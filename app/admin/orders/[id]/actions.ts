"use server";

import { revalidatePath } from "next/cache";

import {
  updateAdminOrderStatus,
  updateAdminPaymentStatus,
  updateAdminShipping,
  verifyAdminPaymentProof,
  rejectAdminPaymentProof,
  refundAdminPayment,
} from "@/lib/admin-orders";

import type {
  OrderStatus,
  PaymentStatus,
} from "@/lib/order";

/* =========================================================
   UPDATE ORDER STATUS
========================================================= */

export async function updateAdminOrderStatusAction(
  orderId: string,
  status: OrderStatus
) {
  try {
    const order =
      await updateAdminOrderStatus(
        orderId,
        status
      );

    if (!order) {
      return {
        success: false,
        message:
          "Failed to update order status.",
      };
    }

    revalidatePath(
      `/admin/orders/${orderId}`
    );

    revalidatePath(
      "/admin/orders"
    );

    revalidatePath(
      "/admin"
    );

    return {
      success: true,
      message:
        "Order status updated.",
      order,
    };
  } catch (error) {
    console.error(
      "Update admin order status failed:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update order status.",
    };
  }
}

/* =========================================================
   UPDATE PAYMENT STATUS
========================================================= */

export async function updateAdminPaymentStatusAction(
  orderId: string,
  paymentStatus: PaymentStatus
) {
  try {
    const order =
      await updateAdminPaymentStatus(
        orderId,
        paymentStatus
      );

    if (!order) {
      return {
        success: false,
        message:
          "Failed to update payment status.",
      };
    }

    revalidatePath(
      `/admin/orders/${orderId}`
    );

    revalidatePath(
      "/admin/orders"
    );

    revalidatePath(
      "/admin"
    );

    return {
      success: true,
      message:
        "Payment status updated.",
      order,
    };
  } catch (error) {
    console.error(
      "Update admin payment status failed:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update payment status.",
    };
  }
}

/* =========================================================
   UPDATE SHIPPING
========================================================= */

export async function updateAdminShippingAction(
  orderId: string,
  input: {
    courier: string;
    trackingNumber: string;
  }
) {
  try {
    /* -----------------------------------------------------
       Basic validation
    ----------------------------------------------------- */

    const courier =
      input.courier.trim();

    const trackingNumber =
      input.trackingNumber.trim();

    if (!courier) {
      return {
        success: false,
        message:
          "Courier is required.",
      };
    }

    if (!trackingNumber) {
      return {
        success: false,
        message:
          "Tracking number is required.",
      };
    }

    /* -----------------------------------------------------
       Update shipping
    ----------------------------------------------------- */

    const order =
      await updateAdminShipping(
        orderId,
        {
          courier,
          trackingNumber,
        }
      );

    if (!order) {
      return {
        success: false,
        message:
          "Shipping information could not be updated.",
      };
    }

    /* -----------------------------------------------------
       Revalidate
    ----------------------------------------------------- */

    revalidatePath(
      `/admin/orders/${orderId}`
    );

    revalidatePath(
      "/admin/orders"
    );

    revalidatePath(
      "/admin"
    );

    return {
      success: true,
      message:
        "Shipping information saved.",
      order,
    };
  } catch (error) {
    console.error(
      "Update admin shipping failed:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to save shipping information.",
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
    throw new Error(
      "Missing order ID."
    );
  }

  try {
    const order =
      await verifyAdminPaymentProof(
        orderId
      );

    if (!order) {
      throw new Error(
        "Payment proof could not be verified."
      );
    }

    revalidatePath(
      `/admin/orders/${orderId}`
    );

    revalidatePath(
      "/admin/orders"
    );

    revalidatePath(
      "/admin"
    );
  } catch (error) {
    console.error(
      "Verify payment proof failed:",
      error
    );

    throw error;
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
    throw new Error(
      "Missing order ID."
    );
  }

  try {
    const order =
      await rejectAdminPaymentProof(
        orderId
      );

    if (!order) {
      throw new Error(
        "Payment proof could not be rejected."
      );
    }

    revalidatePath(
      `/admin/orders/${orderId}`
    );

    revalidatePath(
      "/admin/orders"
    );

    revalidatePath(
      "/admin"
    );
  } catch (error) {
    console.error(
      "Reject payment proof failed:",
      error
    );

    throw error;
  }
}

/* =========================================================
   REFUND PAYMENT
========================================================= */

export async function refundAdminPaymentAction(
  formData: FormData
): Promise<void> {
  const orderId =
    String(
      formData.get("orderId") ?? ""
    );

  if (!orderId) {
    throw new Error(
      "Missing order ID."
    );
  }

  try {
    const order =
      await refundAdminPayment(
        orderId
      );

    if (!order) {
      throw new Error(
        "Payment could not be refunded."
      );
    }

    revalidatePath(
      `/admin/orders/${orderId}`
    );

    revalidatePath(
      "/admin/orders"
    );

    revalidatePath(
      "/admin"
    );
  } catch (error) {
    console.error(
      "Refund payment failed:",
      error
    );

    throw error;
  }
}