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


    const {
      data: {
        user,
      },
    } =
      await supabase.auth.getUser();


    if (!user) {

      return {
        success:false,
        message:
          "You must be logged in.",
      };

    }



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



    if(orderError){
      throw orderError;
    }



    if(!order){

      return {
        success:false,
        message:
          "Order not found.",
      };

    }



    const payment =
      String(
        order.payment_method ?? ""
      )
      .trim()
      .toLowerCase();



    if(
      payment !== "bank" &&
      payment !== "bank_transfer" &&
      payment !== "bank transfer"
    ){

      return {
        success:false,
        message:
          "Payment proof is only available for bank transfer orders.",
      };

    }



    if(
      order.payment_status !== "pending"
    ){

      return {
        success:false,
        message:
          "Payment proof can only be uploaded while payment is pending.",
      };

    }



    const expectedPrefix =
      `${user.id}/${orderId}/`;



    if(
      !path.startsWith(
        expectedPrefix
      )
    ){

      return {
        success:false,
        message:
          "Invalid payment proof path.",
      };

    }



    const oldPath =
      order.payment_proof_path;



    const {
      error:updateError,
    } =
      await supabase

        .from("orders")

        .update({

          payment_proof_path:
            path,

          payment_proof_uploaded_at:
            new Date().toISOString(),

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



    if(updateError){
      throw updateError;
    }



    if(
      oldPath &&
      oldPath !== path
    ){

      const {
        error:removeError,
      } =
        await supabase.storage

          .from("payment-proofs")

          .remove([
            oldPath,
          ]);



      if(removeError){

        console.error(
          "Failed removing old proof:",
          removeError
        );

      }

    }



    revalidatePath(
      `/account/orders/${orderId}`
    );



    return {

      success:true,

      message:
        oldPath
          ? "Payment proof replaced successfully."
          : "Payment proof uploaded successfully.",

    };


  } catch(error) {


    console.error(
      "Failed to save payment proof:",
      error
    );


    return {

      success:false,

      message:
        "Failed to save payment proof.",

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