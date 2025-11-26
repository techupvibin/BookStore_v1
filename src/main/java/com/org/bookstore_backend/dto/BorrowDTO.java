package com.org.bookstore_backend.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BorrowDTO {

    private Long id;

    private Long userId;
    private String username; // Optional: for display

    private Long bookId;
    private String bookTitle; // Optional: for display

    private LocalDate borrowDate;
    private LocalDate dueDate;
    private LocalDate returnDate;

    private Boolean isReturned;
}