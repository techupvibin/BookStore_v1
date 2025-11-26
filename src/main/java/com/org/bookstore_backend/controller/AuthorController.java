package com.org.bookstore_backend.controller;

import com.org.bookstore_backend.dto.AuthorDTO;
import com.org.bookstore_backend.services.AuthorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/authors")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthorController {

    @Autowired
    private AuthorService authorService;

    //@PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping(path = "/save")
    public ResponseEntity<String> saveAuthor(@RequestBody AuthorDTO authorDTO) {
        String authorName = authorService.addAuthor(authorDTO);
        return ResponseEntity.ok("Author '" + authorName + "' added successfully");
    }
    //@PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping(path = "/getAllAuthor")
    public ResponseEntity<List<AuthorDTO>> getAllAuthor() {
        List<AuthorDTO> authors = authorService.getAllAuthor();
        return ResponseEntity.ok(authors);
    }

    //@PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping(path = "/update")
    public ResponseEntity<String> updateAuthor(@RequestBody AuthorDTO authorDTO) {
        String responseMessage = String.valueOf(authorService.updateAuthor(authorDTO.getId(), authorDTO));
        return ResponseEntity.ok(responseMessage);
    }
    //@PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping(path = "/delete/{id}")
    public ResponseEntity<String> deleteAuthor(@PathVariable(value = "id") Long id) {
        String deletedAuthorName = authorService.deleteAuthor(id);
        return ResponseEntity.ok("Author '" + deletedAuthorName + "' deleted successfully");
    }
}
