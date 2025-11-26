package com.org.bookstore_backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.KafkaListenerEndpointRegistry;
import org.springframework.kafka.listener.MessageListenerContainer;

import jakarta.annotation.PostConstruct;
import java.util.concurrent.TimeUnit;

/**
 * Configuration to handle Kafka startup delays
 * Ensures Kafka is ready before starting listeners
 */
@Configuration
@ConditionalOnProperty(name = "spring.kafka.enabled", havingValue = "true", matchIfMissing = true)
public class KafkaStartupConfig {

    private static final Logger logger = LoggerFactory.getLogger(KafkaStartupConfig.class);

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    private final KafkaListenerEndpointRegistry kafkaListenerEndpointRegistry;

    public KafkaStartupConfig(KafkaListenerEndpointRegistry kafkaListenerEndpointRegistry) {
        this.kafkaListenerEndpointRegistry = kafkaListenerEndpointRegistry;
    }

    @PostConstruct
    public void delayKafkaListeners() {
        logger.info("Delaying Kafka listeners startup to ensure Kafka is ready...");
        
        // Wait for Kafka to be ready
        waitForKafka();
        
        // Start all Kafka listeners
        startKafkaListeners();
    }

    private void waitForKafka() {
        int maxRetries = 30; // 30 seconds max wait
        int retryCount = 0;
        
        while (retryCount < maxRetries) {
            try {
                // Try to connect to Kafka
                org.apache.kafka.clients.admin.AdminClient adminClient = createAdminClient();
                adminClient.listTopics().names().get(5, TimeUnit.SECONDS);
                adminClient.close();
                
                logger.info("Kafka is ready! Starting listeners...");
                return;
                
            } catch (Exception e) {
                retryCount++;
                logger.warn("Kafka not ready yet (attempt {}/{}): {}", retryCount, maxRetries, e.getMessage());
                
                try {
                    Thread.sleep(1000); // Wait 1 second before retry
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    logger.error("Interrupted while waiting for Kafka", ie);
                    return;
                }
            }
        }
        
        logger.error("Kafka failed to become ready after {} attempts", maxRetries);
    }

    private void startKafkaListeners() {
        try {
            for (MessageListenerContainer container : kafkaListenerEndpointRegistry.getListenerContainers()) {
                if (!container.isRunning()) {
                    logger.info("Starting Kafka listener container: {}", container.getListenerId());
                    container.start();
                }
            }
            logger.info("All Kafka listeners started successfully");
        } catch (Exception e) {
            logger.error("Error starting Kafka listeners", e);
        }
    }

    private org.apache.kafka.clients.admin.AdminClient createAdminClient() {
        java.util.Properties props = new java.util.Properties();
        props.put(org.apache.kafka.clients.admin.AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(org.apache.kafka.clients.admin.AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, 5000);
        props.put(org.apache.kafka.clients.admin.AdminClientConfig.CONNECTIONS_MAX_IDLE_MS_CONFIG, 5000);
        
        return org.apache.kafka.clients.admin.AdminClient.create(props);
    }
}
