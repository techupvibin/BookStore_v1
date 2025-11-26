package com.org.bookstore_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.HashMap;
import java.util.Map;

/**
 * Simple controller to test CORS configuration
 */
@RestController
@RequestMapping("/api/cors-test")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CorsTestController {

    @GetMapping("/ping")
    public ResponseEntity<Map<String, Object>> ping() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "CORS is working!");
        response.put("timestamp", System.currentTimeMillis());
        response.put("status", "success");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/test")
    public ResponseEntity<Map<String, Object>> testPost(@RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "POST request successful!");
        response.put("receivedData", body);
        response.put("timestamp", System.currentTimeMillis());
        response.put("status", "success");
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/test", method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> testOptions() {
        return ResponseEntity.ok().build();
    }
}
