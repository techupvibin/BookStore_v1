package com.org.bookstore_backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.ToString;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

@Data
@ToString
public class BookCreationDTO {

   // @NotBlank(message = "Title is mandatory")
    private String title;

    //@NotBlank(message = "Description is mandatory")
    private String description;

   // @NotBlank(message = "ISBN is mandatory")
    private String isbn;

    @Min(value = 1400, message = "Publication year must be after 1400")
    private int publicationYear;

    @NotBlank(message = "Genre is mandatory")
    private String genre;

    @Min(value = 0, message = "Price cannot be negative")
    private double price;

    @Min(value = 0, message = "Quantity cannot be negative")
    private int quantity;

    private boolean isAvailable;

    //@NotBlank(message = "Publisher is mandatory")
    private String publisher; // Single publisher name

    //@NotNull(message = "At least one author is mandatory")
    private Set<@NotBlank(message = "Author name cannot be blank") String> authors; // Multiple authors

    private MultipartFile imageFile; // Optional: can be null if no image is uploaded
}
