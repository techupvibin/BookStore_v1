package com.org.bookstore_backend.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Service for handling payment-related notifications
 * Triggers Kafka notifications when payments are processed
 */
@Service
public class PaymentNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentNotificationService.class);

    private final KafkaNotificationService kafkaNotificationService;

    @Autowired
    public PaymentNotificationService(KafkaNotificationService kafkaNotificationService) {
        this.kafkaNotificationService = kafkaNotificationService;
    }

    /**
     * Handles successful payment processing
     * Triggers Kafka notification for real-time delivery
     */
    public void handlePaymentSuccess(Long userId, Long orderId, String orderNumber, Double amount) {
        logger.info("Payment successful for user {} order {}: £{}", userId, orderId, amount);
        
        try {
            // Publish payment success notification to Kafka
            kafkaNotificationService.publishPaymentSuccessNotification(userId, orderId, orderNumber, amount);
            
            logger.info("Payment success notification published to Kafka for user {} order {}", userId, orderId);
            
        } catch (Exception e) {
            logger.error("Failed to publish payment success notification for user {} order {}", userId, orderId, e);
        }
    }

    /**
     * Handles payment failure
     * Could trigger different types of notifications
     */
    public void handlePaymentFailure(Long userId, Long orderId, String orderNumber, String reason) {
        logger.warn("Payment failed for user {} order {}: {}", userId, orderId, reason);
        
        try {
            // Publish payment failure notification to Kafka
            kafkaNotificationService.publishGeneralNotification(
                userId,
                "Payment Failed ❌",
                String.format("Payment for order %s failed: %s", orderNumber, reason),
                "PAYMENT_FAILURE"
            );
            
            logger.info("Payment failure notification published to Kafka for user {} order {}", userId, orderId);
            
        } catch (Exception e) {
            logger.error("Failed to publish payment failure notification for user {} order {}", userId, orderId, e);
        }
    }

    /**
     * Handles payment processing start
     */
    public void handlePaymentProcessing(Long userId, Long orderId, String orderNumber) {
        logger.info("Payment processing started for user {} order {}", userId, orderId);
        
        try {
            // Publish payment processing notification to Kafka
            kafkaNotificationService.publishGeneralNotification(
                userId,
                "Processing Payment 🔄",
                String.format("Processing payment for order %s. Please wait...", orderNumber),
                "PAYMENT_PROCESSING"
            );
            
            logger.info("Payment processing notification published to Kafka for user {} order {}", userId, orderId);
            
        } catch (Exception e) {
            logger.error("Failed to publish payment processing notification for user {} order {}", userId, orderId, e);
        }
    }

    /**
     * Handles refund processing
     */
    public void handleRefundProcessed(Long userId, Long orderId, String orderNumber, Double amount) {
        logger.info("Refund processed for user {} order {}: £{}", userId, orderId, amount);
        
        try {
            // Publish refund notification to Kafka
            kafkaNotificationService.publishGeneralNotification(
                userId,
                "Refund Processed 💰",
                String.format("Refund of £%.2f for order %s has been processed and will appear in your account within 3-5 business days.", amount, orderNumber),
                "REFUND_PROCESSED"
            );
            
            logger.info("Refund notification published to Kafka for user {} order {}", userId, orderId);
            
        } catch (Exception e) {
            logger.error("Failed to publish refund notification for user {} order {}", userId, orderId, e);
        }
    }
}
