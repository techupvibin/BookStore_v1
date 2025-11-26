package com.org.bookstore_backend.dto;

import com.org.bookstore_backend.model.Order;
import com.org.bookstore_backend.model.OrderItem;
import com.org.bookstore_backend.model.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Component responsible for mapping between Order domain entities and their
 * corresponding Data Transfer Objects (DTOs).
 */
@Component
public class OrderMapper {

    /**
     * Maps an OrderItem entity to its DTO representation for API responses.
     * This method is null-safe.
     *
     * @param orderItem The OrderItem entity.
     * @return The corresponding OrderItemDTO.
     */
    public OrderItemDTO toOrderItemDto(OrderItem orderItem) {
        if (orderItem == null) {
            return null;
        }

        // Use a null-safe approach for the Book entity
        Long bookId = (orderItem.getBook() != null) ? orderItem.getBook().getId() : null;
        String bookTitle = (orderItem.getBook() != null) ? orderItem.getBook().getTitle() : null; // ✅ Corrected: Get the book title, not its ID.
        BigDecimal priceAtPurchase = orderItem.getPriceAtPurchase();

        return OrderItemDTO.builder()
                .bookId(bookId)
                .bookTitle(bookTitle)
                .quantity(orderItem.getQuantity())
                .price(priceAtPurchase)
                .totalPrice(priceAtPurchase.multiply(new BigDecimal(orderItem.getQuantity())))
                .build();
    }

    /**
     * Maps an Order entity to its DTO representation for API responses.
     * This method handles null collections and related entities gracefully.
     *
     * @param order The Order entity.
     * @return The corresponding OrderDTO.
     */
    public OrderDTO toDto(Order order) {
        if (order == null) {
            return null;
        }

        List<OrderItemDTO> items = (order.getOrderItems() != null)
                ? order.getOrderItems().stream()
                .map(this::toOrderItemDto)
                .collect(Collectors.toList())
                : Collections.emptyList();

        UserDTO userDto = null;
        User user = order.getUser();
        if (user != null) {
            userDto = UserDTO.builder()
                    .userId(user.getUserId())
                    .username(user.getUsername())
                    .email(user.getEmail()) // ✅ Added missing email field
                    .build();
        }

        return OrderDTO.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .orderDate(order.getOrderDate())
                .totalAmount(order.getTotalAmount())
                .status(order.getOrderStatus())
                .paymentMethod(order.getPaymentMethod())
                .shippingAddress(order.getShippingAddress())
                .user(userDto)
                .books(items)
                .build();
    }

    /**
     * Maps an OrderDTO from the frontend to a new Order entity.
     * Note: The OrderItem entities are not fully mapped here. The service layer
     * is responsible for resolving them (e.g., fetching the Book entity).
     *
     * @param orderDTO The DTO for the new order.
     * @return A new Order entity.
     */
    public Order toEntity(OrderDTO orderDTO) {
        if (orderDTO == null) {
            return null;
        }

        Order order = new Order();
        if (orderDTO.getId() != null) {
            order.setId(orderDTO.getId());
        }
        order.setOrderNumber(orderDTO.getOrderNumber());
        order.setOrderDate(orderDTO.getOrderDate());
        order.setTotalAmount(orderDTO.getTotalAmount());
        order.setOrderStatus(orderDTO.getStatus());
        order.setPaymentMethod(orderDTO.getPaymentMethod());
        order.setShippingAddress(orderDTO.getShippingAddress());

        // Correctly map and set the OrderItems as a Set.
        if (orderDTO.getBooks() != null) {
            Set<OrderItem> orderItems = orderDTO.getBooks().stream()
                    .map(this::toOrderItemEntity)
                    .collect(Collectors.toSet());
            order.setOrderItems(orderItems);
        } else {
            order.setOrderItems(new HashSet<>());
        }

        // Set the bidirectional relationship
        if (order.getOrderItems() != null) {
            order.getOrderItems().forEach(item -> item.setOrder(order));
        }

        return order;
    }

    /**
     * Maps an OrderItemDTO to a skeleton OrderItem entity.
     * Note: Book and Order entities must be set by the service layer.
     *
     * @param orderItemDTO The DTO.
     * @return A new OrderItem entity.
     */
    private OrderItem toOrderItemEntity(OrderItemDTO orderItemDTO) {
        return OrderItem.builder()
                .quantity(orderItemDTO.getQuantity())
                .priceAtPurchase(orderItemDTO.getPrice())
                .build();
    }
}