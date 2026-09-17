import { createClient } from "@/lib/supabase/client";

import type { Review } from "@/types/review";


/* =========================================================
   PRODUCT REVIEW
========================================================= */

type ProductReviewRow = {
  id: number;
  product_id: number;

  name: string;
  rating: number;

  title: string;
  comment: string;

  verified: boolean;

  date: string;
};


function mapReview(
  row: ProductReviewRow
): Review {

  return {
    id:
      row.id,

    productId:
      row.product_id,

    name:
      row.name,

    rating:
      row.rating,

    title:
      row.title,

    comment:
      row.comment,

    verified:
      row.verified,

    date:
      row.date,
  };

}


export async function getProductReviews(
  productId: number
): Promise<Review[]> {

  const supabase =
    createClient();


  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_product_reviews",
      {
        p_product_id:
          productId,
      }
    );


  if (error) {

    console.error(
      "getProductReviews:",
      error
    );

    throw new Error(
      `Failed to load reviews: ${error.message}`
    );

  }


  return (
    (data as ProductReviewRow[] | null) ??
    []
  ).map(
    mapReview
  );

}


/* =========================================================
   ORDER REVIEW ITEMS
========================================================= */

export type OrderReviewItem = {
  orderItemId: string;

  productId: number;

  variantId: number;

  name: string;

  image: string;

  color?: string;

  size?: string;

  quantity: number;

  price: number;

  reviewed: boolean;

};


type OrderReviewItemRow = {
  order_item_id: string;

  product_id: number;

  variant_id: number;

  product_name: string;

  product_image: string | null;

  color: string | null;

  size: string | null;

  quantity: number;

  unit_price: number | string;

  reviewed: boolean;
};


function mapOrderReviewItem(
  row: OrderReviewItemRow
): OrderReviewItem {

  return {
    orderItemId:
      row.order_item_id,

    productId:
      Number(
        row.product_id
      ),

    variantId:
      Number(
        row.variant_id
      ),

    name:
      row.product_name,

    image:
      row.product_image ?? "",

    color:
      row.color ?? undefined,

    size:
      row.size ?? undefined,

    quantity:
      Number(
        row.quantity
      ),

    price:
      Number(
        row.unit_price
      ),

    reviewed:
      row.reviewed,
  };

}


/**
 * Get items from an order that are eligible
 * for review.
 *
 * The database RPC is responsible for:
 * - verifying order ownership
 * - verifying order/payment status
 * - returning the real order_item ID
 * - returning the real product/variant IDs
 * - indicating whether the item was already reviewed
 */
export async function getOrderReviewItems(
  orderId: string
): Promise<OrderReviewItem[]> {

  const supabase =
    createClient();


  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_order_review_items",
      {
        p_order_id:
          orderId,
      }
    );


  if (error) {

    console.error(
      "getOrderReviewItems:",
      error
    );

    throw new Error(
      `Failed to load review items: ${error.message}`
    );

  }


  return (
    (data as OrderReviewItemRow[] | null) ??
    []
  ).map(
    mapOrderReviewItem
  );

}