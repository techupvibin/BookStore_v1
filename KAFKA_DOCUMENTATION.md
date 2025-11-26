# 📨 Kafka Integration Documentation - BookStore Application

## 📋 Table of Contents

- [Overview](#overview)
- [How Kafka is Used](#how-kafka-is-used)
- [Kafka Architecture](#kafka-architecture)
- [Verification Steps](#verification-steps)
- [Configuration](#configuration)
- [Topics and Events](#topics-and-events)
- [Troubleshooting](#troubleshooting)
- [Testing](#testing)

---

## 🎯 Overview

Apache Kafka is used in the BookStore application as a **message broker** for implementing an **event-driven architecture**. It enables asynchronous communication between components, real-time notifications, and decoupled event processing.

### Why Kafka?

- **Asynchronous Processing**: Non-blocking event publishing
- **Scalability**: Handle high-volume events efficiently
- **Reliability**: Guaranteed message delivery
- **Real-time Notifications**: Instant user notifications via WebSocket
- **Decoupling**: Services communicate through events, not direct calls

---

## 🔄 How Kafka is Used

### 1. **Event Publishing**

Kafka is used to publish domain events when important actions occur:

#### **Notification Events**
- **Order Status Updates**: When admin updates order status
- **Payment Success**: When payment is processed successfully
- **Order Created**: When a new order is placed
- **General Notifications**: System-wide announcements

#### **Event Flow**
```
Business Action → Service Layer → KafkaEventPublisher → Kafka Topic → Kafka Consumer → WebSocket → Frontend
```

### 2. **Real-time Notification System**

The primary use case is **real-time notifications**:

1. **Event Occurs** (e.g., order status updated)
2. **KafkaEventPublisher** publishes event to `notifications.events` topic
3. **NotificationKafkaConsumer** consumes the event
4. **WebSocket** forwards notification to connected clients
5. **Frontend** receives and displays notification

### 3. **Components Using Kafka**

#### **Publishers (Producers)**
- **`KafkaEventPublisher`** - Generic event publisher
- **`KafkaNotificationService`** - Notification-specific publisher
- **`OrderService`** - Publishes order events
- **`PaymentService`** - Publishes payment events

#### **Consumers**
- **`NotificationKafkaConsumer`** - Consumes notification events and forwards to WebSocket

---

## 🏗️ Kafka Architecture

### **System Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Services                      │
│  OrderService, PaymentService, AdminOrderController         │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Publishes Events
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              KafkaEventPublisher /                           │
│              KafkaNotificationService                        │
│  • Serializes events to JSON                                │
│  • Publishes to Kafka topics                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Kafka Protocol
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Apache Kafka Broker                       │
│  Topics:                                                    │
│  • notifications.events                                     │
│  • orders.events                                            │
│  • saga.* (for future saga pattern)                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Consumes Events
                            ▼
┌─────────────────────────────────────────────────────────────┐
│            NotificationKafkaConsumer                         │
│  • Consumes from notifications.events                       │
│  • Deserializes JSON                                        │
│  • Forwards to WebSocket                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ WebSocket (STOMP)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend                            │
│  • Receives real-time notifications                         │
│  • Updates UI instantly                                     │
└─────────────────────────────────────────────────────────────┘
```

### **Docker Network Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Zookeeper     │    │     Kafka       │    │  Spring Boot    │
│   Port: 2181    │◄───┤   Port: 29092   │◄───┤   App          │
│   (Internal)    │    │   (Internal)    │    │   (Internal)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   External      │
                       │   Port: 9092    │
                       │   (Host)        │
                       └─────────────────┘
```

**Port Mapping:**
- **Internal (Docker)**: `kafka:29092` - Used by Spring Boot app
- **External (Host)**: `localhost:9092` - For testing and monitoring

---

## ✅ Verification Steps

### **Step 1: Check if Kafka is Running**

#### **Using Docker Compose**
```bash
# Check all services status
docker-compose ps

# Check Kafka container specifically
docker-compose ps kafka

# Expected output:
# NAME      IMAGE                        STATUS
# kafka     confluentinc/cp-kafka:7.4.0  Up X minutes
```

#### **Check Kafka Logs**
```bash
# View Kafka logs
docker-compose logs kafka

# Follow logs in real-time
docker-compose logs -f kafka

# Look for these success messages:
# - "started (kafka.server.KafkaServer)"
# - "Kafka version: X.X.X"
# - "started kafka.server.KafkaServer"
```

### **Step 2: Verify Kafka Connectivity**

#### **From Host Machine**
```bash
# Test port connectivity
nc -zv localhost 9092

# Expected output:
# Connection to localhost 9092 port [tcp/*] succeeded!
```

#### **From Docker Container**
```bash
# Test from Spring Boot container
docker exec -it bookstore_springboot_app nc -zv kafka 29092

# Expected output:
# kafka (172.x.x.x:29092) open
```

### **Step 3: List Kafka Topics**

```bash
# List all topics
docker exec -it kafka kafka-topics --bootstrap-server localhost:29092 --list

# Expected topics:
# __consumer_offsets
# notifications.events
# orders.events
# dlq.events
# saga.failed
# saga.compensated
# saga.inventory.reserved
# saga.payment.processed
# saga.shipment.created
```

### **Step 4: Check Topic Details**

```bash
# Describe a specific topic
docker exec -it kafka kafka-topics --bootstrap-server localhost:29092 \
  --describe --topic notifications.events

# Expected output:
# Topic: notifications.events
# PartitionCount: 3
# ReplicationFactor: 1
# Configs: retention.ms=604800000,cleanup.policy=delete,compression.type=snappy
```

### **Step 5: Verify Consumer Groups**

```bash
# List consumer groups
docker exec -it kafka kafka-consumer-groups --bootstrap-server localhost:29092 --list

# Expected groups:
# notification-consumer-group
# payment-notification-consumer
# order-status-consumer
# bookstore-app
```

### **Step 6: Check Spring Boot Application**

#### **Check Application Logs**
```bash
# View Spring Boot logs
docker-compose logs bookstore_springboot_app | grep -i kafka

# Look for:
# - "Kafka consumer started"
# - "Kafka producer initialized"
# - "Connected to Kafka"
```

#### **Check Health Endpoint**
```bash
# Check overall health
curl http://localhost:8080/actuator/health

# Check Kafka health specifically (if configured)
curl http://localhost:8080/actuator/health/kafka
```

### **Step 7: Test Event Publishing**

#### **Send a Test Message**
```bash
# Start a console producer
docker exec -it kafka kafka-console-producer \
  --bootstrap-server localhost:29092 \
  --topic notifications.events

# Type a test message:
{"type":"TEST","title":"Test Notification","message":"This is a test"}
# Press Enter, then Ctrl+C to exit
```

#### **Consume Messages**
```bash
# Start a console consumer
docker exec -it kafka kafka-console-consumer \
  --bootstrap-server localhost:29092 \
  --topic notifications.events \
  --from-beginning

# You should see messages if any were published
```

### **Step 8: Verify in Application**

1. **Place an Order**: Create an order through the UI
2. **Check Logs**: Look for Kafka publishing logs
3. **Check WebSocket**: Verify notification is received in frontend
4. **Check Kafka**: Verify message in Kafka topic

---

## ⚙️ Configuration

### **Kafka Configuration (`KafkaConfig.java`)**

```java
@Configuration
@EnableKafka
@ConditionalOnProperty(name = "spring.kafka.enabled", havingValue = "true")
public class KafkaConfig {
    
    // Producer Configuration
    - Bootstrap servers: localhost:9092 (local) or kafka:29092 (Docker)
    - Serialization: String serializer
    - Idempotency: Enabled
    - Acks: all (wait for all replicas)
    - Retries: 3
    - Compression: Snappy
    
    // Consumer Configuration
    - Group ID: bookstore-app
    - Auto offset reset: earliest
    - Auto commit: false (manual commit)
    - Max poll records: 500
    - Session timeout: 30s
    - Heartbeat interval: 10s
    
    // Listener Configuration
    - Concurrency: 3 (3 concurrent consumers)
    - Error handling: Exponential backoff
    - Dead Letter Queue: dlq.events
}
```

### **Application Configuration (`application.yml`)**

```yaml
spring:
  kafka:
    # Bootstrap servers
    bootstrap-servers: localhost:9092  # Local
    # bootstrap-servers: kafka:29092   # Docker
    
    # Consumer settings
    consumer:
      group-id: bookstore-app
      auto-offset-reset: latest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      session.timeout.ms: 30000
      heartbeat.interval.ms: 10000
      max.poll.interval.ms: 300000
    
    # Producer settings
    producer:
      acks: all
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.apache.kafka.common.serialization.StringSerializer
      request.timeout.ms: 40000
      delivery.timeout.ms: 120000
    
    # Listener settings
    listener:
      ack-mode: batch
      auto-startup: true
      startup-timeout: 60000
    
    # Enable/disable Kafka
    enabled: true  # Set to false to disable Kafka
```

### **Docker Configuration (`docker-compose.yml`)**

```yaml
kafka:
  image: confluentinc/cp-kafka:7.4.0
  container_name: kafka
  depends_on:
    - zookeeper
  ports:
    - "9092:9092"      # External access
    - "9102:9102"      # JMX monitoring
  environment:
    KAFKA_BROKER_ID: 1
    KAFKA_ZOOKEEPER_CONNECT: 'zookeeper:2181'
    KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
    KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:29092,PLAINTEXT_HOST://0.0.0.0:9092
    KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'true'
  healthcheck:
    test: ["CMD-SHELL", "kafka-topics --bootstrap-server localhost:29092 --list"]
    interval: 30s
    timeout: 10s
    retries: 5
```

---

## 📨 Topics and Events

### **Kafka Topics**

| Topic Name | Partitions | Replicas | Retention | Purpose |
|------------|-----------|----------|-----------|---------|
| `notifications.events` | 3 | 1 | 7 days | Notification events |
| `orders.events` | 3 | 1 | 7 days | Order-related events |
| `dlq.events` | 3 | 1 | 30 days | Dead letter queue |
| `saga.failed` | 3 | 1 | 30 days | Failed saga events |
| `saga.compensated` | 3 | 1 | 30 days | Compensated saga events |
| `saga.inventory.reserved` | 3 | 1 | 30 days | Inventory reservation |
| `saga.payment.processed` | 3 | 1 | 30 days | Payment processing |
| `saga.shipment.created` | 3 | 1 | 30 days | Shipment creation |

### **Event Types**

#### **1. Notification Events**

**Topic**: `notifications.events`

**Event Structure**:
```json
{
  "type": "ORDER_STATUS_UPDATE",
  "title": "Order Delivered! ✅",
  "message": "Your order has been successfully delivered!",
  "userId": 123,
  "orderId": 456,
  "metadata": {
    "orderNumber": "ORD-1234567890",
    "status": "DELIVERED",
    "trackingUrl": "/order-history"
  }
}
```

**Event Types**:
- `ORDER_CREATED` - New order placed
- `ORDER_STATUS_UPDATE` - Order status changed
- `PAYMENT_SUCCESS` - Payment processed successfully
- `PAYMENT_FAILED` - Payment failed
- `GENERAL` - General notifications

**Published By**:
- `KafkaNotificationService.publishOrderStatusNotification()`
- `KafkaNotificationService.publishPaymentSuccessNotification()`
- `KafkaNotificationService.publishOrderCreatedNotification()`

**Consumed By**:
- `NotificationKafkaConsumer.consumeNotification()`
- `NotificationKafkaConsumer.consumePaymentNotification()`
- `NotificationKafkaConsumer.consumeOrderStatusNotification()`

#### **2. Order Events**

**Topic**: `orders.events`

**Event Types**:
- Order created
- Order status updated
- Order cancelled
- Order completed

**Published By**:
- `KafkaEventPublisher.publish()` (via `OrderService`)

---

## 🔧 Troubleshooting

### **Issue 1: Kafka Not Starting**

**Symptoms**:
- Container exits immediately
- Connection refused errors
- Zookeeper connection errors

**Solutions**:
```bash
# Check Zookeeper is running
docker-compose ps zookeeper

# Check Kafka logs
docker-compose logs kafka

# Restart Kafka
docker-compose restart kafka

# Check port conflicts
netstat -tulpn | grep 9092
```

### **Issue 2: Application Can't Connect to Kafka**

**Symptoms**:
- "No resolvable bootstrap urls" error
- Connection timeout
- Network unreachable

**Solutions**:
```bash
# Verify Kafka is healthy
docker-compose ps kafka

# Test connectivity from app container
docker exec -it bookstore_springboot_app nc -zv kafka 29092

# Check network
docker network inspect bookstore_default

# Verify bootstrap servers in application.yml
# Should be: kafka:29092 (Docker) or localhost:9092 (local)
```

### **Issue 3: Consumer Not Receiving Messages**

**Symptoms**:
- Messages published but not consumed
- Consumer group not showing activity

**Solutions**:
```bash
# Check consumer group status
docker exec -it kafka kafka-consumer-groups \
  --bootstrap-server localhost:29092 \
  --group notification-consumer-group \
  --describe

# Check consumer lag
docker exec -it kafka kafka-consumer-groups \
  --bootstrap-server localhost:29092 \
  --group notification-consumer-group \
  --describe

# Reset consumer group offset (if needed)
docker exec -it kafka kafka-consumer-groups \
  --bootstrap-server localhost:29092 \
  --group notification-consumer-group \
  --reset-offsets \
  --to-earliest \
  --topic notifications.events \
  --execute
```

### **Issue 4: Topics Not Created**

**Symptoms**:
- Topics don't appear in list
- Topic creation errors

**Solutions**:
```bash
# Check auto-create is enabled
docker exec -it kafka kafka-configs \
  --bootstrap-server localhost:29092 \
  --entity-type brokers \
  --entity-name 1 \
  --describe | grep auto.create

# Manually create topic
docker exec -it kafka kafka-topics \
  --bootstrap-server localhost:29092 \
  --create \
  --topic notifications.events \
  --partitions 3 \
  --replication-factor 1
```

### **Issue 5: High Consumer Lag**

**Symptoms**:
- Messages accumulating in topics
- Slow notification delivery

**Solutions**:
```bash
# Check consumer lag
docker exec -it kafka kafka-consumer-groups \
  --bootstrap-server localhost:29092 \
  --group notification-consumer-group \
  --describe

# Increase consumer concurrency in KafkaConfig.java
# factory.setConcurrency(5); // Increase from 3 to 5

# Check consumer processing time
# Review application logs for slow processing
```

---

## 🧪 Testing

### **Test 1: Manual Message Publishing**

```bash
# Start consumer in one terminal
docker exec -it kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic notifications.events \
  --from-beginning

# In another terminal, publish a message
docker exec -it kafka kafka-console-producer \
  --bootstrap-server localhost:9092 \
  --topic notifications.events

# Type:
{"type":"TEST","title":"Test","message":"Hello Kafka"}

# You should see the message in the consumer terminal
```

### **Test 2: Application Integration Test**

1. **Start the application**:
   ```bash
   docker-compose up -d
   ```

2. **Place an order** through the UI

3. **Check Kafka topic**:
   ```bash
   docker exec -it kafka kafka-console-consumer \
     --bootstrap-server localhost:9092 \
     --topic notifications.events \
     --from-beginning
   ```

4. **Verify notification** appears in Kafka and frontend

### **Test 3: Consumer Group Test**

```bash
# Check consumer group is active
docker exec -it kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --group notification-consumer-group \
  --describe

# Expected output shows:
# - GROUP: notification-consumer-group
# - TOPIC: notifications.events
# - PARTITION: 0, 1, 2
# - CURRENT-OFFSET: X
# - LAG: 0 (if processing correctly)
```

### **Test 4: Performance Test**

```bash
# Publish multiple messages
for i in {1..100}; do
  docker exec -it kafka kafka-console-producer \
    --bootstrap-server localhost:9092 \
    --topic notifications.events <<< \
    "{\"type\":\"TEST\",\"title\":\"Test $i\",\"message\":\"Message $i\"}"
done

# Check consumer lag
docker exec -it kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --group notification-consumer-group \
  --describe
```

---

## 📊 Monitoring

### **Kafka Metrics**

#### **Topic Metrics**
```bash
# Get topic size
docker exec -it kafka kafka-log-dirs \
  --bootstrap-server localhost:9092 \
  --topic-list notifications.events \
  --describe

# Get partition details
docker exec -it kafka kafka-topics \
  --bootstrap-server localhost:9092 \
  --describe --topic notifications.events
```

#### **Consumer Metrics**
```bash
# Consumer group status
docker exec -it kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --group notification-consumer-group \
  --describe

# Consumer lag
docker exec -it kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --group notification-consumer-group \
  --describe | grep LAG
```

### **Application Logs**

```bash
# Monitor Kafka-related logs
docker-compose logs -f bookstore_springboot_app | grep -i kafka

# Look for:
# - "Event published successfully"
# - "Received notification from Kafka"
# - "Notification forwarded to WebSocket"
```

---

## 🚀 Quick Start Checklist

Use this checklist to ensure Kafka is properly set up:

- [ ] **Zookeeper is running**: `docker-compose ps zookeeper`
- [ ] **Kafka is running**: `docker-compose ps kafka`
- [ ] **Kafka is healthy**: Check logs for "started (kafka.server.KafkaServer)"
- [ ] **Port 9092 is accessible**: `nc -zv localhost 9092`
- [ ] **Topics are created**: `docker exec -it kafka kafka-topics --bootstrap-server localhost:9092 --list`
- [ ] **Spring Boot connected**: Check logs for Kafka connection success
- [ ] **Consumer groups active**: `docker exec -it kafka kafka-consumer-groups --bootstrap-server localhost:9092 --list`
- [ ] **Test message works**: Send test message and verify consumption
- [ ] **Application publishes events**: Place order and check Kafka topic
- [ ] **Notifications received**: Verify frontend receives WebSocket notifications

---

## 📚 Additional Resources

- **Kafka Docker Setup**: See `KAFKA_DOCKER_SETUP.md`
- **Troubleshooting Guide**: See `KAFKA_CONNECTION_TROUBLESHOOTING.md`
- **Spring Kafka Docs**: https://docs.spring.io/spring-kafka/docs/current/reference/html/
- **Apache Kafka Docs**: https://kafka.apache.org/documentation/
- **Confluent Kafka**: https://docs.confluent.io/platform/current/kafka/introduction.html

---

## 🎯 Summary

Kafka in the BookStore application:

1. **Purpose**: Event-driven architecture for real-time notifications
2. **Main Use Case**: Order status updates and payment notifications
3. **Flow**: Service → KafkaEventPublisher → Kafka Topic → Consumer → WebSocket → Frontend
4. **Configuration**: Enabled by default, can be disabled via `spring.kafka.enabled=false`
5. **Topics**: `notifications.events` is the primary topic for user notifications
6. **Verification**: Use Docker commands and application logs to verify functionality

---

<div align="center">
  <strong>📨 Kafka Integration Documentation</strong><br>
  <em>Complete guide to Kafka usage in BookStore application</em>
</div>

