package com.org.bookstore_backend.model;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "roles")
@NoArgsConstructor // Lombok will generate a public no-argument constructor
public class Role {
   @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

      @Column(unique = true)
    private String name;



   /* // No-arg constructor required by JPA
    public Role() {}
*/

    public Role(String admin) {
        this.name = admin;
    }
}

