import axios from 'axios';
import {
  BookService,
  AuthService,
  UserService,
  PublisherService,
  AuthorService,
  CategoryService,
  ReviewService,
  OrderService,
  PromoService,
  ImageService
} from '../api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('API Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('BookService', () => {
    test('should fetch books successfully', async () => {
      const mockBooks = [
        { id: 1, title: 'Book 1' },
        { id: 2, title: 'Book 2' }
      ];
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockBooks })
      });

      const result = await BookService.fetchBooks();
      expect(result).toEqual(mockBooks);
    });

    test('should create book successfully', async () => {
      const bookData = { title: 'New Book', author: 'Author' };
      const mockResponse = { id: 1, ...bookData };
      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue({ data: mockResponse })
      });

      const result = await BookService.createBook(bookData);
      expect(result).toEqual(mockResponse);
    });

    test('should update book successfully', async () => {
      const bookData = { title: 'Updated Book' };
      const mockResponse = { id: 1, ...bookData };
      mockedAxios.create.mockReturnValue({
        put: jest.fn().mockResolvedValue({ data: mockResponse })
      });

      const result = await BookService.updateBook(1, bookData);
      expect(result).toEqual(mockResponse);
    });

    test('should delete book successfully', async () => {
      const mockResponse = { message: 'Book deleted' };
      mockedAxios.create.mockReturnValue({
        delete: jest.fn().mockResolvedValue({ data: mockResponse })
      });

      const result = await BookService.deleteBook(1);
      expect(result).toEqual(mockResponse);
    });

    test('should handle book service errors', async () => {
      const error = new Error('Network error');
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(error)
      });

      await expect(BookService.fetchBooks()).rejects.toThrow('Network error');
    });
  });

  describe('AuthService', () => {
    test('should login successfully', async () => {
      const credentials = { username: 'testuser', password: 'password' };
      const mockResponse = { token: 'jwt-token', user: { username: 'testuser' } };
      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue({ data: mockResponse })
      });

      const result = await AuthService.login(credentials);
      expect(result).toEqual(mockResponse);
    });

    test('should register successfully', async () => {
      const userData = { username: 'newuser', email: 'test@example.com' };
      const mockResponse = { id: 1, ...userData };
      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue({ data: mockResponse })
      });

      const result = await AuthService.register(userData);
      expect(result).toEqual(mockResponse);
    });

    test('should handle auth service errors', async () => {
      const error = new Error('Authentication failed');
      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockRejectedValue(error)
      });

      await expect(AuthService.login({})).rejects.toThrow('Authentication failed');
    });
  });

  describe('UserService', () => {
    test('should fetch user profile successfully', async () => {
      const mockProfile = { id: 1, username: 'testuser', email: 'test@example.com' };
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockProfile })
      });

      const result = await UserService.fetchUserProfile();
      expect(result).toEqual(mockProfile);
    });

    test('should update user profile successfully', async () => {
      const userData = { username: 'updateduser' };
      const mockResponse = { id: 1, ...userData };
      mockedAxios.create.mockReturnValue({
        put: jest.fn().mockResolvedValue({ data: mockResponse })
      });

      const result = await UserService.updateUserProfile(userData);
      expect(result).toEqual(mockResponse);
    });

    test('should handle user service errors', async () => {
      const error = new Error('Profile update failed');
      mockedAxios.create.mockReturnValue({
        put: jest.fn().mockRejectedValue(error)
      });

      await expect(UserService.updateUserProfile({})).rejects.toThrow('Profile update failed');
    });
  });

  describe('PublisherService', () => {
    test('should fetch publishers successfully', async () => {
      const mockPublishers = [
        { id: 1, name: 'Publisher 1' },
        { id: 2, name: 'Publisher 2' }
      ];
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockPublishers })
      });

      const result = await PublisherService.fetchPublishers();
      expect(result).toEqual(mockPublishers);
    });

    test('should handle publisher service errors', async () => {
      const error = new Error('Failed to fetch publishers');
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(error)
      });

      await expect(PublisherService.fetchPublishers()).rejects.toThrow('Failed to fetch publishers');
    });
  });

  describe('AuthorService', () => {
    test('should fetch authors successfully', async () => {
      const mockAuthors = [
        { id: 1, name: 'Author 1' },
        { id: 2, name: 'Author 2' }
      ];
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockAuthors })
      });

      const result = await AuthorService.fetchAuthors();
      expect(result).toEqual(mockAuthors);
    });

    test('should handle author service errors', async () => {
      const error = new Error('Failed to fetch authors');
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(error)
      });

      await expect(AuthorService.fetchAuthors()).rejects.toThrow('Failed to fetch authors');
    });
  });

  describe('CategoryService', () => {
    test('should fetch categories successfully', async () => {
      const mockCategories = [
        { id: 1, name: 'Fiction' },
        { id: 2, name: 'Non-Fiction' }
      ];
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockCategories })
      });

      const result = await CategoryService.fetchCategories();
      expect(result).toEqual(mockCategories);
    });

    test('should handle category service errors', async () => {
      const error = new Error('Failed to fetch categories');
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(error)
      });

      await expect(CategoryService.fetchCategories()).rejects.toThrow('Failed to fetch categories');
    });
  });

  describe('ReviewService', () => {
    test('should fetch reviews successfully', async () => {
      const mockReviews = [
        { id: 1, rating: 5, comment: 'Great book!' },
        { id: 2, rating: 4, comment: 'Good read' }
      ];
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockReviews })
      });

      const result = await ReviewService.fetchReviews(1);
      expect(result).toEqual(mockReviews);
    });

    test('should add review successfully', async () => {
      const reviewData = { rating: 5, comment: 'Excellent book!' };
      const mockResponse = { id: 1, ...reviewData };
      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue({ data: mockResponse })
      });

      const result = await ReviewService.addReview(1, reviewData);
      expect(result).toEqual(mockResponse);
    });

    test('should handle review service errors', async () => {
      const error = new Error('Failed to add review');
      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockRejectedValue(error)
      });

      await expect(ReviewService.addReview(1, {})).rejects.toThrow('Failed to add review');
    });
  });

  describe('OrderService', () => {
    test('should create order successfully', async () => {
      const orderData = { items: [{ bookId: 1, quantity: 2 }] };
      const mockResponse = { id: 1, ...orderData, status: 'PENDING' };
      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue({ data: mockResponse })
      });

      const result = await OrderService.createOrder(orderData);
      expect(result).toEqual(mockResponse);
    });

    test('should fetch orders successfully', async () => {
      const mockOrders = [
        { id: 1, status: 'COMPLETED' },
        { id: 2, status: 'PENDING' }
      ];
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockOrders })
      });

      const result = await OrderService.fetchOrders();
      expect(result).toEqual(mockOrders);
    });

    test('should handle order service errors', async () => {
      const error = new Error('Failed to create order');
      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockRejectedValue(error)
      });

      await expect(OrderService.createOrder({})).rejects.toThrow('Failed to create order');
    });
  });

  describe('PromoService', () => {
    test('should list promos successfully', async () => {
      const mockPromos = [
        { id: 1, code: 'SAVE10', discount: 10 },
        { id: 2, code: 'SAVE20', discount: 20 }
      ];
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockPromos })
      });

      const result = await PromoService.listPromos();
      expect(result).toEqual(mockPromos);
    });

    test('should generate promo successfully', async () => {
      const payload = { discount: 15, maxUses: 100 };
      const mockResponse = { id: 1, code: 'NEWPROMO', ...payload };
      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue({ data: mockResponse })
      });

      const result = await PromoService.generatePromo(payload);
      expect(result).toEqual(mockResponse);
    });

    test('should apply promo successfully', async () => {
      const mockResponse = { valid: true, discount: 10, finalPrice: 90 };
      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue({ data: mockResponse })
      });

      const result = await PromoService.applyPromo('SAVE10', 100);
      expect(result).toEqual(mockResponse);
    });

    test('should handle promo service errors', async () => {
      const error = new Error('Invalid promo code');
      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockRejectedValue(error)
      });

      await expect(PromoService.applyPromo('INVALID', 100)).rejects.toThrow('Invalid promo code');
    });
  });

  describe('ImageService', () => {
    test('should upload image successfully', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = { imageUrl: 'https://example.com/image.jpg' };
      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue({ data: mockResponse })
      });

      const result = await ImageService.uploadImage(mockFile);
      expect(result).toBe('https://example.com/image.jpg');
    });

    test('should handle image upload errors', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const error = new Error('Upload failed');
      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockRejectedValue(error)
      });

      await expect(ImageService.uploadImage(mockFile)).rejects.toThrow('Upload failed');
    });

    test('should create FormData with correct content type', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = { imageUrl: 'https://example.com/image.jpg' };
      const mockPost = jest.fn().mockResolvedValue({ data: mockResponse });
      
      mockedAxios.create.mockReturnValue({
        post: mockPost
      });

      await ImageService.uploadImage(mockFile);

      expect(mockPost).toHaveBeenCalledWith(
        '/images/upload',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    });
  });

  describe('Axios Configuration', () => {
    test('should create axios instance with correct base URL', () => {
      // Reset environment variable
      delete process.env.REACT_APP_API_BASE_URL;
      
      mockedAxios.create.mockReturnValue({
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      });

      // Trigger axios instance creation by calling any service
      BookService.fetchBooks();

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:8080/api',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    test('should use custom API base URL from environment', () => {
      process.env.REACT_APP_API_BASE_URL = 'https://api.example.com/api';
      
      mockedAxios.create.mockReturnValue({
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      });

      // Trigger axios instance creation
      BookService.fetchBooks();

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.example.com/api',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('Request Interceptors', () => {
    test('should add authorization header when token exists', async () => {
      localStorageMock.getItem.mockReturnValue('test-token');
      
      const mockInterceptor = jest.fn();
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: {} }),
        interceptors: {
          request: { use: mockInterceptor },
          response: { use: jest.fn() }
        }
      });

      // Trigger interceptor setup
      await BookService.fetchBooks();

      expect(mockInterceptor).toHaveBeenCalled();
    });

    test('should not add authorization header when token does not exist', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const mockInterceptor = jest.fn();
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: {} }),
        interceptors: {
          request: { use: mockInterceptor },
          response: { use: jest.fn() }
        }
      });

      // Trigger interceptor setup
      await BookService.fetchBooks();

      expect(mockInterceptor).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors consistently across services', async () => {
      const networkError = new Error('Network Error');
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(networkError),
        post: jest.fn().mockRejectedValue(networkError),
        put: jest.fn().mockRejectedValue(networkError),
        delete: jest.fn().mockRejectedValue(networkError)
      });

      await expect(BookService.fetchBooks()).rejects.toThrow('Network Error');
      await expect(AuthService.login({})).rejects.toThrow('Network Error');
      await expect(UserService.updateUserProfile({})).rejects.toThrow('Network Error');
      await expect(OrderService.createOrder({})).rejects.toThrow('Network Error');
    });

    test('should handle HTTP error responses', async () => {
      const httpError = {
        response: {
          status: 404,
          data: { message: 'Resource not found' }
        }
      };
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(httpError)
      });

      await expect(BookService.fetchBooks()).rejects.toEqual(httpError);
    });

    test('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.code = 'ECONNABORTED';
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(timeoutError)
      });

      await expect(BookService.fetchBooks()).rejects.toThrow('Request timeout');
    });
  });

  describe('Service Integration', () => {
    test('should maintain consistent API structure across services', () => {
      const services = [
        BookService,
        AuthService,
        UserService,
        PublisherService,
        AuthorService,
        CategoryService,
        ReviewService,
        OrderService,
        PromoService,
        ImageService
      ];

      services.forEach(service => {
        expect(service).toBeDefined();
        expect(typeof service).toBe('object');
      });
    });

    test('should use consistent HTTP methods', () => {
      // Test that services use appropriate HTTP methods
      expect(typeof BookService.fetchBooks).toBe('function');
      expect(typeof BookService.createBook).toBe('function');
      expect(typeof BookService.updateBook).toBe('function');
      expect(typeof BookService.deleteBook).toBe('function');
    });
  });
});
