package com.org.bookstore_backend.adapter_design.adapter;
import com.org.bookstore_backend.dto.BookCreationDTO;
import com.org.bookstore_backend.dto.BookDTO;
import com.org.bookstore_backend.dto.BookUpdateDTO;
import com.org.bookstore_backend.model.Book;

/**
 * Adapter interface for converting BookDTO (frontend representation with string names)
 * into a Book entity with resolved Publisher and Author entities.
 */
public interface BookInputAdapter {

    Book adaptToNewBookEntity(BookCreationDTO creationDTO, String imageUrl);

    Book adaptToExistingBookEntity(BookUpdateDTO updateDTO, Book existingBook, String imageUrl);

    /**
     * Adapts a BookDTO to a new Book entity, resolving Publisher and Author entities
     * based on their names. New Publisher/Author entities will be created if they don't exist.
     *
     * @param bookDTO The BookDTO from the frontend.
     * @return A new Book entity with resolved relationships.
     */
    Book adaptToNewBookEntity(BookDTO bookDTO);

    /**
     * Adapts a BookDTO to an existing Book entity, resolving and updating
     * Publisher and Author entities based on their names. New Publisher/Author
     * entities will be created if they don't exist.
     *
     * @param bookDTO The BookDTO from the frontend.
     * @param existingBook The existing Book entity to update.
     * @return The updated Book entity with resolved relationships.
     */
    Book adaptToExistingBookEntity(BookDTO bookDTO, Book existingBook);
}