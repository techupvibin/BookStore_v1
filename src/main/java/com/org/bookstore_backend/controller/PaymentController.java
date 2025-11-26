package com.org.bookstore_backend.controller;
import com.org.bookstore_backend.dto.OrderDTO;
import com.org.bookstore_backend.dto.OrderRequestDTO;
import com.org.bookstore_backend.services.OrderService;
import com.org.bookstore_backend.services.PaymentService;
import com.org.bookstore_backend.services.impl.UserDetailsImpl;
import com.org.bookstore_backend.services.CartService;
import com.org.bookstore_backend.services.PromoService;
import com.org.bookstore_backend.model.User;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
 

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    private final OrderService orderService;
    private final PaymentService paymentService;
    private final PromoService promoService;
    private final CartService cartService;

    @Autowired
    public PaymentController(OrderService orderService, PaymentService paymentService, PromoService promoService, CartService cartService) {
        this.orderService = orderService;
        this.paymentService = paymentService;
        this.promoService = promoService;
        this.cartService = cartService;
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User not authenticated.");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            // UserDetailsImpl.getUserId() returns Long
            return ((UserDetailsImpl) principal).getUserId();
        } else {
            logger.error("Authenticated principal is not UserDetailsImpl. Type: {}", principal.getClass().getName());
            throw new IllegalStateException("Could not retrieve user ID from authentication principal. Principal type: " + principal.getClass().getName());
        }
    }

    /**
     * Creates a payment intent for a credit card transaction.
     * This endpoint requires authentication.
     *
     * @param orderRequest DTO containing order details, including total amount.
     * @return A ResponseEntity with a map containing payment intent details (e.g., client secret).
     */
    @PostMapping("/create-payment-intent")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> createPaymentIntent(@RequestBody OrderRequestDTO orderRequest) {
        try {
            Long userId = getCurrentUserId();
            Map<String, String> response = paymentService.createPaymentIntent(userId);
            logger.info("Successfully created Stripe Payment Intent for user ID: {}", userId);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException | IllegalStateException e) {
            logger.error("Failed to create payment intent due to business logic error: {}", e.getMessage());
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.BAD_REQUEST);
        } catch (com.stripe.exception.StripeException se) {
            logger.error("Stripe error while creating payment intent: {}", se.getMessage());
            return new ResponseEntity<>(Map.of("error", se.getMessage()), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            logger.error("An unexpected error occurred while creating payment intent:", e);
            return new ResponseEntity<>(Map.of("error", "An unexpected server error occurred during payment intent creation."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Processes a Cash on Delivery (COD) checkout.
     * This endpoint requires authentication.
     *
     * @param orderRequest DTO containing details for the new order.
     * @return A ResponseEntity with the created OrderDTO if successful.
     */
    @PostMapping("/checkout/cod")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDTO> processCodCheckout(@RequestBody OrderRequestDTO orderRequest) {
        try {
            Long userId = getCurrentUserId();
            orderRequest.setUserId(userId);
            // Ensure payment method is set for COD
            orderRequest.setPaymentMethod("COD");
            // Apply promo if provided
            if (orderRequest.getPromoCode() != null && !orderRequest.getPromoCode().isBlank()) {
                User u = new User();
                u.setUserId(userId);
                java.math.BigDecimal cartTotal = cartService.calculateTotalAmount(userId);
                var resp = promoService.validateForUser(orderRequest.getPromoCode(), u, cartTotal);
                if (!resp.isValid()) {
                    return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
                }
                orderRequest.setTotalAmount(resp.getDiscountedTotal());
                orderRequest.setPromoDiscount(resp.getDiscount());
            }
            OrderDTO newOrder = orderService.placeOrder(orderRequest);
            if (orderRequest.getPromoCode() != null && !orderRequest.getPromoCode().isBlank()) {
                User u = new User();
                u.setUserId(userId);
                promoService.redeem(orderRequest.getPromoCode(), u, newOrder.getId());
            }
            logger.info("COD Order created successfully with ID: {} for user ID: {}", newOrder.getId(), userId);
            return new ResponseEntity<>(newOrder, HttpStatus.CREATED);
        } catch (IllegalStateException | IllegalArgumentException | EntityNotFoundException e) {
            logger.warn("Failed to process COD checkout due to business logic error: {}", e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            logger.error("Failed to process COD checkout: An unexpected server error occurred.", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Finalizes an order after a successful Stripe card payment.
     * Expects a valid PaymentIntent ID and necessary order details.
     */
    @PostMapping("/checkout/card")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> processCardCheckout(@RequestBody Map<String, Object> body) {
        try {
            Long userId = getCurrentUserId();
            String paymentIntentId = (String) body.get("paymentIntentId");
            String shippingAddress = (String) body.get("shippingAddress");
            String paymentMethod = (String) body.getOrDefault("paymentMethod", "CARD");
            String promoCode = (String) body.get("promoCode");
            Object totalObj = body.get("totalAmount");

            if (paymentIntentId == null || paymentIntentId.isEmpty()) {
                return new ResponseEntity<>(Map.of("error", "Missing paymentIntentId"), HttpStatus.BAD_REQUEST);
            }

            OrderRequestDTO orderRequest = new OrderRequestDTO();
            orderRequest.setUserId(userId);
            orderRequest.setShippingAddress(shippingAddress);
            orderRequest.setPaymentMethod(paymentMethod);
            orderRequest.setPromoCode(promoCode);
            if (totalObj instanceof Number n) {
                orderRequest.setTotalAmount(java.math.BigDecimal.valueOf(n.doubleValue()));
            }

            OrderDTO order = paymentService.processCreditCardPayment(paymentIntentId, orderRequest);
            return new ResponseEntity<>(order, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            logger.error("Failed to process card checkout:", e);
            return new ResponseEntity<>(Map.of("error", "Failed to finalize order after payment."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}