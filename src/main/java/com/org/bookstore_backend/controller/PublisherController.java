package com.org.bookstore_backend.controller;
import com.org.bookstore_backend.dto.PublisherDTO;
import com.org.bookstore_backend.services.PublisherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/publishers")
@CrossOrigin(origins = "http://localhost:3000")
public class PublisherController {

    @Autowired
    private PublisherService publisherService;

    @PostMapping(path = "/save")
    public ResponseEntity<String> savePublisher(@RequestBody PublisherDTO publisherDTO) {
        publisherService.createPublisher(publisherDTO);
        return ResponseEntity.ok("Added Successfully");
    }

    @GetMapping(path = "/getAllPublisher")
    public ResponseEntity<List<PublisherDTO>> getAllPublisher() {
        List<PublisherDTO> allPublishers = publisherService.getAllPublishers();
        return ResponseEntity.ok(allPublishers);
    }

    @PutMapping(path = "/update")
    public ResponseEntity<String> updatePublisher(@RequestBody PublisherDTO publisherDTO) {
        String publisherName = String.valueOf(publisherService.updatePublisher(publisherDTO));
        return ResponseEntity.ok(publisherName);
    }

    @DeleteMapping(path = "/delete/{id}")
    public ResponseEntity<String> deletePublisher(@PathVariable(value = "id") Long id) {
        publisherService.deletePublisher(id);
        return ResponseEntity.ok("Deleted successfully");
    }
}