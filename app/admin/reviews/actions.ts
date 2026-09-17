"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";


type ActionResult = {
  success: boolean;
  message: string;
};


export async function updateReviewStatusAction(
  reviewId: number,
  status: "approved" | "rejected"
): Promise<ActionResult> {

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
        message: "Unauthorized.",
      };

    }


    /* =====================================================
       ADMIN CHECK
    ===================================================== */

    const {
      data: profile,
      error: profileError,
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
      profileError ||
      profile?.role !== "admin"
    ) {

      return {
        success: false,
        message: "Unauthorized.",
      };

    }


    /* =====================================================
       VALIDATION
    ===================================================== */

    if (
      !Number.isInteger(
        reviewId
      ) ||
      reviewId <= 0
    ) {

      return {
        success: false,
        message: "Invalid review.",
      };

    }


    /* =====================================================
       UPDATE
    ===================================================== */

    const {
      data,
      error,
    } =
      await supabase

        .from("reviews")

        .update({

          status,

          updated_at:
            new Date().toISOString(),

        })

        .eq(
          "id",
          reviewId
        )

        .select(
          "id, status"
        )

        .maybeSingle();


    if (error) {

      console.error(
        "updateReviewStatusAction:",
        error
      );

      return {
        success: false,
        message:
          `Failed to update review: ${error.message}`,
      };

    }


    if (!data) {

      return {
        success: false,
        message: "Review not found.",
      };

    }


    /* =====================================================
       REVALIDATE
    ===================================================== */

    revalidatePath(
      "/admin/reviews"
    );

    revalidatePath(
      "/admin"
    );


    return {
      success: true,
      message:
        status === "approved"
          ? "Review approved."
          : "Review rejected.",
    };

  } catch (error) {

    console.error(
      "Review moderation failed:",
      error
    );


    return {

      success: false,

      message:
        error instanceof Error
          ? error.message
          : "Failed to update review.",

    };

  }

}