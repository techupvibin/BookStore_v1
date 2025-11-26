import axios from 'axios';

// Set a single base URL that includes the API prefix
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to each request if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Book Service ---
export const BookService = {
  // Now uses the base URL + the endpoint path
  fetchBooks: async () => {
    const response = await axiosInstance.get('/books');
    return response.data;
  },
  createBook: async (bookData) => {
    const response = await axiosInstance.post('/books', bookData);
    return response.data;
  },
  updateBook: async (id, bookData) => {
    const response = await axiosInstance.put(`/books/${id}`, bookData);
    return response.data;
  },
  deleteBook: async (id) => {
    const response = await axiosInstance.delete(`/books/${id}`);
    return response.data;
  },
};

// --- Auth Service ---
export const AuthService = {
  // These were already correct, but now use the consistent baseURL
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },
};

// --- User Service ---
export const UserService = {
  fetchUserProfile: async () => {
    // Assuming backend endpoint is /api/users/me
    const response = await axiosInstance.get('/users/me');
    return response.data;
  },
  updateUserProfile: async (userData) => {
    const response = await axiosInstance.put('/users/me', userData);
    return response.data;
  },
};

// --- Publisher Service ---
export const PublisherService = {
  fetchPublishers: async () => {
    const response = await axiosInstance.get('/publishers');
    return response.data;
  },
};

// --- Author Service ---
export const AuthorService = {
  fetchAuthors: async () => {
    const response = await axiosInstance.get('/authors');
    return response.data;
  },
};

// --- Category Service ---
export const CategoryService = {
  fetchCategories: async () => {
    const response = await axiosInstance.get('/categories');
    return response.data;
  },
};

// --- Review Service ---
export const ReviewService = {
  fetchReviews: async (bookId) => {
    const response = await axiosInstance.get(`/books/${bookId}/reviews`);
    return response.data;
  },
  addReview: async (bookId, reviewData) => {
    const response = await axiosInstance.post(`/books/${bookId}/reviews`, reviewData);
    return response.data;
  },
};

// --- Order Service ---
export const OrderService = {
  createOrder: async (orderData) => {
    const response = await axiosInstance.post('/orders', orderData);
    return response.data;
  },
  fetchOrders: async () => {
    const response = await axiosInstance.get('/orders');
    return response.data;
  },
};

// --- Promo Service ---
export const PromoService = {
  listPromos: async () => {
    const response = await axiosInstance.get('/promos/admin/all');
    return response.data;
  },
  generatePromo: async (payload) => {
    const response = await axiosInstance.post('/promos/generate', payload);
    return response.data;
  },
  applyPromo: async (code, cartTotal) => {
    // Changed from /promos/apply to /promos/validate to match backend
    const response = await axiosInstance.post('/promos/validate', { 
      promoCode: code,
      cartTotal: cartTotal || 0
    });
    return response.data;
  },
};

// --- Image Service ---
export const ImageService = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.imageUrl;
  },
};