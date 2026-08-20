import { createClient } from "@/lib/supabase/server";
import type {
  Order,
  OrderStatus,
  PaymentStatus,
} from "@/lib/order";


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


  const {
    data,
    error,
  } =
    await supabase

      .from("orders")

      .update({
        status,
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


  const {
    data,
    error,
  } =
    await supabase

      .from("orders")

      .update({
        payment_status:
          paymentStatus,
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
     Make sure a payment proof exists
  ------------------------------------------------------- */

  const {
    data: existingOrder,
    error: existingError,
  } =
    await supabase

      .from("orders")

      .select(
        "payment_proof_path"
      )

      .eq(
        "id",
        id
      )

      .single();


  if (existingError) {
    throw existingError;
  }


  if (
    !existingOrder?.payment_proof_path
  ) {

    return undefined;

  }


  /* -------------------------------------------------------
     Verify payment
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
    "paid",

  payment_proof_verified_at:
    new Date().toISOString(),

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
     Get existing proof path
  ------------------------------------------------------- */

  const {
    data: existingOrder,
    error: existingError,
  } =
    await supabase

      .from("orders")

      .select(
        "payment_proof_path"
      )

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

        .from("payment-proofs")

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


  return mapAdminOrder(
    data
  );

}