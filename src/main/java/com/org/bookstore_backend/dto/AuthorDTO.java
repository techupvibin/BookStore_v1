package com.org.bookstore_backend.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
/**
 * Data Transfer Object for Author.
 * Contains basic info like author ID and name.
 */

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class AuthorDTO {

    // ✅ Optional: Custom getter if needed
    private Long id;
    @NotBlank(message = "Author name is mandatory")
    private String name;

}