package com.org.bookstore_backend.events;

/**
 * Interface for publishing domain events.
 * This can be implemented to publish events to Kafka, message queues, or other event systems.
 */
public interface EventPublisher {
    
    /**
     * Publishes a domain event to a specific topic.
     * 
     * @param topic The topic/channel where the event should be published
     * @param event The domain event to publish
     */
    void publish(String topic, DomainEvent event);
    
    /**
     * Publishes a domain event to the default topic.
     * 
     * @param event The domain event to publish
     */
    default void publish(DomainEvent event) {
        publish("default", event);
    }
}


