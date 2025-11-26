package com.org.bookstore_backend.dto;

import com.org.bookstore_backend.model.PromoCode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for PromoCode entity.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromoCodeDTO {
    
    private Long id;
    private String code;
    private String description;
    private PromoCode.DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minimumOrderAmount;
    private Integer maxUses;
    private Integer currentUses;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
    private boolean active;
}
