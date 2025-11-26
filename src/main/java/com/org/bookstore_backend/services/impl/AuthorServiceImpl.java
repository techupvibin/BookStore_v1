package com.org.bookstore_backend.services.impl;
import com.org.bookstore_backend.dto.AuthorDTO;
import com.org.bookstore_backend.dto.AuthorMapper;
import com.org.bookstore_backend.model.Author;
import com.org.bookstore_backend.repo.AuthorRepo;
import com.org.bookstore_backend.services.AuthorService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthorServiceImpl implements AuthorService {

    @Autowired
    private AuthorRepo authorRepo;

    @Autowired
    private AuthorMapper authorMapper;

    @Override
    public String addAuthor(AuthorDTO authorDTO) {

        Author author = new Author();
        author.setName(authorDTO.getName());
        authorRepo.save(author);
        return author.getName();

    }

    @Override
    public List<AuthorDTO> getAllAuthor() {

        List<Author> getAuthors = authorRepo.findAll();
        List<AuthorDTO> authorDTOList = new ArrayList<>();

        for (Author author : getAuthors) {
            AuthorDTO authorDTO = new AuthorDTO(
                    (long) Math.toIntExact(author.getId()),
                    author.getName()
            );
            authorDTOList.add(authorDTO);

        }
        return authorDTOList;
    }

    @Transactional
    public String updateAuthor(AuthorDTO authorDTO) {

        if (authorRepo.existsById((long) authorDTO.getId())) {
            Author author = authorRepo.getReferenceById((long) authorDTO.getId());
            author.setName(authorDTO.getName());

            authorRepo.save(author);
            return author.getName();

        } else {
            System.out.println("Author ID Not Exist!!!!!!!!");
        }
        return null;

    }

    @Override
    public List<AuthorDTO> getAllAuthors() {
        return authorRepo.findAll().stream()
                .map(AuthorMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AuthorDTO getAuthorById(Long id) {
        Author author = authorRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Author not found with id: " + id));
        return AuthorMapper.toDTO(author);
    }

    @Override
    public AuthorDTO createAuthor(AuthorDTO authorDto) {
        Author author = AuthorMapper.toEntity(authorDto);
        return AuthorMapper.toDTO(authorRepo.save(author));
    }

    @Override
    public AuthorDTO updateAuthor(Long id, AuthorDTO authorDto) {
        Author existingAuthor = authorRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Author not found with id: " + id));

        AuthorMapper.updateEntityFromDTO(authorDto, existingAuthor);
        return AuthorMapper.toDTO(authorRepo.save(existingAuthor));
    }
    @Override
    @Transactional
    public String deleteAuthor(Long id) {
        if (!authorRepo.existsById(id)) {
            throw new EntityNotFoundException("Author not found with id: " + id);
        }
        authorRepo.deleteById(id);
        return "Author with ID " + id + " deleted successfully.";
    }
}
