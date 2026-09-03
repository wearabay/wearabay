import type {
  OrderStatus,
  PaymentStatus,
} from "@/lib/order";


/* =========================================================
   ALLOWED ORDER STATUS TRANSITIONS

   NORMAL ORDER LIFECYCLE

   pending
      ↓
   processing
      ↓
   shipped
      ↓
   delivered
      ↓
   completed


   LEGACY / COMPATIBILITY

   paid → processing

   The "paid" order status is kept because it already exists
   in the application's OrderStatus type and may exist on
   previously created orders.

   New bank-transfer orders should normally move:

   pending + pending
          ↓
   payment verification
          ↓
   processing + paid


   CANCELLATION

   Cancellation is only allowed while an order is pending.

   We intentionally do NOT allow:

   pending    → paid       through the generic status selector
   processing → cancelled
   shipped    → cancelled
   delivered  → cancelled
   completed  → cancelled

   Payment verification is handled by the dedicated
   verify_order_payment workflow.
========================================================= */

const allowedTransitions: Record<
  OrderStatus,
  OrderStatus[]
> = {

  pending: [
    "cancelled",
  ],


  /*
   * Kept for compatibility with existing orders.
   *
   * A paid order may continue to processing.
   */

  paid: [
    "processing",
  ],


  processing: [
    "shipped",
  ],


  shipped: [
    "delivered",
  ],


  delivered: [
    "completed",
  ],


  completed: [],


  cancelled: [],

};


/* =========================================================
   ALLOWED PAYMENT STATUS TRANSITIONS

   Normal payment lifecycle:

   pending
      ↓
   paid

   pending
      ↓
   failed

   pending
      ↓
   expired

   failed
      ↓
   pending

   expired
      ↓
   pending

   paid
      ↓
   refunded

   refunded
      ↓
   [final]


   Payment verification should normally happen through the
   dedicated verify_order_payment workflow.
========================================================= */

const allowedPaymentTransitions: Record<
  PaymentStatus,
  PaymentStatus[]
> = {

  pending: [
    "paid",
    "failed",
    "expired",
  ],


  paid: [
    "refunded",
  ],


  failed: [
    "pending",
  ],


  expired: [
    "pending",
  ],


  refunded: [],

};


/* =========================================================
   CHECK ORDER STATUS TRANSITION
========================================================= */

export function canUpdateOrderStatus(
  current: OrderStatus,
  next: OrderStatus
): boolean {

  /* -------------------------------------------------------
     Same status is harmless.
  ------------------------------------------------------- */

  if (
    current === next
  ) {

    return true;

  }


  return (
    allowedTransitions[current]
      ?.includes(next)
    ?? false
  );

}


/* =========================================================
   CHECK PAYMENT STATUS TRANSITION
========================================================= */

export function canUpdatePaymentStatus(
  current: PaymentStatus,
  next: PaymentStatus
): boolean {

  /* -------------------------------------------------------
     Same status is harmless.
  ------------------------------------------------------- */

  if (
    current === next
  ) {

    return true;

  }


  return (
    allowedPaymentTransitions[current]
      ?.includes(next)
    ?? false
  );

}