package com.org.bookstore_backend.dto;

import lombok.Data;

@Data
public class UpdateStatusRequestDTO {
    private String newStatus;

    // Lombok's @Data annotation automatically generates:
    // public String getNewStatus() { return newStatus; }
    // public void setNewStatus(String newStatus) { this.newStatus = newStatus; }
}

