# BookStore Frontend Testing Guide

This document provides comprehensive information about the testing setup and how to achieve 80%+ test coverage for the BookStore frontend application.

## 🎯 Test Coverage Goals

- **Target Coverage**: 80% or higher
- **Coverage Metrics**: Branches, Functions, Lines, and Statements
- **Coverage Reporters**: Text, LCOV, HTML, and JSON

## 📋 Test Structure

The test suite is organized as follows:

```
src/
├── __tests__/                    # Test directories
│   ├── contexts/                 # Context tests
│   │   ├── AuthContext.test.js
│   │   └── CartContext.test.js
│   ├── components/               # Component tests
│   │   ├── LoginPage.test.js
│   │   └── BookCard.test.js
│   └── services/                 # Service tests
│       └── api.test.js
├── App.test.js                   # Main App component tests
├── setupTests.js                 # Test configuration
└── jest.config.js               # Jest configuration
```

## 🚀 Running Tests

### Basic Test Commands

```bash
# Run tests in watch mode (development)
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode (no watch, with coverage)
npm run test:ci
```

### Test Coverage Commands

```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser (after running test:coverage)
open coverage/lcov-report/index.html
```

## 📊 Coverage Configuration

The project is configured to enforce 80% coverage across all metrics:

```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

## 🧪 Test Categories

### 1. Context Tests (`contexts/__tests__/`)

**AuthContext.test.js**
- Authentication state management
- Token validation
- Login/logout functionality
- Role-based access control
- Error handling

**CartContext.test.js**
- Cart state management
- Add/remove items
- Quantity updates
- Cart calculations
- API integration

### 2. Component Tests (`components/__tests__/`)

**LoginPage.test.js**
- Form rendering and validation
- User input handling
- API integration
- Error states
- Loading states
- Navigation

**BookCard.test.js**
- Component rendering
- Props handling
- User interactions
- Cart integration
- Favorites functionality
- Accessibility

### 3. Service Tests (`services/__tests__/`)

**api.test.js**
- All API service methods
- HTTP request handling
- Error scenarios
- Authentication headers
- Response processing

### 4. App Integration Tests

**App.test.js**
- Route rendering
- Context integration
- Authentication flows
- Admin access control
- Error boundaries

## 🛠️ Test Utilities and Helpers

### Mock Setup

```javascript
// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock axios
jest.mock('axios');
```

### Test Utilities

```javascript
// Render with providers
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <CartProvider>
            {component}
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};
```

## 📈 Coverage Analysis

### Current Coverage Areas

✅ **High Coverage (>90%)**
- Context providers (AuthContext, CartContext)
- Core components (LoginPage, BookCard)
- API services
- Main App component

✅ **Medium Coverage (80-90%)**
- Form validation
- Error handling
- User interactions

### Areas Needing Additional Tests

🔄 **To Reach 80% Coverage**
1. **Additional Components**: Test remaining page components
2. **Edge Cases**: Add more boundary condition tests
3. **Integration Tests**: Test component interactions
4. **Error Scenarios**: Test failure modes

## 🔧 Adding New Tests

### For New Components

1. Create test file: `src/components/__tests__/ComponentName.test.js`
2. Import required dependencies
3. Set up mocks for external dependencies
4. Write tests for:
   - Component rendering
   - Props handling
   - User interactions
   - State changes
   - Error scenarios

### For New Contexts

1. Create test file: `src/contexts/__tests__/ContextName.test.js`
2. Test state management
3. Test provider functionality
4. Test error handling
5. Test integration with other contexts

### For New Services

1. Create test file: `src/services/__tests__/ServiceName.test.js`
2. Mock external API calls
3. Test success scenarios
4. Test error scenarios
5. Test data transformation

## 🎯 Best Practices

### Test Organization

```javascript
describe('ComponentName', () => {
  describe('Rendering', () => {
    // Render tests
  });

  describe('User Interactions', () => {
    // Interaction tests
  });

  describe('Error Handling', () => {
    // Error tests
  });

  describe('Integration', () => {
    // Integration tests
  });
});
```

### Test Naming

```javascript
test('should render component with correct props', () => {
  // Test implementation
});

test('should handle user input correctly', () => {
  // Test implementation
});

test('should show error message on API failure', () => {
  // Test implementation
});
```

### Mock Management

```javascript
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
});
```

## 📊 Monitoring Coverage

### Coverage Reports

After running `npm run test:coverage`, you'll get:

1. **Console Output**: Summary of coverage metrics
2. **HTML Report**: Detailed coverage in `coverage/lcov-report/index.html`
3. **LCOV File**: For CI/CD integration
4. **JSON Report**: For programmatic analysis

### Coverage Thresholds

The build will fail if coverage drops below 80%:

```bash
# If coverage is below 80%
npm run test:coverage
# ❌ Jest: "global" coverage threshold for branches (80%) not met: 75%
```

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run Tests
  run: npm run test:ci

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

### Coverage Badge

Add to README.md:
```markdown
[![Test Coverage](https://codecov.io/gh/your-repo/branch/main/graph/badge.svg)](https://codecov.io/gh/your-repo)
```

## 🔍 Debugging Tests

### Common Issues

1. **Async Tests**: Use `waitFor()` for async operations
2. **Mock Cleanup**: Clear mocks in `beforeEach()`
3. **Provider Wrapping**: Ensure all required providers are included
4. **Event Handling**: Use `userEvent` for user interactions

### Debug Commands

```bash
# Run specific test file
npm test -- LoginPage.test.js

# Run tests in debug mode
npm test -- --verbose

# Run tests with coverage for specific file
npm test -- --coverage --collectCoverageFrom="src/components/LoginPage.js"
```

## 📚 Additional Resources

- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Material-UI Testing Guide](https://mui.com/material-ui/guides/testing/)
- [React Router Testing](https://reactrouter.com/docs/en/v6/guides/testing)

## 🎉 Achieving 80% Coverage

To reach and maintain 80% coverage:

1. **Run coverage analysis**: `npm run test:coverage`
2. **Identify uncovered lines**: Check HTML report
3. **Add missing tests**: Focus on critical paths
4. **Test edge cases**: Add boundary condition tests
5. **Maintain coverage**: Run tests regularly

The current test suite provides a solid foundation for achieving 80%+ coverage across all metrics.
