package com.org.bookstore_backend.dto;
import com.org.bookstore_backend.model.Author;
import lombok.Builder;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@NoArgsConstructor

public class AuthorMapper {

    public static AuthorDTO toDTO(Author author) {
        if (author == null) return null;
        return AuthorDTO.builder()
                .id(author.getId())
                .name(author.getName())
                .build();
    }

    public static Author toEntity(AuthorDTO dto) {
        if (dto == null) return null;
        Author author = new Author();
        author.setId(dto.getId());// ID might be null for creation
        author.setName(dto.getName());
        return author;
    }

    public static void updateEntityFromDTO(AuthorDTO authorDto, Author existingAuthor) {
        if (authorDto == null || existingAuthor == null) {
            return; // No update needed if DTO or existing entity is null
        }
        // Update only the fields that are present in the DTO
        if (authorDto.getName() != null) {
            existingAuthor.setName(authorDto.getName());
        }
        // Note: ID is not updated here, as it should remain unchanged for existing entities
    }
}