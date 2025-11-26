package com.org.bookstore_backend.services;

import com.org.bookstore_backend.dto.AuthorDTO;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public interface AuthorService {

    String addAuthor(AuthorDTO authorDTO);

    List<AuthorDTO> getAllAuthor();

    List<AuthorDTO> getAllAuthors();
    AuthorDTO getAuthorById(Long id);
    AuthorDTO createAuthor(AuthorDTO authorDto);
    AuthorDTO updateAuthor(Long id, AuthorDTO authorDto);
    String deleteAuthor(Long id);

}