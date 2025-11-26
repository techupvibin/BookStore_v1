package com.org.bookstore_backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "cart_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
// Define a unique constraint to ensure a user doesn't have the same book twice in their cart
@IdClass(CartItemPK.class) // Specifies the composite primary key class
public class CartItem {

    // Removed direct 'User user' field:
    // A CartItem belongs to a Cart, and the Cart belongs to a User.
    // This avoids redundant 'user_id' in cart_items table and keeps the model normalized.
    // You can access the User through cart.getUser().

    // Composite Primary Key fields (each part of the composite key must be annotated with @Id)
    @Id // This annotation is crucial for composite primary keys
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    @JsonBackReference
    private Cart cart; // Part of composite key and foreign key to Cart

    @Id // This annotation is crucial for composite primary keys
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book; // Part of composite key and foreign key to Book

    @NotNull(message = "Quantity is mandatory")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Column(nullable = false)
    private Integer quantity;


    private BigDecimal priceAtPurchase; // This field stores the price of the book at the time it was added to the cart

    private BigDecimal getPrice;
    // You might want to store priceAtTimeOfAdding if book prices can change.
    // private Double priceAtTimeOfAdding;
}
