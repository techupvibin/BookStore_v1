package com.org.bookstore_backend.services;

import com.org.bookstore_backend.dto.UserDTO;
import com.org.bookstore_backend.dto.UserRolesUpdateDTO;
import com.org.bookstore_backend.model.User;
import jakarta.validation.Valid;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;

public interface UserService { // ⭐ IMPORTANT: Removed 'extends UserDetailsService'

    @Transactional
    String loginWithJwt(String username, String password);

    @Transactional
    UserDTO register(UserDTO userDTO);

    Optional<UserDTO> findByUserName(String username);

    @Transactional
    Optional<UserDTO> findByUsername(String username);

    @Transactional
    Optional<UserDTO> login(String username, String password);

    /**
     * Registers a new user with the 'ADMIN' role.
     * This method is intended for privileged access only.
     * @param userDTO The user data transfer object.
     * @return The registered user DTO.
     */
    UserDTO registerAdmin(@Valid UserDTO userDTO); // ⭐ FIXED: Changed return type from 'User' to 'UserDTO'

    /**
     * Loads a user by their username for Spring Security authentication.
     * This method is part of the UserDetailsService contract.
     * This should not be here.
     */
    // UserDetails loadUserByUsername(String username); // ⭐ REMOVED from this interface

    UserDetails loadUserByUsername(String username);

    /**
     * Retrieves a list of all users as UserDTOs.
     * @return A list of UserDTOs.
     */
    List<UserDTO> getAllUsers();

    /**
     * Retrieves a single user by their ID as a UserDTO.
     * @param userId The ID of the user to retrieve.
     * @return The UserDTO of the found user.
     */
    UserDTO getUserById(Long userId);

    /**
     * Updates the roles of a specific user.
     * @param userId The ID of the user whose roles are to be updated.
     * @param rolesUpdateDTO A DTO containing the new set of role names.
     * @return The updated UserDTO.
     */
    UserDTO updateUserRoles(Long userId, UserRolesUpdateDTO rolesUpdateDTO);

    /**
     * Deletes a user by their ID.
     * @param userId The ID of the user to delete.
     */
    void deleteUser(Long userId);

    /**
     * Checks if any admin users exist in the system.
     * @return true if at least one admin user exists, false otherwise.
     */
    boolean hasAnyAdminUsers();
}