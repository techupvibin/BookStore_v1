package com.org.bookstore_backend.repo;

import com.org.bookstore_backend.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepo extends JpaRepository<Cart, Long> {

    /**
     * Finds a Cart by the associated User's ID.
     * This is crucial for managing a single shopping cart per user.
     *
     * @param userId The ID of the User.
     * @return An Optional containing the Cart if found, or empty otherwise.
     */
    Optional<Cart> findByUser_UserId(Long userId);

}
