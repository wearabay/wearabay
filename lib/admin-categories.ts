import { createClient } from "@/lib/supabase/server";
import {
  getAdminUser,
  getSuperAdminUser,
} from "@/lib/admin";

type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  productCount: number;
};

export type CategoryInput = {
  name: string;
  slug?: string;
  description?: string;
  coverImage?: string;
  sortOrder?: number;
  isActive?: boolean;
};

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapCategory(
  row: CategoryRow,
  productCount = 0,
): AdminCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    coverImage: row.cover_image,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    productCount,
  };
}

async function requireAdmin() {
  const admin = await getAdminUser();

  if (!admin) {
    throw new Error(
      "You do not have permission to access categories.",
    );
  }

  return admin;
}

async function requireSuperAdmin() {
  const admin = await getSuperAdminUser();

  if (!admin) {
    throw new Error(
      "Only a super admin can manage categories.",
    );
  }

  return admin;
}


/* =========================================================
   GET ALL CATEGORIES
   ========================================================= */

export async function getAdminCategories(): Promise<
  AdminCategory[]
> {
  await requireAdmin();

  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", {
      ascending: true,
    })
    .order("name", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Failed to load categories: ${error.message}`,
    );
  }

  const categories = data ?? [];

  if (categories.length === 0) {
    return [];
  }

  const categoryIds = categories.map(
    (category) => category.id,
  );

  const {
    data: products,
    error: productsError,
  } = await supabase
    .from("products")
    .select("category_id")
    .in("category_id", categoryIds);

  if (productsError) {
    throw new Error(
      `Failed to count category products: ${productsError.message}`,
    );
  }

  const productCountByCategory =
    new Map<number, number>();

  for (const product of products ?? []) {
    if (product.category_id === null) {
      continue;
    }

    productCountByCategory.set(
      product.category_id,
      (productCountByCategory.get(
        product.category_id,
      ) ?? 0) + 1,
    );
  }

  return categories.map((category) =>
    mapCategory(
      category,
      productCountByCategory.get(category.id) ?? 0,
    ),
  );
}


/* =========================================================
   GET SINGLE CATEGORY
   ========================================================= */

export async function getAdminCategoryById(
  id: number,
): Promise<AdminCategory | null> {
  await requireAdmin();

  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load category: ${error.message}`,
    );
  }

  if (!data) {
    return null;
  }

  const {
    count,
    error: countError,
  } = await supabase
    .from("products")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("category_id", id);

  if (countError) {
    throw new Error(
      `Failed to count category products: ${countError.message}`,
    );
  }

  return mapCategory(
    data,
    count ?? 0,
  );
}


/* =========================================================
   CREATE CATEGORY
   ========================================================= */

export async function createAdminCategory(
  input: CategoryInput,
): Promise<AdminCategory> {
  await requireSuperAdmin();

  const name = normalizeName(input.name);

  if (!name) {
    throw new Error(
      "Category name is required.",
    );
  }

  const slug = slugify(
    input.slug?.trim() || name,
  );

  if (!slug) {
    throw new Error(
      "A valid category slug is required.",
    );
  }

  const supabase = await createClient();

  const {
    data: existingName,
  } = await supabase
    .from("categories")
    .select("id")
    .ilike("name", name)
    .maybeSingle();

  if (existingName) {
    throw new Error(
      "A category with this name already exists.",
    );
  }

  const {
    data: existingSlug,
  } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existingSlug) {
    throw new Error(
      "A category with this slug already exists.",
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("categories")
    .insert({
      name,
      slug,
      description:
        input.description?.trim() || null,
      cover_image:
        input.coverImage?.trim() || null,
      sort_order:
        input.sortOrder ?? 0,
      is_active:
        input.isActive ?? true,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(
      error?.message ??
        "Failed to create category.",
    );
  }

  return mapCategory(data, 0);
}


/* =========================================================
   UPDATE CATEGORY
   ========================================================= */

export async function updateAdminCategory(
  id: number,
  input: CategoryInput,
): Promise<AdminCategory> {
  await requireSuperAdmin();

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      "Invalid category ID.",
    );
  }

  const name = normalizeName(input.name);

  if (!name) {
    throw new Error(
      "Category name is required.",
    );
  }

  const slug = slugify(
    input.slug?.trim() || name,
  );

  if (!slug) {
    throw new Error(
      "A valid category slug is required.",
    );
  }

  const supabase = await createClient();

  const {
    data: existingName,
  } = await supabase
    .from("categories")
    .select("id")
    .ilike("name", name)
    .neq("id", id)
    .maybeSingle();

  if (existingName) {
    throw new Error(
      "A category with this name already exists.",
    );
  }

  const {
    data: existingSlug,
  } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .neq("id", id)
    .maybeSingle();

  if (existingSlug) {
    throw new Error(
      "A category with this slug already exists.",
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("categories")
    .update({
      name,
      slug,
      description:
        input.description?.trim() || null,
      cover_image:
        input.coverImage?.trim() || null,
      sort_order:
        input.sortOrder ?? 0,
      is_active:
        input.isActive ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(
      error?.message ??
        "Failed to update category.",
    );
  }

  const {
    count,
    error: countError,
  } = await supabase
    .from("products")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("category_id", id);

  if (countError) {
    throw new Error(
      `Category updated, but product count could not be loaded: ${countError.message}`,
    );
  }

  return mapCategory(
    data,
    count ?? 0,
  );
}


/* =========================================================
   DELETE CATEGORY
   ========================================================= */

export async function deleteAdminCategory(
  id: number,
): Promise<void> {
  await requireSuperAdmin();

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      "Invalid category ID.",
    );
  }

  const supabase = await createClient();

  const {
    count,
    error: countError,
  } = await supabase
    .from("products")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("category_id", id);

  if (countError) {
    throw new Error(
      `Failed to check category usage: ${countError.message}`,
    );
  }

  if ((count ?? 0) > 0) {
    throw new Error(
      "This category is still assigned to products and cannot be deleted. Deactivate it instead.",
    );
  }

  const {
    error,
  } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(
      `Failed to delete category: ${error.message}`,
    );
  }
}