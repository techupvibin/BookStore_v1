package com.org.bookstore_backend.services;

import com.org.bookstore_backend.dto.OrderDTO;
import com.org.bookstore_backend.dto.OrderRequestDTO;

import java.util.List;

public interface OrderService {

    /**
     * Places a new order based on the user's cart and the provided request details.
     * This is the primary method for handling the checkout process.
     * @param orderRequestDTO The DTO containing the user ID, payment method, and shipping address.
     * @return The DTO of the newly created order.
     */
    OrderDTO placeOrder(OrderRequestDTO orderRequestDTO);

    /**
     * Retrieves the complete order history for a specific user.
     * @param userId The ID of the user.
     * @return A list of order DTOs.
     */
    List<OrderDTO> getOrderHistory(Long userId);

    /**
     * Cursor-based pagination for a user's order history.
     * @param userId User id
     * @param cursor Last seen order id (exclusive). If null, starts from newest.
     * @param size Page size
     * @return A list of order DTOs ordered by id desc.
     */
    List<OrderDTO> getOrderHistoryPage(Long userId, Long cursor, int size);

    /**
     * Retrieves a single order by its ID.
     * @param id The ID of the order.
     * @return The DTO of the found order.
     */
    OrderDTO getOrderById(Long id);

    /**
     * Creates or updates an order based on a provided DTO.
     * This method can be used by an admin to create a manual order or update an existing one.
     * @param orderDTO The DTO of the order to save.
     * @return The DTO of the newly saved or updated order.
     */
    OrderDTO saveOrder(OrderDTO orderDTO);

    /**
     * Retrieves all orders in the system.
     * @return A list of all order DTOs.
     */
    List<OrderDTO> getAllOrders();

    /**
     * Deletes an order by its ID.
     * @param id The ID of the order to delete.
     */
    void deleteOrder(Long id);

    /**
     * Updates the status of an existing order.
     * This method is intended for administrative use.
     *
     * @param id        The ID of the order to update.
     * @param newStatus The new status string (e.g., "PROCESSING", "DELIVERED").
     * @return The DTO of the updated order.
     */
    OrderDTO updateOrderStatus(Long id, String newStatus);

    /**
     * Generates an invoice PDF for the provided order.
     * @param order The order to render.
     * @return Raw PDF bytes.
     */
    byte[] generateInvoicePdf(OrderDTO order);
}