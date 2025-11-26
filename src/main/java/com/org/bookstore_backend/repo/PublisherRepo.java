package com.org.bookstore_backend.repo;

import com.org.bookstore_backend.model.Publisher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PublisherRepo extends JpaRepository<Publisher, Long> {
    Optional<Publisher> findByName(String name);
}