package com.org.bookstore_backend.services.impl;

import com.org.bookstore_backend.dto.OrderDTO;
import com.org.bookstore_backend.dto.OrderRequestDTO;
import com.org.bookstore_backend.model.Order;
import com.org.bookstore_backend.model.User;
import com.org.bookstore_backend.services.CartService;
import com.org.bookstore_backend.services.PromoService;
import com.org.bookstore_backend.services.OrderService;
import com.org.bookstore_backend.services.PaymentService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
 

@Service
public class PaymentServiceImpl implements PaymentService {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    private final OrderService orderService;
    private final CartService cartService;
    private final PromoService promoService;

    @Autowired
    public PaymentServiceImpl(OrderService orderService, CartService cartService, PromoService promoService) {
        this.orderService = orderService;
        this.cartService = cartService;
        this.promoService = promoService;
    }

    @Override
    public Map<String, String> createPaymentIntent(Long userId) throws StripeException {
        // Ensure Stripe secret key is configured
        if (stripeSecretKey == null || stripeSecretKey.isBlank()) {
            throw new IllegalStateException("Stripe secret key is not configured. Set stripe.secret.key in application.yml");
        }

        // ⭐ REVISED: Calculate amount based on the user's cart
        BigDecimal totalAmount = cartService.calculateTotalAmount(userId);
        // Apply promo if present in a downstream step (client applies before creating intent in UI)

        if (totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Cannot create a payment for an empty or zero-total cart.");
        }

        Stripe.apiKey = stripeSecretKey;

        long amountInCents = totalAmount.multiply(new BigDecimal("100")).longValue();

        // Stripe minimum for GBP is 30 pence
        if (amountInCents < 30L) {
            throw new IllegalArgumentException("Minimum charge is £0.30");
        }

        PaymentIntentCreateParams createParams = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("gbp")
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(createParams);
        Map<String, String> responseData = new HashMap<>();
        responseData.put("clientSecret", paymentIntent.getClientSecret());
        return responseData;
    }

    @Override
    public Order finalizeOrder(String paymentIntentId, User currentUser, String shippingAddress) throws Exception {
        return null;
    }

    // Removed deprecated UUID-based overloads

    @Override
    public OrderDTO processCreditCardPayment(String paymentIntentId, OrderRequestDTO orderRequest) throws Exception {
        // ⭐ NEW: This method handles finalizing the order after a successful Stripe payment
        Stripe.apiKey = stripeSecretKey;

        // Verify the payment intent status
        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
        if (!"succeeded".equals(paymentIntent.getStatus())) {
            throw new IllegalStateException("Payment not successful. Status: " + paymentIntent.getStatus());
        }

        // Place the order using the OrderService
        // Apply promo on server before placing order
        if (orderRequest.getPromoCode() != null && !orderRequest.getPromoCode().isBlank()) {
            var user = new com.org.bookstore_backend.model.User();
            user.setUserId(orderRequest.getUserId());
            var total = orderRequest.getTotalAmount() != null ? orderRequest.getTotalAmount() : cartService.calculateTotalAmount(orderRequest.getUserId());
            var resp = promoService.validateForUser(orderRequest.getPromoCode(), user, total);
            if (!resp.isValid()) {
                throw new IllegalArgumentException("Invalid promo: " + resp.getMessage());
            }
            orderRequest.setTotalAmount(resp.getDiscountedTotal());
            orderRequest.setPromoDiscount(resp.getDiscount());
        }
        OrderDTO newOrder = orderService.placeOrder(orderRequest);
        // Redeem promo after success
        if (orderRequest.getPromoCode() != null && !orderRequest.getPromoCode().isBlank()) {
            var user = new com.org.bookstore_backend.model.User();
            user.setUserId(orderRequest.getUserId());
            promoService.redeem(orderRequest.getPromoCode(), user, newOrder.getId());
        }

        // Clear the user's cart after the order is successfully placed
        cartService.clearCart(orderRequest.getUserId());

        return newOrder;
    }
}