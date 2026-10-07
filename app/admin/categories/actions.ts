"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  deleteAdminCategory,
  getAdminCategoryById,
  updateAdminCategory,
} from "@/lib/admin-categories";

export async function toggleAdminCategoryAction(
  id: number,
  isActive: boolean,
) {
  const category =
    await getAdminCategoryById(id);

  if (!category) {
    throw new Error(
      "Category not found.",
    );
  }

  await updateAdminCategory(
    id,
    {
      name: category.name,
      slug: category.slug,
      description:
        category.description ?? "",
      coverImage:
        category.coverImage ?? "",
      sortOrder:
        category.sortOrder,
      isActive,
    },
  );

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function deleteAdminCategoryAction(
  id: number,
) {
  await deleteAdminCategory(id);

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}