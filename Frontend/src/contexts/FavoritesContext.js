import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// Create the FavoritesContext
const FavoritesContext = createContext(null);

const API_BASE_URL = 'http://localhost:8080/api';
const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const FavoritesProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadFromLocal = () => {
    const stored = localStorage.getItem('favorites');
    setFavorites(stored ? JSON.parse(stored) : []);
  };

  const persistLocal = (list) => {
    localStorage.setItem('favorites', JSON.stringify(list));
  };

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/favorites'); // If backend not available, will fall back
      const list = (res.data || []).map((b) => ({
        bookId: b.bookId ?? b.id,
        bookTitle: b.bookTitle ?? b.title,
        bookPrice: b.bookPrice ?? b.price,
        bookImageUrl: b.bookImageUrl ?? b.imageUrl,
      }));
      setFavorites(list);
      persistLocal(list);
    } catch (e) {
      // Fallback to local if server endpoint doesn't exist
      loadFromLocal();
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const addToFavorites = useCallback(async (bookId) => {
    try {
      await api.post(`/favorites/${bookId}`);
      await fetchFavorites();
    } catch {
      // Local fallback
      const current = JSON.parse(localStorage.getItem('favorites') || '[]');
      if (!current.some((f) => f.bookId === bookId)) {
        const updated = [...current, { bookId }];
        persistLocal(updated);
        setFavorites(updated);
      }
    }
  }, [fetchFavorites]);

  const removeFromFavorites = useCallback(async (bookId) => {
    try {
      await api.delete(`/favorites/${bookId}`);
      await fetchFavorites();
    } catch {
      // Local fallback
      const current = JSON.parse(localStorage.getItem('favorites') || '[]');
      const updated = current.filter((f) => f.bookId !== bookId);
      persistLocal(updated);
      setFavorites(updated);
    }
  }, [fetchFavorites]);

  const isFavorite = useCallback((bookId) => {
    return favorites.some((f) => f.bookId === bookId);
  }, [favorites]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, loading, error, fetchFavorites, addToFavorites, removeFromFavorites, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Custom hook to use favorites in components
export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
};

export default FavoritesContext;
