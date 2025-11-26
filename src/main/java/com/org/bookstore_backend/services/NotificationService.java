package com.org.bookstore_backend.services;
import com.org.bookstore_backend.dto.NotificationDTO;
import com.org.bookstore_backend.model.Order;
import com.org.bookstore_backend.model.OrderItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;


@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final MailService mailService;

    @Autowired
    public NotificationService(SimpMessagingTemplate messagingTemplate, MailService mailService) {
        this.messagingTemplate = messagingTemplate;
        this.mailService = mailService;
    }

    /**
     * Sends a real-time notification to a specific user about an order status change.
     */
    public void sendOrderStatusNotification(Long userId, Long orderId, String newStatus) {
        String destination = "/queue/notifications";
        
        // Get enhanced status information
        OrderStatusInfo statusInfo = getOrderStatusInfo(newStatus);
        
        NotificationDTO notification = new NotificationDTO(
                "ORDER_STATUS_UPDATE",
                statusInfo.title,
                statusInfo.message
        );
        
        // Add metadata for tracking
        notification.setUserId(userId);
        notification.setOrderId(orderId);
        notification.setMetadata(Map.of(
                "orderId", orderId,
                "status", newStatus,
                "trackingUrl", "/order-history",
                "actionText", "Track Your Order"
        ));
        
        logger.info("Sending order status notification for order {} to user {}. New status: {}", orderId, userId, newStatus);
        messagingTemplate.convertAndSendToUser(String.valueOf(userId), destination, notification);
    }
    
    /**
     * Inner class to hold order status information
     */
    private static class OrderStatusInfo {
        final String title;
        final String message;
        
        OrderStatusInfo(String title, String message) {
            this.title = title;
            this.message = message;
        }
    }

    /**
     * Get enhanced order status information with user-friendly messages
     */
    private OrderStatusInfo getOrderStatusInfo(String status) {
        return switch (status.toUpperCase()) {
            case "NEW_ORDER" -> new OrderStatusInfo(
                "Order Received! 📋",
                "Your order has been received and is being prepared. You can track its progress in your order history."
            );
            case "PROCESSING" -> new OrderStatusInfo(
                "Order Processing! ⚙️",
                "Your order is being processed and prepared for shipment. We'll notify you when it's ready to ship."
            );
            case "PACKED" -> new OrderStatusInfo(
                "Order Packed! 📦",
                "Great news! Your order has been packed and is ready for dispatch. It will be shipped soon."
            );
            case "DISPATCHED" -> new OrderStatusInfo(
                "Order Dispatched! 🚚",
                "Your order has been dispatched and is on its way to you. You can track its delivery progress."
            );
            case "IN_TRANSIT" -> new OrderStatusInfo(
                "Order In Transit! 🚛",
                "Your order is currently in transit and making its way to your delivery address."
            );
            case "OUT_FOR_DELIVERY" -> new OrderStatusInfo(
                "Out for Delivery! 🏠",
                "Your order is out for delivery and should arrive at your address soon. Please be available to receive it."
            );
            case "DELIVERED" -> new OrderStatusInfo(
                "Order Delivered! ✅",
                "Your order has been successfully delivered! Thank you for shopping with us. Enjoy your books!"
            );
            case "CANCELED" -> new OrderStatusInfo(
                "Order Cancelled ❌",
                "Your order has been cancelled. If you have any questions, please contact our customer support."
            );
            default -> new OrderStatusInfo(
                "Order Status Updated 📦",
                String.format("Your order status has been updated to: %s. You can track its progress in your order history.", status)
            );
        };
    }

    /**
     * Sends an order-related email (used when Kafka is disabled or by consumers).
     */
    public void sendOrderEmail(Order order, String type, String status) {
        try {
            String subject;
            String html;
            String orderNumber = order.getOrderNumber();
            if ("ORDER_CREATED".equals(type)) {
                subject = "Order Confirmed: " + safe(orderNumber);
                html = buildOrderHtml(order, "Thank you for your order!", "We've received your order and it's being processed.");
            } else if ("ORDER_STATUS_UPDATED".equals(type)) {
                subject = "Order Status Updated: " + safe(orderNumber);
                html = buildOrderHtml(order, "Order Update", "Your order status is now <b>" + safe(status) + "</b>.");
            } else {
                subject = "Order Update";
                html = buildOrderHtml(order, "Order Update", "There's an update regarding your order.");
            }
            String recipient = order.getUser() != null ? order.getUser().getEmail() : null;
            if (recipient != null && !recipient.isBlank()) {
                mailService.sendHtml(recipient, subject, html);
            }
        } catch (Exception e) {
            logger.warn("sendOrderEmail failed: {}", e.getMessage());
        }
    }

    private String buildOrderHtml(Order order, String title, String intro) {
        StringBuilder sb = new StringBuilder();
        sb.append("<h2>").append(title).append("</h2>");
        sb.append("<p>").append(intro).append("</p>");
        sb.append("<p><b>Order:</b> ").append(safe(order.getOrderNumber())).append("</p>");
        sb.append("<table cellspacing='0' cellpadding='6' style='border-collapse:collapse;border:1px solid #e5e7eb'>");
        sb.append("<thead><tr style='background:#f8fafc'><th align='left'>Item</th><th align='right'>Qty</th><th align='right'>Price</th></tr></thead><tbody>");
        if (order.getOrderItems() != null) {
            for (OrderItem it : order.getOrderItems()) {
                String name = it.getBook() != null ? safe(it.getBook().getTitle()) : "Item";
                String qty = String.valueOf(it.getQuantity());
                String price = String.valueOf(it.getPriceAtPurchase());
                sb.append("<tr><td>").append(name).append("</td><td align='right'>").append(qty)
                  .append("</td><td align='right'>£").append(price).append("</td></tr>");
            }
        }
        sb.append("</tbody></table>");
        sb.append("<p style='margin-top:8px'><b>Total:</b> £").append(order.getTotalAmount()).append("</p>");
        sb.append("<p style='color:#6b7280;font-size:12px'>Dream Books — thank you for shopping with us.</p>");
        return sb.toString();
    }

    private String safe(String s) { return s == null ? "" : s; }
}