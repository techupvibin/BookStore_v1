package com.org.bookstore_backend.dto;

import com.org.bookstore_backend.model.Author;
import com.org.bookstore_backend.model.Book;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class BookMapper {

    /**
     * Converts a Book entity to a BookDTO.
     * This method is used for sending book data to the frontend.
     * @param book The Book entity to convert.
     * @return A BookDTO with consolidated information.
     */
    public BookDTO toDTO(Book book) {
        if (book == null) {
            return null;
        }

        // Correctly handle publisher and authors to prevent NullPointerExceptions
        String publisherName = (book.getPublisher() != null) ? book.getPublisher().getName() : null;
        Set<String> authorNames = (book.getAuthors() != null) ?
                book.getAuthors().stream()
                        .map(Author::getName)
                        .collect(Collectors.toSet())
                : Collections.emptySet();

        return BookDTO.builder()
                .id(book.getId())
                .title(book.getTitle())
                .description(book.getDescription())
                .isbn(book.getIsbn())
                .publicationYear(book.getPublicationYear())
                .imageUrl(book.getImageUrl())
                .genre(book.getGenre())
                .price(book.getPrice())
                .quantity(book.getQuantity())
                .isAvailable(book.isAvailable())
                .publisherName(publisherName) // ✅ Correctly set publisher name
                .authorNames(authorNames)     // ✅ Correctly set author names as a Set<String>
                .build();
    }
}