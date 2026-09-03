import { createClient } from "@/lib/supabase/server";

import type {
  Order,
  OrderStatus,
  PaymentStatus,
} from "@/lib/order";

import type { CartItem } from "@/lib/cart";

import {
  canUpdateOrderStatus,
  canUpdatePaymentStatus,
} from "@/lib/order-status";


/* =========================================================
   TYPES
========================================================= */

type AdminOrderRow = {
  id: string;

  order_number: string | null;

  customer_email: string | null;
  customer_phone: string | null;

  first_name: string | null;
  last_name: string | null;

  country: string | null;
  province: string | null;
  city: string | null;
  postal_code: string | null;
  street: string | null;

  delivery_method: string | null;
  payment_method: string | null;

  subtotal: number | string | null;
  shipping_fee: number | string | null;
  total: number | string | null;

  status: string | null;
  payment_status: string | null;

  created_at: string | null;
  updated_at?: string | null;

  payment_proof_path?: string | null;
  payment_proof_uploaded_at?: string | null;
  payment_proof_verified_at?: string | null;

  courier?: string | null;
  tracking_number?: string | null;
  shipped_at?: string | null;

  order_items?: AdminOrderItemRow[] | null;
};


type AdminOrderItemRow = {
  id: string;

  product_id: number | string | null;
  product_name: string | null;
  product_image: string | null;

  color: string | null;
  size: string | null;

  quantity: number | string | null;
  unit_price: number | string | null;

  product_slug?: string | null;
};


/* =========================================================
   MAP ORDER ITEMS
========================================================= */

function mapAdminOrderItems(
  rows: AdminOrderItemRow[] = []
): CartItem[] {

  return rows.map(
    (item) => ({

      id:
        Number(
          item.product_id ?? 0
        ),

      name:
        item.product_name ?? "",

      price:
        Number(
          item.unit_price ?? 0
        ),

      image:
        item.product_image ?? "",

      quantity:
        Number(
          item.quantity ?? 0
        ),

      color:
        item.color ?? undefined,

      size:
        item.size ?? undefined,

    })
  );
}


/* =========================================================
   MAP ADMIN ORDER
========================================================= */

function mapAdminOrder(
  row: AdminOrderRow
): Order {

  return {

    id:
      row.id,

    orderNumber:
      row.order_number ?? "",

    items:
      mapAdminOrderItems(
        row.order_items ?? []
      ),

    customer: {

      email:
        row.customer_email ?? "",

      phone:
        row.customer_phone ?? "",

    },

    address: {

      firstName:
        row.first_name ?? "",

      lastName:
        row.last_name ?? "",

      street:
        row.street ?? "",

      city:
        row.city ?? "",

      province:
        row.province ?? "",

      postalCode:
        row.postal_code ?? "",

      country:
        row.country ?? "",

    },

    delivery:
      row.delivery_method ?? "",

    payment:
      row.payment_method ?? "",

    subtotal:
      Number(
        row.subtotal ?? 0
      ),

    shippingFee:
      Number(
        row.shipping_fee ?? 0
      ),

    total:
      Number(
        row.total ??
        row.subtotal ??
        0
      ),

    status:
      (
        row.status ??
        "pending"
      ) as OrderStatus,

    paymentStatus:
      (
        row.payment_status ??
        "pending"
      ) as PaymentStatus,

    paymentProofPath:
      row.payment_proof_path ??
      null,

    paymentProofUploadedAt:
      row.payment_proof_uploaded_at ??
      null,

    paymentProofVerifiedAt:
      row.payment_proof_verified_at ??
      null,

    createdAt:
      row.created_at ?? "",

    courier:
      row.courier ??
      null,

    trackingNumber:
      row.tracking_number ??
      null,

    shippedAt:
      row.shipped_at ??
      null,

  };
}


/* =========================================================
   AUTHENTICATED ADMIN
========================================================= */

async function getAuthenticatedAdmin() {

  const supabase =
    await createClient();


  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();


  if (!user) {

    return {
      supabase,
      user: null,
      isAdmin: false,
    };

  }


  const {
    data: profile,
  } =
    await supabase

      .from("profiles")

      .select("role")

      .eq(
        "id",
        user.id
      )

      .maybeSingle();


  return {

    supabase,

    user,

    isAdmin:
      profile?.role ===
      "admin",

  };

}


/* =========================================================
   ORDER HISTORY
========================================================= */

async function createOrderHistory(
  supabase: Awaited<
    ReturnType<typeof createClient>
  >,
  orderId: string,
  type: string,
  oldValue: string | null,
  newValue: string | null,
  note?: string
) {

  const {
    error,
  } =
    await supabase

      .from(
        "order_status_history"
      )

      .insert({

        order_id:
          orderId,

        type,

        old_value:
          oldValue,

        new_value:
          newValue,

        note:
          note ?? null,

      });


  if (error) {

    throw new Error(
      error.message
    );

  }

}


/* =========================================================
   GET ADMIN ORDERS
========================================================= */

export async function getAdminOrders(): Promise<
  Order[]
> {

  const {
    supabase,
    user,
    isAdmin,
  } =
    await getAuthenticatedAdmin();


  if (!user || !isAdmin) {
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

      .order(
        "created_at",
        {
          ascending: false,
        }
      );


  if (error) {

    console.error(
      "getAdminOrders:",
      error
    );

    return [];

  }


  return (
    data ?? []
  ).map(
    (row) =>
      mapAdminOrder(
        row as AdminOrderRow
      )
  );

}


/* =========================================================
   GET ADMIN ORDER BY ID
========================================================= */

export async function getAdminOrderById(
  orderId: string
): Promise<Order | null> {

  const {
    supabase,
    user,
    isAdmin,
  } =
    await getAuthenticatedAdmin();


  if (!user || !isAdmin) {
    return null;
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
        orderId
      )

      .maybeSingle();


  if (error) {

    console.error(
      "getAdminOrderById:",
      error
    );

    return null;

  }


  if (!data) {
    return null;
  }


  return mapAdminOrder(
    data as AdminOrderRow
  );

}


/* =========================================================
   UPDATE ORDER STATUS
========================================================= */

export async function updateAdminOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<Order> {

  const {
    supabase,
    user,
    isAdmin,
  } =
    await getAuthenticatedAdmin();


  if (!user || !isAdmin) {

    throw new Error(
      "Unauthorized"
    );

  }


  const {
    data: currentOrder,
    error: fetchError,
  } =
    await supabase

      .from("orders")

      .select(
        `
          id,
          status,
          payment_status,
          courier,
          tracking_number
        `
      )

      .eq(
        "id",
        orderId
      )

      .single();


  if (
    fetchError ||
    !currentOrder
  ) {

    throw new Error(
      fetchError?.message ??
        "Order not found"
    );

  }


  const currentStatus =
    currentOrder.status as OrderStatus;


  const currentPaymentStatus =
    currentOrder.payment_status as PaymentStatus;


  if (
    !canUpdateOrderStatus(
      currentStatus,
      newStatus
    )
  ) {

    throw new Error(
      `Invalid order status transition: ${currentStatus} → ${newStatus}`
    );

  }


  /* -------------------------------------------------------
     ATOMIC CANCELLATION + INVENTORY RELEASE

     Pending + unpaid/expired orders use the database RPC.

     This guarantees that:
     - order becomes cancelled
     - reserved inventory is released
     - release movement is recorded
     - order history is recorded

     All within one database transaction.
  ------------------------------------------------------- */

  if (
    newStatus === "cancelled" &&
    currentStatus === "pending" &&
    (
      currentPaymentStatus ===
        "pending" ||
      currentPaymentStatus ===
        "expired"
    )
  ) {

    const {
      data: cancelledOrderId,
      error,
    } =
      await supabase.rpc(
        "cancel_order_and_release_inventory",
        {
          p_order_id:
            orderId,
        }
      );


    if (error) {

      throw new Error(
        error.message
      );

    }


    if (!cancelledOrderId) {

      throw new Error(
        "Failed to cancel order and release inventory"
      );

    }


    const {
      data: updatedOrder,
      error: reloadError,
    } =
      await supabase

        .from("orders")

        .select(`
          *,
          order_items (*)
        `)

        .eq(
          "id",
          orderId
        )

        .single();


    if (
      reloadError ||
      !updatedOrder
    ) {

      throw new Error(
        reloadError?.message ??
          "Failed to reload cancelled order"
      );

    }


    return mapAdminOrder(
      updatedOrder as AdminOrderRow
    );

  }


  /* -------------------------------------------------------
     SHIPPING REQUIREMENT
  ------------------------------------------------------- */

  if (
    newStatus === "shipped" &&
    (
      !currentOrder.courier ||
      !currentOrder.tracking_number
    )
  ) {

    throw new Error(
      "Courier and tracking number are required before shipping."
    );

  }


  const updatePayload: Record<
    string,
    unknown
  > = {

    status:
      newStatus,

    updated_at:
      new Date().toISOString(),

  };


  if (
    newStatus === "shipped"
  ) {

    updatePayload.shipped_at =
      new Date().toISOString();

  }


  const {
    data,
    error,
  } =
    await supabase

      .from("orders")

      .update(
        updatePayload
      )

      .eq(
        "id",
        orderId
      )

      .select(`
        *,
        order_items (*)
      `)

      .single();


  if (
    error ||
    !data
  ) {

    throw new Error(
      error?.message ??
        "Failed to update order status"
    );

  }


  await createOrderHistory(
    supabase,
    orderId,
    "order_status",
    currentStatus,
    newStatus
  );


  return mapAdminOrder(
    data as AdminOrderRow
  );

}


/* =========================================================
   UPDATE PAYMENT STATUS
========================================================= */

export async function updateAdminPaymentStatus(
  orderId: string,
  newPaymentStatus: PaymentStatus
): Promise<Order> {

  const {
    supabase,
    user,
    isAdmin,
  } =
    await getAuthenticatedAdmin();


  if (!user || !isAdmin) {

    throw new Error(
      "Unauthorized"
    );

  }


  const {
    data: currentOrder,
    error: fetchError,
  } =
    await supabase

      .from("orders")

      .select(
        "id, payment_status, status"
      )

      .eq(
        "id",
        orderId
      )

      .single();


  if (
    fetchError ||
    !currentOrder
  ) {

    throw new Error(
      fetchError?.message ??
        "Order not found"
    );

  }


  const currentPaymentStatus =
    currentOrder.payment_status as PaymentStatus;


  if (
    !canUpdatePaymentStatus(
      currentPaymentStatus,
      newPaymentStatus
    )
  ) {

    throw new Error(
      `Invalid payment status transition: ${currentPaymentStatus} → ${newPaymentStatus}`
    );

  }


  const {
    data,
    error,
  } =
    await supabase

      .from("orders")

      .update({

        payment_status:
          newPaymentStatus,

        updated_at:
          new Date().toISOString(),

      })

      .eq(
        "id",
        orderId
      )

      .select(`
        *,
        order_items (*)
      `)

      .single();


  if (
    error ||
    !data
  ) {

    throw new Error(
      error?.message ??
        "Failed to update payment status"
    );

  }


  await createOrderHistory(
    supabase,
    orderId,
    "payment_status",
    currentPaymentStatus,
    newPaymentStatus
  );


  return mapAdminOrder(
    data as AdminOrderRow
  );

}


/* =========================================================
   VERIFY PAYMENT PROOF
========================================================= */

export async function verifyAdminPaymentProof(
  orderId: string
): Promise<Order> {

  const {
    supabase,
    user,
    isAdmin,
  } =
    await getAuthenticatedAdmin();


  if (!user || !isAdmin) {

    throw new Error(
      "Unauthorized"
    );

  }


  const {
    data: currentOrder,
    error: fetchError,
  } =
    await supabase

      .from("orders")

      .select(
        `
          id,
          status,
          payment_status,
          payment_proof_path
        `
      )

      .eq(
        "id",
        orderId
      )

      .single();


  if (
    fetchError ||
    !currentOrder
  ) {

    throw new Error(
      fetchError?.message ??
        "Order not found"
    );

  }


  if (
    !currentOrder.payment_proof_path
  ) {

    throw new Error(
      "Payment proof has not been uploaded."
    );

  }


  if (
    currentOrder.payment_status !==
    "pending"
  ) {

    throw new Error(
      "Only pending payments can be verified."
    );

  }


  const now =
    new Date().toISOString();


  const {
    data,
    error,
  } =
    await supabase

      .from("orders")

      .update({

        payment_status:
          "paid",

        status:
          "processing",

        payment_proof_verified_at:
          now,

        updated_at:
          now,

      })

      .eq(
        "id",
        orderId
      )

      .select(`
        *,
        order_items (*)
      `)

      .single();


  if (
    error ||
    !data
  ) {

    throw new Error(
      error?.message ??
        "Failed to verify payment proof"
    );

  }


  await createOrderHistory(
    supabase,
    orderId,
    "payment_status",
    "pending",
    "paid",
    "Payment proof verified by admin"
  );


  await createOrderHistory(
    supabase,
    orderId,
    "order_status",
    currentOrder.status,
    "processing",
    "Order moved to processing after payment verification"
  );


  return mapAdminOrder(
    data as AdminOrderRow
  );

}


/* =========================================================
   REJECT PAYMENT PROOF
========================================================= */

export async function rejectAdminPaymentProof(
  orderId: string
): Promise<Order> {

  const {
    supabase,
    user,
    isAdmin,
  } =
    await getAuthenticatedAdmin();


  if (!user || !isAdmin) {

    throw new Error(
      "Unauthorized"
    );

  }


  const {
    data: currentOrder,
    error: fetchError,
  } =
    await supabase

      .from("orders")

      .select(
        "id, status, payment_status"
      )

      .eq(
        "id",
        orderId
      )

      .single();


  if (
    fetchError ||
    !currentOrder
  ) {

    throw new Error(
      fetchError?.message ??
        "Order not found"
    );

  }


  if (
    currentOrder.payment_status !==
    "pending"
  ) {

    throw new Error(
      "Only pending payments can be rejected."
    );

  }


  const {
    data,
    error,
  } =
    await supabase

      .from("orders")

      .update({

        payment_status:
          "failed",

        updated_at:
          new Date().toISOString(),

      })

      .eq(
        "id",
        orderId
      )

      .select(`
        *,
        order_items (*)
      `)

      .single();


  if (
    error ||
    !data
  ) {

    throw new Error(
      error?.message ??
        "Failed to reject payment proof"
    );

  }


  await createOrderHistory(
    supabase,
    orderId,
    "payment_status",
    "pending",
    "failed",
    "Payment proof rejected by admin"
  );


  return mapAdminOrder(
    data as AdminOrderRow
  );

}


/* =========================================================
   UPDATE SHIPPING
========================================================= */

export async function updateAdminShipping(
  orderId: string,
  input: {
    courier?: string | null;
    trackingNumber?: string | null;
  }
): Promise<Order> {

  const {
    supabase,
    user,
    isAdmin,
  } =
    await getAuthenticatedAdmin();


  if (!user || !isAdmin) {

    throw new Error(
      "Unauthorized"
    );

  }


  const normalizedCourier =
    typeof input?.courier ===
    "string"
      ? input.courier.trim()
      : "";


  const normalizedTrackingNumber =
    typeof input?.trackingNumber ===
    "string"
      ? input.trackingNumber.trim()
      : "";


  if (!normalizedCourier) {

    throw new Error(
      "Courier is required."
    );

  }


  if (!normalizedTrackingNumber) {

    throw new Error(
      "Tracking number is required."
    );

  }


  const {
    data: currentOrder,
    error: fetchError,
  } =
    await supabase

      .from("orders")

      .select(
        `
          id,
          status,
          courier,
          tracking_number
        `
      )

      .eq(
        "id",
        orderId
      )

      .single();


  if (
    fetchError ||
    !currentOrder
  ) {

    throw new Error(
      fetchError?.message ??
        "Order not found"
    );

  }


  const {
    data,
    error,
  } =
    await supabase

      .from("orders")

      .update({

        courier:
          normalizedCourier,

        tracking_number:
          normalizedTrackingNumber,

        updated_at:
          new Date().toISOString(),

      })

      .eq(
        "id",
        orderId
      )

      .select(`
        *,
        order_items (*)
      `)

      .single();


  if (
    error ||
    !data
  ) {

    throw new Error(
      error?.message ??
        "Failed to update shipping information"
    );

  }


  if (
    currentOrder.courier !==
      normalizedCourier ||
    currentOrder.tracking_number !==
      normalizedTrackingNumber
  ) {

    await createOrderHistory(
      supabase,
      orderId,
      "shipping",
      [
        currentOrder.courier,
        currentOrder.tracking_number,
      ]
        .filter(
          (
            value
          ) =>
            typeof value ===
            "string" &&
            value.length > 0
        )
        .join(" / ") ||
        null,
      `${normalizedCourier} / ${normalizedTrackingNumber}`,
      "Shipping information updated by admin"
    );

  }


  return mapAdminOrder(
    data as AdminOrderRow
  );

}


/* =========================================================
   ADMIN ORDER STATS
========================================================= */

export async function getAdminOrderStats() {

  const {
    supabase,
    user,
    isAdmin,
  } =
    await getAuthenticatedAdmin();


  if (!user || !isAdmin) {

    return {

      total: 0,

      needPaymentReview: 0,

      paid: 0,

      processing: 0,

      shipped: 0,

      completed: 0,

    };

  }


  const {
    data,
    error,
  } =
    await supabase

      .from("orders")

      .select(
        "status, payment_status"
      );


  if (error) {

    console.error(
      "getAdminOrderStats:",
      error
    );


    return {

      total: 0,

      needPaymentReview: 0,

      paid: 0,

      processing: 0,

      shipped: 0,

      completed: 0,

    };

  }


  const orders =
    data ?? [];


  return {

    total:
      orders.length,

    needPaymentReview:
      orders.filter(
        (order) =>
          order.payment_status ===
            "pending" &&
          order.status ===
            "pending"
      ).length,

    paid:
      orders.filter(
        (order) =>
          order.payment_status ===
          "paid"
      ).length,

    processing:
      orders.filter(
        (order) =>
          order.status ===
          "processing"
      ).length,

    shipped:
      orders.filter(
        (order) =>
          order.status ===
          "shipped"
      ).length,

    completed:
      orders.filter(
        (order) =>
          order.status ===
          "completed"
      ).length,

  };

}


/* =========================================================
   PAYMENT REVIEW QUEUE
========================================================= */

export async function getAdminPaymentReviewOrders(): Promise<
  Order[]
> {

  const {
    supabase,
    user,
    isAdmin,
  } =
    await getAuthenticatedAdmin();


  if (!user || !isAdmin) {
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
        "payment_status",
        "pending"
      )

      .not(
        "payment_proof_path",
        "is",
        null
      )

      .order(
        "created_at",
        {
          ascending: true,
        }
      );


  if (error) {

    console.error(
      "getAdminPaymentReviewOrders:",
      error
    );

    return [];

  }


  return (
    data ?? []
  ).map(
    (row) =>
      mapAdminOrder(
        row as AdminOrderRow
      )
  );

}


/* =========================================================
   REFUND PAYMENT
========================================================= */

export async function refundAdminPayment(
  orderId: string
): Promise<Order> {

  const {
    supabase,
    user,
    isAdmin,
  } =
    await getAuthenticatedAdmin();


  if (!user || !isAdmin) {

    throw new Error(
      "Unauthorized"
    );

  }


  const {
    data,
    error,
  } =
    await supabase.rpc(
      "refund_order_payment",
      {
        p_order_id:
          orderId,
      }
    );


  if (error) {

    throw new Error(
      error.message
    );

  }


  if (!data) {

    throw new Error(
      "Failed to refund order payment"
    );

  }


  const {
    data: updatedOrder,
    error: reloadError,
  } =
    await supabase

      .from("orders")

      .select(`
        *,
        order_items (*)
      `)

      .eq(
        "id",
        orderId
      )

      .single();


  if (
    reloadError ||
    !updatedOrder
  ) {

    throw new Error(
      reloadError?.message ??
        "Failed to reload refunded order"
    );

  }


  return mapAdminOrder(
    updatedOrder as AdminOrderRow
  );

}