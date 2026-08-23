import type {
  OrderStatus,
} from "@/lib/order";


const allowedTransitions: Record<
  OrderStatus,
  OrderStatus[]
> = {

  pending: [
    "paid",
    "cancelled",
  ],


  paid: [
    "pending",
    "processing",
    "cancelled",
  ],


  processing: [
    "paid",
    "shipped",
    "cancelled",
  ],


  shipped: [
    "processing",
    "completed",
  ],


  completed: [
    "shipped",
  ],


  cancelled: [
    "pending",
  ],

};



export function canUpdateOrderStatus(
  current: OrderStatus,
  next: OrderStatus
) {

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