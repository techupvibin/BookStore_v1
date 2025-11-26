//// src/main/java/com/org/bookstore_backend/services/CheckoutService.java
//package com.org.bookstore_backend.services;
//
//import com.org.bookstore_backend.dto.OrderItemDTO;
//import com.org.bookstore_backend.dto.PaymentRequestDTO;
//import com.org.bookstore_backend.dto.RazorpayOrderResponseDTO;
//import com.org.bookstore_backend.dto.VerificationRequestDTO;
//import com.razorpay.RazorpayException;
//
//import java.util.List;
//
//public interface CheckoutService {
//    void placeCashOnDeliveryOrder(String email, List<OrderItemDTO> orderItems);
//    RazorpayOrderResponseDTO createRazorpayOrder(String email, PaymentRequestDTO paymentRequest) throws RazorpayException;
//    boolean verifyRazorpayPayment(String email, VerificationRequestDTO verificationRequest) throws RazorpayException;
//}