package com.org.bookstore_backend.config;

import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.KafkaAdmin;

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

/**
 * Kafka health check configuration
 * Provides health indicators for Kafka connectivity
 */
@Configuration
public class KafkaHealthConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Bean
    public KafkaAdmin kafkaAdmin() {
        Map<String, Object> configs = new HashMap<>();
        configs.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configs.put(AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, 10000);
        configs.put(AdminClientConfig.CONNECTIONS_MAX_IDLE_MS_CONFIG, 10000);
        return new KafkaAdmin(configs);
    }

    @Bean
    public HealthIndicator kafkaHealthIndicator() {
        return new KafkaHealthIndicator();
    }

    /**
     * Custom health indicator for Kafka
     */
    public class KafkaHealthIndicator implements HealthIndicator {

        @Override
        public Health health() {
            try {
                Properties props = new Properties();
                props.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
                props.put(AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, 5000);
                props.put(AdminClientConfig.CONNECTIONS_MAX_IDLE_MS_CONFIG, 5000);

                try (AdminClient adminClient = AdminClient.create(props)) {
                    // Try to list topics to verify connectivity
                    adminClient.listTopics().names().get();
                    return Health.up()
                            .withDetail("bootstrap-servers", bootstrapServers)
                            .withDetail("status", "Kafka is reachable")
                            .build();
                }
            } catch (Exception e) {
                return Health.down()
                        .withDetail("bootstrap-servers", bootstrapServers)
                        .withDetail("error", e.getMessage())
                        .withDetail("status", "Kafka is not reachable")
                        .build();
            }
        }
    }
}
