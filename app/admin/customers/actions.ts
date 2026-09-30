"use server";

import { revalidatePath } from "next/cache";

import {
  getSuperAdminUser,
} from "@/lib/admin";

import { createClient } from "@/lib/supabase/server";

export type ManageableCustomerRole =
  | "customer"
  | "admin"
  | "super_admin";

type UpdateCustomerRoleResult = {
  success: boolean;
  message: string;
};

export async function updateCustomerRoleAction(
  customerId: string,
  role: ManageableCustomerRole,
): Promise<UpdateCustomerRoleResult> {
  try {
    /* =====================================================
       SUPER ADMIN AUTHORIZATION
    ===================================================== */

    const currentAdmin =
      await getSuperAdminUser();

    if (!currentAdmin) {
      return {
        success: false,
        message: "Unauthorized.",
      };
    }

    /* =====================================================
       VALIDATE TARGET
    ===================================================== */

    const targetId =
      customerId.trim();

    if (!targetId) {
      return {
        success: false,
        message: "Invalid customer.",
      };
    }

    if (
      currentAdmin.id ===
      targetId
    ) {
      return {
        success: false,
        message:
          "You cannot change your own role.",
      };
    }

    if (
      role !== "customer" &&
      role !== "admin" &&
      role !== "super_admin"
    ) {
      return {
        success: false,
        message: "Invalid role.",
      };
    }

    /* =====================================================
       DATABASE
    ===================================================== */

    const supabase =
      await createClient();

    const {
      data: targetProfile,
      error: targetProfileError,
    } =
      await supabase
        .from("profiles")
        .select(
          "id, role",
        )
        .eq(
          "id",
          targetId,
        )
        .maybeSingle();

    if (targetProfileError) {
      console.error(
        "updateCustomerRoleAction target:",
        targetProfileError,
      );

      return {
        success: false,
        message:
          "Failed to load customer.",
      };
    }

    if (!targetProfile) {
      return {
        success: false,
        message:
          "Customer not found.",
      };
    }

    if (
      targetProfile.role ===
      role
    ) {
      return {
        success: false,
        message:
          "Customer already has this role.",
      };
    }

    /* =====================================================
       ROLE PROTECTION
    ===================================================== */

    /*
      A super admin can manage another super admin,
      but cannot remove the final super admin account.

      This prevents the system from accidentally ending
      up without any super admin.
    */

    if (
      targetProfile.role ===
        "super_admin" &&
      role !== "super_admin"
    ) {
      const {
        count,
        error: countError,
      } =
        await supabase
          .from("profiles")
          .select(
            "id",
            {
              count: "exact",
              head: true,
            },
          )
          .eq(
            "role",
            "super_admin",
          );

      if (countError) {
        console.error(
          "updateCustomerRoleAction super admin count:",
          countError,
        );

        return {
          success: false,
          message:
            "Failed to verify super admin protection.",
        };
      }

      if (
        (count ?? 0) <= 1
      ) {
        return {
          success: false,
          message:
            "The last Admin Utama cannot be demoted.",
        };
      }
    }

    /* =====================================================
       UPDATE ROLE
    ===================================================== */

    const {
      error: updateError,
    } =
      await supabase
        .from("profiles")
        .update({
          role,
        })
        .eq(
          "id",
          targetId,
        );

    if (updateError) {
      console.error(
        "updateCustomerRoleAction update:",
        updateError,
      );

      return {
        success: false,
        message:
          `Failed to update role: ${updateError.message}`,
      };
    }

    /* =====================================================
       REVALIDATE
    ===================================================== */

    revalidatePath(
      "/admin/customers",
    );

    revalidatePath(
      `/admin/customers/${targetId}`,
    );

    revalidatePath(
      "/admin",
    );

    /* =====================================================
       RESULT
    ===================================================== */

    const roleLabel =
      role === "super_admin"
        ? "Admin Utama"
        : role === "admin"
          ? "Admin 2"
          : "Customer";

    return {
      success: true,
      message:
        `Role updated to ${roleLabel}.`,
    };
  } catch (error) {
    console.error(
      "updateCustomerRoleAction failed:",
      error,
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update customer role.",
    };
  }
}