package com.org.bookstore_backend.services;

import com.org.bookstore_backend.model.ShortenedUrl; // Needed for method signatures
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Interface for the URL Shortening Service.
 * Defines the contract for shortening and retrieving URLs.
 */
@Service
public interface UrlShorteningService {

    /**
     * Shortens a given long URL. If the URL has been shortened before,
     * it returns the existing short code. Otherwise, it generates a new one.
     * @param longUrl The original long URL to shorten.
     * @return The generated short code.
     * @throws RuntimeException if URL shortening fails.
     */
    String shortenUrl(String longUrl);

    /**
     * Retrieves the original long URL for a given short code and increments its hit count.
     * @param shortCode The short code to look up.
     * @return The original long URL.
     * @throws IllegalArgumentException if the short code is not found.
     */
    String retrieveLongUrl(String shortCode);

    /**
     * Helper method to construct the full short URL for the frontend.
     * @param shortCode The generated short code.
     * @return The complete short URL (e.g., http://localhost:8080/abcDE1).
     */
    String getFullShortUrl(String shortCode);
}
