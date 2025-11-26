package com.org.bookstore_backend.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

@Data
public class BookUpdateDTO {

    private String title;
    private String description;
    private String isbn;

    @Min(value = 1400, message = "Publication year must be after 1400")
    private Integer publicationYear;

    private String genre;

    @Min(value = 0, message = "Price cannot be negative")
    private Double price;

    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;

    private Boolean isAvailable;

    private String publisher;

    private Set<String> authors; // Support multiple authors

    private MultipartFile imageFile; // Optional new image

    // Indicates if the existing image should be removed
    private Boolean removeImage;

    // Convenience method for service checks
    public boolean isRemoveImage() {
        return Boolean.TRUE.equals(removeImage);
    }
}
