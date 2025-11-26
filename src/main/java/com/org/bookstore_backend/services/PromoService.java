package com.org.bookstore_backend.services;

import com.org.bookstore_backend.model.User;
import java.math.BigDecimal;

/**
 * Service interface for handling promotional codes and discounts.
 */
public interface PromoService {
    
    /**
     * Validates a promotional code for a specific user and cart total.
     * 
     * @param promoCode The promotional code to validate
     * @param user The user attempting to use the promo code
     * @param cartTotal The total amount of the cart before discount
     * @return PromoValidationResponse containing validation result and discount details
     */
    PromoValidationResponse validateForUser(String promoCode, User user, BigDecimal cartTotal);
    
    /**
     * Redeems a promotional code for a specific user and order.
     * 
     * @param promoCode The promotional code to redeem
     * @param user The user redeeming the promo code
     * @param orderId The ID of the order the promo is being applied to
     */
    void redeem(String promoCode, User user, Long orderId);
    
    /**
     * Response class for promo validation results.
     */
    class PromoValidationResponse {
        private final boolean valid;
        private final String message;
        private final BigDecimal discount;
        private final BigDecimal discountedTotal;
        
        public PromoValidationResponse(boolean valid, String message, BigDecimal discount, BigDecimal discountedTotal) {
            this.valid = valid;
            this.message = message;
            this.discount = discount;
            this.discountedTotal = discountedTotal;
        }
        
        public boolean isValid() {
            return valid;
        }
        
        public String getMessage() {
            return message;
        }
        
        public BigDecimal getDiscount() {
            return discount;
        }
        
        public BigDecimal getDiscountedTotal() {
            return discountedTotal;
        }
        
        public static PromoValidationResponse valid(BigDecimal discount, BigDecimal discountedTotal) {
            return new PromoValidationResponse(true, "Promo code applied successfully", discount, discountedTotal);
        }
        
        public static PromoValidationResponse invalid(String message) {
            return new PromoValidationResponse(false, message, BigDecimal.ZERO, BigDecimal.ZERO);
        }
    }
}
