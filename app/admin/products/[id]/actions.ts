"use server";

import { revalidatePath } from "next/cache";

import {
  createAdminVariant,
  updateAdminVariant,
  deleteAdminVariant,
  type CreateAdminVariantInput,
  type UpdateAdminVariantInput,
} from "@/lib/admin-variants";

export async function createAdminVariantAction(
  input: CreateAdminVariantInput
) {
  try {
    return await createAdminVariant(
      input
    );
  } catch (error) {
    console.error(
      "createAdminVariantAction:",
      error
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to create variant"
    );
  }
}

export async function updateAdminVariantAction(
  id: number,
  input: UpdateAdminVariantInput
) {
  try {
    return await updateAdminVariant(
      id,
      input
    );
  } catch (error) {
    console.error(
      "updateAdminVariantAction:",
      error
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to update variant"
    );
  }
}

export async function deleteAdminVariantAction(
  id: number,
  productId: number
) {
  try {
    await deleteAdminVariant(id);

    revalidatePath(
      `/admin/products/${productId}/variants`
    );

    revalidatePath(
      `/admin/products/${productId}`
    );

    revalidatePath(
      "/admin/products"
    );
  } catch (error) {
    console.error(
      "deleteAdminVariantAction:",
      error
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to delete variant"
    );
  }
}