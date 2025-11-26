package com.org.bookstore_backend.model;

/**
 * Enum representing the various possible statuses of an order in the bookstore system.
 * Using an enum provides type safety and prevents invalid status strings.
 */
public enum OrderStatus {
    /**
     * The order has just been placed.
     */
    NEW_ORDER,
    /**
     * The order is currently being processed by the system.
     */
    PROCESSING,
    /**
     * The items in the order have been gathered and packed.
     */
    PACKED,
    /**
     * The order has left the warehouse and is on its way.
     */
    DISPATCHED,
    /**
     * The order is en route to the delivery destination.
     */
    IN_TRANSIT,
    /**
     * The order is with the local delivery driver and will be delivered soon.
     */
    OUT_FOR_DELIVERY,
    /**
     * The order has been successfully delivered to the customer.
     */
    DELIVERED,
    /**
     * The order has been canceled by the customer or the admin.
     */
    CANCELED
}