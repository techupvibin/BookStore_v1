package com.org.bookstore_backend.controller;

import com.org.bookstore_backend.dto.PromoCodeDTO;
import com.org.bookstore_backend.model.PromoCode;
import com.org.bookstore_backend.model.User;
import com.org.bookstore_backend.services.PromoService;
import com.org.bookstore_backend.repo.PromoCodeRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import com.org.bookstore_backend.services.impl.UserDetailsImpl;

/**
 * Controller for handling promotional code operations.
 */
@RestController
@RequestMapping("/api/promos")
public class PromoController {
    
    private static final Logger logger = LoggerFactory.getLogger(PromoController.class);
    
    private final PromoService promoService;
    private final PromoCodeRepo promoCodeRepo;
    
    @Autowired
    public PromoController(PromoService promoService, PromoCodeRepo promoCodeRepo) {
        this.promoService = promoService;
        this.promoCodeRepo = promoCodeRepo;
    }
    
    /**
     * Generates a new promotional code (admin only).
     */
    @PostMapping("/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromoCodeDTO> generatePromoCode(@RequestBody PromoCodeGenerationRequest request) {
        try {
            // Generate a unique promo code
            String generatedCode = generateUniqueCode(request.getPrefix());
            
            PromoCode promoCode = PromoCode.builder()
                    .code(generatedCode)
                    .description(request.getDescription())
                    .discountType(request.getDiscountType())
                    .discountValue(request.getDiscountValue())
                    .minimumOrderAmount(request.getMinimumOrderAmount())
                    .maxUses(request.getMaxUses())
                    .currentUses(0)
                    .validFrom(request.getValidFrom())
                    .validUntil(request.getValidUntil())
                    .active(true)
                    .build();
            
            PromoCode saved = promoCodeRepo.save(promoCode);
            
            logger.info("Generated new promo code: {}", saved.getCode());
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(saved));
        } catch (Exception e) {
            logger.error("Error generating promo code: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Validates a promotional code for the current user.
     */
    @PostMapping("/validate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PromoService.PromoValidationResponse> validatePromoCode(
            @RequestBody PromoValidationRequest request) {
        try {
            logger.info("Validating promo code: {} for cart total: {}", request.getPromoCode(), request.getCartTotal());
            
            User currentUser = getCurrentUser();
            logger.info("Current user: {}", currentUser.getUsername());
            
            PromoService.PromoValidationResponse response = 
                promoService.validateForUser(request.getPromoCode(), currentUser, request.getCartTotal());
            
            logger.info("Promo validation result: valid={}, message={}", response.isValid(), response.getMessage());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error validating promo code: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Gets all active promotional codes (admin only).
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PromoCodeDTO>> getAllPromoCodes() {
        try {
            List<PromoCode> promoCodes = promoCodeRepo.findAll();
            List<PromoCodeDTO> dtos = promoCodes.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            logger.error("Error fetching promo codes: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Creates a new promotional code (admin only).
     */
    @PostMapping("/admin/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromoCodeDTO> createPromoCode(@RequestBody PromoCodeDTO promoCodeDTO) {
        try {
            PromoCode promoCode = convertToEntity(promoCodeDTO);
            PromoCode saved = promoCodeRepo.save(promoCode);
            
            logger.info("Created new promo code: {}", saved.getCode());
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(saved));
        } catch (Exception e) {
            logger.error("Error creating promo code: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Updates an existing promotional code (admin only).
     */
    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromoCodeDTO> updatePromoCode(@PathVariable Long id, 
                                                       @RequestBody PromoCodeDTO promoCodeDTO) {
        try {
            PromoCode existing = promoCodeRepo.findById(id)
                    .orElse(null);
            
            if (existing == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Update fields
            existing.setCode(promoCodeDTO.getCode());
            existing.setDescription(promoCodeDTO.getDescription());
            existing.setDiscountType(promoCodeDTO.getDiscountType());
            existing.setDiscountValue(promoCodeDTO.getDiscountValue());
            existing.setMinimumOrderAmount(promoCodeDTO.getMinimumOrderAmount());
            existing.setMaxUses(promoCodeDTO.getMaxUses());
            existing.setValidFrom(promoCodeDTO.getValidFrom());
            existing.setValidUntil(promoCodeDTO.getValidUntil());
            existing.setActive(promoCodeDTO.isActive());
            
            PromoCode saved = promoCodeRepo.save(existing);
            
            logger.info("Updated promo code: {}", saved.getCode());
            return ResponseEntity.ok(convertToDTO(saved));
        } catch (Exception e) {
            logger.error("Error updating promo code: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Deletes a promotional code (admin only).
     */
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePromoCode(@PathVariable Long id) {
        try {
            if (!promoCodeRepo.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            
            promoCodeRepo.deleteById(id);
            logger.info("Deleted promo code with ID: {}", id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting promo code: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User not authenticated");
        }
        
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) principal;
            
            // Create a user object with the extracted information
            User user = new User();
            user.setUsername(userDetails.getUsername());
            user.setUserId(userDetails.getUserId());
            
            return user;
        }
        
        throw new IllegalStateException("Could not retrieve current user");
    }
    
    private PromoCodeDTO convertToDTO(PromoCode promoCode) {
        return PromoCodeDTO.builder()
                .id(promoCode.getId())
                .code(promoCode.getCode())
                .description(promoCode.getDescription())
                .discountType(promoCode.getDiscountType())
                .discountValue(promoCode.getDiscountValue())
                .minimumOrderAmount(promoCode.getMinimumOrderAmount())
                .maxUses(promoCode.getMaxUses())
                .currentUses(promoCode.getCurrentUses())
                .validFrom(promoCode.getValidFrom())
                .validUntil(promoCode.getValidUntil())
                .active(promoCode.isActive())
                // Removed createdAt and updatedAt fields
                .build();
    }
    
    private PromoCode convertToEntity(PromoCodeDTO dto) {
        return PromoCode.builder()
                .id(dto.getId())
                .code(dto.getCode())
                .description(dto.getDescription())
                .discountType(dto.getDiscountType())
                .discountValue(dto.getDiscountValue())
                .minimumOrderAmount(dto.getMinimumOrderAmount())
                .maxUses(dto.getMaxUses())
                .currentUses(dto.getCurrentUses() != null ? dto.getCurrentUses() : 0)
                .validFrom(dto.getValidFrom())
                .validUntil(dto.getValidUntil())
                .active(dto.isActive())
                .build();
    }
    
    /**
     * Generates a unique promotional code.
     */
    private String generateUniqueCode(String prefix) {
        String baseCode = prefix != null ? prefix.toUpperCase() : "PROMO";
        String generatedCode = baseCode + "_" + System.currentTimeMillis() % 10000;
        
        // Ensure uniqueness
        int attempts = 0;
        while (promoCodeRepo.findByCode(generatedCode).isPresent() && attempts < 10) {
            generatedCode = baseCode + "_" + (System.currentTimeMillis() + attempts) % 10000;
            attempts++;
        }
        
        return generatedCode;
    }
    
    /**
     * Request DTO for promo code validation.
     */
    public static class PromoValidationRequest {
        private String promoCode;
        private BigDecimal cartTotal;
        
        // Getters and setters
        public String getPromoCode() { return promoCode; }
        public void setPromoCode(String promoCode) { this.promoCode = promoCode; }
        public BigDecimal getCartTotal() { return cartTotal; }
        public void setCartTotal(BigDecimal cartTotal) { this.cartTotal = cartTotal; }
    }
    
    /**
     * Request DTO for promo code generation.
     */
    public static class PromoCodeGenerationRequest {
        private String prefix;
        private String description;
        private PromoCode.DiscountType discountType;
        private BigDecimal discountValue;
        private BigDecimal minimumOrderAmount;
        private Integer maxUses;
        private java.time.LocalDateTime validFrom;
        private java.time.LocalDateTime validUntil;
        
        // Getters and setters
        public String getPrefix() { return prefix; }
        public void setPrefix(String prefix) { this.prefix = prefix; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public PromoCode.DiscountType getDiscountType() { return discountType; }
        public void setDiscountType(PromoCode.DiscountType discountType) { this.discountType = discountType; }
        
        public BigDecimal getDiscountValue() { return discountValue; }
        public void setDiscountValue(BigDecimal discountValue) { this.discountValue = discountValue; }
        
        public BigDecimal getMinimumOrderAmount() { return minimumOrderAmount; }
        public void setMinimumOrderAmount(BigDecimal minimumOrderAmount) { this.minimumOrderAmount = minimumOrderAmount; }
        
        public Integer getMaxUses() { return maxUses; }
        public void setMaxUses(Integer maxUses) { this.maxUses = maxUses; }
        
        public java.time.LocalDateTime getValidFrom() { return validFrom; }
        public void setValidFrom(java.time.LocalDateTime validFrom) { this.validFrom = validFrom; }
        
        public java.time.LocalDateTime getValidUntil() { return validUntil; }
        public void setValidUntil(java.time.LocalDateTime validUntil) { this.validUntil = validUntil; }
    }
}
