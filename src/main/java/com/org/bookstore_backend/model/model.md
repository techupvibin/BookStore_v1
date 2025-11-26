# Model Layer Documentation

## Overview
The `model` package contains the entity classes that represent the database schema and domain objects of the Bookstore application. These entities define the structure of data stored in the database and implement the Domain Model pattern.

## What is the Model Layer?
The model layer is responsible for:
- **Entity Definition**: Defines the structure of database tables
- **Data Validation**: Implements validation rules at the entity level
- **Relationship Mapping**: Defines relationships between entities
- **Business Rules**: Encapsulates domain-specific business rules
- **Data Integrity**: Ensures data consistency and integrity
- **ORM Mapping**: Maps Java objects to database tables using JPA annotations

## Why Do We Need Models?
- **Data Structure**: Defines the structure of data in the application
- **Database Mapping**: Maps Java objects to database tables
- **Validation**: Provides data validation at the entity level
- **Relationships**: Defines how entities relate to each other
- **Business Logic**: Encapsulates domain-specific business rules
- **Type Safety**: Provides compile-time type checking for data operations

## How Models Work in This Project?

### 1. **Author.java**
- **What**: Represents book authors in the system
- **Why**: Stores author information for book cataloging and management
- **How**: Maps to `authors` table with relationships to books
- **Where**: Used throughout the application for author-related operations

### 2. **AuthProvider.java**
- **What**: Enum representing different authentication providers
- **Why**: Supports multiple authentication methods (local, OAuth2, etc.)
- **How**: Defines authentication provider types for user authentication
- **Where**: Used in User entity and authentication services

### 3. **Book.java**
- **What**: Core entity representing books in the bookstore
- **Why**: Central entity for all book-related operations and data
- **How**: Maps to `books` table with relationships to authors, publishers, categories
- **Where**: Used throughout the application for book management

### 4. **Borrow.java**
- **What**: Represents book borrowing transactions
- **Why**: Tracks book lending and returning operations
- **How**: Maps to `borrows` table with relationships to users and books
- **Where**: Used by BorrowService for lending operations

### 5. **Cart.java**
- **What**: Represents user shopping carts
- **Why**: Manages user's shopping cart state and items
- **How**: Maps to `carts` table with one-to-one relationship to users
- **Where**: Used by CartService for shopping cart management

### 6. **CartItem.java**
- **What**: Represents individual items in a shopping cart
- **Why**: Stores cart items with quantities and book references
- **How**: Maps to `cart_items` table with composite primary key
- **Where**: Used by CartService for cart item management

### 7. **CartItemPK.java**
- **What**: Composite primary key for cart items
- **Why**: Ensures unique cart item identification
- **How**: Combines cart ID and book ID for uniqueness
- **Where**: Used by CartItem entity for primary key definition

### 8. **Category.java**
- **What**: Represents book categories and genres
- **Why**: Organizes books into hierarchical categories
- **How**: Maps to `categories` table with self-referencing relationships
- **Where**: Used by CategoryService for book categorization

### 9. **OAuth2UserInfoFactory.java**
- **What**: Factory class for creating OAuth2 user information
- **Why**: Handles different OAuth2 provider user data formats
- **How**: Creates standardized user info objects from provider-specific data
- **Where**: Used in OAuth2 authentication flow

### 10. **Order.java**
- **What**: Represents customer orders
- **Why**: Tracks order information and status throughout the order lifecycle
- **How**: Maps to `orders` table with relationships to users and order items
- **Where**: Used by OrderService for order management

### 11. **OrderItem.java**
- **What**: Represents individual items within an order
- **Why**: Stores order item details including quantity and price
- **How**: Maps to `order_items` table with relationships to orders and books
- **Where**: Used by OrderService for order item management

### 12. **OrderStatus.java**
- **What**: Enum representing different order statuses
- **Why**: Tracks order progression through different states
- **How**: Defines order status values (PENDING, CONFIRMED, SHIPPED, DELIVERED, etc.)
- **Where**: Used by Order entity and OrderService

### 13. **Payment.java**
- **What**: Represents payment transactions
- **Why**: Tracks payment information and transaction history
- **How**: Maps to `payments` table with relationships to orders
- **Where**: Used by PaymentService for payment management

### 14. **PromoCode.java**
- **What**: Represents promotional codes and discounts
- **Why**: Manages discount codes and promotional offers
- **How**: Maps to `promo_codes` table with validation rules
- **Where**: Used by PromoService for discount management

### 15. **Publisher.java**
- **What**: Represents book publishers
- **Why**: Stores publisher information for book cataloging
- **How**: Maps to `publishers` table with relationships to books
- **Where**: Used by PublisherService for publisher management

### 16. **Role.java**
- **What**: Represents user roles and permissions
- **Why**: Implements role-based access control
- **How**: Maps to `roles` table with many-to-many relationship to users
- **Where**: Used by User entity and security components

### 17. **ShortenedUrl.java**
- **What**: Represents shortened URLs
- **Why**: Manages URL shortening for better user experience
- **How**: Maps to `shortened_urls` table with original URL mapping
- **Where**: Used by UrlShorteningService

### 18. **User.java**
- **What**: Represents user accounts in the system
- **Why**: Central entity for user management and authentication
- **How**: Maps to `users` table with relationships to orders, cart, and roles
- **Where**: Used throughout the application for user-related operations

## Entity Design Patterns

### 1. **JPA Annotations**
- **@Entity**: Marks class as a JPA entity
- **@Table**: Specifies database table name
- **@Id**: Marks primary key field
- **@GeneratedValue**: Defines primary key generation strategy
- **@Column**: Maps field to database column

### 2. **Relationship Mapping**
- **@OneToOne**: One-to-one relationships
- **@OneToMany**: One-to-many relationships
- **@ManyToOne**: Many-to-one relationships
- **@ManyToMany**: Many-to-many relationships
- **@JoinTable**: Defines join tables for many-to-many relationships

### 3. **Validation Annotations**
- **@NotBlank**: Ensures field is not null or empty
- **@NotNull**: Ensures field is not null
- **@Min/@Max**: Validates numeric ranges
- **@Email**: Validates email format
- **@Size**: Validates string length

### 4. **Lombok Integration**
- **@Getter/@Setter**: Generates getter and setter methods
- **@NoArgsConstructor**: Generates no-args constructor
- **@AllArgsConstructor**: Generates all-args constructor
- **@Builder**: Implements builder pattern
- **@ToString**: Generates toString method

## Entity Relationships

### 1. **User Relationships**
- **User ↔ Role**: Many-to-many (users can have multiple roles)
- **User ↔ Order**: One-to-many (user can have multiple orders)
- **User ↔ Cart**: One-to-one (each user has one cart)
- **User ↔ Book**: Many-to-many (users can favorite multiple books)

### 2. **Book Relationships**
- **Book ↔ Author**: Many-to-many (books can have multiple authors)
- **Book ↔ Publisher**: Many-to-one (book belongs to one publisher)
- **Book ↔ Category**: Many-to-many (books can belong to multiple categories)
- **Book ↔ OrderItem**: One-to-many (book can be in multiple order items)
- **Book ↔ CartItem**: One-to-many (book can be in multiple cart items)

### 3. **Order Relationships**
- **Order ↔ User**: Many-to-one (order belongs to one user)
- **Order ↔ OrderItem**: One-to-many (order contains multiple items)
- **Order ↔ Payment**: One-to-many (order can have multiple payments)

### 4. **Cart Relationships**
- **Cart ↔ User**: One-to-one (cart belongs to one user)
- **Cart ↔ CartItem**: One-to-many (cart contains multiple items)

## Data Validation Rules

### 1. **Book Entity Validation**
- Title: Not blank, required
- ISBN: Not blank, unique, required
- Publication Year: Minimum 1400
- Price: Minimum 0 (non-negative)
- Quantity: Minimum 0 (non-negative)

### 2. **User Entity Validation**
- Username: Not blank, unique, required
- Email: Not blank, unique, valid email format
- Password: Not blank, required

### 3. **Order Entity Validation**
- Order Date: Not null, required
- Total Amount: Minimum 0 (non-negative)
- Status: Not null, required

### 4. **Payment Entity Validation**
- Amount: Minimum 0 (non-negative)
- Payment Date: Not null, required
- Status: Not null, required

## Performance Considerations

### 1. **Lazy Loading**
- Uses `FetchType.LAZY` for large collections
- Prevents unnecessary data loading
- Improves application performance

### 2. **Eager Loading**
- Uses `FetchType.EAGER` for critical relationships
- Ensures data is always available
- Used sparingly to avoid performance issues

### 3. **Indexing Strategy**
- Primary keys are automatically indexed
- Foreign keys should be indexed
- Frequently queried fields should be indexed

### 4. **Cascade Operations**
- Defines cascade behavior for related entities
- Ensures data consistency
- Prevents orphaned records

## Security Considerations

### 1. **Data Sanitization**
- Validates input data at entity level
- Prevents SQL injection through JPA
- Ensures data integrity

### 2. **Access Control**
- Implements role-based access control
- Uses Spring Security integration
- Protects sensitive data

### 3. **Audit Trail**
- Tracks entity changes where needed
- Implements audit fields (created_at, updated_at)
- Maintains data history

## Testing Strategy

### 1. **Unit Testing**
- Test entity validation rules
- Test relationship mappings
- Test business logic methods

### 2. **Integration Testing**
- Test entity persistence
- Test relationship loading
- Test cascade operations

### 3. **Performance Testing**
- Test query performance
- Test relationship loading performance
- Test bulk operations

## Database Schema Considerations

### 1. **Table Design**
- Normalized database design
- Proper foreign key relationships
- Appropriate data types

### 2. **Constraints**
- Primary key constraints
- Foreign key constraints
- Unique constraints
- Check constraints

### 3. **Indexes**
- Primary key indexes
- Foreign key indexes
- Query optimization indexes

This model layer provides a robust, well-structured foundation for the Bookstore application's data layer, following JPA best practices and domain modeling principles.
