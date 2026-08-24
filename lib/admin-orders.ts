import { createClient } from "@/lib/supabase/server";

import type {
  Order,
  OrderStatus,
  PaymentStatus,
} from "@/lib/order";

import {
  canUpdateOrderStatus,
  canUpdatePaymentStatus,
} from "@/lib/order-status";


/* =========================================================
   HELPERS
========================================================= */

function mapAdminOrder(
  row: any
): Order {

  return {

    id:
      row.id,

    orderNumber:
      row.order_number,


    items:
      (row.order_items ?? []).map(
        (item: any) => ({

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
      Number(
        row.total ??
        row.subtotal
      ),


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
   ADMIN AUTH
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

    return null;

  }


  const {
    data: profile,
    error,
  } =
    await supabase

      .from("profiles")

      .select("role")

      .eq(
        "id",
        user.id
      )

      .maybeSingle();


  if (
    error ||
    profile?.role !== "admin"
  ) {

    return null;

  }


  return user;

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
  oldValue?: string | null,
  newValue?: string | null,
  note?: string | null
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
          oldValue ?? null,

        new_value:
          newValue ?? null,

        note:
          note ?? null,

      });


  if (error) {

    throw error;

  }

}


/* =========================================================
   GET ALL ADMIN ORDERS
========================================================= */

export async function getAdminOrders(): Promise<Order[]> {

  const supabase =
    await createClient();


  const admin =
    await getAuthenticatedAdmin();


  if (!admin) {

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

    throw error;

  }


  return (
    data ?? []
  ).map(
    mapAdminOrder
  );

}


/* =========================================================
   GET ONE ADMIN ORDER
========================================================= */

export async function getAdminOrderById(
  id: string
): Promise<Order | undefined> {

  const supabase =
    await createClient();


  const admin =
    await getAuthenticatedAdmin();


  if (!admin) {

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

      .maybeSingle();


  if (error) {

    throw error;

  }


  if (!data) {

    return undefined;

  }


  return mapAdminOrder(
    data
  );

}


/* =========================================================
   UPDATE ADMIN ORDER STATUS
========================================================= */

export async function updateAdminOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order | undefined> {

  const supabase =
    await createClient();


  const admin =
    await getAuthenticatedAdmin();


  if (!admin) {

    return undefined;

  }


  /* -------------------------------------------------------
     Get current order information
  ------------------------------------------------------- */

  const {
    data: existingOrder,
    error: existingError,
  } =
    await supabase

      .from("orders")

      .select(`
        status,
        courier,
        tracking_number
      `)

      .eq(
        "id",
        id
      )

      .single();


  if (existingError) {

    throw existingError;

  }


  /* -------------------------------------------------------
     Validate status transition
  ------------------------------------------------------- */

  if (
    !canUpdateOrderStatus(
      existingOrder.status,
      status
    )
  ) {

    throw new Error(
      `Cannot move order from ${existingOrder.status} to ${status}`
    );

  }


  /* -------------------------------------------------------
     SHIPPED REQUIRES SHIPPING INFORMATION

     Workflow:

     processing
         ↓
     courier + tracking
         ↓
     shipped
  ------------------------------------------------------- */

  if (
    status === "shipped"
  ) {

    const courier =
      String(
        existingOrder.courier ?? ""
      ).trim();


    const trackingNumber =
      String(
        existingOrder.tracking_number ?? ""
      ).trim();


    if (!courier) {

      throw new Error(
        "Courier must be saved before the order can be shipped."
      );

    }


    if (!trackingNumber) {

      throw new Error(
        "Tracking number must be saved before the order can be shipped."
      );

    }

  }


  /* -------------------------------------------------------
     Update order status
  ------------------------------------------------------- */

  const updateData: Record<
    string,
    unknown
  > = {

    status,

  };


  /*
   * When the order becomes shipped,
   * record the shipment timestamp.
   */

  if (
    status === "shipped"
  ) {

    updateData.shipped_at =
      new Date().toISOString();

  }


  const {
    data,
    error,
  } =
    await supabase

      .from("orders")

      .update(
        updateData
      )

      .eq(
        "id",
        id
      )

      .select(`
        *,
        order_items (*)
      `)

      .single();


  if (error) {

    throw error;

  }


  if (!data) {

    return undefined;

  }


  /* -------------------------------------------------------
     Create history AFTER update succeeds
  ------------------------------------------------------- */

  await createOrderHistory(
    supabase,
    id,
    "order_status",
    existingOrder.status,
    status,
    "Admin updated order status"
  );


  return mapAdminOrder(
    data
  );

}


/* =========================================================
   UPDATE ADMIN PAYMENT STATUS
========================================================= */

export async function updateAdminPaymentStatus(
  id: string,
  paymentStatus: PaymentStatus
): Promise<Order | undefined> {

  const supabase =
    await createClient();


  const admin =
    await getAuthenticatedAdmin();


  if (!admin) {

    return undefined;

  }


  /* -------------------------------------------------------
     Get current payment status
  ------------------------------------------------------- */

  const {
    data: existingOrder,
    error: existingError,
  } =
    await supabase

      .from("orders")

      .select(
        "payment_status"
      )

      .eq(
        "id",
        id
      )

      .single();


  if (existingError) {

    throw existingError;

  }


  /* -------------------------------------------------------
     Validate payment status transition

     Server-side protection:

     pending  → paid
     pending  → failed
     pending  → expired

     failed   → pending
     expired  → pending

     paid     → refunded

     refunded → final

     Backward / invalid transitions are rejected.
  ------------------------------------------------------- */

  if (
    !canUpdatePaymentStatus(
      existingOrder.payment_status,
      paymentStatus
    )
  ) {

    throw new Error(
      `Cannot move payment status from ${existingOrder.payment_status} to ${paymentStatus}`
    );

  }


  /* -------------------------------------------------------
     Update payment status
  ------------------------------------------------------- */

  const {
    data,
    error,
  } =
    await supabase

      .from("orders")

      .update({

        payment_status:
          paymentStatus,

        ...(paymentStatus === "pending"
          ? {

              payment_proof_verified_at:
                null,

            }

          : {}),

      })

      .eq(
        "id",
        id
      )

      .select(`
        *,
        order_items (*)
      `)

      .single();


  if (error) {

    throw error;

  }


  if (!data) {

    return undefined;

  }


  /* -------------------------------------------------------
     Create history AFTER update succeeds
  ------------------------------------------------------- */

  if (
    existingOrder.payment_status !==
    paymentStatus
  ) {

    await createOrderHistory(
      supabase,
      id,
      "payment_status",
      existingOrder.payment_status,
      paymentStatus,
      "Admin updated payment status"
    );

  }


  return mapAdminOrder(
    data
  );

}


/* =========================================================
   VERIFY PAYMENT PROOF
========================================================= */

export async function verifyAdminPaymentProof(
  id: string
): Promise<Order | undefined> {

  const supabase =
    await createClient();


  const admin =
    await getAuthenticatedAdmin();


  if (!admin) {

    return undefined;

  }


  /* -------------------------------------------------------
     Get current payment information
  ------------------------------------------------------- */

  const {
    data: existingOrder,
    error: existingError,
  } =
    await supabase

      .from("orders")

      .select(`
        status,
        payment_proof_path,
        payment_status
      `)

      .eq(
        "id",
        id
      )

      .single();


  if (existingError) {

    throw existingError;

  }


  if (!existingOrder) {

    return undefined;

  }


  /* -------------------------------------------------------
     Make sure payment proof exists
  ------------------------------------------------------- */

  if (
    !existingOrder.payment_proof_path
  ) {

    throw new Error(
      "Payment proof has not been uploaded."
    );

  }


  /* -------------------------------------------------------
     Prevent duplicate verification

     Once payment is paid, the payment has already
     been verified and must not be verified again.
  ------------------------------------------------------- */

  if (
    existingOrder.payment_status ===
    "paid"
  ) {

    throw new Error(
      "Payment has already been verified."
    );

  }


  /* -------------------------------------------------------
     Payment must still be pending
  ------------------------------------------------------- */

  if (
    existingOrder.payment_status !==
    "pending"
  ) {

    throw new Error(
      `Payment cannot be verified from status ${existingOrder.payment_status}.`
    );

  }


  /* -------------------------------------------------------
     Verify payment

     Payment:
       pending → paid

     Order:
       pending → processing
  ------------------------------------------------------- */

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
          new Date().toISOString(),

      })

      .eq(
        "id",
        id
      )

      .eq(
        "payment_status",
        "pending"
      )

      .select(`
        *,
        order_items (*)
      `)

      .single();


  if (error) {

    throw error;

  }


  if (!data) {

    throw new Error(
      "Payment verification failed."
    );

  }


  /* -------------------------------------------------------
     Create payment history
  ------------------------------------------------------- */

  await createOrderHistory(
    supabase,
    id,
    "payment_verified",
    existingOrder.payment_status,
    "paid",
    "Payment proof verified by admin"
  );


  /* -------------------------------------------------------
     Create order status history
  ------------------------------------------------------- */

  await createOrderHistory(
    supabase,
    id,
    "order_status",
    existingOrder.status,
    "processing",
    "Order moved to processing after payment verification"
  );


  return mapAdminOrder(
    data
  );

}


/* =========================================================
   REJECT PAYMENT PROOF
========================================================= */

export async function rejectAdminPaymentProof(
  id: string
): Promise<Order | undefined> {

  const supabase =
    await createClient();


  const admin =
    await getAuthenticatedAdmin();


  if (!admin) {

    return undefined;

  }


  /* -------------------------------------------------------
     Get existing payment proof
  ------------------------------------------------------- */

  const {
    data: existingOrder,
    error: existingError,
  } =
    await supabase

      .from("orders")

      .select(`
        payment_proof_path,
        payment_status
      `)

      .eq(
        "id",
        id
      )

      .single();


  if (existingError) {

    throw existingError;

  }


  if (!existingOrder) {

    return undefined;

  }


  const proofPath =
    existingOrder.payment_proof_path;


  /* -------------------------------------------------------
     Remove proof from Storage
  ------------------------------------------------------- */

  if (proofPath) {

    const {
      error: storageError,
    } =
      await supabase.storage

        .from(
          "payment-proofs"
        )

        .remove([
          proofPath,
        ]);


    if (storageError) {

      throw storageError;

    }

  }


  /* -------------------------------------------------------
     Reset payment proof
  ------------------------------------------------------- */

  const {
    data,
    error,
  } =
    await supabase

      .from("orders")

      .update({

        payment_proof_path:
          null,

        payment_proof_uploaded_at:
          null,

        payment_proof_verified_at:
          null,

        payment_status:
          "pending",

      })

      .eq(
        "id",
        id
      )

      .select(`
        *,
        order_items (*)
      `)

      .single();


  if (error) {

    throw error;

  }


  if (!data) {

    return undefined;

  }


  /* -------------------------------------------------------
     Create history AFTER update succeeds
  ------------------------------------------------------- */

  await createOrderHistory(
    supabase,
    id,
    "payment_rejected",
    existingOrder.payment_status,
    "pending",
    "Payment proof rejected by admin"
  );


  return mapAdminOrder(
    data
  );

}


/* =========================================================
   UPDATE SHIPPING
========================================================= */

export async function updateAdminShipping(
  id: string,
  input: {
    courier: string;
    trackingNumber: string;
  }
): Promise<Order | undefined> {

  const supabase =
    await createClient();


  const admin =
    await getAuthenticatedAdmin();


  if (!admin) {

    return undefined;

  }


  /* -------------------------------------------------------
     Get current order information

     Shipping can be entered while processing.
     It can also be corrected after shipped.
  ------------------------------------------------------- */

  const {
    data: existingOrder,
    error: existingError,
  } =
    await supabase

      .from("orders")

      .select(`
        status,
        courier,
        tracking_number
      `)

      .eq(
        "id",
        id
      )

      .single();


  if (existingError) {

    throw existingError;

  }


  /* -------------------------------------------------------
     Shipping is not editable after completion/cancellation
  ------------------------------------------------------- */

  if (
    existingOrder.status !==
      "processing" &&
    existingOrder.status !==
      "shipped"
  ) {

    return undefined;

  }


  /* -------------------------------------------------------
     Validate courier
  ------------------------------------------------------- */

  const courier =
    input.courier.trim();


  if (!courier) {

    throw new Error(
      "Courier is required."
    );

  }


  /* -------------------------------------------------------
     Validate tracking number
  ------------------------------------------------------- */

  const trackingNumber =
    input.trackingNumber.trim();


  if (!trackingNumber) {

    throw new Error(
      "Tracking number is required."
    );

  }


  /* -------------------------------------------------------
     Update shipping information
  ------------------------------------------------------- */

  const {
    data,
    error,
  } =
    await supabase

      .from("orders")

      .update({

        courier,

        tracking_number:
          trackingNumber,

      })

      .eq(
        "id",
        id
      )

      .select(`
        *,
        order_items (*)
      `)

      .single();


  if (error) {

    throw error;

  }


  if (!data) {

    return undefined;

  }


  /* -------------------------------------------------------
     Only create history when shipping actually changes.
  ------------------------------------------------------- */

  const oldCourier =
    String(
      existingOrder.courier ?? ""
    ).trim();


  const oldTracking =
    String(
      existingOrder.tracking_number ?? ""
    ).trim();


  const shippingChanged =
    oldCourier !== courier ||
    oldTracking !== trackingNumber;


  if (shippingChanged) {

    await createOrderHistory(
      supabase,
      id,
      "shipping",
      oldTracking || null,
      trackingNumber,
      `Shipping information saved: ${courier} - ${trackingNumber}`
    );

  }


  return mapAdminOrder(
    data
  );

}


/* =========================================================
   GET ADMIN ORDER STATS
========================================================= */

export async function getAdminOrderStats() {

  const supabase =
    await createClient();


  const admin =
    await getAuthenticatedAdmin();


  if (!admin) {

    return null;

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

    throw error;

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
   GET ADMIN PAYMENT REVIEW ORDERS
========================================================= */

export async function getAdminPaymentReviewOrders():
  Promise<Order[]> {

  const supabase =
    await createClient();


  const admin =
    await getAuthenticatedAdmin();


  if (!admin) {

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
          ascending: false,
        }
      );


  if (error) {

    throw error;

  }


  return (
    data ?? []
  ).map(
    mapAdminOrder
  );

}