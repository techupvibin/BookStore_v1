package com.org.bookstore_backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "authors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Author {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Author name is mandatory")
    @Column(name = "author_name", length = 255, nullable = false)
    private String name;

    // Optional: Many-to-Many relationship with Book, if you want to navigate from Author to Books
    @ManyToMany(mappedBy = "authors", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Book> books = new HashSet<>();

    // For ManyToMany relationship (Book -> Author), you only need the id and name
    // You might also add a constructor for easy DTO conversion
    public Author(Long id) {
        this.id = id;
    }
}