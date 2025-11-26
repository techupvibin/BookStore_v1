package com.org.bookstore_backend.controller;
import com.org.bookstore_backend.dto.OrderDTO;
import com.org.bookstore_backend.model.OrderStatus;
import com.org.bookstore_backend.dto.OrderDTO;
import com.org.bookstore_backend.services.MailService;
import com.org.bookstore_backend.services.NotificationService;
import com.org.bookstore_backend.services.KafkaNotificationService;
import com.org.bookstore_backend.services.OrderService;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
 

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private static final Logger logger = LoggerFactory.getLogger(AdminOrderController.class);

    private final OrderService orderService;
    private final NotificationService notificationService;
    private final KafkaNotificationService kafkaNotificationService;
    private final MailService mailService;

    @Autowired
    public AdminOrderController(OrderService orderService, NotificationService notificationService, KafkaNotificationService kafkaNotificationService, MailService mailService) {
        this.orderService = orderService;
        this.notificationService = notificationService;
        this.kafkaNotificationService = kafkaNotificationService;
        this.mailService = mailService;
    }

    /**
     * Retrieves all orders for the admin dashboard.
     */
    @GetMapping
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        logger.info("Admin is fetching all orders.");
        List<OrderDTO> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    /**
     * Retrieves revenue statistics for the admin dashboard.
     */
    @GetMapping("/revenue-stats")
    public ResponseEntity<Map<String, Object>> getRevenueStats() {
        try {
            logger.info("Admin is fetching revenue statistics.");
            List<OrderDTO> allOrders = orderService.getAllOrders();
            
            double totalRevenue = 0.0;
            int totalOrders = allOrders.size();
            int completedOrders = 0;
            int pendingOrders = 0;
            
            for (OrderDTO order : allOrders) {
                String status = order.getStatus() != null ? order.getStatus().toUpperCase() : "";
                double amount = order.getTotalAmount() != null ? order.getTotalAmount().doubleValue() : 0.0;
                
                if ("DELIVERED".equals(status)) {
                    totalRevenue += amount;
                    completedOrders++;
                } else if ("CANCELED".equals(status)) {
                    // Canceled orders don't count
                } else {
                    pendingOrders++;
                }
            }
            
            Map<String, Object> stats = Map.of(
                "totalRevenue", totalRevenue,
                "totalOrders", totalOrders,
                "completedOrders", completedOrders,
                "pendingOrders", pendingOrders,
                "averageOrderValue", completedOrders > 0 ? totalRevenue / completedOrders : 0.0
            );
            
            logger.info("Revenue stats calculated: totalRevenue={}, completedOrders={}", totalRevenue, completedOrders);
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            logger.error("Failed to calculate revenue stats: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to calculate revenue statistics"));
        }
    }

    /**
     * Sends an invoice PDF to the user's email for a specific order.
     * POST /api/admin/orders/{orderId}/send-invoice
     */
    @PostMapping("/{orderId}/send-invoice")
    public ResponseEntity<Map<String, String>> sendInvoiceEmail(@PathVariable Long orderId) {
        try {
            logger.info("Attempting to send invoice email for order ID: {}", orderId);
            
            OrderDTO order = orderService.getOrderById(orderId);
            if (order == null) {
                logger.error("Order not found for ID: {}", orderId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Order not found"));
            }
            
            if (order.getUser() == null) {
                logger.error("Order {} has no user information", orderId);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Order has no user information"));
            }
            
            if (order.getUser().getUserId() == null) {
                logger.error("Order {} user has no user ID", orderId);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Order user has no user ID"));
            }
            
            // Lookup user email from order
            String email = order.getUser().getEmail();
            if (email == null || email.isBlank()) {
                logger.warn("Order {} user email is missing from DTO, attempting to fetch from database", orderId);
                
                // Try to fetch user email directly from database as fallback
                try {
                    // Use OrderService to get the full order with user details
                    OrderDTO fullOrder = orderService.getOrderById(orderId);
                    if (fullOrder != null && fullOrder.getUser() != null && 
                        fullOrder.getUser().getEmail() != null && !fullOrder.getUser().getEmail().isBlank()) {
                        email = fullOrder.getUser().getEmail();
                        logger.info("Retrieved email {} for user {} from full order", email, fullOrder.getUser().getUsername());
                    } else {
                        logger.error("Order {} user has no email address in database. User details: userId={}, username={}", 
                            orderId, order.getUser().getUserId(), order.getUser().getUsername());
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "User has no email address in database. Please update the user profile."));
                    }
                } catch (Exception e) {
                    logger.error("Failed to fetch user email from database for order {}: {}", orderId, e.getMessage());
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Failed to retrieve user email from database"));
                }
            }
            
            logger.info("Generating PDF for order {} with user email: {}", orderId, email);
            
            // Generate PDF with better error handling
            byte[] pdf;
            try {
                pdf = orderService.generateInvoicePdf(order);
                if (pdf == null || pdf.length == 0) {
                    logger.error("Generated PDF is null or empty for order {}", orderId);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Failed to generate PDF"));
                }
                logger.info("PDF generated successfully for order {}, size: {} bytes", orderId, pdf.length);
            } catch (Exception pdfException) {
                logger.error("Failed to generate PDF for order {}: {}", orderId, pdfException.getMessage(), pdfException);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to generate PDF: " + pdfException.getMessage()));
            }
            
            String displayId = order.getOrderNumber() != null ? order.getOrderNumber() : String.valueOf(order.getId());
            String subject = "Invoice #" + displayId;
            String body = "<p>Dear " + (order.getUser().getUsername() != null ? order.getUser().getUsername() : "Customer") + ",</p>" +
                    "<p>Please find attached your invoice for order <b>" + displayId + "</b>.</p>" +
                    "<p>Thank you for shopping with Dream Books.</p>";
            
            logger.info("Sending email to {} for order {} with subject: {}", email, orderId, subject);
            
            mailService.sendWithAttachment(email, subject, body, "invoice-" + displayId + ".pdf", pdf, "application/pdf");
            
            logger.info("Invoice email sent successfully for order {} to {}", orderId, email);
            return ResponseEntity.ok(Map.of("message", "Invoice sent successfully"));
            
        } catch (jakarta.persistence.EntityNotFoundException e) {
            logger.error("Entity not found for order {}: {}", orderId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Order not found"));
        } catch (Exception e) {
            logger.error("Failed to send invoice email for order {}: {}", orderId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to send invoice: " + e.getMessage()));
        }
    }

    /**
     * Updates the status of an order and sends a real-time notification to the user.
     */
    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> requestBody) {
        try {
            String newStatusStr = requestBody.get("newStatus");
            if (newStatusStr == null) {
                return ResponseEntity.badRequest().build();
            }
            OrderStatus newStatus = OrderStatus.valueOf(newStatusStr);
            logger.info("Admin is updating order {} status to {}", orderId, newStatus);

            OrderDTO updatedOrder = orderService.updateOrderStatus(orderId, newStatus.name());

            // ⭐ NEW: Send a real-time notification to the user via Kafka
            // Notify the order's owner
            Long userId = updatedOrder.getUser() != null ? updatedOrder.getUser().getUserId() : null;
            if (userId != null) {
                // Send Kafka notification
                kafkaNotificationService.publishOrderStatusNotification(
                    userId,
                    updatedOrder.getId(),
                    updatedOrder.getOrderNumber(),
                    newStatus.name()
                );
                
                // Also send WebSocket notification for immediate delivery
                notificationService.sendOrderStatusNotification(
                    userId,
                    updatedOrder.getId(),
                    newStatus.name()
                );
            }

            return ResponseEntity.ok(updatedOrder);
        } catch (EntityNotFoundException e) {
            logger.error("Order not found: {}", orderId);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid order status: {}", e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            logger.error("An unexpected error occurred while updating order status:", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}