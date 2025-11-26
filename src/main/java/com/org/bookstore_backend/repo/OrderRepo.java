package com.org.bookstore_backend.repo;// In 'OrderRepo.java'
import com.org.bookstore_backend.model.Order;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepo extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByUser(User user); // For "My Orders" functionality

    List<Order> findByUserOrderByOrderDateDesc(com.org.bookstore_backend.model.User user);

    // Cursor pagination by primary key (descending)
    List<Order> findByUserOrderByOrderIdDesc(com.org.bookstore_backend.model.User user, Pageable pageable);
    List<Order> findByUserAndOrderIdLessThanOrderByOrderIdDesc(com.org.bookstore_backend.model.User user, Long orderId, Pageable pageable);
}

