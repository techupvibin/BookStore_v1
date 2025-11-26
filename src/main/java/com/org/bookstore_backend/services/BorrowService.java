//package com.org.bookstore_backend.services;
//
//import com.org.bookstore_backend.dto.BorrowDTO; // ✅ Check if BorrowDTO exists and is in the correct package
//
////import com.org.bookstore_backend.DTO.BorrowSaveDTO;
////import com.org.bookstore_backend.DTO.BorrowUpdateDTO;
//import com.org.bookstore_backend.model.Borrow;
//
//import java.util.List;
//
//public interface BorrowService {
//
//    // ❌ Typo in class name: "BorrowSaboveDTO" doesn’t exist — should be "BorrowSaveDTO"
//    // String addBorrow(BorrowSaboveDTO borrowSaveDTO); // ⛔ This will fail to compile
//
//    String addBorrow(BorrowDTO borrowDTO);
//
//    List<BorrowDTO> getAllBorrow(); // ✅ This will work if BorrowDTO is correctly placed and spelled
//
//    // String updateBorrow(BorrowUpdateDTO borrowUpdateDTO); // ✅ Optional — just needs DTO to exist
//
//    String updateBorrow(BorrowDTO borrowDTO);
//
//    Borrow borrowTheBook(Long bookId); // ✅ Assuming implementation handles the logic
//
//    Borrow returnTheBook(Long borrowRecordId); // ✅ All good here
//}
