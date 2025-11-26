package com.org.bookstore_backend.services.impl;

import com.org.bookstore_backend.dto.CategoryDTO;
import com.org.bookstore_backend.exception.DuplicateResourceException;
import com.org.bookstore_backend.exception.ResourceNotFoundException;
import com.org.bookstore_backend.model.Category;
import com.org.bookstore_backend.repo.CategoryRepository; // Assuming this is the correct repository package
import com.org.bookstore_backend.services.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Autowired // Good practice: constructor injection
    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // ⭐ Create Category: Ensures no duplicate names before saving.
    @Override
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        if (categoryRepository.existsByName(categoryDTO.getName())) {
            throw new DuplicateResourceException("Category with name '" + categoryDTO.getName() + "' already exists.");
        }
        Category category = Category.builder()
                .name(categoryDTO.getName())
                .build();
        Category savedCategory = categoryRepository.save(category);
        return convertToDTO(savedCategory);
    }

    // ⭐ Get All Categories: Retrieves all categories and converts them to DTOs.
    @Override
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ⭐ Get Category by ID: Finds a category by its ID or throws a not-found exception.
    @Override
    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
        return convertToDTO(category);
    }

    // ⭐ Update Category: Updates an existing category, checking for duplicate names.
    @Override
    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO) {
        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));

        // Check for duplicate name only if the name is changing
        if (!existingCategory.getName().equals(categoryDTO.getName()) && categoryRepository.existsByName(categoryDTO.getName())) {
            throw new DuplicateResourceException("Category with name '" + categoryDTO.getName() + "' already exists.");
        }

        existingCategory.setName(categoryDTO.getName());
        Category updatedCategory = categoryRepository.save(existingCategory);
        return convertToDTO(updatedCategory);
    }

    // ⭐ Delete Category: Deletes a category by ID after ensuring it exists.
    @Override
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with ID: " + id);
        }
        categoryRepository.deleteById(id);
    }

    // Helper method to convert Entity to DTO: Essential for decoupling layers.
    private CategoryDTO convertToDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .build();
    }

    // ⭐ Find or create category by name: A useful utility method.
    @Override
    public Category findOrCreateCategory(String categoryName) {
        return categoryRepository.findByName(categoryName)
                .orElseGet(() -> categoryRepository.save(Category.builder().name(categoryName).build()));
    }
}
