package com.org.bookstore_backend.model;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
//import com.org.bookstore_backend.entity.Fine;
import java.time.LocalDate;

@Setter
@Getter
@Entity
@Table(name="borrow")
public class Borrow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "borrowDate")
    private LocalDate borrowDate;

    @Column(name="dueDate")
    private LocalDate dueDate;

    @Column(name = "returnDate")
    private LocalDate returnDate;


    @Column(name = "isReturned")
    private Boolean isReturned;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;



//    @OneToMany(mappedBy = "borrow")
//    private Set<Fine> fines;



    public Borrow(int id, Book book, User user, LocalDate borrowDate, LocalDate returnDate) {
        this.id = (long) id;
        this.book = book;
        this.user = user;
        this.borrowDate = borrowDate;
        this.returnDate = returnDate;
    }

    public Borrow(Book book, User user, LocalDate borrowDate, LocalDate returnDate) {
        this.book = book;
        this.user = user;
        this.borrowDate = borrowDate;
        this.returnDate = returnDate;
    }

    public Borrow() {
    }


    @Override
    public String toString() {
        return "Borrow{" +
                "id=" + id +
                ", book=" + book +
                ", user=" + user +
                ", borrowDate=" + borrowDate +
                ", returnDate=" + returnDate +
                '}';
    }
}