package com.org.bookstore_backend.services.impl;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.List;
 
import java.util.stream.Collectors;

public class UserDetailsImpl implements UserDetails {

    private final Long userId;
    private final String username;
    private final String password;
    private final List<SimpleGrantedAuthority> authorities;

    // Constructor for loading from the database
    public UserDetailsImpl(String username, String password, List<SimpleGrantedAuthority> authorities, Long userId) {
        this.username = username;
        this.password = password;
        this.authorities = authorities;
        this.userId = userId;
    }

    // Constructor for token-based authentication (used by WebSocketConfig)
    public UserDetailsImpl(Long userId, String username, String password, List<String> roles) {
        this.userId = userId;
        this.username = username;
        this.password = password; // Will be null for tokens
        this.authorities = mapRolesToAuthorities(roles);
    }

    public Long getUserId() {
        return userId;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }

    // Utility method to convert role strings to SimpleGrantedAuthority objects
    public static List<SimpleGrantedAuthority> mapRolesToAuthorities(List<String> roles) {
        return roles.stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }
}