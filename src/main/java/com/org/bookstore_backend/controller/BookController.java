package com.org.bookstore_backend.controller;
import com.org.bookstore_backend.dto.BookCreationDTO;
import com.org.bookstore_backend.dto.BookDTO;
import com.org.bookstore_backend.dto.BookUpdateDTO;
import com.org.bookstore_backend.services.BookService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType; // ⭐ Import MediaType
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "http://localhost:3000") // Keep this if your frontend is on localhost:3000
public class BookController {

    private final BookService bookService;
    private static final Logger logger = LoggerFactory.getLogger(BookController.class);

    @Autowired
    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    // --- Public Endpoints (accessible to all) ---

    @GetMapping
    public ResponseEntity<List<BookDTO>> getAllBooks(
            @RequestParam(required = false) String category, // ⭐ New: Optional category parameter
            @RequestParam(required = false) String search) { // ⭐ New: Optional search parameter
        logger.info("Fetching all books with category: '{}', search: '{}'", category, search);
        // ⭐ Pass parameters to the service layer for filtering
        List<BookDTO> books = bookService.getAllBooks(category, search);
        // Changed to return 200 OK with an empty list, instead of NO_CONTENT, for consistency
        return ResponseEntity.ok(books);
    }
    @GetMapping("/genres")
    public ResponseEntity<List<String>> getAllGenres() {
        List<String> genres = bookService.getAllGenres(); // Assumes this method exists in BookService
        return ResponseEntity.ok(genres);

    }

    @GetMapping("/{id}")
    // ⭐ Example: Allow all authenticated users to view a single book detail
    public ResponseEntity<BookDTO> getBookById(@PathVariable Long id) {
        logger.info("Fetching book with ID: {}", id);
        try {
            BookDTO book = bookService.getBookById(id);
            return ResponseEntity.ok(book);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Returns a preview/sample text for a given book. Currently uses the book description
     * as the sample content truncated to a sensible length. Can be extended later to load
     * a dedicated sample chapter.
     */
    @GetMapping("/{id}/sample")
    public ResponseEntity<Map<String, String>> getBookSample(@PathVariable Long id) {
        try {
            BookDTO book = bookService.getBookById(id);
            String description = book.getDescription() != null ? book.getDescription() : "";
            String sample = description.length() > 2000 ? description.substring(0, 2000) + "…" : description;
            return ResponseEntity.ok(Map.of("sample", sample));
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(Map.of("error", "Book not found"), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Failed to load sample"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- Admin-only Endpoints ---

    // ⭐ Uncommented PreAuthorize for admin access
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE) // ⭐ Use MediaType constant
    public ResponseEntity<BookDTO> createBook(
            // ⭐ JSON part for the book fields
            @Valid @RequestPart("bookCreationDTO") BookCreationDTO bookCreationDTO,
            // ⭐ Separate file part for the image (matches frontend form key)
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile
    ) {
        logger.info("Received request to create a new book with title: {}", bookCreationDTO.getTitle());
        try {
            // ⭐ Pass the DTO and the provided image file to the service
            BookDTO createdBook = bookService.createBook(bookCreationDTO, imageFile);
            return new ResponseEntity<>(createdBook, HttpStatus.CREATED);
        } catch (IOException e) {
            logger.error("Failed to upload image for new book: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload image.");
        }
    }

    // CSV bulk upload for books
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping(path = "/bulk/csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadBooksCsv(@RequestPart("file") MultipartFile file) {
        try {
            Map<String, Object> summary = bookService.importBooksFromCsv(file);
            return ResponseEntity.ok(summary);
        } catch (IOException e) {
            logger.error("Failed to process CSV upload: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid CSV file"));
        } catch (Exception e) {
            logger.error("Unexpected error during CSV upload", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Upload failed"));
        }
    }

    // ⭐ Uncommented PreAuthorize for admin access
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE) // ⭐ Use MediaType constant
    public ResponseEntity<BookDTO> updateBook(
            @PathVariable Long id,
            // ⭐ Changed to @RequestPart for explicit multipart handling
            @Valid @RequestPart("bookUpdateDTO") BookUpdateDTO bookUpdateDTO,
            // ⭐ Explicitly receive imageFile as a separate part, required=false is good
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        logger.info("Received request to update book with ID: {}", id);

        // Basic check if DTO part is missing (though @Valid helps with fields inside)
        if (bookUpdateDTO == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Book update data is missing.");
        }

        try {
            // ⭐ Pass the DTO and the potentially new imageFile to the service
            BookDTO updatedBook = bookService.updateBook(id, bookUpdateDTO, imageFile);
            return ResponseEntity.ok(updatedBook);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found with ID: " + id);
        } catch (IOException e) {
            logger.error("Failed to update image for book with ID {}: {}", id, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to update image.");
        }
    }

    // ⭐ Uncommented PreAuthorize for admin access
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        logger.info("Deleting book with ID: {}", id);
        try {
            bookService.deleteBook(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (EntityNotFoundException e) {
            logger.warn("Book with ID {} not found for deletion", id);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // Changed to NOT_FOUND
        }
    }

    // --- Search Endpoints (Consider consolidating into getAllBooks) ---

    // ⭐ You might consolidate these into a more flexible getAllBooks with parameters
    // For now, keeping them as separate if you specifically need them.
    @GetMapping("/search-by-publisher")
    public ResponseEntity<List<BookDTO>> searchBooksByPublisher(@RequestParam String publisherName) {
        logger.info("Searching for books by publisher: {}", publisherName);
        List<BookDTO> books = bookService.findByPublisherName(publisherName);
        if (books.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // Or ResponseEntity.ok(books);
        }
        return ResponseEntity.ok(books);
    }

    @GetMapping("/search-by-author")
    public ResponseEntity<List<BookDTO>> searchBooksByAuthor(@RequestParam String authorName) {
        logger.info("Searching for books by author: {}", authorName);
        List<BookDTO> books = bookService.findByAuthorName(authorName);
        if (books.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // Or ResponseEntity.ok(books);
        }
        return ResponseEntity.ok(books);
    }
}
