# DTO Layer Documentation

## Overview
The `dto` package contains Data Transfer Objects (DTOs) that facilitate data transfer between different layers of the application. DTOs provide a clean interface for data exchange while maintaining separation between internal entity structure and external API contracts.

## What is the DTO Layer?
The DTO layer is responsible for:
- **Data Transfer**: Transfers data between layers without exposing internal structure
- **API Contracts**: Defines clear contracts for API requests and responses
- **Data Transformation**: Converts between entities and external representations
- **Validation**: Provides input validation for API endpoints
- **Versioning**: Enables API versioning and backward compatibility
- **Security**: Controls what data is exposed to external consumers

## Why Do We Need DTOs?
- **Encapsulation**: Hides internal entity structure from external consumers
- **API Stability**: Provides stable API contracts independent of internal changes
- **Security**: Controls data exposure and prevents information leakage
- **Validation**: Enables input validation at the API boundary
- **Performance**: Reduces data transfer by including only necessary fields
- **Flexibility**: Allows different representations for different use cases

## How DTOs Work in This Project?

### 1. **AuthorDTO.java**
- **What**: Data transfer object for author information
- **Why**: Provides clean author data for API responses and requests
- **How**: Maps between Author entity and external API representation
- **Where**: Used by AuthorController for author-related API operations

### 2. **AuthorMapper.java**
- **What**: Mapper interface for converting between Author entity and AuthorDTO
- **Why**: Provides clean separation between entity and DTO conversion logic
- **How**: Uses MapStruct for automatic mapping generation
- **Where**: Used by AuthorService for entity-DTO transformations

### 3. **BookCreationDTO.java**
- **What**: DTO for book creation requests
- **Why**: Validates and structures book creation data
- **How**: Contains validation annotations for book creation
- **Where**: Used by BookController for book creation operations

### 4. **BookDTO.java**
- **What**: Data transfer object for book information
- **Why**: Provides clean book data for API responses
- **How**: Maps between Book entity and external API representation
- **Where**: Used by BookController for book-related API operations

### 5. **BookMapper.java**
- **What**: Mapper interface for converting between Book entity and BookDTO
- **Why**: Handles complex book entity to DTO mapping
- **How**: Uses MapStruct for automatic mapping with custom methods
- **Where**: Used by BookService for entity-DTO transformations

### 6. **BookUpdateDTO.java**
- **What**: DTO for book update requests
- **Why**: Validates and structures book update data
- **How**: Contains validation annotations for book updates
- **Where**: Used by BookController for book update operations

### 7. **BorrowDTO.java**
- **What**: Data transfer object for book borrowing operations
- **Why**: Structures borrowing request and response data
- **How**: Maps borrowing information between layers
- **Where**: Used by BorrowController for borrowing operations

### 8. **CartDTO.java**
- **What**: Data transfer object for shopping cart information
- **Why**: Provides clean cart data for API responses
- **How**: Maps between Cart entity and external representation
- **Where**: Used by CartController for cart operations

### 9. **CartItemDTO.java**
- **What**: Data transfer object for cart item information
- **Why**: Structures cart item data for API operations
- **How**: Maps between CartItem entity and external representation
- **Where**: Used by CartController for cart item management

### 10. **CategoryDTO.java**
- **What**: Data transfer object for category information
- **Why**: Provides clean category data for API responses
- **How**: Maps between Category entity and external representation
- **Where**: Used by CategoryController for category operations

### 11. **NotificationDTO.java**
- **What**: Data transfer object for notification information
- **Why**: Structures notification data for real-time communication
- **How**: Maps notification data for WebSocket and Kafka messaging
- **Where**: Used by NotificationService and WebSocket controllers

### 12. **OrderDTO.java**
- **What**: Data transfer object for order information
- **Why**: Provides clean order data for API responses
- **How**: Maps between Order entity and external representation
- **Where**: Used by OrderController for order operations

### 13. **OrderItemDTO.java**
- **What**: Data transfer object for order item information
- **Why**: Structures order item data for API operations
- **How**: Maps between OrderItem entity and external representation
- **Where**: Used by OrderController for order item management

### 14. **OrderMapper.java**
- **What**: Mapper interface for converting between Order entity and OrderDTO
- **Why**: Handles complex order entity to DTO mapping
- **How**: Uses MapStruct for automatic mapping with custom methods
- **Where**: Used by OrderService for entity-DTO transformations

### 15. **OrderRequestDTO.java**
- **What**: DTO for order creation requests
- **Why**: Validates and structures order creation data
- **How**: Contains validation annotations for order creation
- **Where**: Used by OrderController for order creation operations

### 16. **PaymentIntentRequestDTO.java**
- **What**: DTO for payment intent creation requests
- **Why**: Structures payment intent data for payment processing
- **How**: Maps payment intent request data
- **Where**: Used by PaymentController for payment operations

### 17. **PaymentIntentResponseDTO.java**
- **What**: DTO for payment intent creation responses
- **Why**: Structures payment intent response data
- **How**: Maps payment intent response data
- **Where**: Used by PaymentController for payment responses

### 18. **PromoCodeDTO.java**
- **What**: Data transfer object for promotional code information
- **Why**: Provides clean promo code data for API operations
- **How**: Maps between PromoCode entity and external representation
- **Where**: Used by PromoController for promo code operations

### 19. **PublisherDTO.java**
- **What**: Data transfer object for publisher information
- **Why**: Provides clean publisher data for API responses
- **How**: Maps between Publisher entity and external representation
- **Where**: Used by PublisherController for publisher operations

### 20. **PublisherMapper.java**
- **What**: Mapper interface for converting between Publisher entity and PublisherDTO
- **Why**: Handles publisher entity to DTO mapping
- **How**: Uses MapStruct for automatic mapping
- **Where**: Used by PublisherService for entity-DTO transformations

### 21. **UpdateStatusRequestDTO.java**
- **What**: DTO for status update requests
- **Why**: Structures status update data for various entities
- **How**: Maps status update request data
- **Where**: Used by various controllers for status updates

### 22. **UserDTO.java**
- **What**: Data transfer object for user information
- **Why**: Provides clean user data for API responses
- **How**: Maps between User entity and external representation
- **Where**: Used by AuthUserController and AdminUserController

### 23. **UserMapper.java**
- **What**: Mapper interface for converting between User entity and UserDTO
- **Why**: Handles user entity to DTO mapping
- **How**: Uses MapStruct for automatic mapping
- **Where**: Used by UserService for entity-DTO transformations

### 24. **UserRolesUpdateDTO.java**
- **What**: DTO for user role update requests
- **Why**: Structures user role update data
- **How**: Maps user role update request data
- **Where**: Used by AdminUserController for role management

## DTO Design Patterns

### 1. **Validation Annotations**
- **@NotNull**: Ensures field is not null
- **@NotBlank**: Ensures field is not null or empty
- **@Valid**: Triggers validation of nested objects
- **@Size**: Validates string length
- **@Min/@Max**: Validates numeric ranges
- **@Email**: Validates email format

### 2. **Mapping Annotations**
- **@JsonProperty**: Maps field to JSON property
- **@JsonIgnore**: Excludes field from JSON serialization
- **@JsonFormat**: Formats date/time fields
- **@JsonInclude**: Controls field inclusion in JSON

### 3. **Builder Pattern**
- Uses Lombok's `@Builder` for fluent object creation
- Provides clean API for object construction
- Enables immutable object creation

### 4. **Immutability**
- Uses `final` fields where appropriate
- Provides read-only access to data
- Ensures data integrity

## DTO Categories

### 1. **Request DTOs**
- **Purpose**: Structure incoming API requests
- **Validation**: Contains validation annotations
- **Examples**: BookCreationDTO, OrderRequestDTO, PaymentIntentRequestDTO

### 2. **Response DTOs**
- **Purpose**: Structure API responses
- **Serialization**: Optimized for JSON serialization
- **Examples**: BookDTO, OrderDTO, UserDTO

### 3. **Update DTOs**
- **Purpose**: Structure update requests
- **Validation**: Contains update-specific validation
- **Examples**: BookUpdateDTO, UpdateStatusRequestDTO

### 4. **Mapper DTOs**
- **Purpose**: Handle entity-DTO conversions
- **Mapping**: Uses MapStruct for automatic mapping
- **Examples**: BookMapper, OrderMapper, UserMapper

## Validation Strategies

### 1. **Field-Level Validation**
- Validates individual fields
- Provides immediate feedback
- Uses Bean Validation annotations

### 2. **Object-Level Validation**
- Validates entire objects
- Implements complex business rules
- Uses custom validators

### 3. **Group Validation**
- Validates different groups of fields
- Enables conditional validation
- Uses validation groups

### 4. **Cross-Field Validation**
- Validates relationships between fields
- Implements business logic validation
- Uses custom validation annotations

## Mapping Strategies

### 1. **MapStruct Integration**
- Automatic mapping generation
- Compile-time mapping
- Type-safe mapping

### 2. **Custom Mapping Methods**
- Handles complex mapping logic
- Provides flexibility for special cases
- Implements business-specific mapping

### 3. **Nested Object Mapping**
- Maps complex object hierarchies
- Handles circular references
- Manages lazy loading

### 4. **Collection Mapping**
- Maps collections and arrays
- Handles different collection types
- Optimizes performance

## Performance Considerations

### 1. **Lazy Loading**
- Defers loading of related objects
- Improves response time
- Reduces memory usage

### 2. **Selective Field Mapping**
- Maps only required fields
- Reduces data transfer
- Improves performance

### 3. **Caching**
- Caches frequently used DTOs
- Reduces mapping overhead
- Improves response time

### 4. **Batch Operations**
- Handles bulk data operations
- Optimizes database queries
- Improves throughput

## Security Considerations

### 1. **Data Exposure Control**
- Controls what data is exposed
- Prevents information leakage
- Implements data filtering

### 2. **Input Validation**
- Validates all input data
- Prevents injection attacks
- Ensures data integrity

### 3. **Sensitive Data Handling**
- Excludes sensitive fields
- Implements data masking
- Protects user privacy

### 4. **Access Control**
- Implements field-level access control
- Restricts data based on user roles
- Ensures data security

## Testing Strategy

### 1. **Unit Testing**
- Test DTO validation rules
- Test mapping logic
- Test serialization/deserialization

### 2. **Integration Testing**
- Test DTO integration with controllers
- Test mapping with real entities
- Test validation with real data

### 3. **Contract Testing**
- Test API contracts
- Ensure backward compatibility
- Validate data formats

This DTO layer provides a robust, secure, and maintainable data transfer foundation for the Bookstore application, following best practices for API design and data validation.
