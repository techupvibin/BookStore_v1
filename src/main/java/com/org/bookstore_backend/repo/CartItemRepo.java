package com.org.bookstore_backend.repo;

import com.org.bookstore_backend.model.Book;
import com.org.bookstore_backend.model.CartItem;
import com.org.bookstore_backend.model.CartItemPK;
import com.org.bookstore_backend.model.User;
import com.org.bookstore_backend.model.Cart; // Import Cart model
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.Set;
import jakarta.transaction.Transactional; // For deleteByUser method

public interface CartItemRepo extends JpaRepository<CartItem, CartItemPK> {
    // Corrected method: find CartItems by the User associated with their Cart
    // JPA will automatically navigate from CartItem -> Cart -> User
    Set<CartItem> findByCart_User(User user);

    // Corrected method: delete CartItems by the User associated with their Cart
    @Transactional // Ensures the operation runs within a transaction
    void deleteByCart_User(User user);

    // You might also want methods to find by Cart directly:
    Set<CartItem> findByCart(Cart cart);

    @Transactional
    void deleteByCart(Cart cart);

    Optional<CartItem> findByCartAndBook(Cart cart, Book book);

}
