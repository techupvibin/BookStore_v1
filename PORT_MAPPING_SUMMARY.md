# 🚀 BookStore Docker Port Mapping Summary

## 📋 All Container Ports (External:Internal)

| Service | Container Name | External Port | Internal Port | Purpose |
|---------|---------------|---------------|---------------|---------|
| **PostgreSQL** | my-postgres | 5432 | 5432 | Database |
| **pgAdmin** | my-pgadmin | 5050 | 80 | Database Admin UI |
| **Redis** | redis_cache | 6379 | 6379 | Cache |
| **Zookeeper** | zookeeper | 2181 | 2181 | Kafka Coordination |
| **Kafka** | kafka | 9092 | 9092 | Kafka Broker |
| **Kafka JMX** | kafka | 9102 | 9102 | Kafka Monitoring |
| **Spring Boot** | bookstore_springboot_app | 8080 | 8080 | Backend API |
| **Frontend** | Frontend | 3000 | 80 | React App |
| **Prometheus** | prometheus | 9090 | 9090 | Metrics Collection |
| **Grafana** | grafana | 3001 | 3000 | Monitoring Dashboard |
| **AlertManager** | alertmanager | 9093 | 9093 | Alert Management |

## 🔍 Port Conflict Analysis

### ✅ **No Conflicts Found**
All ports are now unique and properly mapped:

- **5432** - PostgreSQL (Standard)
- **5050** - pgAdmin (Standard)
- **6379** - Redis (Standard)
- **2181** - Zookeeper (Standard)
- **9092** - Kafka (Standard)
- **9102** - Kafka JMX (Updated from 9101)
- **8080** - Spring Boot (Standard)
- **3000** - Frontend (Standard)
- **9090** - Prometheus (Standard)
- **3001** - Grafana (Fixed from 3002)
- **9093** - AlertManager (Standard)

## 🚨 **Issues Fixed**

### 1. **Grafana Port Fix**
- **Before**: `"3001:3002"` ❌ (Wrong internal port)
- **After**: `"3001:3000"` ✅ (Correct internal port)

### 2. **Kafka JMX Port Update**
- **Before**: `9101:9101` ⚠️ (Potential conflict)
- **After**: `9102:9102` ✅ (Unique port)

## 🌐 **Access URLs**

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | - |
| **Backend API** | http://localhost:8080/api | - |
| **pgAdmin** | http://localhost:5050 | admin@example.com / admin123 |
| **Prometheus** | http://localhost:9090 | - |
| **Grafana** | http://localhost:3001 | admin / admin123 |
| **AlertManager** | http://localhost:9093 | - |

## 🔧 **Internal Docker Network**

Services communicate internally using container names:
- **Database**: `postgres-db:5432`
- **Redis**: `redis:6379`
- **Kafka**: `kafka:29092` (Internal)
- **Zookeeper**: `zookeeper:2181`

## 📊 **Port Range Summary**

- **5xxx**: Database & Admin (5050, 5432)
- **6xxx**: Cache (6379)
- **8xxx**: Application (8080)
- **9xxx**: Monitoring & Messaging (9090, 9092, 9093, 9102)
- **3xxx**: Frontend & Dashboards (3000, 3001)
- **2xxx**: Coordination (2181)

## ✅ **Verification Commands**

```bash
# Check all running containers
docker-compose ps

# Check port usage
netstat -tulpn | grep -E "(3000|3001|5050|5432|6379|8080|9090|9092|9093|9102|2181)"

# Test service connectivity
curl http://localhost:3000  # Frontend
curl http://localhost:8080/api/health  # Backend
curl http://localhost:9090  # Prometheus
curl http://localhost:3001  # Grafana
```

## 🎯 **Next Steps**

1. **Start services**: `docker-compose up -d`
2. **Verify all ports**: Check the verification commands above
3. **Test connectivity**: Access each service URL
4. **Monitor logs**: `docker-compose logs -f`

All port conflicts have been resolved! 🎉

