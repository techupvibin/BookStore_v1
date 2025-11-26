package com.org.bookstore_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderDTO {

    
    private Long id;

    private String orderNumber;
    private LocalDateTime orderDate;
    private BigDecimal totalAmount;
    private String status;
    private String paymentMethod;
    private String shippingAddress;

    // ✅ Nest the UserDTO to represent the customer who placed the order.
    private UserDTO user;

    // ✅ Nest a list of OrderItemDTOs for the books.
    private List<OrderItemDTO> books;

    // ✅ The getTotalAmount method is not strictly necessary with Lombok,
    // but it's fine for defensive programming.
    public BigDecimal getTotalAmount() {
        return totalAmount != null ? totalAmount : BigDecimal.ZERO;
    }
}