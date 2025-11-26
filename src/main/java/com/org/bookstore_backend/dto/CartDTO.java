package com.org.bookstore_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartDTO {
    private Long id; // Cart id now Long
    private Long userId; // Align with User.userId which is Long
    private Set<CartItemDTO> cartItems;
    private Double totalAmount;
    private Integer totalItems;
}