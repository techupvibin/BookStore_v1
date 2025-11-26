package com.org.bookstore_backend.config;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.security.Key;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Utility class for JSON Web Token (JWT) operations.
 * Provides methods for generating, parsing, and validating JWTs.
 * The secret key is loaded from application properties.
 */
@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.secret:${JWT_SECRET:dGhpcy1pcy1hLXN1cGVyLXNlY3JldC1rZXktdGhhdC1pcy1tb3JlLXRoYW4tMzItYnl0ZXMhISE=}}")
    private String SECRET_KEY_BASE64;

    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 10; // 10 hours in milliseconds

    /**
     * Helper method to get the signing key. Decodes the Base64 secret.
     * @return The HMAC-SHA cryptographic Key.
     */
    private Key getSigningKey() {
        // Decode the Base64 secret string into bytes
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY_BASE64);
        // Create an HMAC-SHA key from the decoded bytes
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Generates a JWT token for a given username and list of roles.
     * Roles are added as a custom claim "roles".
     *
     * @param username The subject of the token.
     * @param roles The list of roles to include in the token.
     * @return The generated JWT string.
     */
    public String generateToken(String username, List<String> roles) { // ⭐ FIX: Added roles parameter
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", roles); // Now, 'roles' is in scope and correctly used
        return createToken(claims, username);
    }

    /**
     * Generates a JWT token using the Spring Security Authentication object.
     * Extracts username and authorities from the authentication to build the token.
     */
    public String generateToken(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("Cannot generate token for unauthenticated principal");
        }
        String username = authentication.getName();
        List<String> roles = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        return generateToken(username, roles);
    }

    /**
     * Creates the JWT token.
     * Sets claims, subject (username), issued at date, expiration date, and signs the token.
     * @param claims Any custom claims to include in the token.
     * @param subject The subject of the token (typically the username).
     * @return The compact JWT string.
     */
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extracts the username (subject) from a JWT token.
     * @param token The JWT string.
     * @return The username. Returns null if token is invalid or parsing fails.
     */
    public String extractUsername(String token) {
        try {
            return extractClaim(token, Claims::getSubject);
        } catch (ExpiredJwtException e) {
            logger.warn("JWT token expired: {}", e.getMessage());
            return null;
        } catch (UnsupportedJwtException | MalformedJwtException | SignatureException | IllegalArgumentException e) {
            logger.warn("Invalid JWT token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extracts roles from a JWT token's "roles" claim.
     * @param token The JWT string.
     * @return A List of role strings, or an empty list if roles are not found or token is invalid.
     */
    public List<String> extractRoles(String token) {
        try {
            Claims claims = extractAllClaims(token);
            Object rolesObject = claims.get("roles");
            if (rolesObject instanceof List<?>) {
                // Safely cast and map list elements to strings
                return ((List<?>) rolesObject).stream()
                        .map(Object::toString)
                        .collect(Collectors.toList());
            }
            return Collections.emptyList(); // Return empty list if no roles claim or it's not a list
        } catch (ExpiredJwtException e) {
            logger.warn("JWT token expired when extracting roles: {}", e.getMessage());
            return Collections.emptyList();
        } catch (UnsupportedJwtException | MalformedJwtException | SignatureException | IllegalArgumentException e) {
            logger.warn("Invalid JWT token when extracting roles: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Generic method to extract a specific claim from the JWT token's claims.
     * @param token The JWT string.
     * @param claimsResolver A function that specifies which claim to extract from the Claims object.
     * @param <T> The type of the claim to be extracted.
     * @return The extracted claim.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Parses the JWT token and extracts all its claims. This method is private
     * and used internally by other extraction methods.
     * @param token The JWT string.
     * @return A Claims object containing all extracted claims.
     */
    private Claims extractAllClaims(String token) {
        // Use Jwts.parserBuilder to create a parser, set the signing key, build, and parse the token.
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Validates a JWT token against a UserDetails object.
     * Checks if the username in the token matches the UserDetails username and if the token is not expired.
     * This is the comprehensive validation method used by Spring Security.
     * @param token The JWT string.
     * @param userDetails The UserDetails object representing the authenticated user.
     * @return true if the token is valid, false otherwise.
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        // Check if username matches and token is not expired
        return (username != null && username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    /**
     * Checks if the JWT token has expired.
     * @param token The JWT string.
     * @return true if the token is expired, false otherwise.
     */
    private Boolean isTokenExpired(String token) {
        try {
            return extractClaim(token, Claims::getExpiration).before(new Date());
        } catch (ExpiredJwtException e) {
            // If extracting expiration itself throws ExpiredJwtException, it means it's expired
            return true;
        } catch (UnsupportedJwtException | MalformedJwtException | SignatureException | IllegalArgumentException e) {
            logger.error("Error validating token expiration: {}", e.getMessage());
            return true; // Treat as expired/invalid if it can't be parsed for expiration
        }
    }
}