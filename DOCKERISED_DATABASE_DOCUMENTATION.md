# 🗄️ Dockerised Database Documentation - BookStore Application

## 📋 Table of Contents

- [Overview](#overview)
- [Database Configuration](#database-configuration)
- [Automatic Database Creation](#automatic-database-creation)
- [Table Creation](#table-creation)
- [Accessing the Database](#accessing-the-database)
- [Database Management](#database-management)
- [Data Initialization](#data-initialization)
- [Backup and Restore](#backup-and-restore)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## 🎯 Overview

The BookStore application uses **PostgreSQL 14** as its primary database, running in a Docker container. The database is fully containerised and managed through Docker Compose, providing:

- **Automatic Database Creation**: Database is created automatically when container starts
- **Data Persistence**: Data persists across container restarts using Docker volumes
- **Easy Management**: Simple commands to access and manage the database
- **Automatic Table Creation**: Tables are created automatically by Hibernate/JPA
- **Data Initialization**: Roles and admin user are created automatically on startup

### **Database Details**

| Property | Value |
|----------|-------|
| **Database Name** | `BookStore` |
| **Username** | `postgres` |
| **Password** | `Wrong123` |
| **Host (Docker)** | `postgres-db` |
| **Host (External)** | `localhost` |
| **Port** | `5432` |
| **Version** | PostgreSQL 14 |
| **Container Name** | `my-postgres` |

---

## ⚙️ Database Configuration

### **Docker Compose Configuration**

```yaml
postgres-db:
  image: postgres:14
  container_name: my-postgres
  ports:
    - "5432:5432"
  environment:
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: Wrong123
    POSTGRES_DB: BookStore
  volumes:
    - postgres_data:/var/lib/postgresql/data
```

### **Key Configuration Points**

1. **Image**: Uses official PostgreSQL 14 image
2. **Port Mapping**: `5432:5432` (host:container)
3. **Environment Variables**:
   - `POSTGRES_USER`: Database superuser
   - `POSTGRES_PASSWORD`: Database password
   - `POSTGRES_DB`: Database name (created automatically)
4. **Volume**: `postgres_data` for data persistence

### **Application Configuration**

#### **Docker Profile (`application-docker.yml`)**

```yaml
spring:
  datasource:
    url: jdbc:postgresql://postgres-db:5432/BookStore
    username: postgres
    password: ${DB_PASSWORD:Wrong123}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update  # Creates/updates tables automatically
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
```

**Important Settings**:
- **`ddl-auto: update`**: Automatically creates/updates tables based on JPA entities
- **`show-sql: true`**: Logs all SQL queries (useful for debugging)
- **Connection URL**: Uses container name `postgres-db` (not `localhost`)

---

## 🚀 Automatic Database Creation

### **How It Works**

1. **Docker Compose Starts PostgreSQL Container**
   ```bash
   docker-compose up -d postgres-db
   ```

2. **PostgreSQL Initializes**
   - Reads environment variables
   - Creates database specified in `POSTGRES_DB`
   - Sets up user with password

3. **Database Ready**
   - Database `BookStore` is automatically created
   - User `postgres` has full access
   - Ready for connections

### **Verification**

```bash
# Check if database exists
docker exec my-postgres psql -U postgres -c "\l"

# Expected output:
#   Name      |  Owner   | Encoding
#   ----------+----------+----------
#   BookStore | postgres | UTF8
#   postgres  | postgres | UTF8
```

---

## 📊 Table Creation

### **Automatic Table Creation**

Tables are created automatically by **Hibernate/JPA** when the Spring Boot application starts:

1. **Application Starts**: Spring Boot application connects to database
2. **Hibernate Scans Entities**: Finds all `@Entity` classes
3. **DDL Generation**: With `ddl-auto: update`, Hibernate:
   - Creates tables if they don't exist
   - Updates tables if schema changed
   - Preserves existing data

### **Created Tables**

The application creates **17 tables** automatically:

| Table Name | Purpose |
|------------|---------|
| `users` | User accounts and authentication |
| `roles` | User roles (USER, ADMIN, PUBLISHER) |
| `user_roles` | Many-to-many relationship between users and roles |
| `books` | Book catalog |
| `authors` | Author information |
| `book_authors` | Many-to-many relationship between books and authors |
| `publishers` | Publisher information |
| `categories` | Book categories/genres |
| `carts` | Shopping carts |
| `cart_items` | Items in shopping carts |
| `orders` | Customer orders |
| `order_items` | Items within orders |
| `payments` | Payment transactions |
| `promo_codes` | Promotional discount codes |
| `user_favorites` | User favorites/wishlist |
| `borrow` | Book borrowing records |
| `shortened_urls` | URL shortening records |

### **Verify Tables**

```bash
# List all tables
docker exec my-postgres psql -U postgres -d BookStore -c "\dt"

# Count tables
docker exec my-postgres psql -U postgres -d BookStore -c \
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"

# View table structure
docker exec my-postgres psql -U postgres -d BookStore -c "\d users"
```

### **Table Schema Example**

```sql
-- Users table structure
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(45) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    auth_provider VARCHAR(20),
    provider_id VARCHAR(100),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books table structure
CREATE TABLE books (
    book_id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    image_url VARCHAR(500),
    genre VARCHAR(100),
    publication_year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔌 Accessing the Database

### **Method 1: Using pgAdmin (Web UI)**

**Access URL**: http://localhost:5050

**Login Credentials**:
- **Email**: `admin@example.com`
- **Password**: `admin123`

**Steps**:
1. Open http://localhost:5050 in your browser
2. Login with credentials above
3. Add server:
   - **Name**: BookStore
   - **Host**: `my-postgres` (or `postgres-db`)
   - **Port**: `5432`
   - **Username**: `postgres`
   - **Password**: `Wrong123`
   - **Database**: `BookStore`

### **Method 2: Using psql (Command Line)**

#### **From Host Machine**

```bash
# Connect to database
docker exec -it my-postgres psql -U postgres -d BookStore

# Or using postgres-client container
docker exec -it psql-client psql -h my-postgres -U postgres -d BookStore
```

#### **Common psql Commands**

```sql
-- List all databases
\l

-- Connect to database
\c BookStore

-- List all tables
\dt

-- Describe table structure
\d users
\d books

-- View table data
SELECT * FROM users;
SELECT * FROM books LIMIT 10;

-- Count records
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM books;

-- Exit psql
\q
```

### **Method 3: Using Database Client Tools**

You can use any PostgreSQL client tool (DBeaver, pgAdmin desktop, DataGrip, etc.):

**Connection Details**:
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `BookStore`
- **Username**: `postgres`
- **Password**: `Wrong123`

### **Method 4: From Application Container**

```bash
# Connect from Spring Boot container
docker exec -it bookstore_springboot_app sh

# Install psql (if needed)
apk add postgresql-client

# Connect
psql -h postgres-db -U postgres -d BookStore
```

---

## 🛠️ Database Management

### **Check Database Status**

```bash
# Check if container is running
docker ps | findstr my-postgres

# Check container logs
docker logs my-postgres

# Check database size
docker exec my-postgres psql -U postgres -d BookStore -c \
  "SELECT pg_size_pretty(pg_database_size('BookStore'));"
```

### **View Database Information**

```bash
# Database version
docker exec my-postgres psql -U postgres -c "SELECT version();"

# List all databases
docker exec my-postgres psql -U postgres -c "\l"

# Database connections
docker exec my-postgres psql -U postgres -c \
  "SELECT count(*) FROM pg_stat_activity WHERE datname = 'BookStore';"

# Table sizes
docker exec my-postgres psql -U postgres -d BookStore -c \
  "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size 
   FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

### **Common Operations**

#### **Create New Table (Manual)**

```sql
-- Connect to database
docker exec -it my-postgres psql -U postgres -d BookStore

-- Create table
CREATE TABLE test_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **Insert Test Data**

```sql
-- Insert into users
INSERT INTO users (username, email, password) 
VALUES ('testuser', 'test@example.com', 'hashed_password');

-- Insert into books
INSERT INTO books (title, price, stock_quantity, is_available) 
VALUES ('Test Book', 29.99, 10, true);
```

#### **Update Data**

```sql
-- Update user
UPDATE users SET email = 'newemail@example.com' WHERE username = 'testuser';

-- Update book price
UPDATE books SET price = 39.99 WHERE book_id = 1;
```

#### **Delete Data**

```sql
-- Delete user
DELETE FROM users WHERE username = 'testuser';

-- Delete book
DELETE FROM books WHERE book_id = 1;
```

### **Reset Database**

```bash
# Stop application
docker-compose stop bookstore_springboot_app

# Drop and recreate database
docker exec my-postgres psql -U postgres -c "DROP DATABASE IF EXISTS \"BookStore\";"
docker exec my-postgres psql -U postgres -c "CREATE DATABASE \"BookStore\";"

# Restart application (tables will be recreated)
docker-compose start bookstore_springboot_app
```

---

## 🔄 Data Initialization

### **Automatic Initialization**

The application automatically initializes data on startup through the `DataInitializer` class:

#### **Roles Created**

- `ROLE_USER` - Regular user role
- `ROLE_ADMIN` - Administrator role

#### **Admin User Creation**

An admin user is created automatically if it doesn't exist (check `DataInitializer.java` for details).

### **Manual Data Initialization**

#### **Create Admin User**

```sql
-- Connect to database
docker exec -it my-postgres psql -U postgres -d BookStore

-- Insert admin user (password should be BCrypt hashed)
-- Note: Use the application's registration endpoint or DataInitializer for proper password hashing
INSERT INTO users (username, email, password) 
VALUES ('admin', 'admin@bookstore.com', '$2a$10$hashed_password_here');

-- Assign admin role
INSERT INTO user_roles (user_id, role_id) 
SELECT u.user_id, r.role_id 
FROM users u, roles r 
WHERE u.username = 'admin' AND r.name = 'ROLE_ADMIN';
```

#### **Create Sample Books**

```sql
-- Insert sample authors
INSERT INTO authors (name, biography) VALUES 
('J.K. Rowling', 'British author, best known for the Harry Potter series'),
('George R.R. Martin', 'American novelist and short story writer');

-- Insert sample books
INSERT INTO books (title, price, stock_quantity, is_available, genre) VALUES 
('Harry Potter and the Philosopher''s Stone', 19.99, 50, true, 'Fantasy'),
('A Game of Thrones', 24.99, 30, true, 'Fantasy');
```

---

## 💾 Backup and Restore

### **Backup Database**

#### **Method 1: Using pg_dump**

```bash
# Full database backup
docker exec my-postgres pg_dump -U postgres BookStore > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup with custom format (compressed)
docker exec my-postgres pg_dump -U postgres -Fc BookStore > backup_$(date +%Y%m%d_%H%M%S).dump

# Backup specific tables
docker exec my-postgres pg_dump -U postgres -t users -t books BookStore > tables_backup.sql
```

#### **Method 2: Backup Docker Volume**

```bash
# Stop database container
docker-compose stop postgres-db

# Backup volume
docker run --rm -v bookstore_v1_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup_$(date +%Y%m%d).tar.gz /data

# Start database
docker-compose start postgres-db
```

### **Restore Database**

#### **Method 1: Using psql**

```bash
# Restore from SQL file
docker exec -i my-postgres psql -U postgres -d BookStore < backup.sql

# Or create new database and restore
docker exec -i my-postgres psql -U postgres -c "CREATE DATABASE BookStore_restored;"
docker exec -i my-postgres psql -U postgres -d BookStore_restored < backup.sql
```

#### **Method 2: Restore from Custom Format**

```bash
# Restore from custom format dump
docker exec -i my-postgres pg_restore -U postgres -d BookStore -c backup.dump
```

#### **Method 3: Restore Docker Volume**

```bash
# Stop database
docker-compose stop postgres-db

# Restore volume
docker run --rm -v bookstore_v1_postgres_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/postgres_backup.tar.gz -C /

# Start database
docker-compose start postgres-db
```

### **Automated Backup Script**

Create a backup script (`backup-database.sh`):

```bash
#!/bin/bash
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

mkdir -p $BACKUP_DIR
docker exec my-postgres pg_dump -U postgres BookStore > $BACKUP_FILE
gzip $BACKUP_FILE
echo "Backup created: $BACKUP_FILE.gz"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

---

## 🔧 Troubleshooting

### **Issue 1: Database Connection Refused**

**Error**: `Connection to localhost:5432 refused`

**Causes**:
- Container not running
- Wrong hostname in connection string
- Port conflict

**Solutions**:
```bash
# Check container status
docker ps | findstr my-postgres

# Check container logs
docker logs my-postgres

# Verify connection from app container
docker exec bookstore_springboot_app nc -zv postgres-db 5432

# Restart database
docker-compose restart postgres-db
```

### **Issue 2: Tables Not Created**

**Error**: No tables in database

**Causes**:
- `ddl-auto` set to `validate` instead of `update`
- Application not connecting to database
- Hibernate not initializing

**Solutions**:
```bash
# Check application-docker.yml
# Ensure: ddl-auto: update

# Check application logs
docker-compose logs bookstore_springboot_app | findstr -i "hibernate table"

# Restart application
docker-compose restart bookstore_springboot_app

# Manually verify connection
docker exec bookstore_springboot_app sh -c "nc -zv postgres-db 5432"
```

### **Issue 3: Authentication Failed**

**Error**: `password authentication failed for user "postgres"`

**Solutions**:
```bash
# Verify password in docker-compose.yml matches application config
# Check: POSTGRES_PASSWORD in docker-compose.yml
# Check: spring.datasource.password in application-docker.yml

# Reset password
docker exec my-postgres psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'Wrong123';"
```

### **Issue 4: Database Not Found**

**Error**: `database "BookStore" does not exist`

**Solutions**:
```bash
# Create database manually
docker exec my-postgres psql -U postgres -c "CREATE DATABASE \"BookStore\";"

# Or restart container (will auto-create)
docker-compose restart postgres-db
```

### **Issue 5: Permission Denied**

**Error**: `permission denied for table`

**Solutions**:
```bash
# Grant permissions
docker exec my-postgres psql -U postgres -d BookStore -c \
  "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;"
```

### **Issue 6: Volume Issues**

**Error**: Data not persisting

**Solutions**:
```bash
# Check volume exists
docker volume ls | findstr postgres

# Inspect volume
docker volume inspect bookstore_v1_postgres_data

# Recreate volume (WARNING: Deletes data)
docker-compose down -v
docker-compose up -d postgres-db
```

---

## ✅ Best Practices

### **1. Security**

- **Change Default Password**: Update `POSTGRES_PASSWORD` in production
- **Use Environment Variables**: Don't hardcode passwords
- **Limit Access**: Only expose port 5432 if necessary
- **Use SSL**: Enable SSL for production connections

### **2. Performance**

- **Connection Pooling**: Configured in Spring Boot
- **Indexes**: Hibernate creates indexes automatically
- **Regular VACUUM**: PostgreSQL handles this automatically
- **Monitor Queries**: Use `show-sql: true` in development only

### **3. Backup Strategy**

- **Regular Backups**: Daily automated backups
- **Test Restores**: Periodically test backup restoration
- **Multiple Locations**: Store backups in multiple locations
- **Retention Policy**: Keep backups for appropriate duration

### **4. Monitoring**

- **Check Logs**: Regularly check PostgreSQL logs
- **Monitor Size**: Monitor database growth
- **Connection Count**: Monitor active connections
- **Performance Metrics**: Use pgAdmin or monitoring tools

### **5. Development vs Production**

**Development**:
- `ddl-auto: update` - Auto-create/update tables
- `show-sql: true` - Log SQL queries
- Simple password (for local only)

**Production**:
- `ddl-auto: validate` or `none` - Don't auto-modify schema
- `show-sql: false` - Don't log queries
- Strong password from environment variables
- SSL connections
- Regular backups
- Monitoring and alerting

---

## 📊 Database Schema Reference

### **Entity Relationships**

```
users ──┬── user_roles ── roles
        │
        ├── carts ── cart_items ── books
        │
        ├── orders ── order_items ── books
        │
        ├── user_favorites ── books
        │
        └── payments ── orders

books ──┬── book_authors ── authors
        │
        └── book_publishers ── publishers
```

### **Key Constraints**

- **Primary Keys**: All tables have auto-incrementing primary keys
- **Foreign Keys**: Relationships enforced with foreign key constraints
- **Unique Constraints**: 
  - `users.username` - Unique
  - `users.email` - Unique
  - `books.isbn` - Unique (if provided)
- **Indexes**: Created automatically by Hibernate on foreign keys and unique columns

---

## 🔍 Quick Reference Commands

### **Database Operations**

```bash
# Connect to database
docker exec -it my-postgres psql -U postgres -d BookStore

# List tables
docker exec my-postgres psql -U postgres -d BookStore -c "\dt"

# View table structure
docker exec my-postgres psql -U postgres -d BookStore -c "\d users"

# Count records
docker exec my-postgres psql -U postgres -d BookStore -c "SELECT COUNT(*) FROM users;"

# Backup database
docker exec my-postgres pg_dump -U postgres BookStore > backup.sql

# Restore database
docker exec -i my-postgres psql -U postgres -d BookStore < backup.sql
```

### **Container Operations**

```bash
# Start database
docker-compose up -d postgres-db

# Stop database
docker-compose stop postgres-db

# Restart database
docker-compose restart postgres-db

# View logs
docker logs my-postgres

# Check status
docker ps | findstr my-postgres
```

---

## 📚 Additional Resources

- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Spring Data JPA**: https://spring.io/projects/spring-data-jpa
- **Hibernate Documentation**: https://hibernate.org/orm/documentation/
- **pgAdmin Documentation**: https://www.pgadmin.org/docs/

---

<div align="center">
  <strong>🗄️ Dockerised Database Documentation</strong><br>
  <em>Complete guide to PostgreSQL database setup and management in Docker</em>
</div>

