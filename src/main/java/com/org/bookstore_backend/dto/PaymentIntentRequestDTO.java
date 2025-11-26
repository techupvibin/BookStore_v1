package com.org.bookstore_backend.dto;

import lombok.Data;

@Data
public class PaymentIntentRequestDTO {
    private Long amount; // Amount in cents
    // You might add other fields here, like currency, description, etc.
}