package com.org.bookstore_backend.config;

import com.org.bookstore_backend.model.Role;
import com.org.bookstore_backend.model.User;
import com.org.bookstore_backend.repo.RoleRepository;
import com.org.bookstore_backend.repo.UserRepo;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class DataInitializer {

    private static final Logger LOGGER = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepository;
    private final UserRepo userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public DataInitializer(RoleRepository roleRepository,
                           UserRepo userRepository,
                           PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void init() {
        createRolesIfNotExist();
        createAdminUserIfNotExist();
    }

    private void createRolesIfNotExist() {
        createRole("ROLE_USER");
        createRole("ROLE_ADMIN");
    }

    private void createRole(String roleName) {
        roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    LOGGER.info("Creating role: {}", roleName);
                    return roleRepository.save(new Role(roleName));
                });
    }

    private void createAdminUserIfNotExist() {
        try {
            Optional<User> adminOpt = userRepository.findByUserName("admin");

            if (adminOpt.isEmpty()) {
                LOGGER.info("Creating default admin user...");

                Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                        .orElseThrow(() -> new RuntimeException("ROLE_ADMIN not found"));
                Role userRole = roleRepository.findByName("ROLE_USER")
                        .orElseThrow(() -> new RuntimeException("ROLE_USER not found"));

                Set<Role> roles = new HashSet<>();
                roles.add(adminRole);
                roles.add(userRole);

                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin123@example.com");
                admin.setPassword(passwordEncoder.encode("admin123")); // Store encoded password
                admin.setRoles(roles);

                User savedAdmin = userRepository.save(admin);
                LOGGER.info("Admin user created successfully with ID: {}", savedAdmin.getUserId());
                LOGGER.info("Admin username: {}, email: {}", savedAdmin.getUsername(), savedAdmin.getEmail());
                LOGGER.info("Admin roles: {}", savedAdmin.getRoles().stream().map(Role::getName).collect(Collectors.toList()));
            } else {
                User existingAdmin = adminOpt.get();
                LOGGER.info("Admin user already exists. ID: {}, Username: {}, Email: {}", 
                    existingAdmin.getUserId(), existingAdmin.getUsername(), existingAdmin.getEmail());
                LOGGER.info("Admin roles: {}", existingAdmin.getRoles().stream().map(Role::getName).collect(Collectors.toList()));
            }
        } catch (Exception e) {
            LOGGER.error("Failed to create admin user: {}", e.getMessage(), e);
            throw new RuntimeException("Admin user creation failed", e);
        }
    }
}
