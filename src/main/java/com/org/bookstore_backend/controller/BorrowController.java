//package com.org.bookstore_backend.controller;
//import com.org.bookstore_backend.model.Borrow;
//import com.org.bookstore_backend.services.BorrowService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//@RestController
//@CrossOrigin
//@RequestMapping("api/borrowRecords")
//public class BorrowController {
//
//    @Autowired
//    private BorrowService borrowService;
//
//    @PostMapping("/borrowthebook/{bookid}")
//    public ResponseEntity<Borrow> borrowTheBook(@PathVariable Long bookId) {
//        return ResponseEntity.ok(borrowService.borrowTheBook(bookId));
//    }
//
//    @PostMapping("/returnthebook/{borrowRecords}")
//    public ResponseEntity<Borrow> returnBorrowBook(@PathVariable Long borrowRecordId) {
//        return ResponseEntity.ok(borrowService.returnTheBook(borrowRecordId));
//    }
//}
//
////    @GetMapping(path = "/getAllBorrow")
////    public List<BorrowDTO> getAllBorrow()
////    {
////        return borrowService.getAllBorrow();
////    }
////
////    @PutMapping(path = "/update")
////    public String updateBorrow(@RequestBody BorrowUpdateDTO borrowUpdateDTO)
////    {
////        String borrow = borrowService.updateBorrow(borrowUpdateDTO);
////        return  "Updated";
////    }
////
////}