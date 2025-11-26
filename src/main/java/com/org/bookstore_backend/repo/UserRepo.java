package com.org.bookstore_backend.repo;

import com.org.bookstore_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {

    Optional<User> findByUserName(String userName);
    // ⭐ FIX: Change "getPasswordByUsername" to "getPasswordByUserName"
    Optional<String> getPasswordByUserName(String userName);

    Optional<User> findById(Long id);
    Optional<User> findByEmail(String email);

    // Find users by role name
    Optional<User> findByRolesName(String roleName);
}