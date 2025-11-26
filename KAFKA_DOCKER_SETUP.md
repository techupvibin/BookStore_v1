# 🚀 Kafka Docker Setup Guide for BookStore

## 📋 Overview
This guide explains how Kafka is configured to work exclusively through Docker containers for the BookStore application.

## 🐳 Docker Configuration

### 1. **Kafka Service Configuration**
```yaml
kafka:
  image: confluentinc/cp-kafka:7.4.0
  container_name: kafka
  depends_on:
    - zookeeper
  ports:
    - "9092:9092"      # External access for testing
    - "9101:9101"      # JMX monitoring
  environment:
    KAFKA_BROKER_ID: 1
    KAFKA_ZOOKEEPER_CONNECT: 'zookeeper:2181'
    KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
    KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
    KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:29092,PLAINTEXT_HOST://0.0.0.0:9092
    KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
    KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
    KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
    KAFKA_JMX_PORT: 9101
    KAFKA_JMX_HOSTNAME: localhost
    KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'true'
    KAFKA_DELETE_TOPIC_ENABLE: 'true'
  healthcheck:
    test: ["CMD-SHELL", "kafka-topics --bootstrap-server localhost:29092 --list"]
    interval: 30s
    timeout: 10s
    retries: 5
    start_period: 40s
```

### 2. **Application Configuration**
```yaml
spring:
  kafka:
    bootstrap-servers: kafka:29092  # Docker internal address
    consumer:
      group-id: bookstore-app
      auto-offset-reset: latest
    producer:
      acks: all
    enabled: true  # Always enabled in Docker
```

### 3. **Dependencies**
```yaml
bookstore_springboot_app:
  depends_on:
    postgres-db:
      condition: service_started
    redis:
      condition: service_started
    kafka:
      condition: service_healthy  # Wait for Kafka to be ready
```

## 🔧 How It Works

### **Network Architecture**
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

### **Port Mapping**
- **Internal Communication**: `kafka:29092` (Docker network)
- **External Access**: `localhost:9092` (Host machine)
- **JMX Monitoring**: `localhost:9101` (Host machine)

## 🚀 Getting Started

### 1. **Start All Services**
```bash
docker-compose up -d
```

### 2. **Check Service Status**
```bash
docker-compose ps
```

### 3. **Monitor Kafka Health**
```bash
docker-compose logs kafka
```

### 4. **Test Kafka Connectivity**
```bash
# Install dependencies
npm install kafkajs

# Run test script
node test-kafka-connectivity.js
```

## 📊 Kafka Topics

The application automatically creates these topics:

### **Notification Topics**
- `notifications.events` - Main notification events
- `orders.events` - Order-related events
- `saga.events` - Saga orchestration events

### **Topic Configuration**
- **Partitions**: 3 (for scalability)
- **Replicas**: 1 (single broker setup)
- **Retention**: 7 days for notifications, 30 days for saga events
- **Compression**: Snappy for performance

## 🔍 Monitoring & Debugging

### **Kafka Logs**
```bash
docker-compose logs -f kafka
```

### **Topic List**
```bash
docker exec -it kafka kafka-topics --bootstrap-server localhost:29092 --list
```

### **Consumer Groups**
```bash
docker exec -it kafka kafka-consumer-groups --bootstrap-server localhost:29092 --list
```

### **Topic Details**
```bash
docker exec -it kafka kafka-topics --bootstrap-server localhost:29092 --describe --topic notifications.events
```

## 🚨 Troubleshooting

### **Common Issues**

#### 1. **Connection Refused**
```bash
# Check if Kafka is running
docker-compose ps kafka

# Check Kafka logs
docker-compose logs kafka

# Restart Kafka
docker-compose restart kafka
```

#### 2. **Topic Creation Failed**
```bash
# Check Zookeeper connection
docker exec -it kafka kafka-topics --bootstrap-server localhost:29092 --list

# Verify Zookeeper is healthy
docker-compose logs zookeeper
```

#### 3. **Application Won't Start**
```bash
# Check dependency order
docker-compose up -d zookeeper
docker-compose up -d kafka
# Wait for Kafka to be healthy
docker-compose up -d bookstore_springboot_app
```

### **Health Check Commands**
```bash
# Test Kafka connectivity from host
nc -zv localhost 9092

# Test from within Docker network
docker exec -it bookstore_springboot_app nc -zv kafka 29092
```

## 📈 Performance Tuning

### **Kafka Configuration**
- **Batch Size**: 16KB (default)
- **Linger**: 1ms (default)
- **Buffer Memory**: 32MB (default)
- **Compression**: Snappy

### **Consumer Configuration**
- **Concurrency**: 3 consumers
- **Max Poll Records**: 500
- **Session Timeout**: 30s
- **Heartbeat Interval**: 10s

## 🔐 Security Notes

### **Current Setup**
- **Authentication**: None (development)
- **Encryption**: None (PLAINTEXT)
- **Authorization**: None

### **Production Considerations**
- Enable SASL/SSL authentication
- Configure ACLs for topic access
- Use encrypted communication
- Implement proper monitoring and alerting

## 📝 Testing

### **Manual Topic Creation**
```bash
docker exec -it kafka kafka-topics \
  --bootstrap-server localhost:29092 \
  --create \
  --topic test-topic \
  --partitions 3 \
  --replication-factor 1
```

### **Send Test Message**
```bash
docker exec -it kafka kafka-console-producer \
  --bootstrap-server localhost:29092 \
  --topic test-topic
```

### **Consume Test Messages**
```bash
docker exec -it kafka kafka-console-consumer \
  --bootstrap-server localhost:29092 \
  --topic test-topic \
  --from-beginning
```

## 🎯 Next Steps

1. **Start the services**: `docker-compose up -d`
2. **Verify Kafka health**: Check logs and health status
3. **Test connectivity**: Run the test script
4. **Monitor topics**: Verify automatic topic creation
5. **Test notifications**: Place orders and check Kafka events

## 📚 Additional Resources

- [Confluent Kafka Docker Documentation](https://docs.confluent.io/platform/current/installation/docker/config-reference.html)
- [Spring Kafka Documentation](https://docs.spring.io/spring-kafka/docs/current/reference/html/)
- [Kafka CLI Tools](https://kafka.apache.org/documentation/#tools)
