package com.org.bookstore_backend.services;

import com.org.bookstore_backend.dto.CategoryDTO;
import com.org.bookstore_backend.model.Category;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public interface CategoryService {
    // ⭐ Create Category
    CategoryDTO createCategory(CategoryDTO categoryDTO);

    // ⭐ Get All Categories
    List<CategoryDTO> getAllCategories();

    // ⭐ Get Category by ID
    CategoryDTO getCategoryById(Long id);

    // ⭐ Update Category
    CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO);

    // ⭐ Delete Category
    void deleteCategory(Long id);

    // ⭐ Find or create category by name: A useful utility method.
    // Assuming this method is also part of your CategoryService interface
    Category findOrCreateCategory(String categoryName);
}
