package com.org.bookstore_backend.controller;

import com.org.bookstore_backend.dto.UserDTO;
// import com.org.bookstore_backend.model.User; // ⭐ REMOVED - no longer needed
import com.org.bookstore_backend.services.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    private final UserService userService;

    @Autowired
    public AdminController(UserService userService) {
        this.userService = userService;
    }

    // === USER MANAGEMENT ===

    /**
     * Registers a new user with 'ADMIN' role.
     * @param userDTO The user's registration data.
     * @return The registered User DTO.
     */
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/users/register-admin")
    public ResponseEntity<UserDTO> registerAdminUser(@RequestBody @Valid UserDTO userDTO) {
        try {
            logger.info("Registering new admin user: {}", userDTO.getEmail());
            UserDTO registeredUser = userService.registerAdmin(userDTO); // ⭐ NOW returns UserDTO
            return ResponseEntity.status(HttpStatus.CREATED).body(registeredUser);
        } catch (Exception e) {
            logger.error("Admin registration failed: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Registration failed: " + e.getMessage());
        }
    }

    /**
     * Initial admin registration endpoint - publicly accessible for first-time setup
     * This should only be used when no admin users exist in the system
     */
    @PostMapping("/initial-setup")
    public ResponseEntity<UserDTO> initialAdminSetup(@RequestBody @Valid UserDTO userDTO) {
        try {
            logger.info("Initial admin setup requested for: {}", userDTO.getEmail());
            
            // Check if any admin users already exist
            if (userService.hasAnyAdminUsers()) {
                logger.warn("Admin users already exist, rejecting initial setup request");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(null);
            }
            
            UserDTO registeredUser = userService.registerAdmin(userDTO);
            logger.info("Initial admin user created successfully: {}", registeredUser.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED).body(registeredUser);
            
        } catch (Exception e) {
            logger.error("Initial admin setup failed: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Initial setup failed: " + e.getMessage());
        }
    }
}