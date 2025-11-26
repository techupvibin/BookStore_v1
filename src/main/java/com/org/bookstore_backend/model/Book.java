package com.org.bookstore_backend.model;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Builder
@Entity
@Table(name = "books")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is mandatory")
    @Column(name = "book_title", length = 255, nullable = false)
    private String title;

//    @Lob and TEXT both are use for large text.
//    @Column(columnDefinition = "TEXT",length = 500,nullable = false)
//    private String description;
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @NotBlank(message = "ISBN is mandatory")
    @Column(name = "isbn", length = 50, unique = true, nullable = false)
    private String isbn;

    @Min(value = 1400, message = "Publication year must be after 1400")
    @Column(name = "publication_year", nullable = false)
    private Integer publicationYear;

    // ✅ REVISED: Removed @Lob. Storing a URL as a standard String.
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @NotBlank(message = "Genre is mandatory")
    @Column(name = "genre", length = 100, nullable = false)
    private String genre;

    @Min(value = 0, message = "Price cannot be negative")
    @Column(name = "price", nullable = false)
    private double price;

    @Min(value = 0, message = "Quantity cannot be negative")
    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "is_available", nullable = true)
    private boolean isAvailable;

    @ManyToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "publisher_id", nullable = false)
    private Publisher publisher;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(name = "book_authors",
            joinColumns = @JoinColumn(name = "book_id"),
            inverseJoinColumns = @JoinColumn(name = "author_id"))
    @Builder.Default
    private Set<Author> authors = new HashSet<>();

    public Book(Long bookId) {
        this.id = bookId;
    }

    public void setIsAvailable(boolean available) {
        this.isAvailable = available;
    }

    public String getBookTitle() {
        return this.title;
    }
}