package com.org.bookstore_backend.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * Data Transfer Object (DTO) for an item within an order.
 * This class is used for transferring order item details between different
 * layers of the application, such as from the service layer to the presentation layer.
 * It's read-only and provides a snapshot of the book and its price at the time of purchase.
 */
@Data
@Builder
public class OrderItemDTO {

    private Long bookId;

    // The title of the book at the time the order was placed.
    private String bookTitle;

    // The number of units of this book in the order.
    private Integer quantity;

    // The price of a single unit of the book at the time of purchase.
    // Using BigDecimal for monetary values to avoid floating-point precision issues.
    private BigDecimal price;

    // The total price for this specific order item (price * quantity).
    // This is a calculated field to be filled by the service layer.
    private BigDecimal totalPrice;

    // A more explicit name for the price at the time of purchase. This is
    // a redundant field if 'price' already serves this purpose.
    // It's recommended to use 'price' for clarity.
    private BigDecimal priceAtPurchase;
}