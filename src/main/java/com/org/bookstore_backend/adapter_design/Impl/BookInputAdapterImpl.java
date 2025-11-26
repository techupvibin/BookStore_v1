package com.org.bookstore_backend.adapter_design.Impl;
import com.org.bookstore_backend.adapter_design.adapter.BookInputAdapter;
import com.org.bookstore_backend.dto.BookCreationDTO;
import com.org.bookstore_backend.dto.BookDTO;
import com.org.bookstore_backend.dto.BookUpdateDTO;
import com.org.bookstore_backend.model.Author;
import com.org.bookstore_backend.model.Book;
import com.org.bookstore_backend.model.Publisher;
import com.org.bookstore_backend.repo.AuthorRepo;
import com.org.bookstore_backend.repo.PublisherRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Implements the Adapter Design Pattern to convert Data Transfer Objects (DTOs)
 * into Book entities, decoupling the API's data contracts from the JPA model.
 * It also handles the logic for finding or creating related entities like Authors and Publishers.
 */
@Component
public class BookInputAdapterImpl implements BookInputAdapter {

    private final PublisherRepo publisherRepository;
    private final AuthorRepo authorRepository;

    @Autowired
    public BookInputAdapterImpl(PublisherRepo publisherRepository, AuthorRepo authorRepository) {
        this.publisherRepository = publisherRepository;
        this.authorRepository = authorRepository;
    }

    /**
     * Adapts a BookCreationDTO to a new Book entity.
     *
     * @param creationDTO The DTO containing the data for the new book.
     * @param imageUrl    The URL of the book's image.
     * @return A new Book entity populated with data from the DTO.
     */
    @Override
    public Book adaptToNewBookEntity(BookCreationDTO creationDTO, String imageUrl) {
        Book newBook = new Book();
        updateBookEntityFromCreationDTO(newBook, creationDTO, imageUrl);
        return newBook;
    }

    /**
     * Adapts a BookUpdateDTO to an existing Book entity, applying updates selectively.
     *
     * @param updateDTO    The DTO with fields to be updated.
     * @param existingBook The existing Book entity to be updated.
     * @param imageUrl     The new URL for the book's image, if provided.
     * @return The updated existing Book entity.
     */
    @Override
    public Book adaptToExistingBookEntity(BookUpdateDTO updateDTO, Book existingBook, String imageUrl) {
        updateBookEntityFromUpdateDTO(existingBook, updateDTO, imageUrl);
        return existingBook;
    }

    /**
     * @deprecated BookDTO is an output DTO and should not be used for input. This method
     * is a stub to fulfill the interface contract but is not intended for use.
     */
    @Override
    @Deprecated
    public Book adaptToNewBookEntity(BookDTO bookDTO) {
        // BookDTO is an output DTO, so this method should not be used for creation.
        // It returns null to satisfy the interface, but should ideally be removed.
        return null;
    }

    /**
     * @deprecated BookDTO is an output DTO and should not be used for input. This method
     * is a stub to fulfill the interface contract but is not intended for use.
     */
    @Override
    @Deprecated
    public Book adaptToExistingBookEntity(BookDTO bookDTO, Book existingBook) {
        // BookDTO is an output DTO, so this method should not be used for updating.
        // It returns null to satisfy the interface, but should ideally be removed.
        return null;
    }

    // --- Private helper methods for clearer logic separation ---

    private void updateBookEntityFromCreationDTO(Book book, BookCreationDTO dto, String imageUrl) {
        book.setTitle(dto.getTitle());
        book.setDescription(dto.getDescription());
        book.setIsbn(dto.getIsbn());
        book.setPublicationYear(dto.getPublicationYear());
        book.setGenre(dto.getGenre());
        book.setPrice(dto.getPrice());
        book.setQuantity(dto.getQuantity());
        book.setIsAvailable(dto.isAvailable());
        book.setPublisher(findOrCreatePublisher(dto.getPublisher()));
        book.setAuthors(findOrCreateAuthors(dto.getAuthors()));
        book.setImageUrl(imageUrl);
    }

    private void updateBookEntityFromUpdateDTO(Book book, BookUpdateDTO dto, String imageUrl) {
        if (dto.getTitle() != null) book.setTitle(dto.getTitle());
        if (dto.getDescription() != null) book.setDescription(dto.getDescription());
        if (dto.getIsbn() != null) book.setIsbn(dto.getIsbn());
        if (dto.getPublicationYear() != null) book.setPublicationYear(dto.getPublicationYear());
        if (dto.getGenre() != null) book.setGenre(dto.getGenre());
        if (dto.getPrice() != null) book.setPrice(dto.getPrice());
        if (dto.getQuantity() != null) book.setQuantity(dto.getQuantity());
        if (dto.getIsAvailable() != null) book.setIsAvailable(dto.getIsAvailable());
        if (dto.getPublisher() != null) book.setPublisher(findOrCreatePublisher(dto.getPublisher()));
        if (dto.getAuthors() != null) book.setAuthors(findOrCreateAuthors(dto.getAuthors()));

        book.setImageUrl(imageUrl);
    }

    /**
     * Finds an existing publisher by name or creates a new one if it doesn't exist.
     *
     * @param publisherName The name of the publisher.
     * @return The existing or newly created Publisher entity.
     */
    private Publisher findOrCreatePublisher(String publisherName) {
        return publisherRepository.findByName(publisherName)
                .orElseGet(() -> {
                    Publisher newPublisher = new Publisher();
                    newPublisher.setName(publisherName);
                    return publisherRepository.save(newPublisher);
                });
    }

    /**
     * Finds a set of existing authors by name or creates new ones if they don't exist.
     * This method now correctly takes a Set<String> as input.
     *
     * @param authorNames The set of author names.
     * @return A set of existing or newly created Author entities.
     */
    private Set<Author> findOrCreateAuthors(Set<String> authorNames) {
        if (authorNames == null || authorNames.isEmpty()) {
            return new HashSet<>();
        }
        return authorNames.stream()
                .map(String::trim)
                .filter(name -> !name.isEmpty())
                .map(name -> authorRepository.findByName(name)
                        .orElseGet(() -> {
                            Author newAuthor = new Author();
                            newAuthor.setName(name);
                            return authorRepository.save(newAuthor);
                        }))
                .collect(Collectors.toSet());
    }
}