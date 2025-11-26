package com.org.bookstore_backend.dto;

import com.org.bookstore_backend.model.Role;
import com.org.bookstore_backend.model.User;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class UserMapper {

    public UserDTO toDto(User user) {
        if (user == null) {
            return null;
        }

        return UserDTO.builder()
                .userId(user.getUserId())
                .username(user.getUsername()) // Added username mapping
                .email(user.getEmail())
                .roles(user.getRoles().stream()
                        .map(Role::getName)
                        .collect(Collectors.toSet()))
                .build();
    }

    public User toEntity(UserDTO userDTO) {
        if (userDTO == null) {
            return null;
        }

        User user = new User();
        user.setUserId(userDTO.getUserId()); // May be null for new users
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setPassword(userDTO.getPassword()); // Password will be set/encoded by service

        // Roles are not set directly here; typically handled by service logic
        return user;
    }

    public UserDTO toDto(String s) {
        if (s == null || s.isEmpty()) {
            return null;
        }

        // Assuming 's' is a JSON string representation of UserDTO
        // You would typically use a library like Jackson or Gson to convert it
        // For simplicity, this is just a placeholder
        // Replace with actual deserialization logic as needed
        return new UserDTO(); // Placeholder, implement actual conversion logic
    }
}