# Exception Handling Layer Documentation

## Overview
The `exception` package contains custom exception classes and a global exception handler that provides centralized error handling for the Bookstore application. This layer ensures consistent error responses and proper error logging throughout the application.

## What is the Exception Handling Layer?
The exception handling layer is responsible for:
- **Custom Exception Definition**: Defines application-specific exception types
- **Global Error Handling**: Provides centralized exception handling
- **Error Response Formatting**: Ensures consistent error response format
- **Error Logging**: Logs errors for debugging and monitoring
- **User-Friendly Messages**: Provides meaningful error messages to users
- **HTTP Status Mapping**: Maps exceptions to appropriate HTTP status codes

## Why Do We Need Exception Handling?
- **Consistent Error Responses**: Provides uniform error response format across the application
- **Centralized Error Management**: Centralizes error handling logic for easier maintenance
- **User Experience**: Provides meaningful error messages to users
- **Debugging Support**: Logs errors for debugging and troubleshooting
- **Security**: Prevents information leakage through error messages
- **Monitoring**: Enables error tracking and monitoring

## How Exception Handling Works in This Project?

### 1. **BookNotFoundException.java**
- **What**: Custom exception for when a book is not found
- **Why**: Provides specific error handling for book-related operations
- **How**: Extends `RuntimeException` with book-specific error information
- **Where**: Thrown by BookService when a book cannot be found

### 2. **DuplicateResourceException.java**
- **What**: Custom exception for duplicate resource creation
- **Why**: Handles cases where a resource already exists (e.g., duplicate ISBN, email)
- **How**: Extends `RuntimeException` with duplicate resource information
- **Where**: Thrown by various services when duplicate resources are detected

### 3. **GlobalExceptionHandler.java**
- **What**: Centralized exception handler for the entire application
- **Why**: Provides consistent error handling and response formatting
- **How**: Uses `@ControllerAdvice` to handle exceptions globally
- **Where**: Intercepts all exceptions thrown by controllers and services

### 4. **ResourceNotFoundException.java**
- **What**: Generic exception for when a resource is not found
- **Why**: Provides a general-purpose exception for missing resources
- **How**: Extends `RuntimeException` with resource-specific information
- **Where**: Thrown by various services when resources cannot be found

## Exception Handling Patterns

### 1. **Custom Exception Classes**
```java
public class BookNotFoundException extends RuntimeException {
    public BookNotFoundException(String message) {
        super(message);
    }
    
    public BookNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

### 2. **Global Exception Handler**
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BookNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleBookNotFound(BookNotFoundException ex) {
        ErrorResponse error = new ErrorResponse("BOOK_NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
}
```

### 3. **Error Response Structure**
```java
public class ErrorResponse {
    private String error;
    private String message;
    private long timestamp;
    private String path;
    
    // Constructors, getters, and setters
}
```

## Exception Types and Usage

### 1. **BookNotFoundException**
- **When to Use**: When a book cannot be found by ID, ISBN, or other criteria
- **HTTP Status**: 404 Not Found
- **Example Usage**: 
  ```java
  if (book == null) {
      throw new BookNotFoundException("Book with ID " + id + " not found");
  }
  ```

### 2. **DuplicateResourceException**
- **When to Use**: When trying to create a resource that already exists
- **HTTP Status**: 409 Conflict
- **Example Usage**:
  ```java
  if (bookRepo.existsByIsbn(isbn)) {
      throw new DuplicateResourceException("Book with ISBN " + isbn + " already exists");
  }
  ```

### 3. **ResourceNotFoundException**
- **When to Use**: When any resource cannot be found
- **HTTP Status**: 404 Not Found
- **Example Usage**:
  ```java
  if (user == null) {
      throw new ResourceNotFoundException("User with ID " + userId + " not found");
  }
  ```

## Global Exception Handler Features

### 1. **Exception Mapping**
- Maps specific exceptions to HTTP status codes
- Provides consistent error response format
- Handles both checked and unchecked exceptions

### 2. **Error Response Formatting**
- Standardizes error response structure
- Includes error code, message, timestamp, and path
- Provides user-friendly error messages

### 3. **Logging Integration**
- Logs all exceptions for debugging
- Includes stack traces for development
- Provides structured logging for monitoring

### 4. **Security Considerations**
- Prevents information leakage in error messages
- Sanitizes error responses for production
- Hides sensitive information from error responses

## Error Response Structure

### 1. **Standard Error Response**
```json
{
    "error": "BOOK_NOT_FOUND",
    "message": "Book with ID 123 not found",
    "timestamp": 1640995200000,
    "path": "/api/books/123"
}
```

### 2. **Validation Error Response**
```json
{
    "error": "VALIDATION_ERROR",
    "message": "Validation failed",
    "timestamp": 1640995200000,
    "path": "/api/books",
    "details": [
        {
            "field": "title",
            "message": "Title is required"
        }
    ]
}
```

### 3. **Generic Error Response**
```json
{
    "error": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "timestamp": 1640995200000,
    "path": "/api/books"
}
```

## Exception Handling Best Practices

### 1. **Specific Exception Types**
- Create specific exceptions for different error scenarios
- Provide meaningful exception names
- Include relevant context in exception messages

### 2. **Consistent Error Codes**
- Use consistent error codes across the application
- Follow a naming convention for error codes
- Document error codes for API consumers

### 3. **Meaningful Error Messages**
- Provide clear, actionable error messages
- Avoid technical jargon in user-facing messages
- Include relevant context in error messages

### 4. **Proper HTTP Status Codes**
- Use appropriate HTTP status codes
- Follow REST API conventions
- Map exceptions to correct status codes

### 5. **Error Logging**
- Log all exceptions with appropriate levels
- Include relevant context in log messages
- Use structured logging for better monitoring

## Integration with Other Layers

### 1. **Controller Layer**
- Controllers throw exceptions for error scenarios
- Global exception handler intercepts controller exceptions
- Provides consistent error responses to clients

### 2. **Service Layer**
- Services throw business-specific exceptions
- Exceptions propagate up to the controller layer
- Business logic errors are properly handled

### 3. **Repository Layer**
- Repositories throw data access exceptions
- Exceptions are caught and transformed by services
- Database errors are properly handled

### 4. **Validation Layer**
- Validation exceptions are handled globally
- Provides consistent validation error responses
- Includes field-specific validation errors

## Security Considerations

### 1. **Information Disclosure**
- Prevents sensitive information leakage
- Sanitizes error messages for production
- Hides internal implementation details

### 2. **Error Message Sanitization**
- Removes sensitive data from error messages
- Provides generic messages for security-sensitive errors
- Logs detailed errors internally

### 3. **Attack Prevention**
- Prevents information disclosure attacks
- Handles malicious input gracefully
- Provides secure error responses

## Monitoring and Alerting

### 1. **Error Tracking**
- Tracks error frequency and patterns
- Monitors error rates and trends
- Provides error analytics

### 2. **Alerting**
- Alerts on critical errors
- Monitors error thresholds
- Provides real-time error notifications

### 3. **Logging**
- Structured logging for error analysis
- Error correlation and tracking
- Performance impact monitoring

## Testing Exception Handling

### 1. **Unit Testing**
- Test exception throwing scenarios
- Verify exception messages and context
- Test exception handling logic

### 2. **Integration Testing**
- Test exception handling in real scenarios
- Verify error response formats
- Test exception propagation

### 3. **Error Scenario Testing**
- Test various error conditions
- Verify error response consistency
- Test error recovery scenarios

## Performance Considerations

### 1. **Exception Overhead**
- Minimize exception creation overhead
- Use exceptions for exceptional cases only
- Avoid exceptions in normal control flow

### 2. **Error Response Size**
- Keep error responses concise
- Avoid large error payloads
- Optimize error response serialization

### 3. **Logging Performance**
- Use appropriate log levels
- Avoid excessive logging
- Optimize log message formatting

This exception handling layer provides a robust, secure, and maintainable error handling foundation for the Bookstore application, ensuring consistent error responses and proper error management throughout the system.
