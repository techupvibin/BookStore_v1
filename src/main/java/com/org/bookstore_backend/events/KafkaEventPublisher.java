package com.org.bookstore_backend.events;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

/**
 * Kafka implementation of EventPublisher.
 * Publishes domain events to Kafka topics.
 */
@Component
public class KafkaEventPublisher implements EventPublisher {
    
    private static final Logger logger = LoggerFactory.getLogger(KafkaEventPublisher.class);
    
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final boolean kafkaEnabled;
    
    public KafkaEventPublisher(KafkaTemplate<String, String> kafkaTemplate, 
                              ObjectMapper objectMapper,
                              @Value("${spring.kafka.enabled:true}") boolean kafkaEnabled) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
        this.kafkaEnabled = kafkaEnabled;
    }
    
    @Override
    public void publish(String topic, DomainEvent event) {
        if (!kafkaEnabled) {
            logger.debug("Kafka is disabled, skipping event publication for topic: {}", topic);
            return;
        }
        
        try {
            String eventJson = objectMapper.writeValueAsString(event);
            logger.debug("Publishing event to topic {}: {}", topic, eventJson);
            
            CompletableFuture<SendResult<String, String>> future = kafkaTemplate.send(topic, eventJson);
            
            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    logger.debug("Event published successfully to topic {}: {}", topic, result.getRecordMetadata());
                } else {
                    logger.error("Failed to publish event to topic {}: {}", topic, ex.getMessage(), ex);
                }
            });
            
        } catch (JsonProcessingException e) {
            logger.error("Failed to serialize event for topic {}: {}", topic, e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Unexpected error publishing event to topic {}: {}", topic, e.getMessage(), e);
        }
    }
}


