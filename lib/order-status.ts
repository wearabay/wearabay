import type {
  OrderStatus,
  PaymentStatus,
} from "@/lib/order";


/* =========================================================
   ALLOWED ORDER STATUS TRANSITIONS

   Normal lifecycle:

   pending
      ↓
   paid
      ↓
   processing
      ↓
   shipped
      ↓
   completed

   Cancellation is allowed before shipment.

   We intentionally do NOT allow:
   shipped → processing
   completed → shipped

   because those are backwards lifecycle transitions.
========================================================= */

const allowedTransitions: Record<
  OrderStatus,
  OrderStatus[]
> = {

  pending: [
    "paid",
    "cancelled",
  ],


  paid: [
    "processing",
    "cancelled",
  ],


  processing: [
    "shipped",
    "cancelled",
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

   We intentionally do NOT allow:

   paid → pending
   paid → failed
   paid → expired

   because a payment that has already been verified as paid
   must not be moved backwards through the normal admin
   payment status workflow.

   Refund is treated as a terminal payment state.
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
