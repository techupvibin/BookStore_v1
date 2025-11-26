// src/main/java/com/org/bookstore_backend/dto/OrderRequestDTO.java
package com.org.bookstore_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Data Transfer Object (DTO) for creating a new order.
 * This class encapsulates all necessary data from a client's request
 * to create an order, ensuring a clear and structured API contract.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequestDTO {
    // The user's unique identifier. Long-based IDs
    private Long userId;

    // The shipping address for the order.
    private String shippingAddress;

    // The payment method chosen by the user.
    private String paymentMethod;

    // The total amount of the order. This is typically calculated by the backend
    // but can be sent from the frontend for validation.
    private BigDecimal totalAmount;

    // A list of items included in the order, each with its own details.
    private List<OrderItemDTO> items;

    // Optional promo code applied by the user at checkout
    private String promoCode;

    // Optional discount explicitly applied (for transparency on receipts)
    private BigDecimal promoDiscount;
}