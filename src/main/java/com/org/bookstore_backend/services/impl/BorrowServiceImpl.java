package com.org.bookstore_backend.services.impl;
//
//import com.org.bookstore_backend.dto.BorrowDTO;
//import com.org.bookstore_backend.model.Book;
//import com.org.bookstore_backend.model.Borrow;
//import com.org.bookstore_backend.model.User;
//import com.org.bookstore_backend.repo.BookRepo;
//import com.org.bookstore_backend.repo.BorrowRepo;
//import com.org.bookstore_backend.repo.UserRepo;
//import com.org.bookstore_backend.services.BorrowService;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.stereotype.Service;
//
//import java.time.LocalDate;
//import java.util.List;
//
//@Service
//public class BorrowServiceImpl implements BorrowService {
//
//    @Autowired
//    private BookRepo bookRepo;
//
//    @Autowired
//    private BorrowRepo borrowRepo;
//
//    @Autowired
//    private UserRepo userRepo;
//
//    @Override
//    public String addBorrow(BorrowDTO borrowDTO) {
//        // Future implementation here
//        return "";
//    }
//
//    @Override
//    public List<BorrowDTO> getAllBorrow() {
//        // Future implementation here
//        return List.of();
//    }
//
//    @Override
//    public String updateBorrow(BorrowDTO borrowDTO) {
//        // Future implementation here
//        return "";
//    }
//
//    // Core borrow operation
//    public Borrow borrowTheBook(Long bookId) {
//        Book book = bookRepo.findById(bookId)
//                .orElseThrow(() -> new RuntimeException("Book not found"));
//
//        if (book.getQuantity() <= 0 || !book.isAvailable()) {
//            throw new RuntimeException("Book is not available");
//        }
//
//        String username = SecurityContextHolder.getContext().getAuthentication().getName();
//        User user = userRepo.findByUserName(username)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        Borrow borrowRecord = new Borrow();
//        borrowRecord.setBorrowDate(LocalDate.now());
//        borrowRecord.setDueDate(LocalDate.now().plusDays(14));
//        borrowRecord.setIsReturned(false);
//        borrowRecord.setUser(user);
//        borrowRecord.setBook(book);
//
//        // Update book quantity and availability
//        int updatedQty = book.getQuantity() - 1;
//        book.setQuantity(updatedQty);
//        if (updatedQty == 0) {
//            book.setAvailable();
//        }
//
//        bookRepo.save(book);
//        return borrowRepo.save(borrowRecord);
//    }
//
//    @Override
//    public Borrow returnTheBook(Long borrowRecordId) {
//        Borrow borrowRecord = borrowRepo.findById(borrowRecordId.intValue())
//                .orElseThrow(() -> new RuntimeException("Borrow record not found"));
//
//        if (borrowRecord.getIsReturned()) {
//            throw new RuntimeException("Book is already returned");
//        }
//
//        Book book = borrowRecord.getBook();
//        book.setQuantity(book.getQuantity() + 1);
//        book.setAvailable();
//        bookRepo.save(book);
//
//        borrowRecord.setReturnDate(LocalDate.now());
//        borrowRecord.setIsReturned(true);
//        return borrowRepo.save(borrowRecord);
//    }
//}
