package com.org.bookstore_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRolesUpdateDTO {
    private Set<String> roles; // A set of role names (e.g., "ROLE_USER", "ROLE_ADMIN")
}
