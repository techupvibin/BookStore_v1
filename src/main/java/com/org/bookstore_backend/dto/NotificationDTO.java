package com.org.bookstore_backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Data Transfer Object for notifications
 * Used for Kafka message serialization/deserialization
 */
public class NotificationDTO {
    
    @JsonProperty("id")
    private String id;
    
    @JsonProperty("type")
    private String type;
    
    @JsonProperty("title")
    private String title;
    
    @JsonProperty("message")
    private String message;
    
    @JsonProperty("userId")
    private Long userId;
    
    @JsonProperty("orderId")
    private Long orderId;
    
    @JsonProperty("metadata")
    private Map<String, Object> metadata;
    
    @JsonProperty("timestamp")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime timestamp;
    
    @JsonProperty("read")
    private boolean read = false;
    
    // Default constructor
    public NotificationDTO() {
        this.timestamp = LocalDateTime.now();
    }
    
    // Constructor with 3 String parameters (type, title, message)
    public NotificationDTO(String type, String title, String message) {
        this();
        this.type = type;
        this.title = title;
        this.message = message;
    }
    
    // Constructor with required fields
    public NotificationDTO(String type, String title, String message, Long userId) {
        this();
        this.type = type;
        this.title = title;
        this.message = message;
        this.userId = userId;
    }
    
    // Constructor with order information
    public NotificationDTO(String type, String title, String message, Long userId, Long orderId) {
        this(type, title, message, userId);
        this.orderId = orderId;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public Long getOrderId() {
        return orderId;
    }
    
    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }
    
    public Map<String, Object> getMetadata() {
        return metadata;
    }
    
    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public boolean isRead() {
        return read;
    }
    
    public void setRead(boolean read) {
        this.read = read;
    }
    
    @Override
    public String toString() {
        return "NotificationDTO{" +
                "id='" + id + '\'' +
                ", type='" + type + '\'' +
                ", title='" + title + '\'' +
                ", message='" + message + '\'' +
                ", userId=" + userId +
                ", orderId=" + orderId +
                ", timestamp=" + timestamp +
                ", read=" + read +
                '}';
    }
}