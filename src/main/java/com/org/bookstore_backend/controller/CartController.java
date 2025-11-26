package com.org.bookstore_backend.controller;
import com.org.bookstore_backend.dto.CartDTO;
import com.org.bookstore_backend.dto.CartItemDTO;
import com.org.bookstore_backend.services.CartService;
import com.org.bookstore_backend.services.impl.UserDetailsImpl;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:3000")
public class CartController {

    private final CartService cartService;
    private static final Logger logger = LoggerFactory.getLogger(CartController.class);

    @Autowired
    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    /**
     * Helper method to get the current user's ID from the security context.
     *
     * @return The user ID as a UUID.
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl userDetails)) {
            logger.error("Could not determine current user ID from authentication principal. Principal type: {}",
                    authentication != null ? authentication.getPrincipal().getClass().getName() : "null");
            throw new IllegalStateException("Authentication principal not of expected type.");
        }
        return userDetails.getUserId(); // ✅ Returns UUID from UserDetailsImpl
    }

    //------------------------------------------------------------------------------------------------------------------

    /**
     * Retrieves the authenticated user's shopping cart.
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartDTO> getUserCart() {
        try {
            Long userId = getCurrentUserId();
            logger.info("Fetching cart for user ID: {}", userId);
            CartDTO cart = cartService.getUserCart(userId);
            return ResponseEntity.ok(cart);
        } catch (IllegalStateException e) {
            logger.warn("Authentication principal issue when getting cart: {}", e.getMessage());
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        } catch (EntityNotFoundException e) {
            logger.error("User not found for cart retrieval: {}", e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    //------------------------------------------------------------------------------------------------------------------

    /**
     * Adds a specified quantity of a book to the authenticated user's cart.
     */
    @PostMapping("/add")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartDTO> addBookToCart(@Valid @RequestBody CartItemDTO request) {
        try {
            Long userId = getCurrentUserId();
            logger.info("Adding book ID {} with quantity {} to cart for user ID {}", request.getBookId(), request.getQuantity(), userId);
            // ✅ Pass the UUID from the request DTO to the service
            CartDTO updatedCart = cartService.addBookToCart(userId, request.getBookId(), request.getQuantity());
            return new ResponseEntity<>(updatedCart, HttpStatus.OK);
        } catch (IllegalStateException e) {
            logger.warn("Authentication principal issue when adding to cart: {}", e.getMessage());
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        } catch (EntityNotFoundException e) {
            logger.error("Book or User not found when adding to cart: {}", e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid quantity for adding to cart: {}", e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    //------------------------------------------------------------------------------------------------------------------

    /**
     * Updates the quantity of a specific book in the authenticated user's cart.
     */
    @PutMapping("/update")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartDTO> updateBookQuantityInCart(@Valid @RequestBody CartItemDTO request) {
        try {
            Long userId = getCurrentUserId();
            logger.info("Updating quantity of book ID {} to {} for user ID {}", request.getBookId(), request.getQuantity(), userId);
            // ✅ Pass the UUID from the request DTO to the service
            CartDTO updatedCart = cartService.updateBookQuantityInCart(userId, request.getBookId(), request.getQuantity());
            return ResponseEntity.ok(updatedCart);
        } catch (IllegalStateException e) {
            logger.warn("Authentication principal issue when updating cart quantity: {}", e.getMessage());
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        } catch (EntityNotFoundException e) {
            logger.error("Cart, Book, or CartItem not found during quantity update: {}", e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    //------------------------------------------------------------------------------------------------------------------

    /**
     * Removes a specific book from the authenticated user's cart.
     */
    @DeleteMapping("/remove/{bookId}")
    @PreAuthorize("isAuthenticated()")
    // ✅ Change the PathVariable type to UUID
    public ResponseEntity<CartDTO> removeBookFromCart(@PathVariable Long bookId) {
        try {
            Long userId = getCurrentUserId();
            logger.info("Removing book ID {} from cart for user ID {}", bookId, userId);
            // ✅ Pass the UUID to the service
            CartDTO updatedCart = cartService.removeBookFromCart(userId, bookId);
            return ResponseEntity.ok(updatedCart);
        } catch (IllegalStateException e) {
            logger.warn("Authentication principal issue when removing book from cart: {}", e.getMessage());
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        } catch (EntityNotFoundException e) {
            logger.error("Cart or CartItem not found during removal: {}", e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    //------------------------------------------------------------------------------------------------------------------

    /**
     * Clears all items from the authenticated user's cart.
     */
    @DeleteMapping("/clear")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartDTO> clearCart() {
        try {
            Long userId = getCurrentUserId(); // ✅ CHANGED: userId is now UUID
            logger.info("Clearing cart for user ID: {}", userId);
            CartDTO clearedCart = cartService.clearCart(userId);
            return ResponseEntity.ok(clearedCart);
        } catch (IllegalStateException e) {
            logger.warn("Authentication principal issue when clearing cart: {}", e.getMessage());
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        } catch (EntityNotFoundException e) {
            logger.error("Cart not found during clearing: {}", e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}