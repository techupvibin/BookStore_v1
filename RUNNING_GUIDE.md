# 🚀 BookStore Application - Complete Running Guide

## 📋 **Table of Contents**
1. [Prerequisites](#prerequisites)
2. [Backend Setup & Running](#backend-setup--running)
3. [Frontend Setup & Running](#frontend-setup--running)
4. [Docker Setup (Recommended)](#docker-setup-recommended)
5. [Manual Setup](#manual-setup)
6. [Environment Configuration](#environment-configuration)
7. [Troubleshooting](#troubleshooting)
8. [Development Workflow](#development-workflow)

---

## 🔧 **Prerequisites**

### **Required Software**
- **Java 17** or higher
- **Node.js 16** or higher
- **Maven 3.6+** (or use the one bundled with IntelliJ IDEA)
- **PostgreSQL 14** (or use Docker)
- **Git**

### **Optional but Recommended**
- **Docker & Docker Compose** (for easy setup)
- **IntelliJ IDEA** (for backend development)
- **VS Code** (for frontend development)
- **Postman** (for API testing)

### **Check Your Environment**
```bash
# Check Java version
java -version

# Check Node.js version
node --version

# Check npm version
npm --version

# Check Maven version (if installed globally)
mvn --version

# Check Docker version (if using Docker)
docker --version
docker-compose --version
```

---

## 🖥️ **Backend Setup & Running**

### **Method 1: Using IntelliJ IDEA (Recommended)**

#### **Step 1: Open Project in IntelliJ IDEA**
1. Open IntelliJ IDEA
2. Click "Open" and select your `BookStore` folder
3. Wait for IntelliJ to index the project and download dependencies

#### **Step 2: Configure Java SDK**
1. Go to `File` → `Project Structure` → `Project`
2. Set Project SDK to Java 17
3. Set Project language level to 17

#### **Step 3: Run the Application**
1. Navigate to `src/main/java/com/org/bookstore_backend/BookstoreApplication.java`
2. Right-click on the class and select "Run 'BookstoreApplication'"
3. Or use the green play button next to the main method

#### **Step 4: Verify Backend is Running**
- Open browser and go to: http://localhost:8080
- You should see the Spring Boot welcome page or API endpoints
- Check health endpoint: http://localhost:8080/actuator/health

### **Method 2: Using Command Line**

#### **Step 1: Navigate to Project Directory**
```bash
cd C:\Users\govin\IdeaProjects\BookStore
```

#### **Step 2: Set JAVA_HOME (if not set)**
```bash
# For Windows (PowerShell)
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"

# For Windows (Command Prompt)
set JAVA_HOME=C:\Program Files\Java\jdk-17

# For Linux/Mac
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
```

#### **Step 3: Run with Maven**
```bash
# Using IntelliJ's bundled Maven
& "C:\Users\govin\AppData\Roaming\JetBrains\IdeaIC2025.2\plugins\maven\lib\maven3\bin\mvn.cmd" spring-boot:run

# Or if Maven is in your PATH
mvn spring-boot:run

# For clean build and run
mvn clean spring-boot:run
```

#### **Step 4: Alternative Maven Commands**
```bash
# Compile the project
mvn clean compile

# Run tests
mvn test

# Package the application
mvn clean package

# Run the packaged JAR
java -jar target/spring-boot-app-0.0.1-SNAPSHOT.jar
```

### **Backend Configuration**

#### **Database Setup**
The application uses PostgreSQL. You have two options:

**Option 1: Use Docker (Recommended)**
```bash
# Start only PostgreSQL
docker run --name postgres-bookstore -e POSTGRES_PASSWORD=Wrong123 -e POSTGRES_DB=BookStore -p 5432:5432 -d postgres:14
```

**Option 2: Install PostgreSQL Locally**
1. Download and install PostgreSQL 14
2. Create database: `BookStore`
3. Create user with password: `Wrong123`
4. Update `application-local.yml` if needed

#### **Environment Variables**
**Note**: Environment variables are now commented out in the configuration files. The application uses hardcoded default values for development, so no `.env` file is required for basic functionality.

If you want to use external services, you can uncomment the relevant lines in the configuration files and set up the proper environment variables.

---

## 🌐 **Frontend Setup & Running**

### **Step 1: Navigate to Frontend Directory**
```bash
cd Frontend
```

### **Step 2: Install Dependencies**
```bash
# Install all required packages
npm install

# If you encounter issues, try:
npm install --legacy-peer-deps

# Or clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### **Step 3: Configure Environment Variables**
**Note**: Environment variables are now commented out in the configuration files. The application uses hardcoded default values for development, so no `.env` file is required for basic functionality.

If you want to use external services, you can uncomment the relevant lines in the configuration files and set up the proper environment variables.

### **Step 4: Start the Development Server**
```bash
# Start React development server
npm start

# The application will open automatically at http://localhost:3000
# If it doesn't open automatically, manually navigate to http://localhost:3000
```

### **Step 5: Verify Frontend is Running**
- Open browser and go to: http://localhost:3000
- You should see the BookStore homepage
- Try navigating to different pages to ensure everything works

### **Alternative Frontend Commands**
```bash
# Build for production
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build for Docker
npm run build:docker
```

---

## 🐳 **Docker Setup (Recommended)**

### **Complete Application with Docker Compose**

#### **Step 1: Start All Services**
```bash
# Navigate to project root
cd C:\Users\govin\IdeaProjects\BookStore

# Start all services (database, backend, frontend, etc.)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### **Step 2: Access the Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Database**: localhost:5432
- **Redis**: localhost:6379
- **Kafka**: localhost:9092
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001

#### **Step 3: Docker Commands**
```bash
# Build and start services
docker-compose up --build

# Start specific service
docker-compose up postgres-db

# View service logs
docker-compose logs bookstore_springboot_app

# Restart a service
docker-compose restart frontend

# Scale backend service
docker-compose up --scale bookstore_springboot_app=3
```

---

## 🔧 **Manual Setup (Without Docker)**

### **Step 1: Start Database**
```bash
# Using Docker for database only
docker run --name postgres-bookstore -e POSTGRES_PASSWORD=Wrong123 -e POSTGRES_DB=BookStore -p 5432:5432 -d postgres:14

# Or install PostgreSQL locally and start the service
```

### **Step 2: Start Redis (Optional)**
```bash
# Using Docker
docker run --name redis-bookstore -p 6379:6379 -d redis:7

# Or install Redis locally
```

### **Step 3: Start Kafka (Optional)**
```bash
# Start Zookeeper
docker run --name zookeeper -p 2181:2181 -d confluentinc/cp-zookeeper:7.4.0

# Start Kafka
docker run --name kafka -p 9092:9092 --link zookeeper -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 -d confluentinc/cp-kafka:7.4.0
```

### **Step 4: Start Backend**
```bash
# In project root directory
mvn spring-boot:run
```

### **Step 5: Start Frontend**
```bash
# In Frontend directory
cd Frontend
npm start
```

---

## ⚙️ **Environment Configuration**

### **Backend Configuration Files**

#### **application-local.yml** (for local development)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/BookStore
    username: postgres
    password: Wrong123
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
  kafka:
    enabled: false
    bootstrap-servers: localhost:9092

jwt:
  secret: local-jwt-secret-key-make-it-long-and-secure-for-development-only
  expiration: 86400000

stripe:
  secret:
    key: sk_test_your_stripe_secret_key
  publishable:
    key: pk_test_your_stripe_publishable_key

aws:
  s3:
    bucket: your-s3-bucket
    region: us-east-1
```

#### **application-docker.yml** (for Docker environment)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://postgres-db:5432/BookStore
    username: postgres
    password: Wrong123
  kafka:
    bootstrap-servers: kafka:29092

jwt:
  secret: dGhpcy1pcy1hLXN1cGVyLXNlY3JldC1rZXktdGhhdC1pcy1tb3JlLXRoYW4tMzItYnl0ZXMhISE=
  expiration: 86400000
```

### **Frontend Configuration**

#### **package.json** scripts
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

---

## 🔍 **Troubleshooting**

### **Common Backend Issues**

#### **Issue 1: JAVA_HOME not set**
```bash
# Error: JAVA_HOME environment variable is not defined correctly
# Solution: Set JAVA_HOME
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
```

#### **Issue 2: Database Connection Failed**
```bash
# Error: Connection to localhost:5432 refused
# Solution: Start PostgreSQL
docker run --name postgres-bookstore -e POSTGRES_PASSWORD=Wrong123 -e POSTGRES_DB=BookStore -p 5432:5432 -d postgres:14
```

#### **Issue 3: Port 8080 already in use**
```bash
# Error: Port 8080 was already in use
# Solution: Kill process using port 8080
netstat -ano | findstr :8080
taskkill /PID <PID_NUMBER> /F

# Or change port in application.yml
server:
  port: 8081
```

#### **Issue 4: Maven Build Fails**
```bash
# Error: BUILD FAILURE
# Solution: Clean and rebuild
mvn clean install
mvn spring-boot:run
```

### **Common Frontend Issues**

#### **Issue 1: npm install fails**
```bash
# Error: npm ERR! peer dep missing
# Solution: Use legacy peer deps
npm install --legacy-peer-deps
```

#### **Issue 2: Port 3000 already in use**
```bash
# Error: Port 3000 is already in use
# Solution: Use different port
set PORT=3001 && npm start
```

#### **Issue 3: API connection fails**
```bash
# Error: Network Error when calling API
# Solution: Check backend is running and CORS is configured
# Backend should be running on http://localhost:8080
```

### **Docker Issues**

#### **Issue 1: Docker containers won't start**
```bash
# Error: Container startup failed
# Solution: Check logs and restart
docker-compose logs
docker-compose down
docker-compose up --build
```

#### **Issue 2: Port conflicts**
```bash
# Error: Port is already allocated
# Solution: Stop conflicting services or change ports in docker-compose.yml
```

---

## 🚀 **Development Workflow**

### **Daily Development Workflow**

#### **1. Start Development Environment**
```bash
# Option 1: Using Docker (Recommended)
docker-compose up -d

# Option 2: Manual setup
# Terminal 1: Start database
docker run --name postgres-bookstore -e POSTGRES_PASSWORD=Wrong123 -e POSTGRES_DB=BookStore -p 5432:5432 -d postgres:14

# Terminal 2: Start backend
mvn spring-boot:run

# Terminal 3: Start frontend
cd Frontend
npm start
```

#### **2. Make Changes**
- **Backend**: Edit Java files in `src/main/java/`
- **Frontend**: Edit React files in `Frontend/src/`
- Changes are automatically reloaded (hot reload)

#### **3. Test Changes**
- **Backend**: Check http://localhost:8080/actuator/health
- **Frontend**: Check http://localhost:3000
- **API**: Use Postman or browser to test endpoints

#### **4. Stop Development Environment**
```bash
# If using Docker
docker-compose down

# If using manual setup
# Stop each service manually (Ctrl+C in each terminal)
```

### **Backend Development Tips**

#### **Useful Maven Commands**
```bash
# Clean and compile
mvn clean compile

# Run with specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=local

# Run tests
mvn test

# Package application
mvn clean package

# Skip tests during build
mvn clean package -DskipTests
```

#### **IntelliJ IDEA Tips**
- Use "Run with Coverage" to see test coverage
- Use "Debug" mode to set breakpoints
- Use "Run Configuration" to set environment variables
- Use "Database" tool window to connect to PostgreSQL

### **Frontend Development Tips**

#### **Useful npm Commands**
```bash
# Start with different port
PORT=3001 npm start

# Start with specific browser
BROWSER=chrome npm start

# Build and serve production build
npm run build
npx serve -s build

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage
```

#### **VS Code Tips**
- Install "ES7+ React/Redux/React-Native snippets" extension
- Use "Auto Rename Tag" extension for JSX
- Use "Prettier" extension for code formatting
- Use "ESLint" extension for code linting

---

## 📊 **Verification Checklist**

### **Backend Verification**
- [ ] Java 17 is installed and JAVA_HOME is set
- [ ] PostgreSQL is running on port 5432
- [ ] Backend starts without errors
- [ ] Health endpoint responds: http://localhost:8080/actuator/health
- [ ] API endpoints are accessible: http://localhost:8080/api/books
- [ ] Database tables are created automatically

### **Frontend Verification**
- [ ] Node.js 16+ is installed
- [ ] Frontend starts without errors
- [ ] Application loads at http://localhost:3000
- [ ] Can navigate between pages
- [ ] API calls to backend work
- [ ] No console errors in browser

### **Integration Verification**
- [ ] Frontend can communicate with backend
- [ ] User registration works
- [ ] User login works
- [ ] Book listing works
- [ ] Cart functionality works
- [ ] Real-time notifications work (if WebSocket is enabled)

---

## 🎯 **Quick Start Commands**

### **Fastest Way to Run Everything**
```bash
# 1. Clone repository (if not already done)
git clone <your-repo-url>
cd BookStore

# 2. Start everything with Docker
docker-compose up -d

# 3. Wait for services to start (30-60 seconds)
# 4. Open browser to http://localhost:3000
```

### **Development Mode (Manual)**
```bash
# Terminal 1: Database
docker run --name postgres-bookstore -e POSTGRES_PASSWORD=Wrong123 -e POSTGRES_DB=BookStore -p 5432:5432 -d postgres:14

# Terminal 2: Backend
mvn spring-boot:run

# Terminal 3: Frontend
cd Frontend && npm start
```

---

## 📞 **Getting Help**

### **Common Resources**
- **Spring Boot Documentation**: https://spring.io/projects/spring-boot
- **React Documentation**: https://reactjs.org/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Docker Documentation**: https://docs.docker.com/

### **Project-Specific Help**
- Check the `COMPREHENSIVE_README.md` for detailed architecture
- Check the `USER_FLOW_DOCUMENTATION.md` for request flow details
- Check the `API_DOCUMENTATION.md` for endpoint details

---

<div align="center">
  <strong>🚀 BookStore Application - Complete Running Guide</strong><br>
  <em>From setup to production deployment</em>
</div>
