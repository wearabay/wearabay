"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";


type UploadPaymentProofResult = {
  success: boolean;
  message: string;
};


type ActionResult = {
  success: boolean;
  message: string;
};


/* =====================================================
   SAVE PAYMENT PROOF
===================================================== */

export async function savePaymentProofAction(
  orderId: string,
  path: string
): Promise<UploadPaymentProofResult> {

  try {

    const supabase =
      await createClient();


    /* =================================================
       AUTH
    ================================================= */

    const {
      data: {
        user,
      },
    } =
      await supabase.auth.getUser();


    if (!user) {

      return {
        success: false,
        message:
          "You must be logged in.",
      };

    }


    /* =================================================
       LOAD ORDER
    ================================================= */

    const {
      data: order,
      error: orderError,
    } =
      await supabase

        .from("orders")

        .select(`
          id,
          user_id,
          payment_method,
          payment_status,
          payment_proof_path
        `)

        .eq(
          "id",
          orderId
        )

        .eq(
          "user_id",
          user.id
        )

        .maybeSingle();


    if (orderError) {

      throw orderError;

    }


    if (!order) {

      return {
        success: false,
        message:
          "Order not found.",
      };

    }


    /* =================================================
       PAYMENT METHOD VALIDATION
    ================================================= */

    const payment =
      String(
        order.payment_method ?? ""
      )
        .trim()
        .toLowerCase();


    if (
      payment !== "bank" &&
      payment !== "bank_transfer" &&
      payment !== "bank transfer"
    ) {

      return {
        success: false,
        message:
          "Payment proof is only available for bank transfer orders.",
      };

    }


    /* =================================================
       PAYMENT STATUS VALIDATION
    ================================================= */

    if (
      order.payment_status !== "pending"
    ) {

      return {
        success: false,
        message:
          "Payment proof can only be uploaded while payment is pending.",
      };

    }


    /* =================================================
       PATH VALIDATION
       
       Expected:
       {user_id}/{order_id}/{filename}
    ================================================= */

    const expectedPrefix =
      `${user.id}/${orderId}/`;


    if (
      !path.startsWith(
        expectedPrefix
      )
    ) {

      return {
        success: false,
        message:
          "Invalid payment proof path.",
      };

    }


    const oldPath =
      order.payment_proof_path;


    /* =================================================
       UPDATE PAYMENT PROOF
       
       Customer may only update:
       - payment_proof_path
       - payment_proof_uploaded_at
       
       payment_proof_verified_at is intentionally
       NOT modified here.
    ================================================= */

    const {
      data: updatedOrder,
      error: updateError,
    } =
      await supabase

        .from("orders")

        .update({

          payment_proof_path:
            path,

          payment_proof_uploaded_at:
            new Date().toISOString(),

        })

        .eq(
          "id",
          orderId
        )

        .eq(
          "user_id",
          user.id
        )

        .select(`
          id,
          payment_proof_path,
          payment_proof_uploaded_at,
          payment_proof_verified_at
        `)

        .single();


    if (updateError) {

      throw updateError;

    }


    /* =================================================
       VERIFY DATABASE UPDATE
    ================================================= */

    if (!updatedOrder) {

      throw new Error(
        "Payment proof could not be saved to the order."
      );

    }


    /* =================================================
       REMOVE OLD PAYMENT PROOF
       
       When replacing an existing proof, remove
       the old file from private storage.
    ================================================= */

    if (
      oldPath &&
      oldPath !== path
    ) {

      const {
        error: removeError,
      } =
        await supabase.storage

          .from(
            "payment-proofs"
          )

          .remove([
            oldPath,
          ]);


      if (removeError) {

        console.error(
          "Failed removing old proof:",
          removeError
        );

      }

    }


    /* =================================================
       REVALIDATE
    ================================================= */

    revalidatePath(
      `/account/orders/${orderId}`
    );


    revalidatePath(
      "/account/orders"
    );


    /* =================================================
       SUCCESS
    ================================================= */

    return {

      success: true,

      message:
        oldPath
          ? "Payment proof replaced successfully."
          : "Payment proof uploaded successfully.",

    };


  } catch (error) {

    console.error(
      "Failed to save payment proof:",
      error
    );


    return {

      success: false,

      message:
        error instanceof Error
          ? error.message
          : "Failed to save payment proof.",

    };

  }

}


/* =====================================================
   CONFIRM RECEIVED
===================================================== */

export async function confirmReceivedAction(
  orderId: string
): Promise<ActionResult> {

  try {

    const supabase =
      await createClient();


    /* =================================================
       AUTH
    ================================================= */

    const {
      data: {
        user,
      },
    } =
      await supabase.auth.getUser();


    if (!user) {

      return {

        success: false,

        message:
          "Unauthorized.",

      };

    }


    /* =================================================
       CONFIRM ORDER RECEIVED
    ================================================= */

    const {
      data,
      error,
    } =
      await supabase.rpc(
        "confirm_order_received",
        {
          p_order_id: orderId,
        }
      );


    if (error) {

      console.error(
        "Confirm order received RPC failed:",
        error
      );


      return {

        success: false,

        message:
          error.message ||
          "Failed completing order.",

      };

    }


    if (!data) {

      return {

        success: false,

        message:
          "Order could not be completed.",

      };

    }


    /* =================================================
       REVALIDATE
    ================================================= */

    revalidatePath(
      `/account/orders/${orderId}`
    );


    revalidatePath(
      "/account/orders"
    );


    /* =================================================
       SUCCESS
    ================================================= */

    return {

      success: true,

      message:
        "Order completed.",

    };

  } catch (error) {

    console.error(
      "Confirm received failed:",
      error
    );


    return {

      success: false,

      message:
        error instanceof Error
          ? error.message
          : "Failed completing order.",

    };

  }

}


/* =====================================================
   SUBMIT REVIEW
===================================================== */

export async function submitReviewAction(
  formData: FormData
): Promise<ActionResult> {

  try {

    const supabase =
      await createClient();


    /* =================================================
       AUTH
    ================================================= */

    const {
      data: {
        user,
      },
    } =
      await supabase.auth.getUser();


    if (!user) {

      return {

        success: false,

        message:
          "You must be logged in to submit a review.",

      };

    }


    /* =================================================
       INPUT
    ================================================= */

    const orderId =
      String(
        formData.get("orderId") ?? ""
      ).trim();


    const orderItemId =
      String(
        formData.get("orderItemId") ?? ""
      ).trim();


    const productId =
      Number(
        formData.get("productId")
      );


    const variantId =
      Number(
        formData.get("variantId")
      );


    const rating =
      Number(
        formData.get("rating")
      );


    const title =
      String(
        formData.get("title") ?? ""
      ).trim();


    const comment =
      String(
        formData.get("comment") ?? ""
      ).trim();


    /* =================================================
       BASIC VALIDATION
    ================================================= */

    if (!orderId) {

      return {

        success: false,

        message:
          "Order is required.",

      };

    }


    if (!orderItemId) {

      return {

        success: false,

        message:
          "Order item is required.",

      };

    }


    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {

      return {

        success: false,

        message:
          "Invalid product.",

      };

    }


    if (
      !Number.isInteger(variantId) ||
      variantId <= 0
    ) {

      return {

        success: false,

        message:
          "Invalid product variant.",

      };

    }


    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {

      return {

        success: false,

        message:
          "Rating must be between 1 and 5.",

      };

    }


    if (
      title.length > 120
    ) {

      return {

        success: false,

        message:
          "Review title is too long.",

      };

    }


    if (
      comment.length > 2000
    ) {

      return {

        success: false,

        message:
          "Review comment is too long.",

      };

    }


    /* =================================================
       LOAD ORDER ITEM
       
       Never trust productId / variantId
       supplied by the browser.
    ================================================= */

    const {
      data: orderItem,
      error: orderItemError,
    } =
      await supabase

        .from("order_items")

        .select(`
          id,
          order_id,
          product_id,
          variant_id
        `)

        .eq(
          "id",
          orderItemId
        )

        .maybeSingle();


    if (orderItemError) {

      console.error(
        "Failed to load order item:",
        orderItemError
      );

      return {

        success: false,

        message:
          "Failed to verify order item.",

      };

    }


    if (!orderItem) {

      return {

        success: false,

        message:
          "Order item not found.",

      };

    }


    /* =================================================
       VERIFY ITEM → ORDER
    ================================================= */

    if (
      orderItem.order_id !==
      orderId
    ) {

      return {

        success: false,

        message:
          "Invalid order item.",

      };

    }


    /* =================================================
       VERIFY ITEM → PRODUCT
    ================================================= */

    if (
      Number(
        orderItem.product_id
      ) !== productId
    ) {

      return {

        success: false,

        message:
          "Product does not match the order item.",

      };

    }


    /* =================================================
       VERIFY ITEM → VARIANT
    ================================================= */

    if (
      Number(
        orderItem.variant_id
      ) !== variantId
    ) {

      return {

        success: false,

        message:
          "Variant does not match the order item.",

      };

    }


    /* =================================================
       LOAD ORDER
    ================================================= */

    const {
      data: order,
      error: orderError,
    } =
      await supabase

        .from("orders")

        .select(`
          id,
          user_id,
          status,
          payment_status
        `)

        .eq(
          "id",
          orderId
        )

        .maybeSingle();


    if (orderError) {

      console.error(
        "Failed to load order:",
        orderError
      );

      return {

        success: false,

        message:
          "Failed to verify order.",

      };

    }


    if (!order) {

      return {

        success: false,

        message:
          "Order not found.",

      };

    }


    /* =================================================
       VERIFY OWNERSHIP
    ================================================= */

    if (
      order.user_id !==
      user.id
    ) {

      return {

        success: false,

        message:
          "You are not allowed to review this order.",

      };

    }


    /* =================================================
       VERIFY ORDER ELIGIBILITY
    ================================================= */

    if (
      order.status !== "completed" &&
      order.status !== "delivered"
    ) {

      return {

        success: false,

        message:
          "This order is not eligible for review yet.",

      };

    }


    if (
      order.payment_status !==
      "paid"
    ) {

      return {

        success: false,

        message:
          "This order has not been paid.",

      };

    }


    /* =================================================
       DUPLICATE REVIEW CHECK
    ================================================= */

    const {
      data: existingReview,
      error: existingReviewError,
    } =
      await supabase

        .from("reviews")

        .select(
          "id"
        )

        .eq(
          "order_item_id",
          orderItemId
        )

        .maybeSingle();


    if (existingReviewError) {

      console.error(
        "Failed to check existing review:",
        existingReviewError
      );

      return {

        success: false,

        message:
          "Failed to check existing review.",

      };

    }


    if (existingReview) {

      return {

        success: false,

        message:
          "This item has already been reviewed.",

      };

    }


    /* =================================================
       INSERT REVIEW
    ================================================= */

    const {
      error: insertError,
    } =
      await supabase

        .from("reviews")

        .insert({

          product_id:
            productId,

          order_id:
            orderId,

          order_item_id:
            orderItemId,

          user_id:
            user.id,

          rating,

          title,

          comment,

          status:
            "pending",

        });


    if (insertError) {

      console.error(
        "Failed to submit review:",
        insertError
      );


      return {

        success: false,

        message:
          insertError.code === "23505"
            ? "This item has already been reviewed."
            : "Failed to submit review.",

      };

    }


    /* =================================================
       REVALIDATE
    ================================================= */

    revalidatePath(
      `/account/orders/${orderId}`
    );


    revalidatePath(
      `/shop/${orderItem.product_id}`
    );


    return {

      success: true,

      message:
        "Review submitted successfully.",

    };

  } catch (error) {

    console.error(
      "Submit review failed:",
      error
    );


    return {

      success: false,

      message:
        error instanceof Error
          ? error.message
          : "Failed to submit review.",

    };

  }

}