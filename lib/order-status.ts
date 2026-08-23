import type {
  OrderStatus,
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
    "completed",
  ],


  completed: [],


  cancelled: [],

};



/* =========================================================
   CHECK STATUS TRANSITION
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