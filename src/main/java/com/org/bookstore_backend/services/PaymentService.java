package com.org.bookstore_backend.services;

import com.org.bookstore_backend.dto.OrderDTO;
import com.org.bookstore_backend.dto.OrderRequestDTO;
import com.org.bookstore_backend.model.Order;
import com.org.bookstore_backend.model.User;
import com.stripe.exception.StripeException;

import java.math.BigDecimal;
import java.util.Map;
 

public interface PaymentService {

    Map<String, String> createPaymentIntent(Long userId) throws StripeException;

    Order finalizeOrder(String paymentIntentId, User currentUser, String shippingAddress) throws Exception;

    // Deprecated UUID signature removed; use Long-based method above

    // Deprecated UUID signature removed; use finalizeOrder(String, User, String)

    /**
     * Processes a credit card payment and finalizes the order.
     *
     * @param paymentIntentId The ID of the Stripe PaymentIntent.
     * @param orderRequest The DTO containing the full order request.
     * @return An OrderDTO representing the created order.
     * @throws Exception if the payment or order placement fails.
     */
    OrderDTO processCreditCardPayment(String paymentIntentId, OrderRequestDTO orderRequest) throws Exception;
}