# Validation in Docker Container - Guide

This guide explains how to view and check validation entities (DTOs) and validation rules when working with Docker containers.

## 📋 Table of Contents
1. [Viewing Validation Entities in Docker](#viewing-validation-entities-in-docker)
2. [Checking Application Logs](#checking-application-logs)
3. [Accessing Container Files](#accessing-container-files)
4. [Validation Rules Reference](#validation-rules-reference)
5. [Testing Validation in Docker](#testing-validation-in-docker)

---

## 1. Viewing Validation Entities in Docker

### **Method 1: View Application Logs (Real-time Validation Errors)**

When you submit a book creation request, validation errors are logged in the Spring Boot application. View logs:

```bash
# View real-time logs from the Spring Boot container
docker logs -f bookstore_springboot_app

# View last 100 lines of logs
docker logs --tail 100 bookstore_springboot_app

# View logs with timestamps
docker logs -f --timestamps bookstore_springboot_app
```

**What to Look For:**
- Validation error messages like "Title is mandatory", "Publication year must be after 1400"
- Request/response logs showing the data being received
- Exception stack traces if validation fails

### **Method 2: Access Container Shell**

Access the container's shell to explore the application:

```bash
# Enter the Spring Boot container
docker exec -it bookstore_springboot_app /bin/sh

# Or if bash is available
docker exec -it bookstore_springboot_app /bin/bash
```

**Inside the Container:**
```bash
# Navigate to application directory
cd /app

# List JAR contents (if needed)
ls -la

# View environment variables
env | grep SPRING

# Check Java version
java -version
```

---

## 2. Checking Application Logs

### **View Logs for Book Creation Validation**

```bash
# Filter logs for book-related operations
docker logs bookstore_springboot_app 2>&1 | grep -i "book"

# Filter for validation errors
docker logs bookstore_springboot_app 2>&1 | grep -i "validation\|mandatory\|error"

# Filter for specific endpoint
docker logs bookstore_springboot_app 2>&1 | grep -i "/api/books"
```

### **Example Log Output When Validation Fails:**

```
2024-01-15 10:30:45.123  INFO --- [http-nio-8080-exec-1] c.o.b.controller.BookController : Received request to create a new book with title: 
2024-01-15 10:30:45.125  WARN --- [http-nio-8080-exec-1] o.s.w.s.m.m.a.ExceptionHandlerExceptionResolver : Validation failed for argument [0] in public org.springframework.http.ResponseEntity<com.org.bookstore_backend.dto.BookDTO> createBook(@Valid @RequestPart("bookCreationDTO") BookCreationDTO, @RequestPart(value = "imageFile", required = false) MultipartFile)
2024-01-15 10:30:45.126 ERROR --- [http-nio-8080-exec-1] c.o.b.exception.GlobalExceptionHandler : Validation error: Title is mandatory
```

---

## 3. Accessing Container Files

### **View Source Code Structure (If Source is Included)**

```bash
# Copy files from container to host (if source is available)
docker cp bookstore_springboot_app:/app ./container_app

# Or view files directly in container
docker exec bookstore_springboot_app ls -la /app
```

**Note:** In production Docker images, source code is typically compiled into a JAR file. The actual `.java` files are not available in the container.

### **Extract and Inspect JAR File**

```bash
# Copy JAR from container
docker cp bookstore_springboot_app:/app/app.jar ./app.jar

# Extract JAR contents (requires unzip/jar command)
unzip -l app.jar | grep BookCreationDTO
```

---

## 4. Validation Rules Reference

### **BookCreationDTO Validation Rules**

The validation rules are defined in:
- **File Location:** `src/main/java/com/org/bookstore_backend/dto/BookCreationDTO.java`
- **Container:** Compiled into the JAR at `/app/app.jar`

#### **Validation Constraints:**

| Field | Constraint | Error Message |
|-------|-----------|---------------|
| `title` | `@NotBlank` | "Title is mandatory" |
| `description` | `@NotBlank` | "Description is mandatory" |
| `isbn` | `@NotBlank` | "ISBN is mandatory" |
| `publicationYear` | `@Min(1400)` | "Publication year must be after 1400" |
| `genre` | `@NotBlank` | "Genre is mandatory" |
| `price` | `@Min(0)` | "Price cannot be negative" |
| `quantity` | `@Min(0)` | "Quantity cannot be negative" |
| `publisher` | `@NotBlank` | "Publisher is mandatory" |
| `authors` | `@NotNull` + `@NotBlank` (each) | "At least one author is mandatory" / "Author name cannot be blank" |
| `imageFile` | None | Optional field |

### **View Validation Rules in Code**

```bash
# If you have the source code locally
cat src/main/java/com/org/bookstore_backend/dto/BookCreationDTO.java

# Or view in your IDE/editor
```

---

## 5. Testing Validation in Docker

### **Test Validation via API (cURL)**

```bash
# Test with missing required field (should fail validation)
curl -X POST http://localhost:8080/api/books \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F 'bookCreationDTO={"title":"","description":"Test","isbn":"123","publicationYear":2020,"genre":"Fiction","price":10.0,"quantity":5,"publisher":"Test Pub","authors":["Author1"]};type=application/json'

# Test with invalid publication year (should fail validation)
curl -X POST http://localhost:8080/api/books \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F 'bookCreationDTO={"title":"Test Book","description":"Test","isbn":"123","publicationYear":1300,"genre":"Fiction","price":10.0,"quantity":5,"publisher":"Test Pub","authors":["Author1"]};type=application/json'
```

### **Monitor Logs While Testing**

```bash
# In one terminal, watch logs
docker logs -f bookstore_springboot_app

# In another terminal, make API calls
# You'll see validation errors in real-time
```

### **Expected Validation Error Response:**

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Title is mandatory",
  "path": "/api/books"
}
```

---

## 6. Debugging Validation Issues

### **Enable Debug Logging**

Add to `application-docker.yml` (if you rebuild):

```yaml
logging:
  level:
    org.springframework.validation: DEBUG
    org.hibernate.validator: DEBUG
    com.org.bookstore_backend: DEBUG
```

Then restart container:
```bash
docker-compose restart bookstore_springboot_app
docker logs -f bookstore_springboot_app
```

### **Check Request Payload in Logs**

The controller logs the received data:
```java
logger.info("Received request to create a new book with title: {}", bookCreationDTO.getTitle());
```

Look for this in logs to see what data was received.

---

## 7. Quick Reference Commands

```bash
# View all logs
docker logs bookstore_springboot_app

# Follow logs in real-time
docker logs -f bookstore_springboot_app

# Filter for validation errors
docker logs bookstore_springboot_app 2>&1 | grep -i "validation\|mandatory"

# Enter container shell
docker exec -it bookstore_springboot_app /bin/sh

# Check container status
docker ps | grep bookstore_springboot_app

# Restart container (to apply changes)
docker-compose restart bookstore_springboot_app

# View container environment
docker exec bookstore_springboot_app env
```

---

## 8. Important Notes

1. **Source Code Not in Container:** The Docker image contains compiled bytecode (`.class` files in JAR), not source code (`.java` files).

2. **Validation Happens at Controller Level:** The `@Valid` annotation on `@RequestPart("bookCreationDTO")` triggers validation before the controller method executes.

3. **Error Handling:** Validation errors are handled by Spring's `MethodArgumentNotValidException`, which should be caught by `GlobalExceptionHandler` (if configured).

4. **Logs Location:** Application logs are written to stdout/stderr in the container, which Docker captures.

5. **Persistent Logs:** By default, Docker logs are stored in Docker's log driver. Use `docker logs` to access them.

---

## Summary

When working with Docker containers:
- ✅ **View logs** using `docker logs` to see validation errors in real-time
- ✅ **Access container shell** using `docker exec` to explore the environment
- ✅ **Check validation rules** in the source code (locally) or compiled JAR
- ✅ **Test validation** using API calls and monitor logs simultaneously
- ❌ **Source code** is not available in the container (only compiled JAR)

The validation rules are enforced at runtime, and errors will appear in the application logs when validation fails.

