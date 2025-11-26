# Security Layer Documentation

## Overview
The `security` package contains security-related components that handle authentication, authorization, and OAuth2 integration for the Bookstore application. This layer implements Spring Security with JWT tokens and supports multiple authentication providers.

## What is the Security Layer?
The security layer is responsible for:
- **Authentication**: Verifies user identity and credentials
- **Authorization**: Controls access to resources based on user roles
- **OAuth2 Integration**: Supports third-party authentication providers
- **JWT Token Management**: Handles JWT token generation and validation
- **Security Policies**: Implements security rules and constraints
- **User Session Management**: Manages user sessions and security context

## Why Do We Need Security?
- **Data Protection**: Protects sensitive user and business data
- **Access Control**: Ensures only authorized users can access resources
- **Authentication**: Verifies user identity before granting access
- **Authorization**: Controls what users can do based on their roles
- **Compliance**: Meets security and privacy requirements
- **Trust**: Builds user trust through secure operations

## How Security Works in This Project?

### 1. **OAuth2 Integration**
The security package contains OAuth2-related components for third-party authentication:

#### **OAuth2UserInfoFactory.java**
- **What**: Factory class for creating OAuth2 user information objects
- **Why**: Handles different OAuth2 provider user data formats
- **How**: Creates standardized user info objects from provider-specific data
- **Where**: Used in OAuth2 authentication flow to standardize user data

#### **OAuth2UserInfo.java**
- **What**: Interface for OAuth2 user information
- **Why**: Provides a common interface for different OAuth2 providers
- **How**: Defines methods for accessing user information from OAuth2 providers
- **Where**: Used by OAuth2 authentication services

#### **GoogleOAuth2UserInfo.java**
- **What**: Implementation for Google OAuth2 user information
- **Why**: Handles Google-specific user data format
- **How**: Extracts user information from Google OAuth2 response
- **Where**: Used when users authenticate with Google

#### **FacebookOAuth2UserInfo.java**
- **What**: Implementation for Facebook OAuth2 user information
- **Why**: Handles Facebook-specific user data format
- **How**: Extracts user information from Facebook OAuth2 response
- **Where**: Used when users authenticate with Facebook

#### **GitHubOAuth2UserInfo.java**
- **What**: Implementation for GitHub OAuth2 user information
- **Why**: Handles GitHub-specific user data format
- **How**: Extracts user information from GitHub OAuth2 response
- **Where**: Used when users authenticate with GitHub

### 2. **OAuth2 Authentication Services**

#### **OAuth2AuthenticationSuccessHandler.java**
- **What**: Handles successful OAuth2 authentication
- **Why**: Processes successful OAuth2 authentication and creates user sessions
- **How**: Redirects users after successful authentication and creates JWT tokens
- **Where**: Called by Spring Security after successful OAuth2 authentication

#### **OAuth2AuthenticationFailureHandler.java**
- **What**: Handles failed OAuth2 authentication
- **Why**: Processes failed OAuth2 authentication attempts
- **How**: Redirects users to error pages and logs authentication failures
- **Where**: Called by Spring Security after failed OAuth2 authentication

#### **CustomOAuth2UserService.java**
- **What**: Custom service for OAuth2 user processing
- **Why**: Handles OAuth2 user data and creates/updates user accounts
- **How**: Processes OAuth2 user information and manages user accounts
- **Where**: Used by Spring Security OAuth2 authentication flow

### 3. **User Principal and Details**

#### **UserPrincipal.java**
- **What**: Custom user principal for authentication
- **Why**: Extends Spring Security's user principal with application-specific data
- **How**: Implements UserDetails interface with additional user information
- **Where**: Used throughout the application for user authentication

#### **UserPrincipalCreator.java**
- **What**: Factory for creating UserPrincipal objects
- **Why**: Centralizes UserPrincipal creation logic
- **How**: Creates UserPrincipal objects from User entities
- **Where**: Used by authentication services

### 4. **HTTP Security Configuration**

#### **HttpCookieOAuth2AuthorizationRequestRepository.java**
- **What**: Custom repository for OAuth2 authorization requests
- **Why**: Manages OAuth2 authorization request state using HTTP cookies
- **How**: Stores and retrieves OAuth2 authorization requests in cookies
- **Where**: Used by Spring Security OAuth2 flow

#### **TokenProvider.java**
- **What**: JWT token provider for authentication
- **Why**: Generates and validates JWT tokens for user authentication
- **How**: Creates JWT tokens with user information and validates token signatures
- **Where**: Used by authentication services and security filters

## Security Implementation Patterns

### 1. **JWT Token Authentication**
- Uses JWT tokens for stateless authentication
- Implements token generation and validation
- Handles token expiration and refresh

### 2. **OAuth2 Integration**
- Supports multiple OAuth2 providers (Google, Facebook, GitHub)
- Handles OAuth2 callback processing
- Manages OAuth2 user data integration

### 3. **Role-Based Access Control**
- Implements role-based authorization
- Uses Spring Security's method-level security
- Supports hierarchical role structures

### 4. **Session Management**
- Manages user sessions securely
- Handles session timeouts and invalidation
- Implements secure session storage

## Authentication Flow

### 1. **Local Authentication**
1. User provides username/password
2. System validates credentials
3. JWT token is generated
4. Token is returned to client
5. Client includes token in subsequent requests

### 2. **OAuth2 Authentication**
1. User clicks OAuth2 provider button
2. Redirected to provider's authentication page
3. User authenticates with provider
4. Provider redirects back with authorization code
5. System exchanges code for user information
6. User account is created/updated
7. JWT token is generated and returned

### 3. **Token Validation**
1. Client includes JWT token in request header
2. JwtRequestFilter validates token
3. Token signature and expiration are checked
4. User information is extracted from token
5. Security context is established

## Authorization Patterns

### 1. **Method-Level Security**
```java
@PreAuthorize("hasRole('ADMIN')")
public void adminOnlyMethod() {
    // Admin-only logic
}

@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public void userOrAdminMethod() {
    // User or admin logic
}
```

### 2. **URL-Based Security**
```java
@Override
protected void configure(HttpSecurity http) throws Exception {
    http.authorizeRequests()
        .antMatchers("/api/admin/**").hasRole("ADMIN")
        .antMatchers("/api/user/**").hasAnyRole("USER", "ADMIN")
        .antMatchers("/api/public/**").permitAll()
        .anyRequest().authenticated();
}
```

### 3. **Resource-Based Security**
```java
@PreAuthorize("hasPermission(#bookId, 'Book', 'READ')")
public Book getBook(Long bookId) {
    // Book access logic
}
```

## Security Configuration

### 1. **Password Security**
- Uses BCrypt for password hashing
- Implements password strength requirements
- Handles password reset functionality

### 2. **Token Security**
- Uses secure JWT token generation
- Implements token expiration
- Handles token refresh mechanisms

### 3. **CORS Configuration**
- Configures CORS for frontend integration
- Restricts allowed origins and methods
- Handles preflight requests

### 4. **CSRF Protection**
- Implements CSRF protection for state-changing operations
- Excludes API endpoints from CSRF protection
- Handles CSRF token validation

## OAuth2 Provider Configuration

### 1. **Google OAuth2**
- Configures Google OAuth2 client
- Handles Google user data
- Maps Google profile to application user

### 2. **Facebook OAuth2**
- Configures Facebook OAuth2 client
- Handles Facebook user data
- Maps Facebook profile to application user

### 3. **GitHub OAuth2**
- Configures GitHub OAuth2 client
- Handles GitHub user data
- Maps GitHub profile to application user

## Security Best Practices

### 1. **Input Validation**
- Validates all input data
- Sanitizes user input
- Prevents injection attacks

### 2. **Error Handling**
- Provides generic error messages
- Prevents information disclosure
- Logs security events

### 3. **Session Security**
- Uses secure session management
- Implements session timeouts
- Handles session invalidation

### 4. **Token Management**
- Implements secure token storage
- Handles token expiration
- Provides token refresh mechanisms

## Security Monitoring

### 1. **Authentication Logging**
- Logs authentication attempts
- Tracks successful and failed logins
- Monitors authentication patterns

### 2. **Authorization Logging**
- Logs authorization decisions
- Tracks access attempts
- Monitors privilege escalation

### 3. **Security Events**
- Tracks security-related events
- Monitors suspicious activities
- Provides security alerts

## Testing Security

### 1. **Authentication Testing**
- Test authentication flows
- Verify token generation and validation
- Test OAuth2 integration

### 2. **Authorization Testing**
- Test role-based access control
- Verify permission checks
- Test security constraints

### 3. **Security Testing**
- Test for common vulnerabilities
- Verify input validation
- Test error handling

## Performance Considerations

### 1. **Token Validation**
- Optimizes token validation performance
- Implements token caching
- Minimizes validation overhead

### 2. **Session Management**
- Optimizes session storage
- Implements session cleanup
- Minimizes session overhead

### 3. **OAuth2 Performance**
- Optimizes OAuth2 flow
- Implements caching for user data
- Minimizes external API calls

This security layer provides a robust, secure, and maintainable authentication and authorization foundation for the Bookstore application, following security best practices and supporting multiple authentication methods.
