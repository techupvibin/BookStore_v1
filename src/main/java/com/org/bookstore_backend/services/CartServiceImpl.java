package com.org.bookstore_backend.services;
import com.org.bookstore_backend.dto.CartDTO;
import com.org.bookstore_backend.model.Book;
import com.org.bookstore_backend.model.Cart;
import com.org.bookstore_backend.model.CartItem;
import com.org.bookstore_backend.model.User;
import com.org.bookstore_backend.repo.BookRepo;
import com.org.bookstore_backend.repo.CartItemRepo;
import com.org.bookstore_backend.repo.CartRepo;
import com.org.bookstore_backend.repo.UserRepo;
import com.org.bookstore_backend.services.impl.UserDetailsImpl;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
@Transactional
public class CartServiceImpl implements CartService {

    private static final Logger logger = LoggerFactory.getLogger(CartServiceImpl.class);

    private final CartRepo cartRepository;
    private final CartItemRepo cartItemRepository;
    private final UserRepo userRepository;
    private final BookRepo bookRepository;
    private final CartMapper cartMapper;

    @Autowired
    public CartServiceImpl(CartRepo cartRepository, CartItemRepo cartItemRepository,
                           UserRepo userRepository, BookRepo bookRepository, CartMapper cartMapper) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.cartMapper = cartMapper;
    }

    /**
     * Retrieves the cart for a given user. If no cart exists, a new one is created.
     *
     * @param userId The ID of the user.
     * @return A CartDTO representing the user's cart.
     * @throws EntityNotFoundException if the user is not found with the given ID.
     */
    @Override
    public CartDTO getUserCart(Long userId) {
        // 1. Find the user by their ID. Throws EntityNotFoundException if not found.
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        // 2. Find the cart associated with the user.
        // .orElseGet() is used to create a new cart if one does not exist for the user.
        Cart cart = cartRepository.findByUser_UserId(userId)
                .orElseGet(() -> {
                    logger.info("No cart found for user ID: {}. Creating a new cart.", userId);
                    Cart newCart = Cart.builder().user(user).build();
                    return cartRepository.save(newCart);
                });

        // 3. Map the found or newly created Cart entity to a CartDTO and return it.
        return cartMapper.toDto(cart);
    }

    /**
     * Adds a specified quantity of a book to the user's cart. If the book already exists in the cart,
     * its quantity is incremented.
     *
     * @param userId   The ID of the user.
     * @param bookId   The ID of the book to add.
     * @param quantity The quantity of the book to add. Must be at least 1.
     * @return A CartDTO representing the updated cart.
     * @throws IllegalArgumentException if the quantity is less than 1.
     * @throws EntityNotFoundException  if the user or book is not found.
     */
    @Override
    public CartDTO addBookToCart(Long userId, Long bookId, Integer quantity) {
        if (quantity == null || quantity < 1) {
            throw new IllegalArgumentException("Quantity must be at least 1.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new EntityNotFoundException("Book not found with ID: " + bookId));

        Cart cart = cartRepository.findByUser_UserId(userId)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder().user(user).build();
                    return cartRepository.save(newCart);
                });

        Optional<CartItem> existingCartItemOptional = cartItemRepository.findByCartAndBook(cart, book);

        CartItem cartItem;
        if (existingCartItemOptional.isPresent()) {
            cartItem = existingCartItemOptional.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
            cartItemRepository.save(cartItem);
        } else {
            cartItem = CartItem.builder()
                    .cart(cart)
                    .book(book)
                    .quantity(quantity)
                    .build();
            // Add to cart's collection explicitly for consistency and potential cascade operations
            cart.addCartItem(cartItem);
            cartItemRepository.save(cartItem); // Save the new cart item
        }

        // Save the cart to ensure its collection updates are flushed (if using cascade)
        // This save might be redundant if cart.addCartItem handles the relationship and cartItemRepository.save(cartItem)
        // correctly persists it, but it ensures the parent-child relationship is synchronized.
        cartRepository.save(cart);

        // Re-fetch the cart to ensure its collection is properly loaded for DTO mapping
        // This is important if `cart.getCartItems()` is lazy-loaded.
        Cart updatedCart = cartRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Cart not found after update attempt."));

        return cartMapper.toDto(updatedCart);
    }

    @Override
    public CartDTO updateBookQuantityInCart(Long userId, Long bookId, Integer quantity) {
        if (quantity == null) {
            throw new IllegalArgumentException("Quantity is mandatory");
        }
        return updateBookQuantityInCart(userId, bookId, quantity.intValue());
    }


    /**
     * Updates the quantity of a specific book in the user's cart.
     *
     * @param userId      The ID of the user.
     * @param bookId      The ID of the book whose quantity is to be updated.
     * @param newQuantity The new quantity for the book. If <= 0, the item is removed.
     * @return A CartDTO representing the updated cart.
     * @throws EntityNotFoundException if the user, book, cart, or cart item is not found.
     */
    @Override
    public CartDTO updateBookQuantityInCart(Long userId, Long bookId, int newQuantity) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new EntityNotFoundException("Book not found with ID: " + bookId));

        Cart cart = cartRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Cart not found for user ID: " + userId));

        CartItem cartItem = cartItemRepository.findByCartAndBook(cart, book)
                .orElseThrow(() -> new EntityNotFoundException("Book not found in cart for book ID: " + bookId));

        if (newQuantity <= 0) {
            cart.removeCartItem(cartItem); // Remove from cart's collection
            cartItemRepository.delete(cartItem); // Delete the individual item
        } else {
            cartItem.setQuantity(newQuantity);
            cartItemRepository.save(cartItem);
        }

        // Save the cart to ensure orphan removal (if configured) or collection updates are flushed
        cartRepository.save(cart);

        // Re-fetch to ensure the DTO reflects the most current state (especially if collection is lazy)
        Cart updatedCart = cartRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Cart not found after update."));
        return cartMapper.toDto(updatedCart);
    }

    /**
     * Removes a specific book from the user's cart.
     *
     * @param userId The ID of the user.
     * @param bookId The ID of the book to remove.
     * @return A CartDTO representing the updated cart.
     * @throws EntityNotFoundException if the user, book, cart, or cart item is not found.
     */
    @Override
    public CartDTO removeBookFromCart(Long userId, Long bookId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new EntityNotFoundException("Book not found with ID: " + bookId));

        Cart cart = cartRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Cart not found for user ID: " + userId));

        CartItem cartItem = cartItemRepository.findByCartAndBook(cart, book)
                .orElseThrow(() -> new EntityNotFoundException("Book not found in cart for book ID: " + bookId));

        cart.removeCartItem(cartItem); // Remove from cart's collection
        cartItemRepository.delete(cartItem); // Delete the individual item

        // Save the cart to ensure orphan removal (if configured) or collection updates are flushed
        cartRepository.save(cart);

        // Re-fetch to ensure the DTO reflects the most current state (especially if collection is lazy)
        Cart updatedCart = cartRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Cart not found after removal."));
        return cartMapper.toDto(updatedCart);
    }

    /**
     * Clears all items from the user's cart.
     *
     * @param userId The ID of the user.
     * @return A CartDTO representing the cleared cart.
     * @throws EntityNotFoundException if the cart is not found for the user.
     */
    @Override
    public CartDTO clearCart(Long userId) {
        Cart cart = cartRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Cart not found for user ID: " + userId));

        // Use a temporary set to avoid ConcurrentModificationException if iterating and modifying
        Set<CartItem> itemsToClear = new HashSet<>(cart.getCartItems());
        for (CartItem item : itemsToClear) {
            cart.removeCartItem(item); // Remove from cart's collection
            cartItemRepository.delete(item); // Delete the individual item
        }
        // Save the cart to reflect the cleared collection (if needed for orphanRemoval configuration)
        cartRepository.save(cart);

        // Re-fetch to ensure the DTO reflects the most current state (empty cart)
        Cart updatedCart = cartRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Cart not found after clear."));
        return cartMapper.toDto(updatedCart);
    }

    /**
     * Retrieves the ID of the currently authenticated user from the security context.
     *
     * @return The ID of the authenticated user.
     * @throws IllegalStateException if no authenticated user is found or the principal type is unexpected.
     */
    @Override
    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new IllegalStateException("No authenticated user found.");
        }
        // Assuming UserDetailsImpl is always the principal for authenticated users
        if (authentication.getPrincipal() instanceof UserDetailsImpl userDetails) {
            return userDetails.getUserId();
        }
        throw new IllegalStateException("Could not determine current user ID from authentication principal. Unexpected principal type.");
    }

    /**
     * Retrieves all cart items for a given user.
     *
     * @param currentUser The User entity for whom to retrieve cart items.
     * @return A Set of CartItem entities belonging to the user's cart, or an empty set if no cart is found.
     */
    @Override
    public Set<CartItem> getCartItems(User currentUser) {
        // Find the cart for the current user using their ID
        Optional<Cart> cartOptional = cartRepository.findByUser_UserId(currentUser.getUserId());

        if (cartOptional.isPresent()) {
            Cart cart = cartOptional.get();
            // Ensure cart items are loaded if they are lazy-loaded. Accessing the collection usually triggers it.
            return new HashSet<>(cart.getCartItems());
        }
        return Collections.emptySet();
    }

    /**
     * Calculates the total amount of all items in the user's cart.
     *
     * @param userId The ID of the user.
     * @return The total BigDecimal amount of the cart.
     * @throws EntityNotFoundException if the user is not found.
     */
    @Override
    public BigDecimal calculateTotalAmount(Long userId) {
        // Verify user existence, though `getCartItems` would also implicitly do this if a cart is expected.
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        Set<CartItem> cartItems = getCartItems(user);

        if (cartItems.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return cartItems.stream()
                .map(item -> BigDecimal.valueOf(item.getBook().getPrice()).multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
