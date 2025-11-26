package com.org.bookstore_backend.services.impl;
import com.org.bookstore_backend.adapter_design.adapter.BookInputAdapter;
import com.org.bookstore_backend.dto.*;
import com.org.bookstore_backend.model.Author;
import com.org.bookstore_backend.model.Book;
import com.org.bookstore_backend.model.Publisher;
import com.org.bookstore_backend.repo.AuthorRepo;
import com.org.bookstore_backend.repo.BookRepo;
import com.org.bookstore_backend.repo.PublisherRepo;
import com.org.bookstore_backend.services.BookService;
import com.org.bookstore_backend.services.S3Service;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookServiceImpl implements BookService {
    //injecting S3Service to handle file uploads
    private final S3Service s3Service;

    private final BookRepo bookRepository;
    private final BookMapper bookMapper; // Assuming BookMapper is correctly configured
    private final BookInputAdapter bookInputAdapter;
    private final PublisherRepo publisherRepository;
    private final AuthorRepo authorRepository;


    private static final Logger logger = LoggerFactory.getLogger(BookServiceImpl.class);

    @Autowired
    public BookServiceImpl(
            BookRepo bookRepository,
            BookMapper bookMapper,
            BookInputAdapter bookInputAdapter,
            PublisherRepo publisherRepository,
            AuthorRepo authorRepository,
            S3Service s3Service) {
        this.bookRepository = bookRepository;
        this.bookMapper = bookMapper;
        this.bookInputAdapter = bookInputAdapter;
        this.publisherRepository = publisherRepository;
        this.authorRepository = authorRepository;
        this.s3Service = s3Service;
    }

    // --- Book CRUD Operations with File Upload ---

    // Removed the unimplemented saveBook(BookDTO book) method, as createBook and updateBook cover the needs.

    @Override
    public BookDTO saveBook(BookDTO book) {
        return null;
    }

    @Override
    public BookDTO createBook(BookCreationDTO bookCreationDTO, MultipartFile imageFile) throws IOException {
        logger.info("Attempting to create a new book: {}", bookCreationDTO.getTitle());

        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            imageUrl = s3Service.uploadFile(imageFile);
            logger.info("Image uploaded to S3. URL: {}", imageUrl);
        } else {
            logger.warn("No image file provided for the new book.");
        }

        Book book = bookInputAdapter.adaptToNewBookEntity(bookCreationDTO, imageUrl);
        Book savedBook = bookRepository.save(book);
        logger.info("Successfully created book with ID: {}", savedBook.getId());

        return bookMapper.toDTO(savedBook);
    }

    @Override
    public BookDTO updateBook(Long id, BookUpdateDTO bookUpdateDTO, MultipartFile newImageFile) throws IOException {
        logger.info("Attempting to update book with ID: {}", id);

        Book existingBook = bookRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Book not found with ID: " + id));

        String newImageUrl = existingBook.getImageUrl();
        if (newImageFile != null && !newImageFile.isEmpty()) {
            // Delete old image from S3 if it exists and is different (optional, but good practice)
            // if (existingBook.getImageUrl() != null && !existingBook.getImageUrl().isEmpty()) {
            //     s3Service.deleteFile(existingBook.getImageUrl()); // Implement S3Service.deleteFile
            // }
            newImageUrl = s3Service.uploadFile(newImageFile);
            logger.info("New image uploaded to S3. URL: {}", newImageUrl);
        } else if (bookUpdateDTO.isRemoveImage()) { // Assuming BookUpdateDTO has a boolean isRemoveImage()
            // if image is explicitly requested to be removed
            // if (existingBook.getImageUrl() != null && !existingBook.getImageUrl().isEmpty()) {
            //     s3Service.deleteFile(existingBook.getImageUrl());
            // }
            newImageUrl = null;
        }


        Book updatedBook = bookInputAdapter.adaptToExistingBookEntity(bookUpdateDTO, existingBook, newImageUrl);
        Book savedBook = bookRepository.save(updatedBook);
        logger.info("Successfully updated book with ID: {}", savedBook.getId());

        return bookMapper.toDTO(savedBook);
    }

    // ⭐ Implementation for filtering books based on category and search term
    @Override
    public List<BookDTO> getAllBooks(String category, String search) {
        logger.info("Fetching books with category: '{}', search: '{}'", category, search);
        List<Book> books;

        boolean hasCategory = category != null && !category.trim().isEmpty();
        boolean hasSearch = search != null && !search.trim().isEmpty();

        if (hasCategory && hasSearch) {
            // Search by category AND (title OR author name)
            books = bookRepository.findByGenreIgnoreCaseAndTitleContainingIgnoreCaseOrGenreIgnoreCaseAndAuthors_NameContainingIgnoreCase(
                    category, search, category, search
            );
        } else if (hasCategory) {
            // Search by category only
            books = bookRepository.findByGenreIgnoreCase(category);
        } else if (hasSearch) {
            // Search by title OR author name
            books = bookRepository.findByTitleContainingIgnoreCaseOrAuthors_NameContainingIgnoreCase(search, search);
        } else {
            // No filters, return all books
            books = bookRepository.findAll();
        }

        return books.stream()
                .map(bookMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookDTO> getAllBooks() {

        return bookRepository.findAll()
                .stream()
                .map(bookMapper::toDTO)
                .collect(Collectors.toList());
    }

    // --- Book Retrieval Methods ---

    // Original getAllBooks without parameters is now replaced by the one above.
    // If you specifically need one that always returns all books without filtering,
    // you might rename the above to something like 'getFilteredBooks' and keep a 'getAllBooks()'
    // that just calls bookRepository.findAll(). However, the current setup is more flexible.

    @Override
    public BookDTO getBookById(Long id) {
        return bookRepository.findById(id)
                .map(bookMapper::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Book not found with ID: " + id));
    }

    // --- Book Deletion ---

    @Override
    public void deleteBook(Long id) {
        if (!bookRepository.existsById(id)) {
            throw new EntityNotFoundException("Book not found with ID: " + id);
        }
        // ⭐ Optional: Delete image from S3 when book is deleted
        // Book book = bookRepository.findById(id).get();
        // if (book.getImageUrl() != null && !book.getImageUrl().isEmpty()) {
        //     s3Service.deleteFile(book.getImageUrl());
        // }
        bookRepository.deleteById(id);
        logger.info("Deleted book with ID: {}", id);
    }

    @Override
    public BookDTO updateBook(UUID id, BookUpdateDTO bookUpdateDTO, MultipartFile newImageFile) throws IOException {
        return null;
    }

    @Override
    public void deleteBook(UUID id) {

    }

    @Override
    public Optional<BookDTO> findBookById(UUID id) {
        return Optional.empty();
    }

    @Override
    public List<BookDTO> searchAndFilterBooks(String searchTerm, String categoryName, String authorName, String publisherName) {
        return List.of();
    }

    // --- Search and Filtering Methods (Consider consolidating into getAllBooks) ---

    // The methods below are now mostly covered by the new getAllBooks method.
    // You might keep them if they serve very specific, distinct use cases not covered
    // by the general filtering, or if other parts of your application explicitly call them.
    // However, for efficiency and maintainability, consolidating into the single getAllBooks
    // with parameters is often better.

    @Override
    public List<BookDTO> findByPublisherName(String publisherName) {
        return bookRepository.findByPublisher_Name(publisherName)
                .stream()
                .map(bookMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookDTO> findByAuthorName(String authorName) {
        return bookRepository.findByAuthors_Name(authorName)
                .stream().map(bookMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<BookDTO> findByTitleContaining(String title) {
        return bookRepository.findByTitleContainingIgnoreCase(title)
                .stream().map(bookMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<BookDTO> findByGenre(String genre) {
        return bookRepository.findByGenreIgnoreCase(genre)
                .stream().map(bookMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<BookDTO> findByIsAvailable(boolean isAvailable) {
        return bookRepository.findByIsAvailable(isAvailable)
                .stream().map(bookMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<BookDTO> findByPublicationYear(int publicationYear) {
        return bookRepository.findByPublicationYear(publicationYear)
                .stream().map(bookMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<BookDTO> findByPriceBetween(double minPrice, double maxPrice) {
        return bookRepository.findByPriceBetween(minPrice, maxPrice)
                .stream().map(bookMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<BookDTO> findByQuantityGreaterThan(int quantity) {
        return bookRepository.findByQuantityGreaterThan(quantity)
                .stream().map(bookMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<BookDTO> findByIsbn(String isbn) {
        return bookRepository.findByIsbn(isbn)
                .stream().map(bookMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<BookDTO> findByImageUrl(String imageUrl) {
        return bookRepository.findByImageUrl(imageUrl)
                .stream().map(bookMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<BookDTO> findByTitleAndAuthorName(String title, String authorName) {
        return bookRepository.findByTitleContainingIgnoreCaseAndAuthors_NameContainingIgnoreCase(title, authorName)
                .stream().map(bookMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<BookDTO> findByTitleAndPublisherName(String title, String publisherName) {
        return bookRepository.findByTitleContainingIgnoreCaseAndPublisher_NameContainingIgnoreCase(title, publisherName)
                .stream().map(bookMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<BookDTO> findByTitleAndGenre(String title, String genre) {
        return bookRepository.findByTitleContainingIgnoreCaseAndGenre(title, genre)
                .stream().map(bookMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<BookDTO> findByTitleAndPublicationYear(String title, int publicationYear) {
        return bookRepository.findByTitleContainingIgnoreCaseAndPublicationYear(title, publicationYear)
                .stream().map(bookMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<BookDTO> findByTitleAndPrice(String title, double price) {
        return bookRepository.findByTitleContainingIgnoreCaseAndPrice(title, price)
                .stream().map(bookMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<BookDTO> findByTitleAndQuantity(String title, int quantity) {
        return bookRepository.findByTitleContainingIgnoreCaseAndQuantity(title, quantity)
                .stream().map(bookMapper::toDTO).collect(Collectors.toList());
    }

    // --- Methods for managing related entities ---

    @Override
    public List<PublisherDTO> getAllPublishers() {
        return publisherRepository.findAll()
                .stream().map(PublisherMapper::toDTO).collect(Collectors.toList()); // Assuming PublisherMapper exists
    }

    @Override
    public PublisherDTO createPublisher(PublisherDTO dto) {
        Publisher publisher = PublisherMapper.toEntity(dto); // Assuming PublisherMapper exists
        Publisher savedPublisher = publisherRepository.save(publisher);
        return PublisherMapper.toDTO(savedPublisher);
    }

    @Override
    public List<AuthorDTO> getAllAuthors() {
        return authorRepository.findAll()
                .stream().map(AuthorMapper::toDTO).collect(Collectors.toList()); // Assuming AuthorMapper exists
    }

    @Override
    public AuthorDTO createAuthor(AuthorDTO dto) {
        Author author = AuthorMapper.toEntity(dto); // Assuming AuthorMapper exists
        Author savedAuthor = authorRepository.save(author);
        return AuthorMapper.toDTO(savedAuthor);
    }

    @Override
    public List<String> getBookSuggestions(String query) {
        return List.of();
    }

    @Override
    public List<String> getAllGenres() {
        return bookRepository.findAll()
                .stream()
                .map(Book::getGenre)
                .distinct() // Ensure only unique genres are returned
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> importBooksFromCsv(org.springframework.web.multipart.MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("Empty file");
        }
        int created = 0;
        int updated = 0;
        int failed = 0;

        try (var reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            var csvFormat = org.apache.commons.csv.CSVFormat.DEFAULT
                    .withHeader("title", "description", "isbn", "publicationYear", "genre", "price", "quantity", "isAvailable", "publisher", "authors")
                    .withSkipHeaderRecord();
            for (var record : csvFormat.parse(reader)) {
                try {
                    String title = record.get("title").trim();
                    String description = record.get("description").trim();
                    String isbn = record.get("isbn").trim();
                    int publicationYear = Integer.parseInt(record.get("publicationYear").trim());
                    String genre = record.get("genre").trim();
                    double price = Double.parseDouble(record.get("price").trim());
                    int quantity = Integer.parseInt(record.get("quantity").trim());
                    boolean isAvailable = Boolean.parseBoolean(record.get("isAvailable").trim());
                    String publisherName = record.get("publisher").trim();
                    String authorsCsv = record.get("authors");

                    Publisher publisher = publisherRepository.findByName(publisherName)
                            .orElseGet(() -> publisherRepository.save(Publisher.builder().name(publisherName).build()));

                    List<Author> authors = java.util.Arrays.stream(authorsCsv.split(","))
                            .map(String::trim)
                            .filter(s -> !s.isEmpty())
                            .map(name -> authorRepository.findByName(name)
                                    .orElseGet(() -> authorRepository.save(Author.builder().name(name).build())))
                            .collect(Collectors.toList());

                    Optional<Book> existing = (isbn != null && !isbn.isBlank())
                            ? bookRepository.findByIsbn(isbn).stream().findFirst()
                            : Optional.empty();

                    Book book = existing.orElseGet(Book::new);
                    book.setTitle(title);
                    book.setDescription(description);
                    book.setIsbn(isbn);
                    book.setPublicationYear(publicationYear);
                    book.setGenre(genre);
                    book.setPrice(price);
                    book.setQuantity(quantity);
                    book.setIsAvailable(isAvailable);
                    book.setPublisher(publisher);
                    book.setAuthors(new java.util.HashSet<>(authors));

                    boolean isNew = book.getId() == null;
                    bookRepository.save(book);
                    if (isNew) created++; else updated++;
                } catch (Exception rowEx) {
                    logger.warn("Failed to import CSV row: {}", rowEx.getMessage());
                    failed++;
                }
            }
        }

        return java.util.Map.of(
                "created", created,
                "updated", updated,
                "failed", failed
        );
    }
}