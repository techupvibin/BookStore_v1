package com.org.bookstore_backend.repo;

import com.org.bookstore_backend.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // You can add custom query methods here if needed,
    // for example, to find payments by their Stripe Payment Intent ID:
     Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);

}