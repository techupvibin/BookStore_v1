package com.org.bookstore_backend.repo;
import com.org.bookstore_backend.model.Book;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface BookRepo extends JpaRepository<Book, Long> {

    // Fetch all books with authors and publisher eagerly to avoid N+1 problem
    @EntityGraph(attributePaths = {"authors", "publisher"})
    List<Book> findAll();

    // Existing methods and their updates for consistency:

    List<Book> findByPublisher_Name(String name); // Finds by publisher name
    List<Book> findByAuthors_Name(String name);   // Finds by author name

    List<Book> findByTitleContainingIgnoreCase(String title); // Finds by title (case-insensitive)
    List<Book> findByGenreIgnoreCase(String genre);           // Finds by genre (case-insensitive)
    List<Book> findByIsAvailable(boolean isAvailable);        // Finds by availability

    List<Book> findByPublicationYear(int publicationYear);
    List<Book> findByPriceBetween(double minPrice, double maxPrice);
    List<Book> findByQuantityGreaterThan(int quantity);
    List<Book> findByIsbn(String isbn);
    List<Book> findByImageUrl(String imageUrl);

    // ⭐ CORRECTED METHOD NAME: This method now explicitly reflects the OR logic for search by title OR author name.
    // This is used when only 'search' parameter is provided in getAllBooks.
    List<Book> findByTitleContainingIgnoreCaseOrAuthors_NameContainingIgnoreCase(String titleSearch, String authorNameSearch);


    // Combined search methods (ensure these are present and match your service calls)
    List<Book> findByTitleContainingIgnoreCaseAndPublisher_NameContainingIgnoreCase(String title, String publisherName);
    List<Book> findByTitleContainingIgnoreCaseAndGenre(String title, String genre);
    List<Book> findByTitleContainingIgnoreCaseAndPublicationYear(String title, int publicationYear);
    List<Book> findByTitleContainingIgnoreCaseAndPrice(String title, double price);
    List<Book> findByTitleContainingIgnoreCaseAndQuantity(String title, int quantity);


    // ⭐ NEW METHOD REQUIRED FOR getAllBooks FILTERING (from BookServiceImpl):
    // This method handles cases where both category AND a search term (for title OR author name) are present.
    List<Book> findByGenreIgnoreCaseAndTitleContainingIgnoreCaseOrGenreIgnoreCaseAndAuthors_NameContainingIgnoreCase(
            String genreForTitle, String titleSearch, String genreForAuthor, String authorNameSearch);

    //Collection<Object> findByTitleContainingIgnoreCaseAndAuthors_NameContainingIgnoreCase(String title, String authorName);

    List<Book> findByTitleContainingIgnoreCaseAndAuthors_NameContainingIgnoreCase(String title, String authorName);
}
