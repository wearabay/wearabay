"use server";

import { revalidatePath } from "next/cache";

import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategoryById,
  updateAdminCategory,
} from "@/lib/admin-categories";

export async function createAdminCategoryAction(input: {
  name: string;
  slug?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  const category = await createAdminCategory(input);

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");

  return category;
}

export async function updateAdminCategoryAction(
  id: number,
  input: {
    name: string;
    slug?: string;
    description?: string;
    coverImage?: string;
    sortOrder?: number;
    isActive?: boolean;
  },
) {
  const category = await updateAdminCategory(id, input);

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${id}`);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");

  return category;
}

export async function setAdminCategoryCoverAction(
  id: number,
  coverImage: string | null,
) {
  const category = await getAdminCategoryById(id);

  if (!category) {
    throw new Error("Category not found.");
  }

  const updated = await updateAdminCategory(id, {
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    coverImage: coverImage ?? "",
    sortOrder: category.sortOrder,
    isActive: category.isActive,
  });

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${id}`);
  revalidatePath("/shop");
  revalidatePath("/");

  return updated;
}

export async function toggleAdminCategoryAction(
  id: number,
  isActive: boolean,
) {
  const category = await getAdminCategoryById(id);

  if (!category) {
    throw new Error("Category not found.");
  }

  await updateAdminCategory(id, {
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    coverImage: category.coverImage ?? "",
    sortOrder: category.sortOrder,
    isActive,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function deleteAdminCategoryAction(id: number) {
  await deleteAdminCategory(id);

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}