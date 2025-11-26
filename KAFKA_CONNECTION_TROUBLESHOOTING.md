# 🚨 Kafka Connection Troubleshooting Guide

## 🔍 **Error Analysis**

The error you encountered:
```
org.apache.kafka.common.config.ConfigException: No resolvable bootstrap urls given in bootstrap.servers
```

This indicates that the Spring Boot application cannot resolve the Kafka bootstrap servers during startup.

## 🛠️ **Solutions Implemented**

### **1. Enhanced Kafka Configuration**
- ✅ Added connection timeout settings
- ✅ Added session timeout configurations
- ✅ Added heartbeat intervals
- ✅ Added startup timeout settings

### **2. Conditional Kafka Components**
- ✅ Made Kafka listeners conditional
- ✅ Added `@ConditionalOnProperty` annotations
- ✅ Created Kafka health indicators

### **3. Startup Delay Configuration**
- ✅ Created `KafkaStartupConfig` to wait for Kafka
- ✅ Added retry logic for Kafka connectivity
- ✅ Implemented graceful listener startup

### **4. Docker Configuration Updates**
- ✅ Fixed port conflicts (Grafana: 3001:3000, Kafka JMX: 9102)
- ✅ Added proper service dependencies
- ✅ Enhanced environment variables

## 🚀 **How to Test the Fix**

### **1. Start Services in Order**
```bash
# Stop any running containers
docker-compose down

# Start services with proper order
docker-compose up -d postgres-db redis zookeeper kafka

# Wait for Kafka to be healthy
docker-compose logs -f kafka

# Start the Spring Boot application
docker-compose up -d bookstore_springboot_app

# Start frontend
docker-compose up -d frontend
```

### **2. Check Service Status**
```bash
# Check all services
docker-compose ps

# Check Kafka health
docker-compose logs kafka | grep -i "started"

# Check Spring Boot logs
docker-compose logs bookstore_springboot_app | grep -i kafka
```

### **3. Verify Kafka Connectivity**
```bash
# Test Kafka from within the network
docker exec -it kafka kafka-topics --bootstrap-server localhost:29092 --list

# Test from Spring Boot container
docker exec -it bookstore_springboot_app nc -zv kafka 29092
```

## 🔧 **Manual Testing Commands**

### **1. Test Kafka Topics**
```bash
# List topics
docker exec -it kafka kafka-topics --bootstrap-server localhost:29092 --list

# Create test topic
docker exec -it kafka kafka-topics --bootstrap-server localhost:29092 --create --topic test-topic --partitions 1 --replication-factor 1

# Send test message
docker exec -it kafka kafka-console-producer --bootstrap-server localhost:29092 --topic test-topic
```

### **2. Test Spring Boot Health**
```bash
# Check health endpoint
curl http://localhost:8080/actuator/health

# Check Kafka health specifically
curl http://localhost:8080/actuator/health/kafka
```

## 🚨 **Common Issues & Solutions**

### **Issue 1: Kafka Not Ready**
```bash
# Solution: Wait for Kafka health check
docker-compose logs kafka | grep -i "started"
# Look for: "started (kafka.server.KafkaServer)"
```

### **Issue 2: Port Conflicts**
```bash
# Check for port conflicts
netstat -tulpn | grep -E "(9092|29092|3001|9102)"

# Solution: Use the fixed port mappings
# Kafka: 9092:9092, 9102:9102
# Grafana: 3001:3000
```

### **Issue 3: DNS Resolution**
```bash
# Test DNS resolution from Spring Boot container
docker exec -it bookstore_springboot_app nslookup kafka
docker exec -it bookstore_springboot_app ping kafka
```

### **Issue 4: Network Connectivity**
```bash
# Test network connectivity
docker exec -it bookstore_springboot_app nc -zv kafka 29092
docker exec -it bookstore_springboot_app telnet kafka 29092
```

## 📋 **Configuration Files Updated**

### **1. `application.yml`**
- ✅ Enhanced Kafka consumer/producer settings
- ✅ Added connection timeout configurations
- ✅ Added startup timeout settings

### **2. `docker-compose.yml`**
- ✅ Fixed Grafana port mapping (3001:3000)
- ✅ Updated Kafka JMX port (9102:9102)
- ✅ Added proper service dependencies
- ✅ Enhanced environment variables

### **3. Kafka Components**
- ✅ Added conditional annotations
- ✅ Enhanced error handling
- ✅ Added startup delay logic

## 🎯 **Expected Behavior After Fix**

1. **Kafka starts first** and becomes healthy
2. **Spring Boot waits** for Kafka to be ready
3. **Kafka listeners start** after connectivity is confirmed
4. **Application starts successfully** without connection errors

## 🔍 **Debugging Steps**

### **Step 1: Check Kafka Status**
```bash
docker-compose logs kafka | tail -20
```

### **Step 2: Check Spring Boot Logs**
```bash
docker-compose logs bookstore_springboot_app | grep -i kafka
```

### **Step 3: Check Network Connectivity**
```bash
docker network ls
docker network inspect bookstore_default
```

### **Step 4: Test Manual Connection**
```bash
docker exec -it bookstore_springboot_app nc -zv kafka 29092
```

## 🆘 **If Issues Persist**

1. **Check Docker logs** for specific error messages
2. **Verify network connectivity** between containers
3. **Check Kafka health** status
4. **Review environment variables** in `.env` file
5. **Test with minimal configuration** (disable Kafka temporarily)

## 📚 **Additional Resources**

- [Spring Kafka Documentation](https://docs.spring.io/spring-kafka/docs/current/reference/html/)
- [Docker Compose Dependencies](https://docs.docker.com/compose/startup-order/)
- [Kafka Docker Configuration](https://docs.confluent.io/platform/current/installation/docker/config-reference.html)

The Kafka connection issue should now be resolved! 🎉

