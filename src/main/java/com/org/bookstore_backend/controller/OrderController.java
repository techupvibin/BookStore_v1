package com.org.bookstore_backend.controller;

import com.org.bookstore_backend.dto.OrderDTO;
import com.org.bookstore_backend.dto.OrderRequestDTO;
import com.org.bookstore_backend.services.OrderService;
import com.org.bookstore_backend.services.impl.UserDetailsImpl;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import java.util.Objects; // For Object.equals() null-safe comparison

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

    @Autowired
    private OrderService orderService;

    /**
     * Retrieves the ID of the currently authenticated user.
     * This helper method is robust and should be used by all controller methods
     * that require the user's ID.
     *
     * @return The ID of the authenticated user.
     * @throws IllegalStateException if the user is not authenticated or their ID cannot be retrieved.
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new IllegalStateException("User is not authenticated.");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetailsImpl userDetails) {
            return userDetails.getUserId();
        }
        logger.error("Authenticated principal is not of the expected type UserDetailsImpl. Type: {}", principal.getClass().getName());
        throw new IllegalStateException("Could not retrieve user ID from authentication principal.");
    }

    //-------------------------------------------------------------------------

    /**
     * Creates a new order for the authenticated user based on their cart.
     * The userId is set on the DTO from the authenticated principal.
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDTO> createOrder(@RequestBody OrderRequestDTO orderRequestDTO) {
        try {
            Long userId = getCurrentUserId();
            logger.info("User ID {} attempting to place a new order.", userId);
            orderRequestDTO.setUserId(userId);
            OrderDTO newOrder = orderService.placeOrder(orderRequestDTO);
            logger.info("Order placed successfully with ID: {}", newOrder.getId());
            return new ResponseEntity<>(newOrder, HttpStatus.CREATED);
        } catch (IllegalStateException | IllegalArgumentException | EntityNotFoundException e) {
            logger.error("Bad request from user: {}", e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            logger.error("An unexpected error occurred while placing order:", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //-------------------------------------------------------------------------

    /**
     * Retrieves the order history for the authenticated user.
     * Maps to: GET /api/orders
     * This is a more standard RESTful approach than /api/orders/my
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<OrderDTO>> getUserOrders() {
        Long userId = getCurrentUserId();
        logger.info("Fetching order history for user ID: {}", userId);
        List<OrderDTO> orders = orderService.getOrderHistory(userId);
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }

    //-------------------------------------------------------------------------

    /**
     * Retrieves a single order by its ID, ensuring it belongs to the authenticated user.
     * Maps to: GET /api/orders/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDTO> getUserOrderById(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        logger.info("Fetching order ID: {} for user ID: {}", id, userId);
        try {
            OrderDTO order = orderService.getOrderById(id);
            // Null-safe check using Objects.equals()
            if (order != null && Objects.equals(order.getUser().getUserId(), userId)) {
                return new ResponseEntity<>(order, HttpStatus.OK);
            } else if (order != null) {
                logger.warn("User ID {} attempted to access order ID {} which does not belong to them.", userId, id);
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (EntityNotFoundException e) {
            logger.warn("Order ID {} not found.", id);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    //-------------------------------------------------------------------------

    /**
     * Deletes an order by its ID, ensuring it belongs to the authenticated user.
     * Maps to: DELETE /api/orders/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        logger.info("User ID {} attempting to delete order ID: {}", userId, id);
        try {
            OrderDTO orderToDelete = orderService.getOrderById(id);
            if (orderToDelete != null && Objects.equals(orderToDelete.getUser().getUserId(), userId)) {
                orderService.deleteOrder(id);
                logger.info("Order ID {} successfully deleted by user ID {}.", id, userId);
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                logger.warn("User ID {} attempted to delete order ID {} which does not belong to them or not found.", userId, id);
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        } catch (EntityNotFoundException e) {
            logger.warn("Order ID {} not found for deletion by user ID {}.", id, userId);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    //-------------------------------------------------------------------------

    /**
     * Allows an authenticated user to cancel their own order while it's not yet delivered.
     * Maps to: POST /api/orders/{id}/cancel
     */
    @PostMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDTO> cancelMyOrder(@PathVariable Long id, @RequestBody(required = false) java.util.Map<String, String> body) {
        Long userId = getCurrentUserId();
        logger.info("User ID {} attempting to cancel order ID: {}", userId, id);
        try {
            OrderDTO order = orderService.getOrderById(id);
            if (order == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            if (!Objects.equals(order.getUser().getUserId(), userId)) {
                logger.warn("User ID {} attempted to cancel order ID {} which does not belong to them.", userId, id);
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            String reason = body != null ? body.getOrDefault("reason", "") : "";
            // guard: do not cancel if already delivered or canceled
            String current = order.getStatus() != null ? order.getStatus().toUpperCase() : "";
            if ("DELIVERED".equals(current) || "CANCELED".equals(current)) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            OrderDTO canceled = orderService.updateOrderStatus(id, "CANCELED");
            // Notify admins about cancellation request
            try {
                org.slf4j.LoggerFactory.getLogger(OrderController.class).info("Order {} canceled by user {}. Reason: {}", id, userId, reason);
            } catch (Exception ignore) {}
            return new ResponseEntity<>(canceled, HttpStatus.OK);
        } catch (EntityNotFoundException ex) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException ex) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    //-------------------------------------------------------------------------

    /**
     * Generates and returns an invoice PDF for a user's order.
     * Maps to: GET /api/orders/{id}/invoice
     */
    @GetMapping(value = "/{id}/invoice", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        logger.info("User ID {} requesting invoice for order ID: {}", userId, id);
        try {
            OrderDTO order = orderService.getOrderById(id);
            if (order == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            if (!Objects.equals(order.getUser().getUserId(), userId)) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }

            byte[] pdf = orderService.generateInvoicePdf(order);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "invoice-" + (order.getOrderNumber() != null ? order.getOrderNumber() : order.getId()) + ".pdf");
            return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
        } catch (EntityNotFoundException ex) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception ex) {
            logger.error("Failed to generate invoice for order {}", id, ex);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}