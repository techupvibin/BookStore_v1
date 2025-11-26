package com.org.bookstore_backend.controller;

import com.org.bookstore_backend.dto.CategoryDTO;
import com.org.bookstore_backend.exception.ResourceNotFoundException;
import com.org.bookstore_backend.exception.DuplicateResourceException;
import com.org.bookstore_backend.services.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    @Autowired
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    /**
     * Creates a new category.
     * Accessible only by users with 'ADMIN' role.
     * @param categoryDTO The CategoryDTO containing the name of the new category.
     * @return ResponseEntity with the created CategoryDTO and HTTP status.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryDTO> createCategory(@Valid @RequestBody CategoryDTO categoryDTO) {
        try {
            CategoryDTO createdCategory = categoryService.createCategory(categoryDTO);
            return new ResponseEntity<>(createdCategory, HttpStatus.CREATED);
        } catch (DuplicateResourceException e) {
            return new ResponseEntity<>(HttpStatus.CONFLICT); // 409 Conflict
        }
    }

    /**
     * Retrieves all categories.
     * Accessible to ALL users (authenticated or unauthenticated).
     * @return ResponseEntity with a list of CategoryDTOs and HTTP status.
     */
    @GetMapping
    @PreAuthorize("permitAll()") // ⭐ CHANGE: Allow all users to access this endpoint
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        List<CategoryDTO> categories = categoryService.getAllCategories();
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    /**
     * Retrieves a category by its ID.
     * Accessible to all authenticated users.
     * @param id The ID of the category to retrieve.
     * @return ResponseEntity with the CategoryDTO and HTTP status.
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()") // Keep this for authenticated users
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable Long id) {
        try {
            CategoryDTO category = categoryService.getCategoryById(id);
            return new ResponseEntity<>(category, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Updates an existing category.
     * Accessible only by users with 'ADMIN' role.
     * @param id The ID of the category to update.
     * @param categoryDTO The CategoryDTO with updated information.
     * @return ResponseEntity with the updated CategoryDTO and HTTP status.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryDTO> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryDTO categoryDTO) {
        try {
            CategoryDTO updatedCategory = categoryService.updateCategory(id, categoryDTO);
            return new ResponseEntity<>(updatedCategory, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (DuplicateResourceException e) {
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }
    }

    /**
     * Deletes a category by its ID.
     * Accessible only by users with 'ADMIN' role.
     * @param id The ID of the category to delete.
     * @return ResponseEntity with HTTP status indicating success or failure.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content
        } catch (ResourceNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
