package com.org.bookstore_backend.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "carts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // One-to-one relationship with User
    // The cart "belongs" to a user. This assumes one cart per user.
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // One-to-many relationship with CartItems
    // When a cart is deleted, its items should also be deleted (CascadeType.ALL)
    // 'mappedBy' indicates that CartItem owns the relationship (has the foreign key)
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    @Builder.Default
    private Set<CartItem> cartItems = new HashSet<>();

    // You could add fields like 'totalAmount' here, but it's often calculated on the fly
    // or persisted in the CartDTO/service layer to avoid data redundancy/inconsistency.

    // Helper method to add a CartItem (ensures bidirectional relationship consistency)
    public void addCartItem(CartItem item) {
        this.cartItems.add(item);
        item.setCart(this);
    }

    // Helper method to remove a CartItem
    public void removeCartItem(CartItem item) {
        this.cartItems.remove(item);
        item.setCart(null);
    }
}