"use server";

import {
  updateAdminOrderStatus,
  updateAdminPaymentStatus,
  verifyAdminPaymentProof,
  rejectAdminPaymentProof,
} from "@/lib/admin-orders";

import {
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/order";

import { revalidatePath } from "next/cache";


type ActionResult = {
  success: boolean;
  message: string;
};


/* =========================================================
   UPDATE ORDER STATUS
========================================================= */

export async function updateAdminOrderStatusAction(
  id: string,
  status: OrderStatus
): Promise<ActionResult> {

  try {

    const order =
      await updateAdminOrderStatus(
        id,
        status
      );


    if (!order) {

      return {
        success: false,
        message:
          "Unauthorized or order not found.",
      };

    }


    revalidatePath(
      `/admin/orders/${id}`
    );

    revalidatePath(
      "/admin/orders"
    );


    return {
      success: true,
      message:
        "Order status updated.",
    };

  } catch (error) {

    console.error(
      "Failed to update admin order status:",
      error
    );


    return {
      success: false,
      message:
        "Failed to update order status.",
    };

  }

}


/* =========================================================
   UPDATE PAYMENT STATUS
========================================================= */

export async function updateAdminPaymentStatusAction(
  id: string,
  paymentStatus: PaymentStatus
): Promise<ActionResult> {

  try {

    const order =
      await updateAdminPaymentStatus(
        id,
        paymentStatus
      );


    if (!order) {

      return {
        success: false,
        message:
          "Unauthorized or order not found.",
      };

    }


    revalidatePath(
      `/admin/orders/${id}`
    );

    revalidatePath(
      "/admin/orders"
    );


    return {
      success: true,
      message:
        "Payment status updated.",
    };

  } catch (error) {

    console.error(
      "Failed to update admin payment status:",
      error
    );


    return {
      success: false,
      message:
        "Failed to update payment status.",
    };

  }

}


/* =========================================================
   VERIFY PAYMENT PROOF
========================================================= */

export async function verifyAdminPaymentProofAction(
  formData: FormData
): Promise<void> {

  const orderId =
    String(
      formData.get("orderId") ?? ""
    );


  if (!orderId) {
    return;
  }


  try {

    const order =
      await verifyAdminPaymentProof(
        orderId
      );


    if (!order) {

      console.error(
        "Unable to verify payment proof."
      );

      return;

    }


    revalidatePath(
      `/admin/orders/${orderId}`
    );

    revalidatePath(
      "/admin/orders"
    );


  } catch (error) {

    console.error(
      "Failed to verify payment proof:",
      error
    );

  }

}


/* =========================================================
   REJECT PAYMENT PROOF
========================================================= */

export async function rejectAdminPaymentProofAction(
  formData: FormData
): Promise<void> {

  const orderId =
    String(
      formData.get("orderId") ?? ""
    );


  if (!orderId) {
    return;
  }


  try {

    const order =
      await rejectAdminPaymentProof(
        orderId
      );


    if (!order) {

      console.error(
        "Unable to reject payment proof."
      );

      return;

    }


    revalidatePath(
      `/admin/orders/${orderId}`
    );

    revalidatePath(
      "/admin/orders"
    );


  } catch (error) {

    console.error(
      "Failed to reject payment proof:",
      error
    );

  }

}