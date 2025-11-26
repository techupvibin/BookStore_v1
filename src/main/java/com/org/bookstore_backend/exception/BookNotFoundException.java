package com.org.bookstore_backend.exception;

public class BookNotFoundException extends RuntimeException{
    public BookNotFoundException(String id) {
        super("Book with ID " + id + " not found.");
    }
}
//