package com.org.bookstore_backend.dto;

import lombok.Data;

public class PaymentIntentResponseDTO {

    @Data
    public class PaymentIntentResponse {
        private String clientSecret;
        private String status;
    }
}