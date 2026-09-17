import { createClient } from "@/lib/supabase/server";


/* =========================================================
   TYPES
========================================================= */

export type AdminReviewStatus =
  | "pending"
  | "approved"
  | "rejected";


export type AdminReview = {
  id: number;

  productId: number;
  productName: string;

  orderId: string;
  orderNumber: string;

  orderItemId: string;

  userId: string;
  customerName: string;
  customerEmail: string;

  rating: number;

  title: string;
  comment: string;

  status: AdminReviewStatus;

  createdAt: string;
  updatedAt: string;
};


/* =========================================================
   ROW TYPE
========================================================= */

type AdminReviewRow = {
  id: number;

  product_id: number;
  order_id: string;
  order_item_id: string;
  user_id: string;

  rating: number;
  title: string;
  comment: string;
  status: AdminReviewStatus;

  created_at: string;
  updated_at: string;

  products:
    | {
        name: string | null;
      }
    | null;

  orders:
    | {
        order_number: string | null;
        customer_email: string | null;
      }
    | null;

  profiles:
    | {
        full_name: string | null;
        first_name: string | null;
        last_name: string | null;
      }
    | null;
};


/* =========================================================
   HELPERS
========================================================= */

function getCustomerName(
  profile: AdminReviewRow["profiles"]
): string {

  const fullName =
    profile?.full_name?.trim() ?? "";


  if (fullName) {
    return fullName;
  }


  const firstName =
    profile?.first_name?.trim() ?? "";


  const lastName =
    profile?.last_name?.trim() ?? "";


  const combined =
    `${firstName} ${lastName}`.trim();


  return combined || "Customer";

}


function mapAdminReview(
  row: AdminReviewRow
): AdminReview {

  return {

    id:
      row.id,

    productId:
      Number(
        row.product_id
      ),

    productName:
      row.products?.name ??
      "Unknown Product",

    orderId:
      row.order_id,

    orderNumber:
      row.orders?.order_number ??
      "",

    orderItemId:
      row.order_item_id,

    userId:
      row.user_id,

    customerName:
      getCustomerName(
        row.profiles
      ),

    customerEmail:
      row.orders?.customer_email ??
      "",

    rating:
      Number(
        row.rating
      ),

    title:
      row.title,

    comment:
      row.comment,

    status:
      row.status,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,

  };

}


/* =========================================================
   GET ADMIN REVIEWS
========================================================= */

export async function getAdminReviews(
  status?: AdminReviewStatus
): Promise<AdminReview[]> {

  const supabase =
    await createClient();


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
    data: profile,
  } =
    await supabase

      .from("profiles")

      .select(
        "role"
      )

      .eq(
        "id",
        user.id
      )

      .maybeSingle();


  if (
    profile?.role !==
    "admin"
  ) {

    return [];

  }


  let query =
    supabase

      .from("reviews")

      .select(`
        id,
        product_id,
        order_id,
        order_item_id,
        user_id,
        rating,
        title,
        comment,
        status,
        created_at,
        updated_at,
        products (
          name
        ),
        orders (
          order_number,
          customer_email
        ),
        profiles (
          full_name,
          first_name,
          last_name
        )
      `)

      .order(
        "created_at",
        {
          ascending: false,
        }
      );


  if (status) {

    query =
      query.eq(
        "status",
        status
      );

  }


  const {
    data,
    error,
  } =
    await query;


  if (error) {

    console.error(
      "getAdminReviews:",
      error
    );

    throw new Error(
      `Failed to load reviews: ${error.message}`
    );

  }


  return (
    (data as unknown as AdminReviewRow[] | null) ??
    []
  ).map(
    mapAdminReview
  );

}


/* =========================================================
   REVIEW STATS
========================================================= */

export async function getAdminReviewStats() {

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
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

  }


  const {
    data: profile,
  } =
    await supabase

      .from("profiles")

      .select(
        "role"
      )

      .eq(
        "id",
        user.id
      )

      .maybeSingle();


  if (
    profile?.role !==
    "admin"
  ) {

    return {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

  }


  const {
    data,
    error,
  } =
    await supabase

      .from("reviews")

      .select(
        "status"
      );


  if (error) {

    console.error(
      "getAdminReviewStats:",
      error
    );

    return {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

  }


  const reviews =
    data ?? [];


  return {

    total:
      reviews.length,

    pending:
      reviews.filter(
        (review) =>
          review.status ===
          "pending"
      ).length,

    approved:
      reviews.filter(
        (review) =>
          review.status ===
          "approved"
      ).length,

    rejected:
      reviews.filter(
        (review) =>
          review.status ===
          "rejected"
      ).length,

  };

}