package com.org.bookstore_backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "publishers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Publisher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //@NotBlank(message = "Publisher name is mandatory")
    @Column(name = "publisher_name", length = 255, nullable = false, unique = true)
    private String name;

    @Column(name = "location", length = 255) // Added location field
    private String location;
    // Optional: One-to-Many relationship with Book, if you want to navigate from Publisher to Books
    // Consider eager loading if you frequently need publisher's books, but usually lazy is better for performance.
    // DTOs will handle what data to expose.
    @OneToMany(mappedBy = "publisher", cascade = CascadeType.ALL, orphanRemoval = true ,fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Book> books = new HashSet<>();

    // For ManyToOne relationship (Book -> Publisher), you only need the id and name
    // You might also add a constructor for easy DTO conversion
    public Publisher(Long id) {
        this.id = id;
    }
}