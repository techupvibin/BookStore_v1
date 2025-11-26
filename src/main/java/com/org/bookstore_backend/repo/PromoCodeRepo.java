package com.org.bookstore_backend.repo;

import com.org.bookstore_backend.model.PromoCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for PromoCode entity operations.
 */
@Repository
public interface PromoCodeRepo extends JpaRepository<PromoCode, Long> {
    
    /**
     * Finds a promo code by its code string.
     */
    Optional<PromoCode> findByCode(String code);
    
    /**
     * Finds all active promo codes that are currently valid.
     */
    @Query("SELECT p FROM PromoCode p WHERE p.active = true " +
           "AND p.validFrom <= :now AND p.validUntil >= :now " +
           "AND p.currentUses < p.maxUses")
    List<PromoCode> findValidPromoCodes(@Param("now") LocalDateTime now);
    
    /**
     * Checks if a promo code exists and is active.
     */
    boolean existsByCodeAndActiveTrue(String code);
    
    /**
     * Finds promo codes by discount type.
     */
    List<PromoCode> findByDiscountType(PromoCode.DiscountType discountType);
    
    /**
     * Finds promo codes that expire before a given date.
     */
    List<PromoCode> findByValidUntilBefore(LocalDateTime date);
}
