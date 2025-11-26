package com.org.bookstore_backend.services;

import com.org.bookstore_backend.dto.PublisherDTO;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public interface PublisherService {

        /**
         * Creates a new publisher from DTO.
         * @param publisherDto The DTO containing the publisher's details.
         * @return The created PublisherDTO with its generated ID.
         */
        @Transactional
        PublisherDTO createPublisher(PublisherDTO publisherDto);

        /**
         * Updates an existing publisher by ID using a DTO.
         *
         * @param publisherDto The DTO containing the updated publisher details.
         * @return The updated PublisherDTO.
         * @throws jakarta.persistence.EntityNotFoundException if the publisher with the given ID is not found.
         */
        @Transactional
        PublisherDTO updatePublisher(PublisherDTO publisherDto); // Ensure it takes Long id

        /**
         * Returns a list of all publishers as DTOs.
         * @return A list of PublisherDTO objects.
         */
        List<PublisherDTO> getAllPublishers();

        /**
         * Fetches a publisher by its ID as a DTO.
         * @param id The ID of the publisher to retrieve.
         * @return The PublisherDTO corresponding to the ID.
         * @throws jakarta.persistence.EntityNotFoundException if the publisher with the given ID is not found.
         */
        PublisherDTO getPublisherById(Long id);

    @Transactional
    PublisherDTO createPublisher(Long id, PublisherDTO publisherDto);

    /**
         * Deletes a publisher by ID.
         * @param id The ID of the publisher to delete.
         * @throws jakarta.persistence.EntityNotFoundException if the publisher with the given ID is not found.
         */
        @Transactional
        void deletePublisher(Long id); // Consistent void return type
    }
