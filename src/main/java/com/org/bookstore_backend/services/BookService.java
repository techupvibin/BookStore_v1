package com.org.bookstore_backend.services;

import com.org.bookstore_backend.dto.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface BookService {

    // --- CRUD and core operations with UUID as the consistent ID type ---

    BookDTO saveBook(BookDTO book);

    /**
     * Creates a new book and associates it with an image.
     */
    BookDTO createBook(BookCreationDTO bookCreationDTO, MultipartFile imageFile) throws IOException;

    BookDTO updateBook(Long id, BookUpdateDTO bookUpdateDTO, MultipartFile newImageFile) throws IOException;

    // ⭐ Implementation for filtering books based on category and search term
    List<BookDTO> getAllBooks(String category, String search);

    List<BookDTO> getAllBooks();

    BookDTO getBookById(Long id);

    void deleteBook(Long id);

    /**
     * Updates an existing book and its image.
     */
    BookDTO updateBook(UUID id, BookUpdateDTO bookUpdateDTO, MultipartFile newImageFile) throws IOException;

    /**
     * Deletes a book by its UUID.
     */
    void deleteBook(UUID id);

    /**
     * Finds a book by its UUID and returns it as an Optional for safety.
     */
    Optional<BookDTO> findBookById(UUID id);

    // --- Consolidated Search and Filtering ---

    List<BookDTO> searchAndFilterBooks(String searchTerm, String categoryName, String authorName, String publisherName);

    // --- Other methods ---

    List<BookDTO> findByPublisherName(String publisherName);

    List<BookDTO> findByAuthorName(String authorName);

    List<BookDTO> findByTitleContaining(String title);

    List<BookDTO> findByGenre(String genre);

    List<BookDTO> findByIsAvailable(boolean isAvailable);

    List<BookDTO> findByPublicationYear(int publicationYear);

    List<BookDTO> findByPriceBetween(double minPrice, double maxPrice);

    List<BookDTO> findByQuantityGreaterThan(int quantity);

    List<BookDTO> findByIsbn(String isbn);

    List<BookDTO> findByImageUrl(String imageUrl);

    List<BookDTO> findByTitleAndAuthorName(String title, String authorName);

    List<BookDTO> findByTitleAndPublisherName(String title, String publisherName);

    List<BookDTO> findByTitleAndGenre(String title, String genre);

    List<BookDTO> findByTitleAndPublicationYear(String title, int publicationYear);

    List<BookDTO> findByTitleAndPrice(String title, double price);

    List<BookDTO> findByTitleAndQuantity(String title, int quantity);

    List<PublisherDTO> getAllPublishers();

    // ⭐ NEW: Method to get all unique book genres
    List<String> getAllGenres();

    PublisherDTO createPublisher(PublisherDTO publisherDto);

    List<AuthorDTO> getAllAuthors();

    AuthorDTO createAuthor(AuthorDTO authorDto);

    List<String> getBookSuggestions(String query);

    // Bulk CSV import
    Map<String, Object> importBooksFromCsv(MultipartFile file) throws IOException;
}