package com.org.bookstore_backend.controller;

import com.org.bookstore_backend.dto.UserDTO;
import com.org.bookstore_backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
//@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthUserController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userauthenticationService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody UserDTO userDTO) {
        try {
            userauthenticationService.register(userDTO);
            return ResponseEntity.ok("User registered successfully");
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username or email already exists.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred during registration.");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDTO userDTO) {
        try {
            System.out.println("Login attempt for username: " + userDTO.getUsername());
            String jwtToken = userauthenticationService.loginWithJwt(userDTO.getUsername(), userDTO.getPassword());

            // ⭐ FIX: Create a JSON object to wrap the JWT
            Map<String, String> response = new HashMap<>();
            response.put("token", jwtToken);

            System.out.println("Login successful for username: " + userDTO.getUsername());
            // ⭐ Return the JSON object with an OK status
            return ResponseEntity.ok().body(response);

        } catch (RuntimeException e) {
            System.out.println("Login failed for username: " + userDTO.getUsername() + ", error: " + e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid credentials");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Auth controller is working");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return ResponseEntity.ok().body(response);
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated() && !(authentication.getPrincipal() instanceof String && authentication.getPrincipal().equals("anonymousUser"))) {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            Optional<UserDTO> userDTOOptional = userauthenticationService.findByUsername(userDetails.getUsername());

            if (userDTOOptional.isPresent()) {
                UserDTO userDTO = userDTOOptional.get();
                Map<String, Object> responseBody = new HashMap<>();
                responseBody.put("userId", userDTO.getUserId());
                responseBody.put("username", userDTO.getUsername());
                responseBody.put("email", userDTO.getEmail());
                responseBody.put("roles", userDTO.getRoles());
                return ResponseEntity.ok(responseBody);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token invalid or user not found.");
    }
}