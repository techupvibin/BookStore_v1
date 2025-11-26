# 🚀 BookStore Production Setup Guide

This guide covers the production-ready setup of the BookStore application with monitoring, and enhanced security.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Spring Boot   │    │   PostgreSQL    │
│   (Port 3000)   │◄──►│   Backend      │◄──►│   Database      │
│                 │    │   (Port 8080)  │    │   (Port 5432)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WebSocket     │    │   Apache Kafka  │    │     Redis       │
│   Real-time     │    │   Event Stream  │    │   (Port 6379)   │
│   Updates       │    │   (Port 9092)   │    │   (Port 6379)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Prometheus    │    │     Grafana     │    │  AlertManager   │
│   Monitoring    │    │   Dashboards    │    │   Alerts        │
│   (Port 9090)   │    │   (Port 3001)   │    │   (Port 9093)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔄 Order Processing Implementation

### Order Workflow Steps

1. **Order Creation** → User places order from cart
2. **Inventory Check** → Verify book availability
3. **Payment Processing** → Process payment via Stripe
4. **Order Confirmation** → Send confirmation email
5. **Order Fulfillment** → Update order status

### Order States

- `NEW_ORDER`: Order just created
- `PROCESSING`: Order being processed
- `SHIPPED`: Order shipped to customer
- `DELIVERED`: Order delivered successfully
- `CANCELLED`: Order cancelled
- `REFUNDED`: Order refunded

## 📊 Monitoring & Observability

### Prometheus Metrics

- **Application Metrics**: HTTP requests, response times, error rates
- **Order Metrics**: Order processing time, success/failure rates
- **Kafka Metrics**: Message throughput, consumer lag, producer errors
- **JVM Metrics**: Memory usage, GC performance, thread states
- **Database Metrics**: Connection pool, query performance

### Grafana Dashboards

- **BookStore Application Dashboard**: Overall application health
- **Order Processing Dashboard**: Order workflow monitoring
- **Kafka Dashboard**: Message broker performance
- **Infrastructure Dashboard**: System resources

### Alerting Rules

- **Critical**: Application down, high error rates
- **Warning**: High response times, memory usage, order processing failures
- **Info**: Performance degradation, resource usage

## 🚀 Quick Start

### 1. Prerequisites

- Docker & Docker Compose
- Java 17+
- Node.js 18+
- Maven 3.8+

### 2. Clone and Setup

```bash
git clone <repository-url>
cd BookStore
```

### 3. Environment Configuration

**Note**: Environment variables are now commented out in the configuration files. The application uses hardcoded default values for development. For production, you should uncomment the relevant lines in the configuration files and set up proper environment variables.

If you want to use external services, create a `.env` file with production values:

```env
# Database
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=BookStore

# JWT
JWT_SECRET=your_very_long_random_secret_key

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Stripe (Optional)
STRIPE_SECRET_KEY=your_stripe_secret_key

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

### 4. Start Services

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 5. Access Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin123)
- **AlertManager**: http://localhost:9093
- **pgAdmin**: http://localhost:5050 (admin@example.com/admin123)

## 🔐 Security Configuration

### JWT Configuration

```yaml
jwt:
  secret: dGhpcy1pcy1hLXN1cGVyLXNlY3JldC1rZXktdGhhdC1pcy1tb3JlLXRoYW4tMzItYnl0ZXMhISE=
  expiration: 86400000 # 24 hours
```

### RBAC Roles

- **USER**: Place orders, view history
- **ADMIN**: Manage orders, users, inventory
- **PUBLISHER**: Manage books, categories

### CORS Configuration

```yaml
cors:
  allowed-origins: ["https://yourdomain.com"]
  allowed-methods: ["GET", "POST", "PUT", "DELETE"]
  allow-credentials: true
```

## 📈 Performance Tuning

### Kafka Configuration

- **Producer**: Idempotency enabled, acks=all
- **Consumer**: Auto-commit disabled, manual offset management
- **Topics**: 3 partitions, compression enabled

### Database Optimization

- **Connection Pool**: HikariCP with optimal settings
- **Indexing**: Strategic indexes on frequently queried fields
- **Query Optimization**: JPA query hints and native queries

### Caching Strategy

- **Redis**: Session storage, frequently accessed data
- **Application Cache**: In-memory caching for static data
- **CDN**: Static asset delivery optimization

## 🧪 Testing

### Unit Tests

```bash
# Backend tests
mvn test

# Frontend tests
cd Frontend
npm test
```

### Integration Tests

```bash
# API integration tests
mvn test -Dtest=*IntegrationTest

# Order processing tests
mvn test -Dtest=*OrderTest
```

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:8080/api/health

# Using JMeter
jmeter -t load-test-plan.jmx
```

## 📝 Logging

### Log Levels

- **Production**: INFO level with structured JSON logging
- **Development**: DEBUG level with colored console output
- **Performance**: Dedicated performance logging

### Log Rotation

- **Application Logs**: Daily rotation, 7 days retention
- **Error Logs**: Daily rotation, 30 days retention
- **JSON Logs**: Daily rotation, 30 days retention

## 🔍 Troubleshooting

### Common Issues

1. **Order Processing Failures**
   - Check order service logic
   - Verify Kafka connectivity
   - Review database constraints

2. **Performance Issues**
   - Monitor Prometheus metrics
   - Check database query performance
   - Review Kafka consumer lag

3. **Memory Leaks**
   - Monitor JVM heap usage
   - Check for connection leaks
   - Review cache eviction policies

### Debug Commands

```bash
# Check service health
curl http://localhost:8080/actuator/health

# View order statistics
curl http://localhost:8080/api/v1/orders/statistics

# Check Kafka topics
docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092

# Monitor logs
docker-compose logs -f --tail=100
```

## 📚 API Documentation

### Order Endpoints

- `POST /api/v1/orders` - Create new order
- `GET /api/v1/orders/{orderId}` - Get order details
- `PUT /api/v1/orders/{orderId}/status` - Update order status
- `GET /api/v1/orders/statistics` - Get order metrics

### Order Management

- `GET /api/v1/orders` - List all orders
- `PUT /api/v1/orders/{id}/status` - Update order status
- `DELETE /api/v1/orders/{id}` - Cancel order

## 🚀 Deployment

### Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy with production config
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale bookstore_springboot_app=3
```

### Health Checks

```bash
# Application health
curl http://localhost:8080/actuator/health

# Database connectivity
docker exec -it postgres-db pg_isready

# Kafka connectivity
docker exec -it kafka kafka-broker-api-versions --bootstrap-server localhost:9092
```

## 📞 Support

For production support and issues:

1. Check application logs
2. Review Prometheus metrics
3. Verify service connectivity
4. Check resource utilization
5. Review alert notifications

## 🔄 Updates & Maintenance

### Regular Maintenance

- **Daily**: Monitor alerts and metrics
- **Weekly**: Review performance trends
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Performance optimization and capacity planning

### Backup Strategy

- **Database**: Daily automated backups
- **Configuration**: Version controlled configuration files
- **Logs**: Centralized log aggregation
- **Metrics**: Prometheus data retention management
