# 📚 BookStore Application - Complete Documentation

## 📑 Table of Contents

### 🚀 Quick Navigation
- [Overview](#-overview)
- [Application Architecture](#️-application-architecture)
- [What Has Been Created](#-what-has-been-created)
- [How It Works](#-how-it-works)
- [Database Schema](#️-database-schema)
- [Deployment Architecture](#-deployment-architecture)
- [Configuration](#-configuration)
- [Key Features Summary](#-key-features-summary)
- [Security Implementation](#-security-implementation)
- [Monitoring & Observability](#-monitoring--observability)
- [Testing](#-testing)

### 📦 Detailed Sections

#### Backend Components
- [Controllers](#controllers-srcmainjavacomorgbookstore_backendcontroller)
- [Services](#services-srcmainjavacomorgbookstore_backendservices)
- [Models/Entities](#modelsentities-srcmainjavacomorgbookstore_backendmodel)
- [Repositories](#repositories-srcmainjavacomorgbookstore_backendrepo)
- [DTOs](#dtos-srcmainjavacomorgbookstore_backenddto)
- [Configuration](#configuration-srcmainjavacomorgbookstore_backendconfig)
- [Security](#security-srcmainjavacomorgbookstore_backendsecurity)
- [Events](#events-srcmainjavacomorgbookstore_backendevents)
- [Consumer](#consumer-srcmainjavacomorgbookstore_backendconsumer)
- [Exception Handling](#exception-handling-srcmainjavacomorgbookstore_backendexception)

#### Frontend Components
- [Pages](#pages-frontendsrccomponents)
- [Admin Pages](#admin-pages-frontendsrccomponentsadmin)
- [Shared Components](#shared-components-frontendsrccomponents)
- [Contexts](#contexts-frontendsrccontexts)
- [Services](#services-frontendsrcservices)
- [Styles](#styles-frontendsrcstyles)

#### How It Works - Detailed Flows
- [1. User Authentication Flow](#1-user-authentication-flow)
- [2. Book Catalog Management](#2-book-catalog-management)
- [3. Shopping Cart System](#3-shopping-cart-system)
- [4. Order Processing](#4-order-processing)
- [5. Payment Processing (Stripe)](#5-payment-processing-stripe)
- [6. Real-time Notifications](#6-real-time-notifications)
- [7. Admin Dashboard](#7-admin-dashboard)

#### Additional Information
- [Database Schema](#️-database-schema)
- [Deployment Architecture](#-deployment-architecture)
- [Configuration](#-configuration)
- [Key Features Summary](#-key-features-summary)
- [Business Logic Flow](#-business-logic-flow)
- [Security Implementation](#-security-implementation)
- [Monitoring & Observability](#-monitoring--observability)
- [Testing](#-testing)
- [Additional Resources](#-additional-resources)
- [Learning Points](#-learning-points)

#### External Documentation
- [Dockerisation Documentation](DOCKERISATION_DOCUMENTATION.md) - Complete Docker setup and deployment guide
- [Kafka Documentation](KAFKA_DOCUMENTATION.md) - Kafka integration and troubleshooting
- [Dockerised Database Documentation](DOCKERISED_DATABASE_DOCUMENTATION.md) - PostgreSQL database setup and management in Docker

---

## 🎯 Overview

The BookStore is a full-stack e-commerce application built with **Spring Boot** (backend) and **React** (frontend). It provides a complete online bookstore experience with user authentication, book catalog management, shopping cart, order processing, payment integration, real-time notifications, and comprehensive admin functionality.

---

## 🏗️ Application Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Frontend)                   │
│  React Application (Port 3000)                              │
│  ├── Material-UI Components                                 │
│  ├── Context API (State Management)                         │
│  ├── WebSocket Client (STOMP)                               │
│  └── Stripe Payment Integration                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              APPLICATION LAYER (Backend)                     │
│  Spring Boot Application (Port 8080)                         │
│  ├── REST Controllers (API Endpoints)                       │
│  ├── Service Layer (Business Logic)                         │
│  ├── Repository Layer (Data Access)                          │
│  ├── Security (JWT + OAuth2)                                │
│  ├── WebSocket Server (STOMP)                               │
│  └── Event Publishing (Kafka)                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ JPA/Hibernate
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                │
│  PostgreSQL Database (Port 5432)                             │
│  ├── User Management                                         │
│  ├── Book Catalog                                           │
│  ├── Order Processing                                       │
│  └── Notifications                                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Event Streaming
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              INFRASTRUCTURE LAYER                             │
│  Apache Kafka (Port 9092)    │  Redis Cache (Port 6379)     │
│  ├── Event Streaming         │  ├── Session Management      │
│  ├── Order Events            │  ├── Caching Layer            │
│  └── Notification Events     │  └── Performance Optimization│
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 What Has Been Created

### 1. Backend Components (Spring Boot)

#### **Controllers** (`src/main/java/com/org/bookstore_backend/controller/`)

The controllers handle all HTTP requests and define the REST API endpoints:

- **`AuthUserController`** - User authentication, registration, login, OAuth2 callbacks
- **`BookController`** - Book CRUD operations, search, filtering, pagination
- **`OrderController`** - Order creation, tracking, status updates, order history
- **`PaymentController`** - Stripe payment intent creation, payment processing
- **`CartController`** - Shopping cart operations (add, remove, update quantities)
- **`AdminController`** - Admin dashboard, user management, system settings
- **`AdminOrderController`** - Admin order management, status updates, analytics
- **`AdminUserController`** - Admin user management, role assignment
- **`FavoritesController`** - User favorites/wishlist management
- **`CategoryController`** - Book category management
- **`AuthorController`** - Author information management
- **`PublisherController`** - Publisher information management
- **`PromoController`** - Promotional code management
- **`BookImageController`** - Book image upload and management
- **`FileUploadController`** - General file upload operations

#### **Services** (`src/main/java/com/org/bookstore_backend/services/`)

The service layer contains business logic:

- **`UserService`** - User management, authentication, role management
- **`BookService`** - Book catalog management, search, filtering
- **`OrderService`** - Order processing, status management, order history
- **`PaymentService`** - Stripe payment processing, payment intent creation
- **`CartService`** - Shopping cart operations, price calculations
- **`NotificationService`** - Notification creation and management
- **`KafkaNotificationService`** - Kafka-based notification publishing
- **`MailService`** - Email sending (order confirmations, invoices)
- **`S3Service`** - AWS S3 file upload and management
- **`PromoService`** - Promotional code validation and application
- **`AuthorService`** - Author management
- **`PublisherService`** - Publisher management
- **`CategoryService`** - Category management
- **`BookImageService`** - Book image processing and storage
- **`UrlShorteningService`** - URL shortening functionality

#### **Models/Entities** (`src/main/java/com/org/bookstore_backend/model/`)

Database entities representing the data model:

- **`User`** - User accounts with authentication information
- **`Role`** - User roles (USER, ADMIN, PUBLISHER)
- **`Book`** - Book catalog with details (title, author, price, stock, etc.)
- **`Author`** - Author information
- **`Publisher`** - Publisher information
- **`Category`** - Book categories/genres
- **`Cart`** - Shopping cart for users
- **`CartItem`** - Individual items in shopping cart
- **`Order`** - Customer orders
- **`OrderItem`** - Items within an order
- **`Payment`** - Payment transaction records
- **`PromoCode`** - Promotional discount codes
- **`Borrow`** - Book borrowing records (if applicable)

#### **Repositories** (`src/main/java/com/org/bookstore_backend/repo/`)

Data access layer using Spring Data JPA:

- **`UserRepo`** - User data access
- **`BookRepo`** - Book data access with custom queries
- **`OrderRepo`** - Order data access
- **`CartRepo`** - Cart data access
- **`CartItemRepo`** - Cart item data access
- **`AuthorRepo`** - Author data access
- **`PublisherRepo`** - Publisher data access
- **`CategoryRepository`** - Category data access
- **`PaymentRepository`** - Payment data access
- **`PromoCodeRepo`** - Promo code data access
- **`RoleRepository`** - Role data access

#### **DTOs** (`src/main/java/com/org/bookstore_backend/dto/`)

Data Transfer Objects for API communication:

- **`UserDTO`** - User data transfer
- **`BookDTO`** - Book data transfer
- **`BookCreationDTO`** - Book creation request
- **`OrderDTO`** - Order data transfer
- **`OrderRequestDTO`** - Order creation request
- **`CartDTO`** - Cart data transfer
- **`CartItemDTO`** - Cart item data transfer
- **`NotificationDTO`** - Notification data transfer
- **`PaymentIntentRequestDTO`** - Payment intent request
- **`PaymentIntentResponseDTO`** - Payment intent response
- **`PromoCodeDTO`** - Promo code data transfer
- **`AuthorDTO`**, **`PublisherDTO`**, **`CategoryDTO`** - Entity DTOs

#### **Configuration** (`src/main/java/com/org/bookstore_backend/config/`)

Application configuration classes:

- **`SecurityConfig`** - Spring Security configuration (JWT, OAuth2, CORS)
- **`JwtUtil`** - JWT token generation and validation
- **`JwtRequestFilter`** - JWT authentication filter
- **`WebSocketConfig`** - WebSocket/STOMP configuration
- **`KafkaConfig`** - Kafka producer/consumer configuration
- **`GlobalCorsConfig`** - CORS configuration
- **`AwsConfig`** - AWS S3 configuration
- **`MonitoringConfig`** - Prometheus metrics configuration
- **`DataInitializer`** - Database initialization

#### **Security** (`src/main/java/com/org/bookstore_backend/security/`)

Security-related components:

- **OAuth2 Integration** - Google OAuth2 authentication
- **JWT Authentication** - Token-based authentication
- **Role-Based Access Control** - User role management
- **Password Encryption** - BCrypt password hashing

#### **Events** (`src/main/java/com/org/bookstore_backend/events/`)

Event-driven architecture components:

- **`EventPublisher`** - Event publishing interface
- **`KafkaEventPublisher`** - Kafka-based event publishing
- **`DomainEvent`** - Domain event base class

#### **Consumer** (`src/main/java/com/org/bookstore_backend/consumer/`)

Kafka event consumers:

- **`NotificationKafkaConsumer`** - Consumes notification events from Kafka

#### **Exception Handling** (`src/main/java/com/org/bookstore_backend/exception/`)

Exception management:

- **`GlobalExceptionHandler`** - Global exception handler
- **`ResourceNotFoundException`** - Custom exception for missing resources
- **`BookNotFoundException`** - Book-specific exception
- **`DuplicateResourceException`** - Duplicate resource exception

---

### 2. Frontend Components (React)

#### **Pages** (`Frontend/src/components/`)

Main page components:

- **`HomePage`** - Landing page with featured books
- **`AllBooksPage`** - Complete book catalog with filtering
- **`BookDetailPage`** - Individual book details
- **`CartPage`** - Shopping cart view
- **`PaymentGatewayPage`** - Payment processing page
- **`OrderSuccessPage`** - Order confirmation page
- **`OrderHistoryPage`** - User order history
- **`ProfilePage`** - User profile management
- **`LoginPage`** - User login
- **`RegistrationForm`** - User registration
- **`FavouritesPage`** - User favorites/wishlist
- **`NotificationsPage`** - Notification center

#### **Admin Pages** (`Frontend/src/components/admin/`)

Admin-specific pages:

- **`AdminDashboardPage`** - Admin dashboard with analytics
- **`AdminBooksManagementPage`** - Book management interface
- **`AdminOrdersManagementPage`** - Order management interface
- **`AdminUsersManagementPage`** - User management interface
- **`AdminCategoriesManagementPage`** - Category management
- **`AdminPromosPage`** - Promo code management
- **`AdminSettingsPage`** - System settings
- **`AdminPaymentHistoryPage`** - Payment history
- **`AdminProfilePage`** - Admin profile

#### **Shared Components** (`Frontend/src/components/`)

Reusable components:

- **`Navigation`** - Main navigation bar
- **`BookCard`** - Book display card
- **`NotificationBell`** - Notification bell with badge
- **`AppLayout`** - Application layout wrapper
- **`SearchBar`** - Book search functionality
- **`Footer`** - Footer component
- **`PaymentForm`** - Stripe payment form
- **`PrivateRoute`** - Protected route component

#### **Contexts** (`Frontend/src/contexts/`)

State management using React Context API:

- **`AuthContext`** - Authentication state and user information
- **`CartContext`** - Shopping cart state
- **`BookContext`** - Book catalog state
- **`NotificationContext`** - Notification state and WebSocket connection
- **`OrdersContext`** - Order history state
- **`FavoritesContext`** - Favorites/wishlist state
- **`SearchContext`** - Search state

#### **Services** (`Frontend/src/services/`)

API communication layer:

- **`api.js`** - Axios-based API client with interceptors

#### **Styles** (`Frontend/src/styles/`)

Styling files:

- **`components.css`** - Component-specific styles
- **`designSystem.css`** - Design system styles
- **`colorPalette.css`** - Color palette definitions

---

## 🔄 How It Works

### 1. User Authentication Flow

**How it works:**

1. **User Registration/Login:**
   - User submits credentials via `AuthUserController`
   - Backend validates credentials against database
   - JWT token is generated using `JwtUtil`
   - Token is returned to frontend
   - Frontend stores token in localStorage
   - Token is included in subsequent API requests

2. **OAuth2 Login (Google):**
   - User clicks "Login with Google"
   - Redirected to Google OAuth2 consent screen
   - After consent, Google redirects back with authorization code
   - Backend exchanges code for user information
   - User is created/updated in database
   - JWT token is generated and returned

3. **Token Validation:**
   - `JwtRequestFilter` intercepts each request
   - Extracts JWT token from Authorization header
   - Validates token using `JwtUtil`
   - Loads user details and sets authentication context

**Code Flow:**
```
Frontend → POST /api/auth/login → AuthUserController → UserService → UserRepo
                                                              ↓
                                                         JwtUtil.generateToken()
                                                              ↓
                                                         Return JWT + User Data
```

### 2. Book Catalog Management

**How it works:**

1. **Viewing Books:**
   - Frontend calls `GET /api/books`
   - `BookController` receives request
   - `BookService` queries database via `BookRepo`
   - Books are mapped to DTOs using `BookMapper`
   - Returns list of books with image URLs

2. **Search and Filtering:**
   - Frontend sends search query and filters
   - `BookService` uses custom JPA queries
   - Filters by category, author, price range, availability
   - Returns filtered results

3. **Book Creation (Admin):**
   - Admin uploads book details and image
   - Image is uploaded to AWS S3 via `S3Service`
   - Book entity is created and saved
   - Image URL is stored in database

**Code Flow:**
```
Frontend → GET /api/books?search=query&category=fiction
         → BookController.getAllBooks()
         → BookService.searchBooks()
         → BookRepo.findBySearchAndCategory()
         → BookMapper.toDTO()
         → Return BookDTO[]
```

### 3. Shopping Cart System

**How it works:**

1. **Adding to Cart:**
   - User clicks "Add to Cart" on a book
   - Frontend calls `POST /api/cart/add`
   - `CartController` receives request
   - `CartService` finds or creates user's cart
   - Cart item is added or quantity updated
   - Cart total is recalculated

2. **Cart Persistence:**
   - Cart is stored in database per user
   - Cart persists across sessions
   - Cart items use composite key (cart_id + book_id)

3. **Cart Operations:**
   - Update quantity: `PUT /api/cart/update`
   - Remove item: `DELETE /api/cart/remove`
   - Get cart: `GET /api/cart`
   - Clear cart: `DELETE /api/cart/clear`

**Code Flow:**
```
Frontend → POST /api/cart/add {bookId, quantity}
         → CartController.addToCart()
         → CartService.addItemToCart()
         → CartRepo.findByUser() or create new Cart
         → CartItemRepo.save()
         → Return updated CartDTO
```

### 4. Order Processing

**How it works:**

1. **Order Creation:**
   - User proceeds to checkout
   - Frontend calls `POST /api/orders`
   - `OrderController` receives order request
   - `OrderService` validates cart and user
   - Order entity is created with all cart items
   - Order status is set to "NEW_ORDER"
   - Cart is cleared after order creation
   - Order event is published to Kafka

2. **Order Status Updates:**
   - Admin updates order status
   - `OrderService.updateOrderStatus()` is called
   - Order status is updated in database
   - Notification event is published
   - Real-time notification sent via WebSocket

3. **Order History:**
   - User views their orders via `GET /api/orders`
   - Orders are filtered by user ID
   - Order details with items are returned

**Code Flow:**
```
Frontend → POST /api/orders {userId, shippingAddress, paymentMethod}
         → OrderController.createOrder()
         → OrderService.placeOrder()
         → OrderRepo.save()
         → KafkaEventPublisher.publishOrderCreatedEvent()
         → Return OrderDTO
```

### 5. Payment Processing (Stripe)

**How it works:**

1. **Payment Intent Creation:**
   - User proceeds to payment
   - Frontend calls `POST /api/payment/create-intent`
   - `PaymentController` receives request
   - `PaymentService` calculates cart total
   - Stripe PaymentIntent is created
   - Client secret is returned to frontend

2. **Payment Processing:**
   - Frontend uses Stripe Elements to collect card details
   - Payment is confirmed using client secret
   - Stripe processes payment
   - Payment result is sent to backend
   - Order is finalized with payment confirmation

3. **Payment Records:**
   - Payment transaction is saved to database
   - Payment status is tracked
   - Invoice can be generated

**Code Flow:**
```
Frontend → POST /api/payment/create-intent {userId}
         → PaymentController.createPaymentIntent()
         → PaymentService.createPaymentIntent()
         → Stripe API: PaymentIntent.create()
         → Return {clientSecret}
         
Frontend → Stripe.confirmCardPayment(clientSecret)
         → POST /api/orders (with paymentIntentId)
         → Order finalized
```

### 6. Real-time Notifications

**How it works:**

1. **WebSocket Connection:**
   - User logs in
   - Frontend establishes WebSocket connection via STOMP
   - Connection is authenticated using JWT token
   - User subscribes to `/user/queue/notifications`

2. **Event Publishing:**
   - Order status changes trigger notification
   - `KafkaNotificationService` publishes event to Kafka
   - `NotificationKafkaConsumer` consumes event
   - Notification is sent via WebSocket to user

3. **Notification Display:**
   - Frontend receives notification via WebSocket
   - Notification is added to `NotificationContext`
   - Notification bell badge is updated
   - User can view notifications in notification center

**Code Flow:**
```
Order Status Update → KafkaNotificationService.publishNotification()
                    → Kafka Topic: "notifications.events"
                    → NotificationKafkaConsumer.consumeNotification()
                    → WebSocket: messagingTemplate.convertAndSendToUser()
                    → Frontend: NotificationContext receives message
                    → UI updates with notification
```

### 7. Admin Dashboard

**How it works:**

1. **Access Control:**
   - Admin routes are protected with `@PreAuthorize("hasRole('ADMIN')")`
   - Frontend checks user role via `AuthContext.hasRole()`
   - Admin pages are only accessible to admin users

2. **Admin Operations:**
   - **User Management:** View all users, update roles, disable accounts
   - **Order Management:** View all orders, update status, view analytics
   - **Book Management:** Create, update, delete books, manage inventory
   - **Analytics:** Revenue stats, order statistics, user metrics

3. **Admin API Endpoints:**
   - `GET /api/admin/users` - Get all users
   - `PUT /api/admin/users/{id}` - Update user role
   - `GET /api/admin/orders` - Get all orders
   - `PUT /api/admin/orders/{id}/status` - Update order status
   - `GET /api/admin/dashboard` - Get dashboard statistics

**Code Flow:**
```
Admin User → AdminDashboardPage
          → GET /api/admin/dashboard
          → AdminController.getDashboardStats()
          → Various services aggregate data
          → Return statistics
          → Display charts and metrics
```

---

## 🗄️ Database Schema

### Core Tables

1. **`users`** - User accounts
   - `user_id`, `username`, `email`, `password`, `auth_provider`, `provider_id`, `image_url`

2. **`roles`** - User roles
   - `role_id`, `name` (USER, ADMIN, PUBLISHER)

3. **`user_roles`** - User-role mapping (many-to-many)

4. **`books`** - Book catalog
   - `book_id`, `title`, `isbn`, `description`, `price`, `stock_quantity`, `is_available`, `image_url`, `genre`, `publication_year`

5. **`authors`** - Author information
   - `author_id`, `name`, `biography`

6. **`publishers`** - Publisher information
   - `publisher_id`, `name`, `description`

7. **`categories`** - Book categories
   - `category_id`, `name`, `description`

8. **`carts`** - Shopping carts
   - `cart_id`, `user_id` (one-to-one with users)

9. **`cart_items`** - Cart items
   - `cart_item_id`, `cart_id`, `book_id`, `quantity`, `price_at_purchase`

10. **`orders`** - Customer orders
    - `order_id`, `user_id`, `order_number`, `order_date`, `order_status`, `total_amount`, `payment_method`, `shipping_address`

11. **`order_items`** - Order items
    - `order_item_id`, `order_id`, `book_id`, `quantity`, `price_at_purchase`

12. **`payments`** - Payment transactions
    - `payment_id`, `order_id`, `amount`, `payment_method`, `status`, `transaction_id`

13. **`promo_codes`** - Promotional codes
    - `promo_id`, `code`, `discount_type`, `discount_value`, `is_active`, `expiry_date`

14. **`notifications`** - User notifications
    - `notification_id`, `user_id`, `type`, `title`, `message`, `is_read`, `created_at`

15. **`user_favorites`** - User favorites/wishlist
    - `user_id`, `book_id` (composite key)

---

## 🚀 Deployment Architecture

### Docker Compose Services

1. **`postgres-db`** - PostgreSQL database (Port 5432)
2. **`redis`** - Redis cache (Port 6379)
3. **`zookeeper`** - Kafka coordination (Port 2181)
4. **`kafka`** - Message broker (Port 9092)
5. **`bookstore_springboot_app`** - Backend application (Port 8080)
6. **`frontend`** - React frontend (Port 3000)
7. **`prometheus`** - Metrics collection (Port 9090)
8. **`grafana`** - Metrics visualization (Port 3001)
9. **`alertmanager`** - Alert management (Port 9093)

### How to Deploy

1. **Using Docker Compose:**
   ```bash
   docker-compose up -d
   ```

2. **Manual Setup:**
   - Start PostgreSQL, Redis, Kafka
   - Run Spring Boot application: `mvn spring-boot:run`
   - Run React frontend: `cd Frontend && npm start`

---

## 🔧 Configuration

### Backend Configuration (`src/main/resources/`)

- **`application.yml`** - Main configuration
- **`application-local.yml`** - Local development profile
- **`application-docker.yml`** - Docker deployment profile
- **`application-simple.yml`** - Simplified profile

### Frontend Configuration (`Frontend/`)

- **`package.json`** - Dependencies and scripts
- **`.env`** - Environment variables (if needed)
- **`public/index.html`** - HTML template

### Environment Variables

The application uses hardcoded defaults for development. For production, configure:
- JWT secret key
- Stripe API keys
- AWS S3 credentials
- Database connection
- Email SMTP settings
- OAuth2 client credentials

---

## 📊 Key Features Summary

| Feature | What It Does | How It Works |
|---------|-------------|--------------|
| **Authentication** | User login, registration, OAuth2 | JWT tokens, Spring Security, OAuth2 integration |
| **Book Catalog** | Browse, search, filter books | REST API, JPA queries, pagination |
| **Shopping Cart** | Add/remove items, manage quantities | Database-persisted cart, composite keys |
| **Order Processing** | Create orders, track status | Order entities, status workflow, Kafka events |
| **Payment** | Stripe payment processing | PaymentIntent API, secure card processing |
| **Notifications** | Real-time updates | WebSocket (STOMP), Kafka events |
| **Admin Dashboard** | Manage users, orders, books | Role-based access, admin APIs |
| **Email** | Order confirmations, invoices | SMTP, HTML templates |
| **File Storage** | Book images | AWS S3 integration |
| **Promo Codes** | Discount management | Validation, calculation, application |

---

## 🎯 Business Logic Flow

### Complete Order Flow

1. **User browses books** → `BookController` → `BookService` → Database
2. **User adds to cart** → `CartController` → `CartService` → Database
3. **User proceeds to checkout** → Frontend calculates total
4. **Payment intent created** → `PaymentController` → Stripe API
5. **Payment processed** → Stripe Elements → Stripe API
6. **Order created** → `OrderController` → `OrderService` → Database
7. **Event published** → Kafka → `NotificationKafkaConsumer`
8. **Notification sent** → WebSocket → Frontend
9. **Email sent** → `MailService` → SMTP
10. **Admin updates status** → `AdminOrderController` → `OrderService`
11. **Status notification** → Kafka → WebSocket → Frontend

---

## 🔐 Security Implementation

1. **JWT Authentication:**
   - Tokens generated with user details and roles
   - Tokens validated on each request
   - Stateless authentication

2. **OAuth2 Integration:**
   - Google OAuth2 for social login
   - Automatic user creation
   - Seamless JWT token generation

3. **Role-Based Access Control:**
   - Roles: USER, ADMIN, PUBLISHER
   - Method-level security with `@PreAuthorize`
   - Frontend route protection

4. **Password Security:**
   - BCrypt password hashing
   - Secure password storage

5. **CORS Configuration:**
   - Configured for frontend origin
   - Secure cross-origin requests

---

## 📈 Monitoring & Observability

1. **Spring Boot Actuator:**
   - Health checks
   - Metrics endpoint
   - Prometheus integration

2. **Prometheus:**
   - Metrics collection
   - Custom business metrics

3. **Grafana:**
   - Metrics visualization
   - Dashboard creation

4. **Logging:**
   - Structured logging with SLF4J
   - Log levels configuration
   - Error tracking

---

## 🧪 Testing

### Backend Testing
- Unit tests for services
- Integration tests for controllers
- Repository tests with test containers

### Frontend Testing
- Component tests with React Testing Library
- Context tests
- API service tests

---

## 📚 Additional Resources

- **API Documentation:** See `API_DOCUMENTATION.md`
- **Setup Guide:** See `SETUP_GUIDE.md`
- **Running Guide:** See `RUNNING_GUIDE.md`
- **Features Summary:** See `FEATURES_SUMMARY.md`
- **User Flow:** See `USER_FLOW_DOCUMENTATION.md`
- **Kafka Documentation:** See `KAFKA_DOCUMENTATION.md` - Complete guide to Kafka integration, verification steps, and troubleshooting
- **Dockerisation Documentation:** See `DOCKERISATION_DOCUMENTATION.md` - Complete guide to Docker setup, container management, port mappings, and deployment
- **Dockerised Database Documentation:** See `DOCKERISED_DATABASE_DOCUMENTATION.md` - Complete guide to PostgreSQL database setup, table creation, backup/restore, and management in Docker

---

## 🎓 Learning Points

This application demonstrates:

1. **Full-Stack Development:** React frontend + Spring Boot backend
2. **RESTful API Design:** Proper endpoint structure and HTTP methods
3. **Authentication & Authorization:** JWT, OAuth2, role-based access
4. **Event-Driven Architecture:** Kafka for event streaming
5. **Real-time Communication:** WebSocket for notifications
6. **Payment Integration:** Stripe payment processing
7. **Cloud Storage:** AWS S3 for file management
8. **Database Design:** Relational database with proper relationships
9. **State Management:** React Context API
10. **Containerization:** Docker and Docker Compose
11. **Monitoring:** Prometheus and Grafana
12. **Security Best Practices:** Secure authentication, password hashing

---

## 📞 Support

For questions or issues:
- **Email:** govindjsg19@gmail.com
- **GitHub Issues:** Create an issue in the repository

---

<div align="center">
  <strong>Made with ❤️ by Govind Singh</strong><br>
  <em>Building the future of e-commerce, one line of code at a time.</em>
</div>

