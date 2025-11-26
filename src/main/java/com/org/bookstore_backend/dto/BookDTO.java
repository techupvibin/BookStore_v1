package com.org.bookstore_backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookDTO {
    private Long id;

    @NotBlank(message = "Title is mandatory")
    private String title;

    @NotBlank(message = "Description is mandatory")
    private String description;

    @NotBlank(message = "ISBN is mandatory")
    private String isbn;

    @Min(value = 1400, message = "Publication year must be after 1400")
    private int publicationYear;

    private String imageUrl;

    @NotBlank(message = "Genre is mandatory")
    private String genre;

    @Min(value = 0, message = "Price cannot be negative")
    private double price;

    @Min(value = 0, message = "Quantity cannot be negative")
    private int quantity;

    private boolean isAvailable;

    @NotNull(message = "Publisher is mandatory")
    private String publisherName; // 1. Renamed for clarity

    @NotNull(message = "At least one author is mandatory")
    private Set<String> authorNames; // 2. Changed to a Set for a better data model


}