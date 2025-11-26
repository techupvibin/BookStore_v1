package com.org.bookstore_backend.services.impl;

import com.org.bookstore_backend.dto.PublisherDTO; // Ensure this is the correct package for your Mapper
import com.org.bookstore_backend.dto.PublisherMapper;
import com.org.bookstore_backend.model.Publisher;
import com.org.bookstore_backend.repo.PublisherRepo;
import com.org.bookstore_backend.services.PublisherService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PublisherServiceImpl implements PublisherService {

    // Removed: @Autowired private final PublisherMapper publisherMapper;
    // We are treating PublisherMapper as a static utility class, so no need to inject it.

    private final PublisherRepo publisherRepo;
    private final Logger logger = LoggerFactory.getLogger(PublisherServiceImpl.class);

    // Constructor injection for PublisherRepo.
    // @Autowired on the constructor is good practice when there's more than one constructor
    // or for clarity, though optional for single constructors in recent Spring versions.
    @Autowired
    public PublisherServiceImpl(PublisherRepo publisherRepo) {
        this.publisherRepo = publisherRepo;
    }

    // --- Implementations of PublisherService Interface Methods ---

    @Override
    public List<PublisherDTO> getAllPublishers() {
        logger.info("Fetching all publishers");
        return publisherRepo.findAll()
                .stream()
                .map(PublisherMapper::toDTO) // Using static method from PublisherMapper
                .collect(Collectors.toList());
    }

    @Override
    public PublisherDTO getPublisherById(Long id) { // Matches interface
        logger.info("Fetching publisher by ID: {}", id);
        Publisher publisher = publisherRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Publisher not found with ID: " + id));
        return PublisherMapper.toDTO(publisher); // Using static method
    }

    @Transactional
    @Override
    public PublisherDTO createPublisher(PublisherDTO publisherDto) { // Matches interface
        logger.info("Creating new publisher: {}", publisherDto.getName());
        Publisher publisher = PublisherMapper.toEntity(publisherDto); // Using static method
        Publisher saved = publisherRepo.save(publisher);
        return PublisherMapper.toDTO(saved); // Using static method
    }

    @Override
    public PublisherDTO updatePublisher(PublisherDTO publisherDto) {
        return null;
    }

    @Transactional
    @Override
    public PublisherDTO createPublisher(Long id, PublisherDTO publisherDto) { // Matches interface
        logger.info("Updating publisher with ID: {}", id);
        Publisher existing = publisherRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Publisher not found with ID: " + id));

        // Use the mapper to update the entity fields from DTO
        // Make sure your PublisherMapper.updateEntityFromDto handles all relevant fields (e.g., location if present)
        PublisherMapper.updateEntityFromDto(publisherDto, existing);

        Publisher updated = publisherRepo.save(existing);
        return PublisherMapper.toDTO(updated); // Using static method
    }

    @Transactional
    @Override // THIS IS CRITICAL: Match the interface (void return)
    public void deletePublisher(Long id) {
        logger.info("Deleting publisher with ID: {}", id);
        if (!publisherRepo.existsById(id)) {
            throw new EntityNotFoundException("Publisher not found with ID: " + id);
        }
        publisherRepo.deleteById(id);
        // No return statement needed because the method is void.
    }
    public PublisherDTO updatePublisher(Long id, PublisherDTO updateDTO) {
        Publisher existing = publisherRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Publisher not found with ID: " + id));
        PublisherMapper.updateEntityFromDto(updateDTO, existing);
        Publisher updated = publisherRepo.save(existing);
        return PublisherMapper.toDTO(updated);
    }

    // --- REMOVED OBSOLETE METHODS ---
    // The following methods are no longer part of the clean PublisherService interface
    // and should be deleted from this implementation. If they remain, they indicate
    // that the interface is still inconsistent or that these methods are not intended
    // to be part of the public service contract.

    /*
    @Override
    public Publisher getPublisherById(String id) {
        return null; // This method signature does not match the clean interface
    }

    @Override
    public Publisher savePublisher(Publisher publisher) {
        return null; // This method signature does not match the clean interface
    }

    @Override
    public Publisher updatePublisher(String id, Publisher publisher) {
        return null; // This method signature does not match the clean interface
    }

    @Override
    public String deletePublisher(String id) {
        return ""; // This method signature does not match the clean interface
    }

    @Override
    public Publisher addBooksToPublisher(String publisherId, List<String> bookIds) {
        return null; // This method signature does not match the clean interface
    }

    @Override
    public PublisherDTO addPublisher(PublisherDTO publisherDTO) {
        return null; // This method signature does not match the clean interface
    }

    @Override
    public String updatePublisher(PublisherDTO publisherDTO) {
        return ""; // This method signature does not match the clean interface
    }

    // You had a non-overridden deletePublisher(Long id) that returned String, now it's correctly overridden and void.
    // public String deletePublisher(Long id) { ... } // This was the old one

    @Override
    public String deletePublisher(int id) {
        return ""; // This method signature does not match the clean interface
    }
    */
}