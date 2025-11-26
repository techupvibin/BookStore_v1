# 🤝 Contributing to BookStore

Thank you for your interest in contributing to BookStore! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)
- [Questions and Discussions](#questions-and-discussions)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## 🚀 How Can I Contribute?

### 🔒 **Important Notice**
**This repository is read-only for contributors. Only the repository owner can directly modify code.**

### 📋 **Contribution Process**
1. **Fork** the repository to your GitHub account
2. **Create** a feature branch in your fork
3. **Make** your changes in your fork
4. **Submit** a pull request from your fork
5. **Wait** for review and approval from the repository owner

### 🐛 **Reporting Bugs**
- Use the GitHub issue tracker
- Include detailed steps to reproduce
- Provide environment information
- Include error logs and screenshots

### 💡 **Suggesting Enhancements**
- Describe the feature in detail
- Explain why it would be useful
- Provide mockups or examples if possible

### 🔧 **Code Contributions**
- **Fork the repository first**
- Fix bugs in your fork
- Add new features in your fork
- Improve documentation in your fork
- Optimize performance in your fork
- Add tests in your fork
- **Submit pull request for review**

## 🛠️ Development Setup

### Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- Docker and Docker Compose
- Git

### Local Development
```bash
# Clone the repository
git clone https://github.com/yourusername/BookStore.git
cd BookStore

# Start services with Docker
docker-compose up -d

# Backend development
mvn spring-boot:run

# Frontend development
cd Frontend
npm install
npm start
```

### Database Setup
```bash
# Create database
docker exec -it my-postgres psql -U postgres
CREATE DATABASE BookStore;
```

## 📝 Coding Standards

### Java (Backend)
- Follow [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- Use meaningful variable and method names
- Add comprehensive JavaDoc comments
- Keep methods under 50 lines
- Use proper exception handling

```java
/**
 * Creates a new order for the specified user.
 *
 * @param orderRequest the order request containing order details
 * @return the created order DTO
 * @throws IllegalArgumentException if the order request is invalid
 * @throws EntityNotFoundException if the user is not found
 */
public OrderDTO createOrder(OrderRequestDTO orderRequest) {
    // Implementation
}
```

### JavaScript/React (Frontend)
- Use ESLint and Prettier
- Follow React best practices
- Use functional components with hooks
- Implement proper error boundaries
- Use TypeScript for new components

```javascript
// Good: Functional component with hooks
const BookCard = ({ book, onAddToCart }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      await onAddToCart(book);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{book.title}</Typography>
        <Button 
          onClick={handleAddToCart}
          disabled={isLoading}
        >
          {isLoading ? 'Adding...' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  );
};
```

### SQL
- Use consistent naming conventions
- Write readable queries with proper formatting
- Use parameterized queries to prevent SQL injection
- Add appropriate indexes for performance

```sql
-- Good: Clear naming and formatting
SELECT 
    u.user_id,
    u.username,
    u.email,
    COUNT(o.order_id) as total_orders
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
WHERE u.is_active = true
GROUP BY u.user_id, u.username, u.email
ORDER BY total_orders DESC;
```

## 🧪 Testing Guidelines

### Backend Testing
- Write unit tests for all services
- Use Mockito for mocking dependencies
- Test both success and failure scenarios
- Aim for at least 80% code coverage

```java
@SpringBootTest
class OrderServiceTest {
    
    @MockBean
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderService orderService;
    
    @Test
    void shouldCreateOrderSuccessfully() {
        // Given
        OrderRequestDTO request = createValidOrderRequest();
        Order expectedOrder = createMockOrder();
        
        when(orderRepository.save(any(Order.class)))
            .thenReturn(expectedOrder);
        
        // When
        OrderDTO result = orderService.createOrder(request);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getOrderId()).isEqualTo(expectedOrder.getOrderId());
        verify(orderRepository).save(any(Order.class));
    }
    
    @Test
    void shouldThrowExceptionForInvalidRequest() {
        // Given
        OrderRequestDTO invalidRequest = createInvalidOrderRequest();
        
        // When & Then
        assertThatThrownBy(() -> orderService.createOrder(invalidRequest))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Order request is invalid");
    }
}
```

### Frontend Testing
- Test component rendering and behavior
- Test user interactions and state changes
- Use React Testing Library for component tests
- Mock API calls for isolated testing

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';
import LoginPage from '../components/LoginPage';

test('renders login form and handles submission', async () => {
  render(
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  );
  
  // Check form elements
  expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  
  // Fill form
  fireEvent.change(screen.getByLabelText(/username/i), {
    target: { value: 'testuser' }
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: 'password123' }
  });
  
  // Submit form
  fireEvent.click(screen.getByRole('button', { name: /login/i }));
  
  // Verify submission
  await waitFor(() => {
    expect(screen.getByText(/logging in/i)).toBeInTheDocument();
  });
});
```

## 🔄 Pull Request Process

### Before Submitting
1. **Fork** the repository
2. **Create** a feature branch from `main`
3. **Make** your changes following coding standards
4. **Test** your changes thoroughly
5. **Update** documentation if needed

### Pull Request Guidelines
- Use descriptive titles
- Provide detailed descriptions
- Include screenshots for UI changes
- Reference related issues
- Ensure all tests pass

### Pull Request Template
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

## 🐛 Reporting Bugs

### Bug Report Template
```markdown
## Bug Description
Clear description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Environment
- OS: [e.g., Windows 10, macOS 12]
- Browser: [e.g., Chrome 96, Firefox 95]
- Version: [e.g., 1.0.0]

## Additional Information
Any other context, logs, or screenshots.
```

## 💡 Feature Requests

### Feature Request Template
```markdown
## Feature Description
Clear description of the feature.

## Problem Statement
What problem does this feature solve?

## Proposed Solution
How should this feature work?

## Alternatives Considered
Other solutions you've considered.

## Additional Context
Any other context or screenshots.
```

## ❓ Questions and Discussions

- **GitHub Discussions**: Use the Discussions tab for questions
- **GitHub Issues**: For bugs and feature requests
- **Code Reviews**: Ask questions in pull request comments

## 📚 Resources

### Documentation
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://reactjs.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Tools
- [IntelliJ IDEA](https://www.jetbrains.com/idea/) - Java IDE
- [VS Code](https://code.visualstudio.com/) - Code editor
- [Postman](https://www.postman.com/) - API testing
- [DBeaver](https://dbeaver.io/) - Database client

## 🎯 Getting Help

If you need help with your contribution:

1. **Check existing issues** for similar problems
2. **Search documentation** for solutions
3. **Ask in Discussions** for general questions
4. **Create an issue** for specific problems

## 🙏 Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Contributor hall of fame
- GitHub contributors graph

---

Thank you for contributing to BookStore! Your contributions help make this project better for everyone. 🚀
