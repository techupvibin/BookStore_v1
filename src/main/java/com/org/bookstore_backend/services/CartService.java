package com.org.bookstore_backend.services;

import com.org.bookstore_backend.dto.CartDTO;
import com.org.bookstore_backend.model.CartItem;
import com.org.bookstore_backend.model.User;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.Set;

@Service
@Transactional // ✅ Use Spring's Transactional annotation on the interface for proxies
public interface CartService {

    /**
     * Retrieves the cart for a given user. If no cart exists, a new one is created.
     *
     * @param userId The ID of the user.
     * @return The CartDTO for the user.
     */
    CartDTO getUserCart(Long userId);

    /**
     * Adds a book to the user's cart or updates its quantity if already present.
     *
     * @param userId The ID of the user.
     * @param bookId The ID of the book to add.
     * @param quantity The quantity to add (must be at least 1).
     * @return The updated CartDTO.
     */
    CartDTO addBookToCart(Long userId, Long bookId,
                          @NotNull(message = "Quantity is mandatory")
                          @Min(value = 1, message = "Quantity must be at least 1")
                          Integer quantity);

    CartDTO updateBookQuantityInCart(Long userId, Long bookId, Integer quantity);

    /**
     * Updates the quantity of a specific book in the user's cart.
     * If {@code newQuantity} is 0 or less, the item will be removed from the cart.
     *
     * @param userId The ID of the user.
     * @param bookId The ID of the book whose quantity is to be updated.
     * @param newQuantity The new quantity for the book.
     * @return The updated CartDTO.
     */
    CartDTO updateBookQuantityInCart(Long userId, Long bookId, int newQuantity);

    /**
     * Removes a specific book from the user's cart.
     *
     * @param userId The ID of the user.
     * @param bookId The ID of the book to remove.
     * @return The updated CartDTO.
     */
    CartDTO removeBookFromCart(Long userId, Long bookId);

    /**
     * Clears all items from the user's cart.
     *
     * @param userId The ID of the user.
     * @return The updated CartDTO (with an empty cartItems list).
     */
    CartDTO clearCart(Long userId);

    /**
     * Retrieves the ID of the currently authenticated user from the security context.
     *
     * @return The ID of the authenticated user.
     */
    Long getCurrentUserId();

    /**
     * Retrieves all cart items for a given user.
     *
     * @param currentUser The User entity for whom to retrieve cart items.
     * @return A Set of CartItem entities belonging to the user's cart, or an empty set if no cart is found.
     */
    Set<CartItem> getCartItems(User currentUser);

    /**
     * Calculates the total price of all items in the user's cart.
     * @param userId The ID of the user.
     * @return The total amount of the cart as a BigDecimal.
     */
    BigDecimal calculateTotalAmount(Long userId);
}
