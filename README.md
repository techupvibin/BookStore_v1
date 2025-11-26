# 📚 BookStore - Full-Stack E-Commerce Platform

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://openjdk.java.net/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.3-green.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-20.10-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A modern, scalable e-commerce platform built with Spring Boot backend and React frontend, featuring event-driven architecture, real-time notifications, and comprehensive security.

## 🚀 Features

### ✨ Core Features
- **User Authentication & Authorization**
  - JWT-based authentication
  - OAuth2 integration with Google
  - Role-based access control (User, Admin, Publisher)
  - Secure password encryption with BCrypt

- **Book Management**
  - Comprehensive book catalog with categories
  - Advanced search and filtering
  - Image management with AWS S3
  - Inventory tracking and management

- **Shopping Experience**
  - Shopping cart functionality
  - Wishlist/favorites management
  - Order processing and tracking
  - Multiple payment gateways (Stripe, Razorpay)

- **Admin Dashboard**
  - User management and role assignment
  - Inventory control and analytics
  - Order management and processing
  - System settings and configuration

### 🔧 Technical Features
- **Event-Driven Architecture** with Apache Kafka
- **Real-time Notifications** via WebSocket
- **Email Service** with PDF invoice generation
- **Caching Strategy** with Redis
- **Containerized Deployment** with Docker
- **Responsive Design** for all devices

## 🏗️ Architecture

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
│   Real-time     │    │   Event Stream  │    │   (Port 9092)   │
│   Updates       │    │   (Port 6379)   │    │   (Port 9092)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Technology Stack

### Backend
- **Java 17** - Modern Java with latest features
- **Spring Boot 3.5.3** - Rapid application development
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Data access layer with Hibernate
- **Spring Kafka** - Event streaming and messaging
- **Spring WebSocket** - Real-time communication
- **Spring Mail** - Email service integration

### Frontend
- **React 18** - Modern UI library with hooks
- **Material-UI** - Consistent design system
- **React Router** - Client-side routing
- **Context API** - State management
- **Axios** - HTTP client for API communication

### Database & Storage
- **PostgreSQL 14** - Primary relational database
- **Redis 7** - Caching and session management
- **AWS S3** - File and image storage

### Message Broker & Events
- **Apache Kafka 7.4** - Event streaming platform
- **Zookeeper** - Kafka coordination service

### DevOps & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Maven** - Build and dependency management

### Security & Authentication
- **JWT (JSON Web Tokens)** - Stateless authentication
- **OAuth2** - Social login integration
- **BCrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
BookStore/
├── 📁 Frontend/                    # React frontend application
│   ├── 📁 src/
│   │   ├── 📁 components/         # React components
│   │   │   ├── 📁 admin/          # Admin-specific components
│   │   │   ├── 📁 pages/          # Page components
│   │   │   └── 📁 shared/         # Reusable components
│   │   ├── 📁 contexts/            # React context providers
│   │   ├── 📁 services/            # API service layer
│   │   └── 📁 styles/              # CSS and styling
│   ├── package.json                # Node.js dependencies
│   └── Dockerfile                  # Frontend container
│
├── 📁 src/                         # Spring Boot backend
│   ├── 📁 main/java/
│   │   └── 📁 com/org/bookstore_backend/
│   │       ├── 📁 config/          # Configuration classes
│   │       ├── 📁 controller/      # REST API controllers
│   │       ├── 📁 service/         # Business logic services
│   │       ├── 📁 repository/      # Data access layer
│   │       ├── 📁 model/           # JPA entities
│   │       ├── 📁 dto/             # Data transfer objects
│   │       ├── 📁 events/          # Event-driven architecture
│   │       └── 📁 security/        # Security configurations
│   └── 📁 resources/
│       └── application.yml         # Application configuration
│
├── 📁 docker-compose.yml           # Multi-container setup
├── 📁 Dockerfile                   # Backend container
├── 📁 pom.xml                      # Maven dependencies
└── 📁 README.md                    # This file
```

## 🔒 Repository Access Control

### 📖 **Read-Only for Contributors**
This repository is configured so that:
- ✅ **Users can view** all code and documentation
- ✅ **Users can fork** the repository to their account
- ✅ **Users can submit** pull requests for review
- ❌ **Users cannot directly edit** code in this repository
- ❌ **Only the repository owner** can merge changes

### 🔄 **Contribution Process**
1. **Fork** the repository to your GitHub account
2. **Create** a feature branch in your fork
3. **Make** your changes in your fork
4. **Submit** a pull request for review
5. **Wait** for approval from the repository owner

### 🛡️ **Security & Quality**
- All pull requests are automatically scanned for security vulnerabilities
- Code quality checks run on every submission
- Branch protection rules prevent unauthorized changes
- Only approved changes can be merged

---

## 🚀 Quick Start

### Prerequisites
- **Java 17** or higher
- **Node.js 16** or higher
- **Docker** and **Docker Compose**
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/BookStore.git
cd BookStore
```

### 2. Start with Docker (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Manual Setup

#### Backend Setup
```bash
# Navigate to project root
cd BookStore

# Build with Maven
mvn clean install

# Run Spring Boot application
mvn spring-boot:run
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd Frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Admin Dashboard**: http://localhost:3000/admin
- **Database**: localhost:5432 (PostgreSQL)
- **Redis**: localhost:6379
- **Kafka**: localhost:9092

## 🔧 Configuration

### Environment Variables
**Note**: Environment variables are now commented out in the configuration files. The application uses hardcoded default values for development, so no `.env` file is required for basic functionality.

If you want to use external services, you can uncomment the relevant lines in the configuration files and set up the proper environment variables.

### Database Setup
```sql
-- Create database
CREATE DATABASE BookStore;

-- Create user (optional)
CREATE USER bookstore_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE BookStore TO bookstore_user;
```

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
GET  /api/auth/validate     # Token validation
```

### Book Management
```
GET    /api/books           # Get all books
GET    /api/books/{id}      # Get book by ID
GET    /api/books/search    # Search books
POST   /api/books           # Create book (Admin)
PUT    /api/books/{id}      # Update book (Admin)
DELETE /api/books/{id}      # Delete book (Admin)
```

### Order Management
```
GET    /api/orders          # Get user orders
POST   /api/orders          # Create order
PUT    /api/orders/{id}     # Update order status
GET    /api/orders/{id}     # Get order details
```

### Admin Endpoints
```
GET    /api/admin/users     # Get all users
PUT    /api/admin/users/{id} # Update user role
GET    /api/admin/orders    # Get all orders
PUT    /api/admin/orders/{id} # Update order status
```

## 🔐 Security Features

### Authentication Flow
1. **User Registration**: BCrypt password hashing
2. **JWT Generation**: Secure token with user roles
3. **Token Validation**: Stateless authentication
4. **Role-Based Access**: Fine-grained permissions

### OAuth2 Integration
- **Google OAuth2** for social login
- **Automatic user creation** for new OAuth2 users
- **Seamless integration** with existing JWT system

### Security Headers
- **CORS** configuration for frontend integration
- **CSRF** protection (configurable)
- **Content Security Policy** headers
- **Secure cookie** settings

## 📧 Email Service

### Built-in Email Capabilities
- **No external APIs** required
- **Multiple email types**: Plain text, HTML, attachments
- **SMTP configuration** with environment variables
- **PDF invoice generation** for orders

### Email Templates
- **Order confirmation** emails
- **Status update** notifications
- **Welcome** emails for new users
- **Password reset** emails

## 🔄 Event-Driven Architecture

### Kafka Event Types
- **ORDER_CREATED** - Triggers notifications and inventory updates
- **ORDER_STATUS_UPDATED** - Triggers real-time updates
- **USER_REGISTERED** - Triggers welcome emails
- **PAYMENT_PROCESSED** - Triggers invoice generation

### Event Flow
```
Domain Event → Kafka Topic → Event Consumers → Actions
     ↓              ↓              ↓           ↓
Order Created → orders.events → Email Service → Send Email
```

## 🚀 Performance & Scalability

### Caching Strategy
- **Redis caching** for session management
- **JPA query optimization** with proper indexing
- **Lazy loading** for entity relationships
- **Connection pooling** for database efficiency

### Asynchronous Processing
- **Kafka events** for non-blocking operations
- **WebSocket** for real-time updates
- **Background email** processing
- **Event sourcing** for audit trails

## 🧪 Testing

### Test Coverage
- **Unit tests** for service layer
- **Integration tests** for API endpoints
- **Frontend tests** with React Testing Library
- **Database tests** with test containers

### Running Tests
```bash
# Backend tests
mvn test

# Frontend tests
cd Frontend
npm test

# Run tests with coverage
npm run test:coverage
```

## 📊 Monitoring & Health Checks

### Spring Boot Actuator
- **Health checks** for all services
- **Metrics** for performance monitoring
- **Prometheus** integration
- **Custom health indicators**

### Logging Strategy
- **Structured logging** with SLF4J
- **Log levels** configuration
- **Performance metrics** logging
- **Error tracking** and monitoring

## 🐳 Docker Deployment

### Container Architecture
```yaml
services:
  postgres-db:          # PostgreSQL database
  redis:                # Redis cache
  zookeeper:            # Kafka coordination
  kafka:                # Message broker
  bookstore_springboot_app: # Spring Boot application
  frontend:             # React application
```

### Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale bookstore_springboot_app=3
```

## 🔄 CI/CD Pipeline

### Build Process
1. **Code commit** triggers build
2. **Maven build** for backend
3. **NPM build** for frontend
4. **Docker image** creation
5. **Automated testing**
6. **Deployment** to staging/production

### Deployment Stages
- **Development** - Local development environment
- **Staging** - Pre-production testing
- **Production** - Live application deployment

## 📈 Future Roadmap

### Short-term (1-3 months)
- [ ] **Kafka consumers** for event processing
- [ ] **Payment webhooks** for Stripe and Razorpay
- [ ] **Advanced search** with Elasticsearch
- [ ] **Mobile app** using React Native

### Medium-term (3-6 months)
- [ ] **Microservices decomposition**
- [ ] **Kubernetes deployment**
- [ ] **Advanced analytics dashboard**
- [ ] **Multi-language support**

### Long-term (6+ months)
- [ ] **AI-powered recommendations**
- [ ] **Real-time inventory management**
- [ ] **Advanced reporting and BI**
- [ ] **API marketplace**

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Style
- **Java**: Follow Google Java Style Guide
- **JavaScript**: Use ESLint and Prettier
- **SQL**: Use consistent naming conventions
- **Git**: Conventional commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Spring Boot** team for the excellent framework
- **React** team for the amazing UI library
- **Apache Kafka** for event streaming capabilities
- **Material-UI** for the design system
- **Docker** for containerization technology

## 📞 Support & Contact

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/BookStore/issues)
- **Email**: govindjsg19@gmail.com
- **Documentation**: [Project Wiki](https://github.com/yourusername/BookStore/wiki)

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/BookStore&type=Date)](https://star-history.com/#yourusername/BookStore&Date)

---

<div align="center">
  <strong>Made with ❤️ by Govind Singh</strong><br>
  <em>Building the future of e-commerce, one line of code at a time.</em>
</div>
#   B o o k S t o r e 
 
 #   B o o k S t o r e 
 
 #   B o o k S t o r e _ v 1  
 #   B o o k S t o r e _ v 1  
 #   B o o k S t o r e _ v 1  
 #   B o o k S t o r e _ v 1  
 #   B o o k S t o r e _ v 1  
 #   B o o k S t o r e _ v 1  
 #   B o o k S t o r e _ v 1  
 