package com.org.bookstore_backend.repo;

import com.org.bookstore_backend.model.ShortenedUrl;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShortenedUrlRepository extends JpaRepository<ShortenedUrl, Long> {

    // Find a ShortenedUrl by its short code
    Optional<ShortenedUrl> findByShortCode(String shortCode);

    // Check if a short code already exists
    boolean existsByShortCode(String shortCode);

    // Find a ShortenedUrl by its long URL
    Optional<ShortenedUrl> findByLongUrl(String longUrl);
}
