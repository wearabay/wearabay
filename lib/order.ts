import { createClient } from "@/lib/supabase/client";

import type { CartItem } from "@/lib/cart";


/* =========================================================
   TYPES
========================================================= */

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled";


export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "expired"
  | "refunded";


type OrderItemRow = {
  product_id: number | string;
  product_name: string;
  unit_price: number | string;
  product_image: string | null;
  quantity: number | string;
  color: string | null;
  size: string | null;
};


type OrderRow = {
  id: string;
  order_number: string;
  order_items?: OrderItemRow[] | null;

  customer_email: string;
  customer_phone: string;

  first_name: string;
  last_name: string;
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;

  delivery_method: string;
  payment_method: string;

  subtotal: number | string;
  shipping_fee: number | string | null;
  total: number | string | null;

  status: OrderStatus;
  payment_status: PaymentStatus;

  payment_proof_path: string | null;
  payment_proof_uploaded_at: string | null;
  payment_proof_verified_at: string | null;

  created_at: string;

  courier?: string | null;
  tracking_number?: string | null;
  shipped_at?: string | null;
};


export type Order = {

  id: string;

  orderNumber: string;

  items: CartItem[];

  customer: {
    email: string;
    phone: string;
  };

  address: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };

  delivery: string;

  payment: string;

  subtotal: number;

  shippingFee: number;

  total: number;

  status: OrderStatus;

  paymentStatus: PaymentStatus;

  paymentProofPath: string | null;

  paymentProofUploadedAt: string | null;

  paymentProofVerifiedAt: string | null;

  createdAt: string;

  courier?: string | null;

  trackingNumber?: string | null;

  shippedAt?: string | null;

};


export type CreateOrderInput = {

  items: CartItem[];

  customer: {
    email: string;
    phone: string;
  };

  address: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };

  delivery: string;

  payment: string;

  subtotal: number;

  shippingFee?: number;

  total?: number;

  status?: OrderStatus;

  paymentStatus?: PaymentStatus;

};


/* =========================================================
   HELPERS
========================================================= */


/**
 * Convert Supabase order item rows
 * into the application's CartItem format.
 */
function mapOrderItems(
  rows: OrderItemRow[] = []
): CartItem[] {

  return rows.map(
    (item) => ({

      id:
        Number(item.product_id),

      name:
        item.product_name,

      price:
        Number(item.unit_price),

      image:
        item.product_image ?? "",

      quantity:
        Number(item.quantity),

      color:
        item.color ?? undefined,

      size:
        item.size ?? undefined,

    })
  );
}


/**
 * Convert Supabase order row
 * into the application's Order format.
 */
export function mapOrder(
  row: OrderRow
): Order {

  return {

    id:
      row.id,

    orderNumber:
      row.order_number,

    items:
      mapOrderItems(
        row.order_items ?? []
      ),

    customer: {

      email:
        row.customer_email,

      phone:
        row.customer_phone,

    },

    address: {

      firstName:
        row.first_name,

      lastName:
        row.last_name,

      street:
        row.street,

      city:
        row.city,

      province:
        row.province,

      postalCode:
        row.postal_code,

      country:
        row.country,

    },

    delivery:
      row.delivery_method,

    payment:
      row.payment_method,

    subtotal:
      Number(row.subtotal),

    shippingFee:
      Number(row.shipping_fee ?? 0),

    total:
      Number(row.total ?? row.subtotal),

    status:
      row.status,

    paymentStatus:
      row.payment_status,

    paymentProofPath:
      row.payment_proof_path ?? null,

    paymentProofUploadedAt:
      row.payment_proof_uploaded_at ?? null,

    paymentProofVerifiedAt:
      row.payment_proof_verified_at ?? null,

    createdAt:
      row.created_at,

    courier:
      row.courier ?? null,

    trackingNumber:
      row.tracking_number ?? null,

    shippedAt:
      row.shipped_at ?? null,

  };
}


/* =========================================================
   CREATE ORDER
========================================================= */


/**
 * Create a new order in Supabase.
 *
 * The authenticated user's ID is taken
 * directly from the Supabase session.
 */
export async function createOrder(
  input: CreateOrderInput
): Promise<Order> {

  const supabase =
    createClient();


  /* -------------------------------------------------------
     AUTH
  ------------------------------------------------------- */

  const {
    data: {
      user,
    },
    error: userError,
  } =
    await supabase.auth.getUser();


  if (userError) {
    throw userError;
  }


  if (!user) {

    throw new Error(
      "You must be logged in to place an order."
    );

  }


  /* -------------------------------------------------------
     BASIC VALIDATION
  ------------------------------------------------------- */

  if (!input.items.length) {

    throw new Error(
      "Order must contain at least one item."
    );

  }


  /* -------------------------------------------------------
     PREPARE ITEMS FOR RPC

     The database resolves:
     product_id + color + size
     → product_variants.id
  ------------------------------------------------------- */

  const rpcItems =
    input.items.map(
      (item) => ({

        id:
          item.id,

        quantity:
          item.quantity,

        color:
          item.color ?? null,

        size:
          item.size ?? null,

      })
    );


  /* -------------------------------------------------------
     CREATE ORDER

     All order creation, variant validation,
     stock validation, order_items insertion,
     and stock deduction happen inside
     the database transaction.
  ------------------------------------------------------- */

  const {
    data: orderId,
    error: orderError,
  } =
    await supabase.rpc(
      "create_order",
      {

        p_customer_email:
          input.customer.email,

        p_customer_phone:
          input.customer.phone,

        p_first_name:
          input.address.firstName,

        p_last_name:
          input.address.lastName,

        p_country:
          input.address.country,

        p_province:
          input.address.province,

        p_city:
          input.address.city,

        p_postal_code:
          input.address.postalCode,

        p_street:
          input.address.street,

        p_delivery_method:
          input.delivery,

        p_payment_method:
          input.payment,

        p_items:
          rpcItems,

      }
    );


  if (orderError) {

    console.error(
      "Failed to create order:",
      orderError
    );

    throw orderError;

  }


  if (!orderId) {

    throw new Error(
      "Failed to create order."
    );

  }


  /* -------------------------------------------------------
     LOAD CREATED ORDER
  ------------------------------------------------------- */

  const order =
    await getOrderById(
      orderId
    );


  if (!order) {

    throw new Error(
      "Order was created but could not be loaded."
    );

  }


  return order;

}


/* =========================================================
   GET ORDERS
========================================================= */


/**
 * Get all orders belonging to
 * the currently authenticated user.
 */
export async function getOrders(): Promise<Order[]> {

  const supabase =
    createClient();


  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();


  if (!user) {
    return [];
  }


  const {
    data,
    error,
  } =
    await supabase

      .from("orders")

      .select(`
        *,
        order_items (*)
      `)

      .eq(
        "user_id",
        user.id
      )

      .order(
        "created_at",
        {
          ascending: false,
        }
      );


  if (error) {
    throw error;
  }


  return (
    (data ?? []) as OrderRow[]
  ).map(
    (row) =>
      mapOrder(row)
  );

}


/* =========================================================
   GET ORDER BY ID
========================================================= */


/**
 * Get one order belonging to
 * the currently authenticated user.
 */
export async function getOrderById(
  id: string
): Promise<Order | undefined> {

  const supabase =
    createClient();


  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();


  if (!user) {
    return undefined;
  }


  const {
    data,
    error,
  } =
    await supabase

      .from("orders")

      .select(`
        *,
        order_items (*)
      `)

      .eq(
        "id",
        id
      )

      .eq(
        "user_id",
        user.id
      )

      .maybeSingle();


  if (error) {
    throw error;
  }


  if (!data) {
    return undefined;
  }


  return mapOrder(
    data as OrderRow
  );

}