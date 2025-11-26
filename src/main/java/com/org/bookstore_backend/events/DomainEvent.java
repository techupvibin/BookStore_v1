package com.org.bookstore_backend.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a domain event that occurred in the system.
 * This class is used for event-driven architecture and can be published to Kafka.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DomainEvent {
    
    /**
     * The type of event (e.g., "ORDER_CREATED", "ORDER_STATUS_UPDATED")
     */
    private String type;
    
    /**
     * The type of aggregate that this event relates to (e.g., "order", "user")
     */
    private String aggregateType;
    
    /**
     * The ID of the aggregate that this event relates to
     */
    private String aggregateId;
    
    /**
     * Timestamp when the event occurred (in milliseconds since epoch)
     */
    private Long occurredAt;
    
    /**
     * JSON payload containing the event data
     */
    private String payloadJson;
    
    /**
     * Version of the event schema (for future compatibility)
     */
    @Builder.Default
    private Integer version = 1;
    
    /**
     * Optional correlation ID for tracing related events
     */
    private String correlationId;
}


