package com.org.bookstore_backend.controller;
import com.org.bookstore_backend.dto.UserDTO;
import com.org.bookstore_backend.dto.UserRolesUpdateDTO;
import com.org.bookstore_backend.exception.ResourceNotFoundException;
import com.org.bookstore_backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
 

@RestController
@RequestMapping("/api/admin/users") // ⭐ This controller handles /api/admin/users path
@CrossOrigin(origins = "http://localhost:3000") // Adjust CORS as needed for your frontend URL
@PreAuthorize("hasRole('ADMIN')") // ⭐ All methods in this controller require ADMIN role by default
public class AdminUserController {

    private static final Logger logger = LoggerFactory.getLogger(AdminUserController.class);

    private final UserService userService;

    @Autowired
    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Retrieves a list of all users. Accessible only by ADMINs.
     * Maps to GET /api/admin/users
     * @return ResponseEntity containing a list of UserDTOs.
     */
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        logger.info("Admin request to get all users.");
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Retrieves a single user by their ID. Accessible only by ADMINs.
     * Maps to GET /api/admin/users/{userId}
     * @param userId The ID of the user to retrieve.
     * @return ResponseEntity containing the UserDTO of the found user.
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long userId) {
        logger.info("Admin request to get user by ID: {}", userId);
        try {
            UserDTO user = userService.getUserById(userId);
            return ResponseEntity.ok(user);
        } catch (ResourceNotFoundException e) {
            logger.warn("User not found for ID: {}", userId);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Updates the roles of a specific user. Accessible only by ADMINs.
     * Maps to PUT /api/admin/users/{userId}/roles
     * @param userId The ID of the user whose roles are to be updated.
     * @param rolesUpdateDTO A DTO containing the new set of role names.
     * @return ResponseEntity containing the updated UserDTO.
     */
    @PutMapping("/{userId}/roles")
    public ResponseEntity<UserDTO> updateUserRoles(@PathVariable Long userId, @RequestBody UserRolesUpdateDTO rolesUpdateDTO) {
        logger.info("Admin request to update roles for user ID: {}", userId);
        try {
            UserDTO updatedUser = userService.updateUserRoles(userId, rolesUpdateDTO);
            return ResponseEntity.ok(updatedUser);
        } catch (ResourceNotFoundException e) {
            logger.warn("User or Role not found for update (User ID: {}, Roles: {}): {}", userId, rolesUpdateDTO.getRoles(), e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating roles for user ID: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Deletes a user by their ID. Accessible only by ADMINs.
     * Maps to DELETE /api/admin/users/{userId}
     * @param userId The ID of the user to delete.
     * @return ResponseEntity with no content if successful.
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        logger.info("Admin request to delete user with ID: {}", userId);
        try {
            userService.deleteUser(userId);
            return ResponseEntity.noContent().build(); // 204 No Content
        } catch (ResourceNotFoundException e) {
            logger.warn("User not found for deletion (ID: {}): {}", userId, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error deleting user with ID: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
