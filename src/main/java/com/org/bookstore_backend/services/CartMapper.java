package com.org.bookstore_backend.services;
import com.org.bookstore_backend.dto.BookMapper;
import com.org.bookstore_backend.dto.CartDTO;
import com.org.bookstore_backend.dto.CartItemDTO;
import com.org.bookstore_backend.dto.UserMapper;
import com.org.bookstore_backend.model.Cart;
import com.org.bookstore_backend.model.CartItem;
import org.mapstruct.CollectionMappingStrategy;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Set;

@Mapper(
        componentModel = "spring", // MapStruct will generate Spring bean
        uses = {BookMapper.class, UserMapper.class},
        collectionMappingStrategy = CollectionMappingStrategy.ADDER_PREFERRED
)
public interface CartMapper {

    @Mapping(target = "userId", source = "user.userId")
    @Mapping(target = "cartItems", source = "cartItems")
    @Mapping(
            target = "totalAmount",
            expression = "java(calculateTotalAmount(cart.getCartItems()))"
    )
    CartDTO toDto(Cart cart);

    @Mapping(target = "bookId", source = "book.id")
    @Mapping(target = "bookTitle", source = "book.title")
    @Mapping(target = "bookImageUrl", source = "book.imageUrl")
    @Mapping(target = "bookPrice", source = "book.price")
    CartItemDTO toItemDto(CartItem cartItem);

    @Mapping(target = "cart", ignore = true)
    @Mapping(target = "book", ignore = true)
    CartItem toItemEntity(CartItemDTO cartItemDTO);

    @Named("calculateTotalAmount")
    default Double calculateTotalAmount(Set<CartItem> cartItems) {
        if (cartItems == null) {
            return 0.0;
        }
        return cartItems.stream()
                .mapToDouble(item -> item.getBook().getPrice() * item.getQuantity())
                .sum();
    }
}
