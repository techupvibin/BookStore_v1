package com.org.bookstore_backend.services.impl;

import com.org.bookstore_backend.model.PromoCode;
import com.org.bookstore_backend.model.User;
import com.org.bookstore_backend.repo.PromoCodeRepo;
import com.org.bookstore_backend.services.PromoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Implementation of PromoService for handling promotional codes and discounts.
 */
@Service
@Transactional
public class PromoServiceImpl implements PromoService {
    
    private static final Logger logger = LoggerFactory.getLogger(PromoServiceImpl.class);
    
    private final PromoCodeRepo promoCodeRepo;
    
    @Autowired
    public PromoServiceImpl(PromoCodeRepo promoCodeRepo) {
        this.promoCodeRepo = promoCodeRepo;
    }
    
    @Override
    public PromoValidationResponse validateForUser(String promoCode, User user, BigDecimal cartTotal) {
        if (promoCode == null || promoCode.trim().isEmpty()) {
            return PromoValidationResponse.invalid("Promo code is required");
        }
        
        if (user == null || user.getUserId() == null) {
            return PromoValidationResponse.invalid("User is required");
        }
        
        if (cartTotal == null || cartTotal.compareTo(BigDecimal.ZERO) <= 0) {
            return PromoValidationResponse.invalid("Cart total must be greater than zero");
        }
        
        // Find the promo code
        PromoCode code = promoCodeRepo.findByCode(promoCode.trim().toUpperCase())
                .orElse(null);
        
        if (code == null) {
            return PromoValidationResponse.invalid("Invalid promo code");
        }
        
        // Check if promo code is valid
        if (!code.isValid()) {
            if (!code.isActive()) {
                return PromoValidationResponse.invalid("Promo code is inactive");
            }
            if (LocalDateTime.now().isBefore(code.getValidFrom())) {
                return PromoValidationResponse.invalid("Promo code is not yet active");
            }
            if (LocalDateTime.now().isAfter(code.getValidUntil())) {
                return PromoValidationResponse.invalid("Promo code has expired");
            }
            if (code.getCurrentUses() >= code.getMaxUses()) {
                return PromoValidationResponse.invalid("Promo code usage limit exceeded");
            }
        }
        
        // Check minimum order amount
        if (cartTotal.compareTo(code.getMinimumOrderAmount()) < 0) {
            return PromoValidationResponse.invalid(
                String.format("Minimum order amount of £%.2f required", code.getMinimumOrderAmount())
            );
        }
        
        // Calculate discount
        BigDecimal discount = code.calculateDiscount(cartTotal);
        BigDecimal discountedTotal = cartTotal.subtract(discount);
        
        // Ensure discounted total is not negative
        if (discountedTotal.compareTo(BigDecimal.ZERO) < 0) {
            discountedTotal = BigDecimal.ZERO;
            discount = cartTotal;
        }
        
        logger.info("Promo code {} validated successfully for user {}. Original: £{}, Discount: £{}, Final: £{}", 
                   promoCode, user.getUserId(), cartTotal, discount, discountedTotal);
        
        return PromoValidationResponse.valid(discount, discountedTotal);
    }
    
    @Override
    public void redeem(String promoCode, User user, Long orderId) {
        if (promoCode == null || promoCode.trim().isEmpty()) {
            logger.warn("Attempted to redeem null or empty promo code for user {} and order {}", 
                       user.getUserId(), orderId);
            return;
        }
        
        PromoCode code = promoCodeRepo.findByCode(promoCode.trim().toUpperCase())
                .orElse(null);
        
        if (code == null) {
            logger.warn("Attempted to redeem non-existent promo code {} for user {} and order {}", 
                       promoCode, user.getUserId(), orderId);
            return;
        }
        
        // Increment usage count
        code.incrementUsage();
        promoCodeRepo.save(code);
        
        logger.info("Promo code {} redeemed successfully for user {} and order {}. New usage count: {}", 
                   promoCode, user.getUserId(), orderId, code.getCurrentUses());
    }
}
