package com.org.bookstore_backend.services.impl;
import com.org.bookstore_backend.dto.OrderDTO;
import com.org.bookstore_backend.dto.OrderMapper;
import com.org.bookstore_backend.dto.OrderRequestDTO;
import com.org.bookstore_backend.events.DomainEvent;
import com.org.bookstore_backend.events.EventPublisher;
import com.org.bookstore_backend.model.*;
import com.org.bookstore_backend.repo.CartRepo;
import com.org.bookstore_backend.repo.OrderRepo;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.org.bookstore_backend.repo.UserRepo;
import com.org.bookstore_backend.services.NotificationService;
import com.org.bookstore_backend.services.KafkaNotificationService;
import org.springframework.beans.factory.annotation.Value;
import com.org.bookstore_backend.services.OrderService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

// PDFBox
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.state.PDExtendedGraphicsState;
import org.apache.pdfbox.util.Matrix;
import java.awt.Color;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderServiceImpl.class);

    private final OrderRepo orderRepository;
    private final CartRepo cartRepository;
    private final UserRepo userRepository;
    private final OrderMapper orderMapper;
    private final EventPublisher eventPublisher;
    private final NotificationService notificationService;
    private final KafkaNotificationService kafkaNotificationService;
    private final boolean kafkaEnabled;

    private static final List<String> VALID_ORDER_STATUS_NAMES = Arrays.stream(OrderStatus.values())
            .map(Enum::name)
            .collect(Collectors.toList());

    public OrderServiceImpl(OrderRepo orderRepository, CartRepo cartRepository, UserRepo userRepository, OrderMapper orderMapper, EventPublisher eventPublisher, NotificationService notificationService, KafkaNotificationService kafkaNotificationService, @Value("${spring.kafka.enabled:true}") boolean kafkaEnabled) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.orderMapper = orderMapper;
        this.eventPublisher = eventPublisher;
        this.notificationService = notificationService;
        this.kafkaNotificationService = kafkaNotificationService;
        this.kafkaEnabled = kafkaEnabled;
    }

    @Override
    public OrderDTO placeOrder(OrderRequestDTO orderRequest) {
        logger.info("Placing order for user ID: {}", orderRequest.getUserId());
        User user = userRepository.findById(orderRequest.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + orderRequest.getUserId()));

        Cart cart = cartRepository.findByUser_UserId(orderRequest.getUserId())
                .orElseThrow(() -> new IllegalStateException("Cart not found for user ID: " + orderRequest.getUserId()));

        if (cart.getCartItems().isEmpty()) {
            throw new IllegalStateException("Cannot place an order with an empty cart.");
        }

        Order order = Order.builder()
                .user(user)
                .orderDate(LocalDateTime.now())
                .orderStatus(OrderStatus.NEW_ORDER.name())
                .paymentMethod(orderRequest.getPaymentMethod())
                .shippingAddress(orderRequest.getShippingAddress())
                .totalAmount(orderRequest.getTotalAmount())
                .orderNumber("ORD-" + System.currentTimeMillis())
                .build();

        for (CartItem cartItem : cart.getCartItems()) {
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .book(cartItem.getBook())
                    .quantity(cartItem.getQuantity())
                    .priceAtPurchase(BigDecimal.valueOf(cartItem.getBook().getPrice()))
                    .build();
            order.addOrderItem(orderItem);
        }

        Order savedOrder = orderRepository.save(order);
        cartRepository.delete(cart);
        logger.info("Order placed successfully with ID: {}", savedOrder.getOrderId());
        try {
            DomainEvent ev = DomainEvent.builder()
                    .type("ORDER_CREATED")
                    .aggregateType("order")
                    .aggregateId(String.valueOf(savedOrder.getOrderId()))
                    .occurredAt(System.currentTimeMillis())
                    .payloadJson("{\"orderNumber\":\"" + savedOrder.getOrderNumber() + "\"}")
                    .build();
            eventPublisher.publish("orders.events", ev);
        } catch (Exception ignore) {}
        // Send Kafka notification for order creation
        if (kafkaEnabled) {
            try {
                kafkaNotificationService.publishOrderCreatedNotification(
                    savedOrder.getUser().getUserId(),
                    savedOrder.getOrderId(),
                    savedOrder.getOrderNumber()
                );
            } catch (Exception e) {
                logger.warn("Failed to send Kafka order creation notification: {}", e.getMessage());
            }
        } else {
            try { notificationService.sendOrderEmail(savedOrder, "ORDER_CREATED", null); } catch (Exception ignore) {}
        }
        return orderMapper.toDto(savedOrder);
    }

    @Override
    public OrderDTO updateOrderStatus(Long id, String newStatus) {
        logger.info("Attempting to update order status for order ID: {} to: {}", id, newStatus);
        String standardizedNewStatus = newStatus.toUpperCase();
        if (!VALID_ORDER_STATUS_NAMES.contains(standardizedNewStatus)) {
            throw new IllegalArgumentException("Invalid order status: " + newStatus + ". Valid statuses are: " + VALID_ORDER_STATUS_NAMES);
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order with ID " + id + " not found."));

        OrderStatus statusEnum = OrderStatus.valueOf(standardizedNewStatus);

        if (order.getOrderStatus().equals(statusEnum.name())) {
            logger.warn("Status for order ID: {} is already {}", id, newStatus);
            return orderMapper.toDto(order);
        }

        order.setOrderStatus(statusEnum.name());
        Order updatedOrder = orderRepository.save(order);
        logger.info("Order ID: {} status successfully updated to {}", id, updatedOrder.getOrderStatus());
        try {
            DomainEvent ev = DomainEvent.builder()
                    .type("ORDER_STATUS_UPDATED")
                    .aggregateType("order")
                    .aggregateId(String.valueOf(updatedOrder.getOrderId()))
                    .occurredAt(System.currentTimeMillis())
                    .payloadJson("{\"status\":\"" + updatedOrder.getOrderStatus() + "\"}")
                    .build();
            eventPublisher.publish("orders.events", ev);
        } catch (Exception ignore) {}
        // Send WebSocket notification for order status update
        try {
            notificationService.sendOrderStatusNotification(
                updatedOrder.getUser().getUserId(),
                updatedOrder.getOrderId(),
                updatedOrder.getOrderStatus()
            );
        } catch (Exception e) {
            logger.warn("Failed to send WebSocket order status notification: {}", e.getMessage());
        }

        // Send Kafka notification for order status update
        if (kafkaEnabled) {
            try {
                kafkaNotificationService.publishOrderStatusNotification(
                    updatedOrder.getUser().getUserId(),
                    updatedOrder.getOrderId(),
                    updatedOrder.getOrderNumber(),
                    updatedOrder.getOrderStatus()
                );
            } catch (Exception e) {
                logger.warn("Failed to send Kafka order status notification: {}", e.getMessage());
            }
        }
        return orderMapper.toDto(updatedOrder);
    }

    @Override
    public List<OrderDTO> getAllOrders() {
        logger.info("Fetching all orders.");
        List<Order> orders = orderRepository.findAll();

        // Eagerly initialize the order items to prevent LazyInitializationException
        orders.forEach(order -> {
            if (order.getOrderItems() != null) {
                order.getOrderItems().size();
            }
        });

        return orders.stream()
                .map(orderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public OrderDTO getOrderById(Long id) {
        logger.info("Fetching order with ID: {}", id);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order with ID " + id + " not found."));

        // Eagerly initialize the order items to prevent LazyInitializationException
        if (order.getOrderItems() != null) {
            order.getOrderItems().size();
        }

        return orderMapper.toDto(order);
    }

    @Override
    public OrderDTO saveOrder(OrderDTO orderDTO) {
        logger.info("Saving or updating an order from DTO.");
        if (orderDTO == null) {
            throw new IllegalArgumentException("OrderDTO cannot be null.");
        }

        Order orderToSave = orderMapper.toEntity(orderDTO);

        if (orderToSave.getUser() != null && orderToSave.getUser().getUserId() != null) {
            User existingUser = userRepository.findById(orderToSave.getUser().getUserId())
                    .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + orderToSave.getUser().getUserId()));
            orderToSave.setUser(existingUser);
        } else {
            throw new IllegalArgumentException("OrderDTO must contain a valid user ID for saving.");
        }

        if (orderToSave.getOrderItems() != null) {
            for (OrderItem item : orderToSave.getOrderItems()) {
                item.setOrder(orderToSave);
            }
        }

        Order savedOrder = orderRepository.save(orderToSave);
        logger.info("Order saved successfully with ID: {}", savedOrder.getOrderId());
        return orderMapper.toDto(savedOrder);
    }

    @Override
    public void deleteOrder(Long id) {
        logger.info("Attempting to delete order with ID: {}", id);
        orderRepository.deleteById(id);
        logger.info("Order with ID: {} deleted successfully.", id);
    }

    @Override
    public List<OrderDTO> getOrderHistory(Long userId) {
        logger.info("Fetching order history for user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        List<Order> orders = orderRepository.findByUserOrderByOrderDateDesc(user);

        // Eagerly initialize the order items to prevent LazyInitializationException
        orders.forEach(order -> {
            if (order.getOrderItems() != null) {
                order.getOrderItems().size();
            }
        });

        return orders.stream()
                .map(orderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> getOrderHistoryPage(Long userId, Long cursor, int size) {
        logger.info("Fetching paged order history for user ID: {} cursor:{} size:{}", userId, cursor, size);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        Pageable pageable = PageRequest.of(0, Math.max(1, Math.min(size, 50)));
        List<Order> orders;
        if (cursor == null) {
            orders = orderRepository.findByUserOrderByOrderIdDesc(user, pageable);
        } else {
            orders = orderRepository.findByUserAndOrderIdLessThanOrderByOrderIdDesc(user, cursor, pageable);
        }

        orders.forEach(o -> { if (o.getOrderItems() != null) o.getOrderItems().size(); });
        return orders.stream().map(orderMapper::toDto).collect(java.util.stream.Collectors.toList());
    }

    @Override
    public byte[] generateInvoicePdf(OrderDTO order) {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                float margin = 50;
                float y = page.getMediaBox().getHeight() - margin;
                float pageWidth = page.getMediaBox().getWidth();
                float usableWidth = pageWidth - (2 * margin);

                // Brand colors
                Color brandPrimary = new Color(99, 102, 241); // #6366F1
                Color brandSecondary = new Color(6, 182, 212); // #06B6D4
                Color tableHeaderBg = new Color(219, 234, 254); // #DBEAFE
                Color tableHeaderText = new Color(15, 23, 42); // #0F172A
                Color textDefault = Color.BLACK;

                // Watermark (company name) in background
                content.saveGraphicsState();
                PDExtendedGraphicsState gs = new PDExtendedGraphicsState();
                gs.setNonStrokingAlphaConstant(0.08f);
                content.setGraphicsStateParameters(gs);
                content.setNonStrokingColor(new Color(150, 150, 150));
                content.beginText();
                content.setFont(PDType1Font.HELVETICA_BOLD, 96);
                Matrix rotate = Matrix.getRotateInstance(Math.toRadians(45), pageWidth / 2, page.getMediaBox().getHeight() / 2);
                content.setTextMatrix(rotate);
                content.showText("Dream Books");
                content.endText();
                content.restoreGraphicsState();

                // Header band
                float headerHeight = 40f;
                content.setNonStrokingColor(brandPrimary);
                content.addRect(margin, y - headerHeight + 10, usableWidth, headerHeight);
                content.fill();

                // Header title
                content.setNonStrokingColor(Color.WHITE);
                content.setFont(PDType1Font.HELVETICA_BOLD, 16);
                content.beginText();
                content.newLineAtOffset(margin + 12, y - headerHeight + 22);
                content.showText("Dream Books - Invoice");
                content.endText();
                y -= (headerHeight + 14);

                // Order meta
                content.setNonStrokingColor(textDefault);
                content.setFont(PDType1Font.HELVETICA_BOLD, 12);
                content.beginText();
                content.newLineAtOffset(margin, y);
                content.showText("Order:");
                content.endText();

                y -= 24;
                content.setFont(PDType1Font.HELVETICA, 12);
                content.beginText();
                content.newLineAtOffset(margin, y);
                content.showText((order.getOrderNumber() != null ? order.getOrderNumber() : String.valueOf(order.getId())));
                content.endText();

                y -= 16;
                content.beginText();
                content.newLineAtOffset(margin, y);
                content.showText("Date: " + String.valueOf(order.getOrderDate()));
                content.endText();

                y -= 16;
                content.beginText();
                content.newLineAtOffset(margin, y);
                content.showText("Customer: " + (order.getUser() != null ? order.getUser().getUsername() : ""));
                content.endText();

                y -= 24;
                // Items header band
                content.setNonStrokingColor(brandSecondary);
                content.addRect(margin, y - 18, usableWidth, 22);
                content.fill();
                content.setNonStrokingColor(Color.WHITE);
                content.setFont(PDType1Font.HELVETICA_BOLD, 12);
                content.beginText();
                content.newLineAtOffset(margin + 8, y - 4);
                content.showText("Items");
                content.endText();

                y -= 28;
                // Table header background
                content.setNonStrokingColor(tableHeaderBg);
                content.addRect(margin, y - 16, usableWidth, 20);
                content.fill();
                // Table header text
                content.setNonStrokingColor(tableHeaderText);
                content.setFont(PDType1Font.HELVETICA_BOLD, 11);
                float col1 = margin + 8;
                float col2 = margin + Math.min(usableWidth * 0.70f, 360f);
                float col3 = margin + Math.min(usableWidth * 0.85f, 460f);
                content.beginText();
                content.newLineAtOffset(col1, y - 4);
                content.showText("Item");
                content.endText();
                content.beginText();
                content.newLineAtOffset(col2, y - 4);
                content.showText("Qty");
                content.endText();
                content.beginText();
                content.newLineAtOffset(col3, y - 4);
                content.showText("Price");
                content.endText();

                y -= 22;
                content.setNonStrokingColor(textDefault);
                content.setFont(PDType1Font.HELVETICA, 11);
                java.math.BigDecimal subtotal = java.math.BigDecimal.ZERO;
                if (order.getBooks() != null) {
                    for (var item : order.getBooks()) {
                        String title = item.getBookTitle() != null ? item.getBookTitle() : "Item";
                        String qty = String.valueOf(item.getQuantity());
                        java.math.BigDecimal unitPrice = item.getPriceAtPurchase() != null ? item.getPriceAtPurchase() : item.getPrice();
                        if (unitPrice == null) unitPrice = java.math.BigDecimal.ZERO;
                        String price = String.valueOf(unitPrice);

                        // Row text
                        content.beginText();
                        content.newLineAtOffset(col1, y);
                        content.showText(title);
                        content.endText();

                        content.beginText();
                        content.newLineAtOffset(col2, y);
                        content.showText(qty);
                        content.endText();

                        content.beginText();
                        content.newLineAtOffset(col3, y);
                        content.showText("£" + price);
                        content.endText();

                        // accumulate subtotal
                        try {
                            java.math.BigDecimal lineTotal = unitPrice.multiply(new java.math.BigDecimal(item.getQuantity() != null ? item.getQuantity() : 0));
                            subtotal = subtotal.add(lineTotal);
                        } catch (Exception ignore) {}

                        y -= 14;
                        if (y < 80) {
                            // keep single-page simple invoice
                            break;
                        }
                    }
                }

                y -= 10;
                // Subtotal line
                content.setNonStrokingColor(textDefault);
                content.setFont(PDType1Font.HELVETICA_BOLD, 12);
                content.beginText();
                content.newLineAtOffset(margin + 8, y);
                content.showText("Subtotal:");
                content.endText();
                content.beginText();
                content.newLineAtOffset(margin + usableWidth - 120, y);
                content.showText("£" + subtotal);
                content.endText();

                // Discount line (if any)
                java.math.BigDecimal totalAmount = order.getTotalAmount() != null ? order.getTotalAmount() : java.math.BigDecimal.ZERO;
                java.math.BigDecimal discount = subtotal.subtract(totalAmount);
                if (discount.compareTo(java.math.BigDecimal.ZERO) > 0) {
                    y -= 16;
                    content.setNonStrokingColor(new Color(22, 163, 74)); // green-ish
                    content.setFont(PDType1Font.HELVETICA_BOLD, 12);
                    content.beginText();
                    content.newLineAtOffset(margin + 8, y);
                    content.showText("Discount:");
                    content.endText();
                    content.beginText();
                    content.newLineAtOffset(margin + usableWidth - 120, y);
                    content.showText("-£" + discount);
                    content.endText();
                }

                y -= 20;
                // Total highlight bar
                content.setNonStrokingColor(tableHeaderBg);
                content.addRect(margin, y - 6, usableWidth, 20);
                content.fill();
                content.setNonStrokingColor(tableHeaderText);
                content.setFont(PDType1Font.HELVETICA_BOLD, 12);
                content.beginText();
                content.newLineAtOffset(margin + 8, y);
                content.showText("Total:");
                content.endText();
                content.beginText();
                content.newLineAtOffset(margin + usableWidth - 120, y);
                content.showText("£" + totalAmount);
                content.endText();
            }

            java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        } catch (Exception e) {
            logger.error("Failed generating invoice PDF", e);
            throw new RuntimeException("Invoice generation failed", e);
        }
    }
}