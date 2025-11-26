package com.org.bookstore_backend.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;
 

// This class defines the composite primary key for CartItem
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CartItemPK implements Serializable {

    // Use Long IDs
    private Long cart;
    private Long book;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CartItemPK that = (CartItemPK) o;
        return Objects.equals(cart, that.cart) &&
                Objects.equals(book, that.book);
    }

    @Override
    public int hashCode() {
        return Objects.hash(cart, book);
    }
}