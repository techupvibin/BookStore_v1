package com.org.bookstore_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublisherDTO {

    private Long id;

    //@NotBlank(message = "Publisher name is mandatory")
    private String name;

    private String location;  // Optional field

}
