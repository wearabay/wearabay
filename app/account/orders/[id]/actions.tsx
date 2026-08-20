"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";


type UploadPaymentProofResult = {
  success: boolean;
  message: string;
};


export async function savePaymentProofAction(
  orderId: string,
  path: string
): Promise<UploadPaymentProofResult> {

  try {

    const supabase =
      await createClient();


    /* =====================================================
       AUTH
    ===================================================== */

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


    /* =====================================================
       LOAD ORDER
    ===================================================== */

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


    /* =====================================================
       PAYMENT METHOD
    ===================================================== */

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


    /* =====================================================
       PAYMENT STATUS
    ===================================================== */

    if (
      order.payment_status !==
      "pending"
    ) {

      return {
        success: false,
        message:
          "Payment proof can only be uploaded while payment is pending.",
      };

    }


    /* =====================================================
       VERIFY PATH
    ===================================================== */

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


    /* =====================================================
       SAVE NEW PAYMENT PROOF
    ===================================================== */

    const oldPath =
      order.payment_proof_path;


    const {
      error: updateError,
    } =
      await supabase

        .from("orders")

        .update({

          payment_proof_path:
            path,

          payment_proof_uploaded_at:
            new Date().toISOString(),

          /*
           * A new upload must be reviewed again.
           */
          payment_proof_verified_at:
            null,

        })

        .eq(
          "id",
          orderId
        )

        .eq(
          "user_id",
          user.id
        );


    if (updateError) {

      throw updateError;

    }


    /* =====================================================
       REMOVE OLD PAYMENT PROOF
    ===================================================== */

    if (
      oldPath &&
      oldPath !== path
    ) {

      const {
        error: removeError,
      } =
        await supabase.storage

          .from("payment-proofs")

          .remove([
            oldPath,
          ]);


      if (removeError) {

        /*
         * Do not fail the upload because
         * the old file could not be removed.
         *
         * The database already points to
         * the new payment proof.
         */

        console.error(
          "Failed to remove old payment proof:",
          removeError
        );

      }

    }


    /* =====================================================
       REFRESH ORDER PAGE
    ===================================================== */

    revalidatePath(
      `/account/orders/${orderId}`
    );


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
        "Failed to save payment proof.",
    };

  }

}