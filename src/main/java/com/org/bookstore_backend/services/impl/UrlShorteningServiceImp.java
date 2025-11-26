package com.org.bookstore_backend.services.impl;
//import com.org.bookstore_backend.model.ShortenedUrl;
//import com.org.bookstore_backend.repo.ShortenedUrlRepository;
//import com.org.bookstore_backend.services.UrlShorteningService;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.security.MessageDigest;
//import java.security.NoSuchAlgorithmException;
//import java.util.Base64;
//import java.util.Optional;
//
//@Service("urlShorteningService") // Specify a name for the bean if needed, though not strictly required here
//public class UrlShorteningServiceImp implements UrlShorteningService { // ⭐ IMPLEMENTS THE INTERFACE
//
//    private static final Logger logger = LoggerFactory.getLogger(UrlShorteningServiceImp.class);
//    private static final int SHORT_CODE_LENGTH = 7; // Length of the generated short code
//
//    @Value("${app.base-url}") // Configure this in application.properties/yml
//    private String appBaseUrl; // e.g., http://localhost:8080 or your domain
//
//    private final ShortenedUrlRepository shortenedUrlRepository;
//
//    @Autowired
//    public UrlShorteningServiceImp(ShortenedUrlRepository shortenedUrlRepository) {
//        this.shortenedUrlRepository = shortenedUrlRepository;
//    }
//
//    /**
//     * Shortens a given long URL. If the URL has been shortened before,
//     * it returns the existing short code. Otherwise, it generates a new one.
//     * @param longUrl The original long URL to shorten.
//     * @return The generated short code.
//     * @throws RuntimeException if URL shortening fails.
//     */
//    @Override // ⭐ Add @Override annotation
//    @Transactional
//    public String shortenUrl(String longUrl) {
//        // 1. Check if the long URL already exists to avoid duplicates
//        Optional<ShortenedUrl> existing = shortenedUrlRepository.findByLongUrl(longUrl);
//        if (existing.isPresent()) {
//            logger.info("Long URL already shortened: {}", longUrl);
//            return existing.get().getShortCode();
//        }
//
//        // 2. Generate a unique short code
//        String shortCode;
//        int attempts = 0;
//        final int MAX_ATTEMPTS = 5; // Prevent infinite loops
//        do {
//            shortCode = generateShortCode(longUrl, attempts);
//            attempts++;
//            if (attempts > MAX_ATTEMPTS) {
//                logger.error("Failed to generate a unique short code after {} attempts for URL: {}", MAX_ATTEMPTS, longUrl);
//                throw new RuntimeException("Failed to generate unique short code.");
//            }
//        } while (shortenedUrlRepository.existsByShortCode(shortCode));
//
//        // 3. Save the new shortened URL
//        ShortenedUrl newShortenedUrl = new ShortenedUrl(shortCode, longUrl);
//        shortenedUrlRepository.save(newShortenedUrl);
//        logger.info("Shortened URL: {} -> {}", longUrl, shortCode);
//        return shortCode;
//    }
//
//    /**
//     * Retrieves the original long URL for a given short code and increments its hit count.
//     * @param shortCode The short code to look up.
//     * @return The original long URL.
//     * @throws IllegalArgumentException if the short code is not found.
//     */
//    @Override // ⭐ Add @Override annotation
//    @Transactional
//    public String retrieveLongUrl(String shortCode) {
//        Optional<ShortenedUrl> shortenedUrlOptional = shortenedUrlRepository.findByShortCode(shortCode);
//        if (shortenedUrlOptional.isPresent()) {
//            ShortenedUrl shortenedUrl = shortenedUrlOptional.get();
//            shortenedUrl.setHitCount(shortenedUrl.getHitCount() + 1); // Increment hit count
//            shortenedUrlRepository.save(shortenedUrl); // Save the updated hit count
//            logger.info("Retrieved long URL for short code {}: {}", shortCode, shortenedUrl.getLongUrl());
//            return shortenedUrl.getLongUrl();
//        } else {
//            logger.warn("Short code not found: {}", shortCode);
//            throw new IllegalArgumentException("Short URL not found for code: " + shortCode);
//        }
//    }
//
//    /**
//     * Generates a short code using a hash of the long URL and an attempt counter.
//     * This helps ensure uniqueness even for identical long URLs if needed,
//     * though the primary check is `existsByShortCode`.
//     * @param longUrl The original long URL.
//     * @param attempt The current attempt number to add entropy.
//     * @return A generated short code.
//     */
//    private String generateShortCode(String longUrl, int attempt) {
//        try {
//            // Use MD5 hash of the long URL + current timestamp + attempt for more uniqueness
//            String dataToHash = longUrl + System.nanoTime() + attempt;
//            MessageDigest md = MessageDigest.getInstance("MD5");
//            byte[] hash = md.digest(dataToHash.getBytes());
//
//            // Encode to Base64 and take a substring
//            String base64Encoded = Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
//            // Ensure the short code is alphanumeric and URL-safe
//            return base64Encoded.substring(0, Math.min(SHORT_CODE_LENGTH, base64Encoded.length()))
//                    .replaceAll("[^a-zA-Z0-9]", ""); // Remove non-alphanumeric chars
//        } catch (NoSuchAlgorithmException e) {
//            logger.error("MD5 algorithm not found. Cannot generate short code.", e);
//            throw new RuntimeException("Error generating short code.", e);
//        }
//    }
//
//    // Helper method to construct the full short URL for the frontend
//    @Override // ⭐ Add @Override annotation
//    public String getFullShortUrl(String shortCode) {
//        return appBaseUrl + "/" + shortCode;
//    }
//}
