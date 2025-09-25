export enum OrderStatus {
  /**
   * Customer has initiated checkout, waiting for online payment to clear.
   */
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  /**
   * Online payment failed.
   */
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  /**
   * Order is confirmed (paid online or COD) and is being prepared for shipment.
   */
  PROCESSING = 'PROCESSING',
  /**
   * Order has been handed to the shipping carrier.
   */
  SHIPPED = 'SHIPPED',
  /**
   * Carrier has confirmed the order was delivered to the customer.
   */
  DELIVERED = 'DELIVERED',
  /**
   * Order was cancelled by the user or an admin before shipment.
   */
  CANCELLED = 'CANCELLED',
  /**
   * Customer has returned the order after delivery.
   */
  RETURNED = 'RETURNED',
}
