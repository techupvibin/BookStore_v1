package com.org.bookstore_backend.consumer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.org.bookstore_backend.dto.NotificationDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * Kafka consumer for notification events
 * Listens to notifications.events topic and forwards to WebSocket
 */
@Component
@ConditionalOnProperty(name = "spring.kafka.enabled", havingValue = "true", matchIfMissing = true)
public class NotificationKafkaConsumer {

    private static final Logger logger = LoggerFactory.getLogger(NotificationKafkaConsumer.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    public NotificationKafkaConsumer(SimpMessagingTemplate messagingTemplate, ObjectMapper objectMapper) {
        this.messagingTemplate = messagingTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Consumes notification events from Kafka and forwards to WebSocket
     */
    @KafkaListener(
        topics = "notifications.events",
        groupId = "notification-consumer-group",
        containerFactory = "kafkaListenerContainerFactory",
        autoStartup = "true",
        id = "notification-consumer"
    )
    public void consumeNotification(
            @Payload String message,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_KEY) String key) {
        
        try {
            logger.info("Received notification from Kafka topic: {}, key: {}", topic, key);
            
            // Parse the notification
            NotificationDTO notification = objectMapper.readValue(message, NotificationDTO.class);
            
            // Forward notification to WebSocket
            broadcastNotification(notification);
            
            logger.info("Notification forwarded to WebSocket: type={}, message={}", 
                notification.getType(), notification.getMessage());
            
        } catch (JsonProcessingException e) {
            logger.error("Failed to parse notification message: {}", message, e);
        } catch (Exception e) {
            logger.error("Error processing notification: {}", message, e);
        }
    }

    /**
     * Broadcasts notification to all connected WebSocket clients
     * Implements user-specific routing when userId is available
     */
    private void broadcastNotification(NotificationDTO notification) {
        try {
            // Broadcast to general notifications topic for all users
            messagingTemplate.convertAndSend("/topic/notifications", notification);
            
            // If notification has a specific userId, send to that user's queue
            if (notification.getUserId() != null) {
                messagingTemplate.convertAndSendToUser(
                    notification.getUserId().toString(), 
                    "/queue/notifications", 
                    notification
                );
                logger.info("Notification sent to user-specific queue for user: {}", notification.getUserId());
            }
            
        } catch (Exception e) {
            logger.error("Failed to forward notification to WebSocket: {}", notification, e);
        }
    }

    /**
     * Consumes payment success notifications specifically
     */
    @KafkaListener(
        topics = "notifications.events",
        groupId = "payment-notification-consumer",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumePaymentNotification(
            @Payload String message,
            @Header(KafkaHeaders.RECEIVED_KEY) String key) {
        
        if (key.startsWith("payment_")) {
            try {
                NotificationDTO notification = objectMapper.readValue(message, NotificationDTO.class);
                logger.info("Processing payment notification: {}", notification.getMessage());
                
                // Handle payment-specific logic here
                // For example, you might want to send emails or update user preferences
                
            } catch (JsonProcessingException e) {
                logger.error("Failed to parse payment notification: {}", message, e);
            }
        }
    }

    /**
     * Consumes order status update notifications specifically
     */
    @KafkaListener(
        topics = "notifications.events",
        groupId = "order-status-consumer",
        containerFactory = "kafkaListenerContainerFactory",
        autoStartup = "true",
        id = "order-status-consumer"
    )
    public void consumeOrderStatusNotification(
            @Payload String message,
            @Header(KafkaHeaders.RECEIVED_KEY) String key) {
        
        if (key.startsWith("status_")) {
            try {
                NotificationDTO notification = objectMapper.readValue(message, NotificationDTO.class);
                logger.info("Processing order status notification: {}", notification.getMessage());
                
                // Handle order status-specific logic here
                // For example, you might want to trigger follow-up actions
                
            } catch (JsonProcessingException e) {
                logger.error("Failed to parse order status notification: {}", message, e);
            }
        }
    }
}
