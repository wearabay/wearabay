"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  type CreateAdminProductInput,
  type UpdateAdminProductInput,
} from "@/lib/admin-products";

export async function createAdminProductAction(
  input: CreateAdminProductInput
) {
  let product;

  try {
    product =
      await createAdminProduct(input);
  } catch (error) {
    console.error(
      "createAdminProductAction:",
      error
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to create product"
    );
  }

  redirect(
    `/admin/products/${product.id}`
  );
}

export async function updateAdminProductAction(
  id: number,
  input: UpdateAdminProductInput
) {
  try {
    const product =
      await updateAdminProduct(
        id,
        input
      );

    revalidatePath(
      "/admin/products"
    );

    revalidatePath(
      `/admin/products/${id}`
    );

    return product;
  } catch (error) {
    console.error(
      "updateAdminProductAction:",
      error
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to update product"
    );
  }
}

export async function deleteAdminProductAction(
  id: number
) {
  try {
    await deleteAdminProduct(id);

    revalidatePath(
      "/admin/products"
    );
  } catch (error) {
    console.error(
      "deleteAdminProductAction:",
      error
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to delete product"
    );
  }
}