# 🐳 Dockerisation Documentation - BookStore Application

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Docker Configuration](#docker-configuration)
- [Container Details](#container-details)
- [Port Mappings](#port-mappings)
- [Building Images](#building-images)
- [Running Containers](#running-containers)
- [Accessing Services](#accessing-services)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## 🎯 Overview

The BookStore application is fully containerised using **Docker** and **Docker Compose**. This enables:

- **Consistent Environment**: Same setup across development, staging, and production
- **Easy Deployment**: One command to start all services
- **Isolation**: Each service runs in its own container
- **Scalability**: Easy to scale individual services
- **Dependency Management**: Automatic service orchestration

### **Containerised Services**

| Service | Container Name | Image | Purpose |
|---------|---------------|-------|---------|
| **PostgreSQL** | `my-postgres` | `postgres:14` | Primary database |
| **pgAdmin** | `my-pgadmin` | `dpage/pgadmin4` | Database administration |
| **Redis** | `redis_cache` | `redis:7` | Caching layer |
| **Zookeeper** | `zookeeper` | `confluentinc/cp-zookeeper:7.4.0` | Kafka coordination |
| **Kafka** | `kafka` | `confluentinc/cp-kafka:7.4.0` | Message broker |
| **Spring Boot** | `bookstore_springboot_app` | Custom build | Backend API |
| **React Frontend** | `Frontend` | Custom build | Frontend application |
| **Prometheus** | `prometheus` | `prom/prometheus:latest` | Metrics collection |
| **Grafana** | `grafana` | `grafana/grafana:latest` | Monitoring dashboard |
| **AlertManager** | `alertmanager` | `prom/alertmanager:latest` | Alert management |

---

## 🏗️ Architecture

### **Docker Compose Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network                            │
│              (bookstore_v1_default)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │    Redis     │  │  Zookeeper   │     │
│  │  Port: 5432  │  │  Port: 6379  │  │  Port: 2181  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                │                │                │
│         └────────────────┼────────────────┘                │
│                          │                                  │
│                  ┌───────▼────────┐                        │
│                  │     Kafka      │                        │
│                  │  Port: 29092   │                        │
│                  │  (Internal)    │                        │
│                  └───────┬────────┘                        │
│                          │                                  │
│         ┌────────────────┼────────────────┐                │
│         │                │                │                │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐       │
│  │ Spring Boot │  │  Prometheus │  │   Grafana    │       │
│  │  Port: 8080 │  │ Port: 9090  │  │ Port: 3001   │       │
│  └──────┬──────┘  └─────────────┘  └─────────────┘       │
│         │                                                  │
│  ┌──────▼──────┐                                          │
│  │  Frontend   │                                          │
│  │ Port: 3000  │                                          │
│  └─────────────┘                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### **Multi-Stage Build Process**

#### **Backend (Spring Boot)**
```
Stage 1: Build
├── Base Image: maven:3.9.6-eclipse-temurin-17
├── Copy source code
├── Run: mvn package
└── Output: JAR file

Stage 2: Runtime
├── Base Image: eclipse-temurin:17-jre
├── Copy JAR from Stage 1
└── Run: java -jar app.jar
```

#### **Frontend (React)**
```
Stage 1: Build
├── Base Image: node:18-alpine
├── Install dependencies
├── Build React app
└── Output: Production build

Stage 2: Serve
├── Base Image: nginx:alpine
├── Copy build from Stage 1
└── Serve static files
```

---

## 📦 Prerequisites

### **Required Software**

1. **Docker** (version 20.10 or higher)
   ```bash
   # Verify installation
   docker --version
   ```

2. **Docker Compose** (version 2.0 or higher)
   ```bash
   # Verify installation
   docker-compose --version
   ```

3. **Git** (for cloning repository)
   ```bash
   # Verify installation
   git --version
   ```

### **System Requirements**

- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: At least 10GB free
- **CPU**: 2+ cores recommended
- **OS**: Windows 10/11, macOS, or Linux

### **Port Availability**

Ensure these ports are available:
- `3000` - Frontend
- `3001` - Grafana
- `5050` - pgAdmin
- `5432` - PostgreSQL
- `6379` - Redis
- `8080` - Spring Boot API
- `9090` - Prometheus
- `9092` - Kafka
- `9093` - AlertManager
- `9102` - Kafka JMX
- `2181` - Zookeeper

---

## 🚀 Quick Start

### **1. Clone Repository**
```bash
git clone <repository-url>
cd BookStore_v1
```

### **2. Start All Services**
```bash
# Build and start all containers
docker-compose up -d

# View logs
docker-compose logs -f
```

### **3. Access Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **Admin Dashboard**: http://localhost:3000/admin

### **4. Stop Services**
```bash
# Stop all containers
docker-compose stop

# Stop and remove containers
docker-compose down
```

---

## ⚙️ Docker Configuration

### **docker-compose.yml Structure**

```yaml
version: '3.8'

services:
  # Database Services
  postgres-db:        # PostgreSQL database
  pgadmin:           # Database admin UI
  
  # Cache & Messaging
  redis:             # Redis cache
  zookeeper:         # Kafka coordination
  kafka:             # Message broker
  
  # Application Services
  bookstore_springboot_app:  # Backend API
  frontend:                  # React frontend
  
  # Monitoring
  prometheus:        # Metrics collection
  grafana:          # Monitoring dashboard
  alertmanager:     # Alert management

volumes:
  postgres_data:     # Database persistence
  prometheus_data:   # Metrics persistence
  grafana_data:      # Grafana data
  alertmanager_data: # Alert data
```

### **Key Configuration Features**

1. **Service Dependencies**: Services start in correct order
2. **Health Checks**: Kafka has health check before app starts
3. **Volume Persistence**: Data persists across container restarts
4. **Network Isolation**: All services on same Docker network
5. **Environment Variables**: Configurable via docker-compose.yml

---

## 📦 Container Details

### **1. PostgreSQL Database**

```yaml
postgres-db:
  image: postgres:14
  container_name: my-postgres
  ports:
    - "5432:5432"
  environment:
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: Wrong123
    POSTGRES_DB: BookStore
  volumes:
    - postgres_data:/var/lib/postgresql/data
```

**Features**:
- Persistent data storage
- Pre-configured database
- Accessible on port 5432

### **2. pgAdmin**

```yaml
pgadmin:
  image: dpage/pgadmin4
  container_name: my-pgadmin
  ports:
    - "5050:80"
  environment:
    PGADMIN_DEFAULT_EMAIL: admin@example.com
    PGADMIN_DEFAULT_PASSWORD: admin123
```

**Access**: http://localhost:5050
**Credentials**: admin@example.com / admin123

### **3. Redis Cache**

```yaml
redis:
  image: redis:7
  container_name: redis_cache
  ports:
    - "6379:6379"
```

**Purpose**: Session management and caching

### **4. Kafka & Zookeeper**

```yaml
zookeeper:
  image: confluentinc/cp-zookeeper:7.4.0
  container_name: zookeeper
  ports:
    - "2181:2181"

kafka:
  image: confluentinc/cp-kafka:7.4.0
  container_name: kafka
  depends_on:
    - zookeeper
  ports:
    - "9092:9092"      # External
    - "9102:9102"      # JMX
  healthcheck:
    test: ["CMD-SHELL", "kafka-topics --bootstrap-server localhost:29092 --list"]
```

**Features**:
- Health check before app starts
- Auto topic creation enabled
- Internal port: 29092, External: 9092

### **5. Spring Boot Backend**

```yaml
bookstore_springboot_app:
  build:
    context: ./
  container_name: bookstore_springboot_app
  depends_on:
    postgres-db:
      condition: service_started
    redis:
      condition: service_started
    kafka:
      condition: service_healthy
  ports:
    - "8080:8080"
  environment:
    SPRING_PROFILES_ACTIVE: docker
```

**Dockerfile** (Multi-stage build):
```dockerfile
# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn -q -DskipTests package

# Runtime stage
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENV SPRING_PROFILES_ACTIVE=docker
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Features**:
- Multi-stage build (smaller final image)
- Wildcard JAR copy (works with any artifactId)
- Automatic dependency waiting

### **6. React Frontend**

```yaml
frontend:
  build:
    context: ./Frontend
    dockerfile: Dockerfile
    args:
      REACT_APP_API_BASE_URL: http://localhost:8080/api
  container_name: Frontend
  ports:
    - "3000:80"
  depends_on:
    - bookstore_springboot_app
```

**Dockerfile** (Multi-stage build):
```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
RUN npm run build:docker

# Serve stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Features**:
- Nginx for serving static files
- Build-time environment variables
- Optimised production build

### **7. Monitoring Stack**

**Prometheus**:
```yaml
prometheus:
  image: prom/prometheus:latest
  container_name: prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    - prometheus_data:/prometheus
```

**Grafana**:
```yaml
grafana:
  image: grafana/grafana:latest
  container_name: grafana
  ports:
    - "3001:3000"
  environment:
    GF_SECURITY_ADMIN_USER: admin
    GF_SECURITY_ADMIN_PASSWORD: admin123
```

**AlertManager**:
```yaml
alertmanager:
  image: prom/alertmanager:latest
  container_name: alertmanager
  ports:
    - "9093:9093"
```

---

## 🔌 Port Mappings

### **Complete Port Reference**

| Service | Container Name | External Port | Internal Port | URL |
|---------|---------------|---------------|---------------|-----|
| **Frontend** | Frontend | 3000 | 80 | http://localhost:3000 |
| **Backend API** | bookstore_springboot_app | 8080 | 8080 | http://localhost:8080/api |
| **PostgreSQL** | my-postgres | 5432 | 5432 | localhost:5432 |
| **pgAdmin** | my-pgadmin | 5050 | 80 | http://localhost:5050 |
| **Redis** | redis_cache | 6379 | 6379 | localhost:6379 |
| **Zookeeper** | zookeeper | 2181 | 2181 | localhost:2181 |
| **Kafka** | kafka | 9092 | 9092 | localhost:9092 |
| **Kafka JMX** | kafka | 9102 | 9102 | localhost:9102 |
| **Prometheus** | prometheus | 9090 | 9090 | http://localhost:9090 |
| **Grafana** | grafana | 3001 | 3000 | http://localhost:3001 |
| **AlertManager** | alertmanager | 9093 | 9093 | http://localhost:9093 |

### **Internal Network Communication**

Services communicate internally using container names:

- **Database**: `postgres-db:5432`
- **Redis**: `redis:6379`
- **Kafka**: `kafka:29092` (internal port)
- **Zookeeper**: `zookeeper:2181`

---

## 🔨 Building Images

### **Build All Services**

```bash
# Build all images
docker-compose build

# Build without cache
docker-compose build --no-cache

# Build specific service
docker-compose build bookstore_springboot_app
docker-compose build frontend
```

### **Build Individual Services**

#### **Backend**
```bash
# From project root
docker build -t bookstore-backend:latest .

# With specific tag
docker build -t bookstore-backend:v1.0 .
```

#### **Frontend**
```bash
# From Frontend directory
cd Frontend
docker build -t bookstore-frontend:latest .

# With build arguments
docker build \
  --build-arg REACT_APP_API_BASE_URL=http://localhost:8080/api \
  -t bookstore-frontend:latest .
```

### **Build Optimisation**

1. **Layer Caching**: Copy package files before source code
2. **Multi-stage Builds**: Smaller final images
3. **.dockerignore**: Exclude unnecessary files
4. **Parallel Builds**: Docker Compose builds in parallel

---

## 🏃 Running Containers

### **Start Services**

```bash
# Start all services in detached mode
docker-compose up -d

# Start and rebuild
docker-compose up -d --build

# Start specific service
docker-compose up -d postgres-db
docker-compose up -d bookstore_springboot_app
```

### **Stop Services**

```bash
# Stop all services
docker-compose stop

# Stop specific service
docker-compose stop frontend
```

### **Restart Services**

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart bookstore_springboot_app
```

### **View Logs**

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f bookstore_springboot_app

# Last 100 lines
docker-compose logs --tail=100 bookstore_springboot_app
```

### **Check Status**

```bash
# All containers
docker-compose ps

# Detailed status
docker ps

# Resource usage
docker stats
```

---

## 🌐 Accessing Services

### **Application URLs**

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application |
| **Backend API** | http://localhost:8080/api | REST API |
| **Admin Dashboard** | http://localhost:3000/admin | Admin panel |
| **API Health** | http://localhost:8080/actuator/health | Health check |

### **Database Access**

| Service | URL | Credentials |
|---------|-----|-------------|
| **pgAdmin** | http://localhost:5050 | admin@example.com / admin123 |
| **PostgreSQL** | localhost:5432 | postgres / Wrong123 |

### **Monitoring URLs**

| Service | URL | Credentials |
|---------|-----|-------------|
| **Prometheus** | http://localhost:9090 | - |
| **Grafana** | http://localhost:3001 | admin / admin123 |
| **AlertManager** | http://localhost:9093 | - |

### **Testing Connectivity**

```bash
# Test frontend
curl http://localhost:3000

# Test backend
curl http://localhost:8080/api/books

# Test health
curl http://localhost:8080/actuator/health

# Test database
docker exec -it my-postgres psql -U postgres -d BookStore
```

---

## 🔧 Troubleshooting

### **Common Issues**

#### **1. Container Name Conflicts**

**Error**: `Conflict. The container name "/container-name" is already in use`

**Solution**:
```bash
# Remove conflicting container
docker stop <container-name>
docker rm <container-name>

# Or clean up all
docker-compose down
```

#### **2. Port Already in Use**

**Error**: `Bind for 0.0.0.0:8080 failed: port is already allocated`

**Solution**:
```bash
# Find process using port
netstat -ano | findstr :8080

# Kill process (Windows)
taskkill /PID <pid> /F

# Or change port in docker-compose.yml
```

#### **3. Build Failures**

**Error**: `failed to solve: failed to compute cache key`

**Solution**:
```bash
# Clean build
docker-compose build --no-cache

# Remove old images
docker image prune -a
```

#### **4. JAR File Not Found**

**Error**: `"/app/target/spring-boot-app-0.0.1-SNAPSHOT.jar": not found`

**Solution**: Use wildcard in Dockerfile:
```dockerfile
COPY --from=build /app/target/*.jar app.jar
```

#### **5. Service Won't Start**

**Error**: Service exits immediately

**Solution**:
```bash
# Check logs
docker-compose logs <service-name>

# Check dependencies
docker-compose ps

# Verify health checks
docker inspect <container-name> | grep -A 10 Health
```

#### **6. Database Connection Issues**

**Error**: Cannot connect to database

**Solution**:
```bash
# Check database is running
docker-compose ps postgres-db

# Check connection from app container
docker exec -it bookstore_springboot_app nc -zv postgres-db 5432

# Verify credentials in docker-compose.yml
```

#### **7. Kafka Connection Issues**

**Error**: Kafka connection timeout

**Solution**:
```bash
# Wait for Kafka to be healthy
docker-compose logs kafka | grep -i "started"

# Check Kafka health
docker exec -it kafka kafka-topics --bootstrap-server localhost:29092 --list

# Verify from app container
docker exec -it bookstore_springboot_app nc -zv kafka 29092
```

### **Debugging Commands**

```bash
# Enter container shell
docker exec -it <container-name> /bin/sh

# Check container logs
docker logs <container-name>

# Inspect container
docker inspect <container-name>

# Check network
docker network inspect bookstore_v1_default

# View resource usage
docker stats

# Clean up everything
docker-compose down -v
docker system prune -a
```

---

## ✅ Best Practices

### **1. Image Optimisation**

- Use multi-stage builds
- Minimize layers
- Use .dockerignore
- Remove unnecessary files
- Use specific image tags

### **2. Security**

- Don't hardcode secrets
- Use environment variables
- Keep images updated
- Use non-root users (where possible)
- Scan images for vulnerabilities

### **3. Performance**

- Use build cache effectively
- Parallel builds where possible
- Optimize Dockerfile order
- Use appropriate base images
- Minimize image size

### **4. Maintenance**

- Regular image updates
- Monitor resource usage
- Clean up unused resources
- Document changes
- Version control Dockerfiles

### **5. Development Workflow**

```bash
# Development
docker-compose up -d

# View logs
docker-compose logs -f

# Rebuild after changes
docker-compose up -d --build

# Clean restart
docker-compose down
docker-compose up -d --build
```

### **6. Production Considerations**

- Use specific image tags (not `latest`)
- Enable health checks
- Configure resource limits
- Use secrets management
- Set up monitoring
- Configure backups
- Use orchestration (Kubernetes)

---

## 📊 Resource Management

### **View Resource Usage**

```bash
# Real-time stats
docker stats

# Disk usage
docker system df

# Container resource limits
docker inspect <container-name> | grep -A 5 Resources
```

### **Clean Up**

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune -a

# Remove with volumes
docker-compose down -v
```

---

## 🔄 Updates and Maintenance

### **Update Images**

```bash
# Pull latest images
docker-compose pull

# Rebuild custom images
docker-compose build --no-cache

# Restart services
docker-compose up -d
```

### **Backup and Restore**

#### **Database Backup**
```bash
# Backup
docker exec my-postgres pg_dump -U postgres BookStore > backup.sql

# Restore
docker exec -i my-postgres psql -U postgres BookStore < backup.sql
```

#### **Volume Backup**
```bash
# Backup volume
docker run --rm -v bookstore_v1_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup.tar.gz /data

# Restore volume
docker run --rm -v bookstore_v1_postgres_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/postgres_backup.tar.gz -C /
```

---

## 📚 Additional Resources

- **Docker Documentation**: https://docs.docker.com/
- **Docker Compose Documentation**: https://docs.docker.com/compose/
- **Spring Boot Docker Guide**: https://spring.io/guides/gs/spring-boot-docker/
- **React Docker Guide**: https://mherman.org/blog/dockerizing-a-react-app/
- **Kafka Docker Setup**: See `KAFKA_DOCKER_SETUP.md`
- **Port Mapping**: See `PORT_MAPPING_SUMMARY.md`

---

## 🎯 Quick Reference

### **Essential Commands**

```bash
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Rebuild
docker-compose up -d --build

# Check status
docker-compose ps

# Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:8080/api
```

### **Service URLs**

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080/api
- **pgAdmin**: http://localhost:5050
- **Grafana**: http://localhost:3001
- **Prometheus**: http://localhost:9090

---

<div align="center">
  <strong>🐳 Dockerisation Documentation</strong><br>
  <em>Complete guide to Docker setup and deployment for BookStore application</em>
</div>

