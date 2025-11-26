package com.org.bookstore_backend.controller;

import com.org.bookstore_backend.model.Book;
import com.org.bookstore_backend.model.User;
import com.org.bookstore_backend.services.impl.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/favorites")
public class FavoritesController {

    private static final Logger logger = LoggerFactory.getLogger(FavoritesController.class);

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User not authenticated.");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) principal).getUserId();
        } else {
            logger.error("Authenticated principal is not UserDetailsImpl. Type: {}", principal.getClass().getName());
            throw new IllegalStateException("Could not retrieve user ID from authentication principal.");
        }
    }

    /**
     * Get user's favorite books
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Book>> getFavorites() {
        try {
            Long userId = getCurrentUserId();
            // For now, return empty list since we don't have a favorites table yet
            // This prevents the 500 error and allows the frontend to fall back to localStorage
            logger.info("Favorites endpoint called for user ID: {} - returning empty list", userId);
            return ResponseEntity.ok(List.of());
        } catch (Exception e) {
            logger.error("Error getting favorites:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Add a book to favorites
     */
    @PostMapping("/{bookId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> addToFavorites(@PathVariable Long bookId) {
        try {
            Long userId = getCurrentUserId();
            logger.info("Add to favorites called for user ID: {} and book ID: {} - not implemented yet", userId, bookId);
            // For now, just return success to prevent errors
            // The frontend will handle this gracefully with localStorage fallback
            return ResponseEntity.ok("Added to favorites (local storage fallback)");
        } catch (Exception e) {
            logger.error("Error adding to favorites:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Remove a book from favorites
     */
    @DeleteMapping("/{bookId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> removeFromFavorites(@PathVariable Long bookId) {
        try {
            Long userId = getCurrentUserId();
            logger.info("Remove from favorites called for user ID: {} and book ID: {} - not implemented yet", userId, bookId);
            // For now, just return success to prevent errors
            // The frontend will handle this gracefully with localStorage fallback
            return ResponseEntity.ok("Removed from favorites (local storage fallback)");
        } catch (Exception e) {
            logger.error("Error removing from favorites:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
