package com.org.bookstore_backend.config;

import io.micrometer.core.aop.TimedAspect;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.concurrent.atomic.AtomicLong;

@Configuration
@EnableAspectJAutoProxy
@EnableScheduling
public class MonitoringConfig {

    @Bean
    public TimedAspect timedAspect(MeterRegistry registry) {
        return new TimedAspect(registry);
    }


    @Bean
    public OrderMetrics orderMetrics(MeterRegistry meterRegistry) {
        return new OrderMetrics(meterRegistry);
    }

    @Bean
    public KafkaMetrics kafkaMetrics(MeterRegistry meterRegistry) {
        return new KafkaMetrics(meterRegistry);
    }

    @Bean
    public DatabaseHealthIndicator databaseHealthIndicator() {
        return new DatabaseHealthIndicator();
    }



    @Bean
    public RedisHealthIndicator redisHealthIndicator() {
        return new RedisHealthIndicator();
    }


    public static class OrderMetrics {
        private final AtomicLong totalOrders;
        private final AtomicLong ordersInProgress;
        private final AtomicLong ordersCompleted;
        private final AtomicLong ordersFailed;

        public OrderMetrics(MeterRegistry meterRegistry) {
            this.totalOrders = meterRegistry.gauge("orders.total.count", new AtomicLong(0));
            this.ordersInProgress = meterRegistry.gauge("orders.in_progress.count", new AtomicLong(0));
            this.ordersCompleted = meterRegistry.gauge("orders.completed.count", new AtomicLong(0));
            this.ordersFailed = meterRegistry.gauge("orders.failed.count", new AtomicLong(0));
        }

        public void incrementTotalOrders() {
            totalOrders.incrementAndGet();
        }

        public void incrementOrdersInProgress() {
            ordersInProgress.incrementAndGet();
        }

        public void decrementOrdersInProgress() {
            ordersInProgress.decrementAndGet();
        }

        public void incrementOrdersCompleted() {
            ordersCompleted.incrementAndGet();
            decrementOrdersInProgress();
        }

        public void incrementOrdersFailed() {
            ordersFailed.incrementAndGet();
            decrementOrdersInProgress();
        }
    }

    public static class KafkaMetrics {
        private final AtomicLong messagesPublished;
        private final AtomicLong messagesConsumed;
        private final AtomicLong messagesFailed;

        public KafkaMetrics(MeterRegistry meterRegistry) {
            this.messagesPublished = meterRegistry.gauge("kafka.messages.published.count", new AtomicLong(0));
            this.messagesConsumed = meterRegistry.gauge("kafka.messages.consumed.count", new AtomicLong(0));
            this.messagesFailed = meterRegistry.gauge("kafka.messages.failed.count", new AtomicLong(0));
        }

        public void incrementMessagesPublished() {
            messagesPublished.incrementAndGet();
        }

        public void incrementMessagesConsumed() {
            messagesConsumed.incrementAndGet();
        }

        public void incrementMessagesFailed() {
            messagesFailed.incrementAndGet();
        }
    }

    public static class DatabaseHealthIndicator implements HealthIndicator {
        @Override
        public Health health() {
            try {
                // Add actual database health check logic here
                // For now, return healthy
                return Health.up()
                        .withDetail("database", "PostgreSQL")
                        .withDetail("status", "Connected")
                        .withDetail("timestamp", System.currentTimeMillis())
                        .build();
            } catch (Exception e) {
                return Health.down()
                        .withDetail("database", "PostgreSQL")
                        .withDetail("error", e.getMessage())
                        .withDetail("timestamp", System.currentTimeMillis())
                        .build();
            }
        }
    }



    public static class RedisHealthIndicator implements HealthIndicator {
        @Override
        public Health health() {
            try {
                // Add actual Redis health check logic here
                // For now, return healthy
                return Health.up()
                        .withDetail("redis", "Redis Cache")
                        .withDetail("status", "Connected")
                        .withDetail("timestamp", System.currentTimeMillis())
                        .build();
            } catch (Exception e) {
                return Health.down()
                        .withDetail("redis", "Redis Cache")
                        .withDetail("error", e.getMessage())
                        .withDetail("timestamp", System.currentTimeMillis())
                        .build();
            }
        }
    }
}
