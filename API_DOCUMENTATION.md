# 📚 BookStore API Documentation

This document provides comprehensive documentation for the BookStore REST API endpoints.

## 🔗 Base URL
```
Development: http://localhost:8080/api
Production: https://yourdomain.com/api
```

## 🔐 Authentication

### JWT Token
Most endpoints require authentication using JWT tokens in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### OAuth2
Google OAuth2 is supported for social login:
```
GET /oauth2/authorization/google
```

## 📋 API Endpoints

### 🔐 Authentication Endpoints

#### User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "User registered successfully"
}
```

#### User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Token Validation
```http
GET /api/auth/validate
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "roles": ["USER"]
}
```

### 📚 Book Management

#### Get All Books
```http
GET /api/books?page=0&size=20&sort=title,asc
```

**Query Parameters:**
- `page`: Page number (0-based)
- `size`: Page size (default: 20)
- `sort`: Sort field and direction (e.g., "title,asc", "price,desc")

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "isbn": "978-0743273565",
      "price": 12.99,
      "description": "A story of the fabulously wealthy Jay Gatsby...",
      "category": {
        "id": 1,
        "name": "Fiction"
      },
      "publisher": {
        "id": 1,
        "name": "Scribner"
      },
      "stockQuantity": 50,
      "imageUrl": "https://example.com/book1.jpg"
    }
  ],
  "totalElements": 100,
  "totalPages": 5,
  "size": 20,
  "number": 0
}
```

#### Get Book by ID
```http
GET /api/books/{id}
```

**Response:**
```json
{
  "id": 1,
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "978-0743273565",
  "price": 12.99,
  "description": "A story of the fabulously wealthy Jay Gatsby...",
  "category": {
    "id": 1,
    "name": "Fiction"
  },
  "publisher": {
    "id": 1,
    "name": "Scribner"
  },
  "stockQuantity": 50,
  "imageUrl": "https://example.com/book1.jpg",
  "averageRating": 4.5,
  "reviewCount": 125
}
```

#### Search Books
```http
GET /api/books/search?q=gatsby&category=fiction&minPrice=10&maxPrice=20
```

**Query Parameters:**
- `q`: Search query
- `category`: Category filter
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `author`: Author filter
- `publisher`: Publisher filter

#### Create Book (Admin Only)
```http
POST /api/books
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "title": "New Book Title",
  "author": "Author Name",
  "isbn": "978-1234567890",
  "price": 19.99,
  "description": "Book description...",
  "categoryId": 1,
  "publisherId": 1,
  "stockQuantity": 100,
  "imageUrl": "https://example.com/book.jpg"
}
```

#### Update Book (Admin Only)
```http
PUT /api/books/{id}
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "title": "Updated Book Title",
  "price": 24.99,
  "stockQuantity": 75
}
```

#### Delete Book (Admin Only)
```http
DELETE /api/books/{id}
Authorization: Bearer <admin_jwt_token>
```

### 🛒 Shopping Cart

#### Get User Cart
```http
GET /api/cart
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": 1,
  "userId": 1,
  "cartItems": [
    {
      "id": 1,
      "book": {
        "id": 1,
        "title": "The Great Gatsby",
        "price": 12.99,
        "imageUrl": "https://example.com/book1.jpg"
      },
      "quantity": 2,
      "subtotal": 25.98
    }
  ],
  "totalAmount": 25.98,
  "itemCount": 2
}
```

#### Add Item to Cart
```http
POST /api/cart/add
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "bookId": 1,
  "quantity": 2
}
```

#### Update Cart Item Quantity
```http
PUT /api/cart/items/{itemId}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "quantity": 3
}
```

#### Remove Item from Cart
```http
DELETE /api/cart/items/{itemId}
Authorization: Bearer <jwt_token>
```

#### Clear Cart
```http
DELETE /api/cart
Authorization: Bearer <jwt_token>
```

### 📦 Order Management

#### Create Order
```http
POST /api/orders
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "shippingAddress": "123 Main St, City, State 12345",
  "paymentMethod": "CREDIT_CARD",
  "items": [
    {
      "bookId": 1,
      "quantity": 2
    }
  ]
}
```

**Response:**
```json
{
  "orderId": 1,
  "orderNumber": "ORD-2024-001",
  "orderDate": "2024-01-15T10:30:00Z",
  "status": "PENDING",
  "totalAmount": 25.98,
  "shippingAddress": "123 Main St, City, State 12345",
  "paymentMethod": "CREDIT_CARD",
  "items": [
    {
      "bookId": 1,
      "title": "The Great Gatsby",
      "quantity": 2,
      "priceAtPurchase": 12.99,
      "subtotal": 25.98
    }
  ]
}
```

#### Get User Orders
```http
GET /api/orders?page=0&size=10&sort=orderDate,desc
Authorization: Bearer <jwt_token>
```

#### Get Order by ID
```http
GET /api/orders/{id}
Authorization: Bearer <jwt_token>
```

#### Update Order Status (Admin Only)
```http
PUT /api/orders/{id}/status
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "status": "SHIPPED"
}
```

### 👥 User Management

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "userId": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "roles": ["USER"],
  "dateCreated": "2024-01-01T00:00:00Z",
  "lastLogin": "2024-01-15T10:30:00Z"
}
```

#### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@example.com"
}
```

#### Change Password
```http
PUT /api/users/password
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

### ⭐ Favorites/Wishlist

#### Get User Favorites
```http
GET /api/users/favorites
Authorization: Bearer <jwt_token>
```

#### Add Book to Favorites
```http
POST /api/users/favorites
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "bookId": 1
}
```

#### Remove Book from Favorites
```http
DELETE /api/users/favorites/{bookId}
Authorization: Bearer <jwt_token>
```

### 🏷️ Categories

#### Get All Categories
```http
GET /api/categories
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Fiction",
    "description": "Fictional literature and novels",
    "bookCount": 150
  },
  {
    "id": 2,
    "name": "Non-Fiction",
    "description": "Non-fictional literature",
    "bookCount": 200
  }
]
```

#### Get Category by ID
```http
GET /api/categories/{id}
```

#### Get Books by Category
```http
GET /api/categories/{id}/books?page=0&size=20
```

### 🏢 Publishers

#### Get All Publishers
```http
GET /api/publishers
```

#### Get Publisher by ID
```http
GET /api/publishers/{id}
```

#### Get Books by Publisher
```http
GET /api/publishers/{id}/books?page=0&size=20
```

### 💳 Payment

#### Process Payment
```http
POST /api/payment/process
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "orderId": 1,
  "paymentMethod": "STRIPE",
  "paymentDetails": {
    "token": "tok_visa",
    "amount": 25.98
  }
}
```

**Response:**
```json
{
  "paymentId": "pi_1234567890",
  "status": "SUCCEEDED",
  "amount": 25.98,
  "currency": "USD",
  "transactionId": "txn_1234567890"
}
```

### 📧 Email & Notifications

#### Send Invoice Email
```http
POST /api/admin/orders/{orderId}/send-invoice
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "message": "Invoice sent successfully",
  "email": "customer@example.com"
}
```

### 🔍 Search & Analytics

#### Advanced Search
```http
GET /api/search/advanced?query=gatsby&filters={"category":"fiction","priceRange":{"min":10,"max":30}}
```

#### Get Search Suggestions
```http
GET /api/search/suggestions?q=gat
```

## 📊 Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Pagination Response
```json
{
  "content": [...],
  "totalElements": 100,
  "totalPages": 5,
  "size": 20,
  "number": 0,
  "first": true,
  "last": false,
  "numberOfElements": 20
}
```

## 🔒 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `INTERNAL_ERROR` | 500 | Internal server error |

## 📱 WebSocket Endpoints

### Real-time Notifications
```
WebSocket URL: ws://localhost:8080/ws
STOMP Destination: /user/{userId}/queue/notifications
```

**Message Format:**
```json
{
  "type": "ORDER_STATUS_UPDATE",
  "title": "Order Update",
  "message": "Your order #123 has been shipped",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🧪 Testing

### Test Environment
```
Base URL: http://localhost:8080/api
Test Database: H2 in-memory database
Test Users: Available in test data
```

### Authentication for Testing
```bash
# Get test user token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

## 📚 SDKs and Libraries

### JavaScript/Node.js
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add JWT token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Java
```java
@RestController
public class BookStoreClient {
    
    @Autowired
    private RestTemplate restTemplate;
    
    public BookDTO getBook(Long id) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(jwtToken);
        
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        return restTemplate.exchange(
            "http://localhost:8080/api/books/" + id,
            HttpMethod.GET,
            entity,
            BookDTO.class
        ).getBody();
    }
}
```

## 🔄 Rate Limiting

- **Public endpoints**: 100 requests per minute
- **Authenticated endpoints**: 1000 requests per minute
- **Admin endpoints**: 5000 requests per minute

## 📈 Performance

- **Response time**: < 200ms for most endpoints
- **Database queries**: Optimized with proper indexing
- **Caching**: Redis caching for frequently accessed data
- **Compression**: GZIP compression enabled

## 🔐 Security

- **HTTPS**: Required in production
- **CORS**: Configured for frontend domains
- **Input validation**: All inputs are validated and sanitized
- **SQL injection**: Prevented with parameterized queries
- **XSS protection**: Input sanitization and output encoding

## 📞 Support

For API support and questions:
- **Documentation**: [GitHub Wiki](https://github.com/yourusername/BookStore/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/BookStore/issues)
- **Email**: api-support@bookstore.com

---

**Note**: This API documentation is continuously updated. Check the latest version for the most current information.
