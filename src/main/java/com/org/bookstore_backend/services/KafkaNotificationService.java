package com.org.bookstore_backend.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.org.bookstore_backend.dto.NotificationDTO;
import com.org.bookstore_backend.model.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * Kafka-based notification service for real-time notifications
 * Publishes notifications to Kafka topics for delivery to users
 */
@Service
public class KafkaNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(KafkaNotificationService.class);

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final boolean kafkaEnabled;

    @Autowired
    public KafkaNotificationService(KafkaTemplate<String, String> kafkaTemplate,
                                  ObjectMapper objectMapper,
                                  @Value("${spring.kafka.enabled:true}") boolean kafkaEnabled) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
        this.kafkaEnabled = kafkaEnabled;
    }

    /**
     * Publishes a payment success notification to Kafka
     */
    public void publishPaymentSuccessNotification(Long userId, Long orderId, String orderNumber, Double amount) {
        if (!kafkaEnabled) {
            logger.info("Kafka is disabled, skipping payment success notification");
            return;
        }

        try {
            NotificationDTO notification = new NotificationDTO(
                "PAYMENT_SUCCESS",
                "Payment Successful! 🎉",
                String.format("Your payment of £%.2f for order %s has been processed successfully!", amount, orderNumber)
            );

            String message = objectMapper.writeValueAsString(notification);
            String key = "payment_" + orderId;
            
            CompletableFuture<SendResult<String, String>> future = kafkaTemplate.send("notifications.events", key, message);
            
            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    logger.info("Payment success notification sent to Kafka for user {} order {}", userId, orderId);
                } else {
                    logger.error("Failed to send payment success notification to Kafka for user {} order {}", userId, orderId, ex);
                }
            });

        } catch (JsonProcessingException e) {
            logger.error("Failed to serialize payment success notification for user {} order {}", userId, orderId, e);
        }
    }

    /**
     * Publishes an order status update notification to Kafka with enhanced messaging
     */
    public void publishOrderStatusNotification(Long userId, Long orderId, String orderNumber, String newStatus) {
        if (!kafkaEnabled) {
            logger.info("Kafka is disabled, skipping order status notification");
            return;
        }

        try {
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
                "orderNumber", orderNumber != null ? orderNumber : String.valueOf(orderId),
                "status", newStatus,
                "trackingUrl", "/order-history",
                "actionText", "Track Your Order"
            ));

            String message = objectMapper.writeValueAsString(notification);
            String key = "status_" + orderId;
            
            CompletableFuture<SendResult<String, String>> future = kafkaTemplate.send("notifications.events", key, message);
            
            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    logger.info("Order status notification sent to Kafka for user {} order {} with status {}", userId, orderId, newStatus);
                } else {
                    logger.error("Failed to send order status notification to Kafka for user {} order {}", userId, orderId, ex);
                }
            });

        } catch (JsonProcessingException e) {
            logger.error("Failed to serialize order status notification for user {} order {}", userId, orderId, e);
        }
    }

    /**
     * Publishes a general notification to Kafka
     */
    public void publishGeneralNotification(Long userId, String title, String message, String type) {
        if (!kafkaEnabled) {
            logger.info("Kafka is disabled, skipping general notification");
            return;
        }

        try {
            NotificationDTO notification = new NotificationDTO(type, title, message);
            String messageJson = objectMapper.writeValueAsString(notification);
            String key = "general_" + userId;
            
            CompletableFuture<SendResult<String, String>> future = kafkaTemplate.send("notifications.events", key, messageJson);
            
            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    logger.info("General notification sent to Kafka for user {}", userId);
                } else {
                    logger.error("Failed to send general notification to Kafka for user {}", userId, ex);
                }
            });

        } catch (JsonProcessingException e) {
            logger.error("Failed to serialize general notification for user {}", userId, e);
        }
    }

    /**
     * Publishes a notification for order creation
     */
    public void publishOrderCreatedNotification(Long userId, Long orderId, String orderNumber) {
        if (!kafkaEnabled) {
            logger.info("Kafka is disabled, skipping order created notification");
            return;
        }

        try {
            NotificationDTO notification = new NotificationDTO(
                "ORDER_CREATED",
                "Order Confirmed! 📚",
                String.format("Your order %s has been placed successfully and is being processed.", orderNumber)
            );

            String message = objectMapper.writeValueAsString(notification);
            String key = "created_" + orderId;
            
            CompletableFuture<SendResult<String, String>> future = kafkaTemplate.send("notifications.events", key, message);
            
            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    logger.info("Order created notification sent to Kafka for user {} order {}", userId, orderId);
                } else {
                    logger.error("Failed to send order created notification to Kafka for user {} order {}", userId, orderId, ex);
                }
            });

        } catch (JsonProcessingException e) {
            logger.error("Failed to serialize order created notification for user {} order {}", userId, orderId, e);
        }
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

    private String getStatusMessage(String status) {
        return switch (status.toUpperCase()) {
            case "PENDING" -> "Pending";
            case "CONFIRMED" -> "Confirmed";
            case "PROCESSING" -> "Processing";
            case "SHIPPED" -> "Shipped";
            case "DELIVERED" -> "Delivered";
            case "CANCELLED" -> "Cancelled";
            case "REFUNDED" -> "Refunded";
            default -> status;
        };
    }
}
