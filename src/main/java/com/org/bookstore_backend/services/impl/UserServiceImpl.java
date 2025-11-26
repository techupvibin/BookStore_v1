package com.org.bookstore_backend.services.impl;

import com.org.bookstore_backend.config.JwtUtil;
import com.org.bookstore_backend.dto.UserDTO;
import com.org.bookstore_backend.dto.UserMapper;
import com.org.bookstore_backend.dto.UserRolesUpdateDTO;
import com.org.bookstore_backend.model.Role;
import com.org.bookstore_backend.model.User;
import com.org.bookstore_backend.repo.RoleRepository;
import com.org.bookstore_backend.repo.UserRepo;
import com.org.bookstore_backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepo userRepository;
    private final UserMapper userMapper;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    public UserServiceImpl(UserRepo userRepository, UserMapper userMapper, RoleRepository roleRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    @Transactional
    public String loginWithJwt(String username, String password) {
        logger.info("Attempting to login user with username: {}", username);
        Optional<User> optionalUser = userRepository.findByUserName(username);

        if (optionalUser.isPresent() && passwordEncoder.matches(password, optionalUser.get().getPassword())) {
            User user = optionalUser.get();
            logger.info("User {} logged in successfully", username);

            List<String> roles = user.getRoles().stream()
                    .map(Role::getName)
                    .collect(Collectors.toList());

            return jwtUtil.generateToken(username, roles);
        } else {
            logger.warn("Invalid login attempt for user: {}", username);
            throw new RuntimeException("Invalid username or password");
        }
    }

    @Transactional
    @Override
    public UserDTO register(UserDTO userDTO) {
        logger.info("Registering new user: {}", userDTO.getUsername());

        Optional<User> userOpt = userRepository.findByUserName(userDTO.getUsername());
        if (userOpt.isPresent()) {
            logger.warn("Registration failed. User already exists: {}", userDTO.getUsername());
            throw new RuntimeException("User already exists with username: " + userDTO.getUsername());
        }

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("Default role not found"));

        User user = userMapper.toEntity(userDTO);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRoles(Set.of(userRole));

        User savedUser = userRepository.save(user);
        logger.info("User registered successfully: {}", savedUser.getUsername());
        return userMapper.toDto(savedUser);
    }

    @Override
    @Transactional
    public Optional<UserDTO> findByUserName(String username) {
        return findByUsername(username);
    }

    @Transactional
    @Override
    public Optional<UserDTO> findByUsername(String username) {
        logger.debug("Searching for user by username: {}", username);
        return userRepository.findByUserName(username)
                .map(userMapper::toDto);
    }

    @Override
    @Transactional
    public Optional<UserDTO> login(String username, String password) {
        logger.info("Login method (non-JWT) called for :{}", username);
        return userRepository.findByUserName(username)
                .filter(user -> passwordEncoder.matches(password, user.getPassword()))
                .map(userMapper::toDto);
    }

    @Override
    @Transactional
    public UserDTO registerAdmin(UserDTO userDTO) { // ⭐ FIX: Changed return type from User to UserDTO
        if (userRepository.findByUserName(userDTO.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists!");
        }

        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseThrow(() -> new RuntimeException("Admin role not found"));

        User user = userMapper.toEntity(userDTO);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRoles(Set.of(adminRole));

        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        return userRepository.findByUserName(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(userMapper::toDto).collect(Collectors.toList());
    }

    @Override
    public UserDTO getUserById(Long userId) {
        return userRepository.findById(userId).map(userMapper::toDto).orElse(null);
    }

    @Override
    @Transactional
    public UserDTO updateUserRoles(Long userId, UserRolesUpdateDTO rolesUpdateDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Set<Role> newRoles = rolesUpdateDTO.getRoles().stream()
                .map(roleName -> roleRepository.findByName(roleName)
                        .orElseThrow(() -> new RuntimeException("Role not found: " + roleName)))
                .collect(Collectors.toSet());

        user.setRoles(newRoles);
        return userMapper.toDto(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    @Override
    public boolean hasAnyAdminUsers() {
        return userRepository.findByRolesName("ROLE_ADMIN").isPresent();
    }
}