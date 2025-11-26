# Controller Layer Documentation

## Overview
The `controller` package contains all REST API endpoints for the Bookstore application. This layer follows the Spring MVC pattern and serves as the entry point for all HTTP requests from the frontend.

## What is the Controller Layer?
The controller layer is responsible for:
- **HTTP Request Handling**: Receives and processes incoming HTTP requests
- **Request Validation**: Validates incoming request data using annotations
- **Response Formatting**: Formats responses in JSON format
- **Error Handling**: Delegates error handling to the GlobalExceptionHandler
- **Security**: Integrates with Spring Security for authentication and authorization

## Why Do We Need Controllers?
- **Separation of Concerns**: Separates HTTP concerns from business logic
- **API Contract**: Defines clear API contracts for frontend consumption
- **Request/Response Mapping**: Maps HTTP requests to service method calls
- **Security Integration**: Enforces security policies at the API level
- **Documentation**: Provides clear API documentation through annotations

## How Controllers Work in This Project?

### 1. **AdminController.java**
- **What**: Handles administrative operations for the bookstore
- **Why**: Provides admin-specific functionality separate from regular user operations
- **How**: Uses `@PreAuthorize("hasRole('ADMIN')")` for role-based access control
- **Where**: Used by admin users to manage the entire bookstore system

### 2. **AdminOrderController.java**
- **What**: Manages order-related administrative operations
- **Why**: Separates admin order management from regular user order operations
- **How**: Provides endpoints for viewing all orders, updating order status, and order analytics
- **Where**: Used by administrators to monitor and manage customer orders

### 3. **AdminSettingsController.java**
- **What**: Handles system configuration and settings management
- **Why**: Allows administrators to configure system-wide settings
- **How**: Provides CRUD operations for system settings and configurations
- **Where**: Used by administrators to maintain system configuration

### 4. **AdminUserController.java**
- **What**: Manages user accounts from an administrative perspective
- **Why**: Allows administrators to manage user accounts, roles, and permissions
- **How**: Provides user management endpoints with role-based access control
- **Where**: Used by administrators to manage user accounts and permissions

### 5. **AuthorController.java**
- **What**: Handles CRUD operations for book authors
- **Why**: Manages author information which is essential for book cataloging
- **How**: Provides REST endpoints for author management with validation
- **Where**: Used by both admin and regular users to view author information

### 6. **AuthUserController.java**
- **What**: Handles user authentication and registration
- **Why**: Manages user login, registration, and authentication flows
- **How**: Integrates with Spring Security and JWT for authentication
- **Where**: Used by all users for account management and authentication

### 7. **BookController.java**
- **What**: Manages book-related operations (CRUD, search, filtering)
- **Why**: Core functionality for book management in the bookstore
- **How**: Provides comprehensive book management with search and filtering capabilities
- **Where**: Used by all users to browse, search, and manage books

### 8. **BookImageController.java**
- **What**: Handles book image upload and management
- **Why**: Manages book cover images and visual content
- **How**: Integrates with S3Service for image storage and retrieval
- **Where**: Used by administrators to manage book images

### 9. **BorrowController.java**
- **What**: Manages book borrowing functionality
- **Why**: Handles the borrowing/returning of books (if applicable to your business model)
- **How**: Provides endpoints for borrowing and returning books
- **Where**: Used by users to borrow and return books

### 10. **CartController.java**
- **What**: Manages shopping cart operations
- **Why**: Handles adding/removing items from user's shopping cart
- **How**: Provides cart management with session-based or user-based cart persistence
- **Where**: Used by users during the shopping process

### 11. **CategoryController.java**
- **What**: Manages book categories and genres
- **Why**: Organizes books into categories for better user experience
- **How**: Provides CRUD operations for book categories
- **Where**: Used by administrators to manage book categorization

### 12. **CorsTestController.java**
- **What**: Handles CORS (Cross-Origin Resource Sharing) testing
- **Why**: Ensures proper CORS configuration for frontend-backend communication
- **How**: Provides test endpoints to verify CORS settings
- **Where**: Used during development and testing phases

### 13. **FavoritesController.java**
- **What**: Manages user's favorite books
- **Why**: Allows users to save books for later reference
- **How**: Provides endpoints to add/remove books from favorites
- **Where**: Used by users to manage their personal book preferences

### 14. **FileUploadController.java**
- **What**: Handles file upload operations
- **Why**: Manages file uploads for various purposes (images, documents, etc.)
- **How**: Integrates with cloud storage services for file management
- **Where**: Used by administrators and users for file uploads

### 15. **OrderController.java**
- **What**: Manages order processing and history
- **Why**: Handles the complete order lifecycle from creation to completion
- **How**: Provides order creation, tracking, and history management
- **Where**: Used by users to place and track orders

### 16. **PaymentController.java**
- **What**: Handles payment processing
- **Why**: Manages payment transactions for orders
- **How**: Integrates with payment gateways for secure transactions
- **Where**: Used by users during the checkout process

### 17. **PromoController.java**
- **What**: Manages promotional codes and discounts
- **Why**: Handles discount and promotional code functionality
- **How**: Provides promo code validation and application
- **Where**: Used by users to apply discounts during checkout

### 18. **PublisherController.java**
- **What**: Manages publisher information
- **Why**: Maintains publisher data for book cataloging
- **How**: Provides CRUD operations for publisher management
- **Where**: Used by administrators to manage publisher information

## Common Patterns Used

### 1. **RESTful Design**
- Uses standard HTTP methods (GET, POST, PUT, DELETE)
- Follows REST conventions for URL structure
- Returns appropriate HTTP status codes

### 2. **Security Integration**
- Uses `@PreAuthorize` for method-level security
- Integrates with JWT authentication
- Implements role-based access control

### 3. **Validation**
- Uses Bean Validation annotations (`@Valid`, `@NotNull`, etc.)
- Validates request bodies and parameters
- Returns validation error messages

### 4. **Error Handling**
- Delegates to GlobalExceptionHandler for consistent error responses
- Uses appropriate HTTP status codes
- Provides meaningful error messages

### 5. **Response Formatting**
- Returns consistent JSON responses
- Uses DTOs for response formatting
- Implements proper HTTP headers

## Integration Points

### 1. **Service Layer**
- Controllers delegate business logic to service classes
- Uses dependency injection for service integration
- Maintains separation of concerns

### 2. **Security Layer**
- Integrates with Spring Security
- Uses JWT for authentication
- Implements role-based authorization

### 3. **Validation Layer**
- Uses Bean Validation framework
- Validates input data before processing
- Provides clear validation error messages

### 4. **Exception Handling**
- Integrates with GlobalExceptionHandler
- Provides consistent error responses
- Logs errors for debugging

## Best Practices Implemented

1. **Single Responsibility**: Each controller handles a specific domain
2. **Consistent Naming**: Follows RESTful naming conventions
3. **Proper HTTP Methods**: Uses appropriate HTTP methods for operations
4. **Security First**: Implements security at the controller level
5. **Validation**: Validates all incoming data
6. **Error Handling**: Provides consistent error responses
7. **Documentation**: Uses annotations for API documentation

## Dependencies

- **Spring Web**: For REST controller functionality
- **Spring Security**: For authentication and authorization
- **Bean Validation**: For request validation
- **Jackson**: For JSON serialization/deserialization
- **Lombok**: For reducing boilerplate code

## Testing Considerations

- Controllers should be tested with MockMvc
- Test both success and error scenarios
- Verify security constraints
- Test validation rules
- Mock service dependencies

This controller layer provides a robust, secure, and well-structured API for the Bookstore application, following Spring Boot best practices and RESTful design principles.
