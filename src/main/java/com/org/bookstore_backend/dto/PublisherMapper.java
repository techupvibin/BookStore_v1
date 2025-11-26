package com.org.bookstore_backend.dto;

import com.org.bookstore_backend.model.Publisher;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@NoArgsConstructor
public class PublisherMapper {



    // Using static methods is fine if you prefer not to inject the mapper
    // If you inject, you'd make these non-static. For now, let's keep them static
    // for consistency with your service's current usage of PublisherMapper::toDTO
    public static PublisherDTO toDTO(Publisher publisher) { // Use toDTO to match your code
        if (publisher == null) {
            return null;
        }
        return PublisherDTO.builder()
                .id(publisher.getId())
                .name(publisher.getName())
                .location(publisher.getLocation()) // Map location
                .build();
    }

    public static Publisher toEntity(PublisherDTO publisherDto) {
        if (publisherDto == null) {
            return null;
        }
        return Publisher.builder()
                .id(publisherDto.getId()) // ID might be null for creation
                .name(publisherDto.getName())
                .location(publisherDto.getLocation()) // Map location
                .build();
    }

    public static void updateEntityFromDto(PublisherDTO publisherDto, Publisher publisher) {
        if (publisherDto.getName() != null && !publisherDto.getName().trim().isEmpty()) {
            publisher.setName(publisherDto.getName());
        }
        // Only update location if it's provided in the DTO
        if (publisherDto.getLocation() != null) {
            publisher.setLocation(publisherDto.getLocation());
        }
    }
}