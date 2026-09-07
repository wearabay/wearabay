import { createClient } from "@/lib/supabase/server";

export type AdminVariantStatus =
  | "active"
  | "inactive";

export type AdminProductVariant = {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  color: string;
  size: string;
  sku: string | null;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  status: AdminVariantStatus;
  createdAt: string;
  updatedAt: string;
};

type ProductVariantRow = {
  id: number;
  product_id: number;
  sku: string | null;
  color: string;
  size: string;
  price: number | string;
  compare_at_price:
    | number
    | string
    | null;
  stock: number;
  status: AdminVariantStatus;
  created_at: string;
  updated_at: string;
  products:
    | {
        id: number;
        name: string;
        slug: string;
      }
    | {
        id: number;
        name: string;
        slug: string;
      }[]
    | null;
};

export type CreateAdminVariantInput = {
  productId: number;
  color: string;
  size: string;
  sku?: string | null;
  price: number;
  compareAtPrice?: number | null;
  stock?: number;
  status?: AdminVariantStatus;
};

export type UpdateAdminVariantInput = {
  color?: string;
  size?: string;
  sku?: string | null;
  price?: number;
  compareAtPrice?: number | null;
  stock?: number;
  status?: AdminVariantStatus;
};

async function assertAdmin() {
  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized");
  }

  const {
    data: profile,
    error: profileError,
  } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

  if (
    profileError ||
    !profile ||
    profile.role !== "admin"
  ) {
    throw new Error("Unauthorized");
  }

  return supabase;
}

function getProduct(
  products: ProductVariantRow["products"]
) {
  return Array.isArray(products)
    ? products[0] ?? null
    : products;
}

function mapAdminVariant(
  row: ProductVariantRow
): AdminProductVariant {
  const product =
    getProduct(row.products);

  return {
    id: row.id,
    productId:
      row.product_id,
    productName:
      product?.name ??
      "Unknown Product",
    productSlug:
      product?.slug ?? "",
    color: row.color,
    size: row.size,
    sku: row.sku,
    price: Number(row.price),
    compareAtPrice:
      row.compare_at_price === null
        ? null
        : Number(
            row.compare_at_price
          ),
    stock: row.stock,
    status: row.status,
    createdAt:
      row.created_at,
    updatedAt:
      row.updated_at,
  };
}

const variantSelect = `
  id,
  product_id,
  sku,
  color,
  size,
  price,
  compare_at_price,
  stock,
  status,
  created_at,
  updated_at,
  products (
    id,
    name,
    slug
  )
`;

export async function getAdminProductVariants(
  productId: number
): Promise<AdminProductVariant[]> {
  const supabase =
    await assertAdmin();

  if (
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    throw new Error(
      "Invalid product ID"
    );
  }

  const {
    data,
    error,
  } =
    await supabase
      .from("product_variants")
      .select(variantSelect)
      .eq(
        "product_id",
        productId
      )
      .order("color", {
        ascending: true,
      })
      .order("size", {
        ascending: true,
      })
      .order("id", {
        ascending: true,
      });

  if (error) {
    console.error(
      "getAdminProductVariants:",
      error
    );

    throw new Error(
      `Failed to load variants: ${error.message}`
    );
  }

  return (data ?? []).map(
    (row) =>
      mapAdminVariant(
        row as unknown as ProductVariantRow
      )
  );
}

export async function getAdminVariantById(
  id: number
): Promise<AdminProductVariant | null> {
  const supabase =
    await assertAdmin();

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      "Invalid variant ID"
    );
  }

  const {
    data,
    error,
  } =
    await supabase
      .from("product_variants")
      .select(variantSelect)
      .eq("id", id)
      .maybeSingle();

  if (error) {
    console.error(
      "getAdminVariantById:",
      error
    );

    throw new Error(
      `Failed to load variant: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return mapAdminVariant(
    data as unknown as ProductVariantRow
  );
}

export async function createAdminVariant(
  input: CreateAdminVariantInput
): Promise<AdminProductVariant> {
  const supabase =
    await assertAdmin();

  if (
    !Number.isInteger(
      input.productId
    ) ||
    input.productId <= 0
  ) {
    throw new Error(
      "Invalid product ID"
    );
  }

  const color =
    input.color.trim();

  const size =
    input.size.trim();

  if (!color) {
    throw new Error(
      "Color is required"
    );
  }

  if (!size) {
    throw new Error(
      "Size is required"
    );
  }

  if (
    !Number.isFinite(
      input.price
    ) ||
    input.price < 0
  ) {
    throw new Error(
      "Price must be a valid non-negative number"
    );
  }

  const stock =
    input.stock ?? 0;

  if (
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    throw new Error(
      "Stock must be a non-negative integer"
    );
  }

  const compareAtPrice =
    input.compareAtPrice ?? null;

  if (
    compareAtPrice !== null &&
    (!Number.isFinite(
      compareAtPrice
    ) ||
      compareAtPrice < 0)
  ) {
    throw new Error(
      "Compare at price must be a valid non-negative number"
    );
  }

  const {
    data,
    error,
  } =
    await supabase
      .from("product_variants")
      .insert({
        product_id:
          input.productId,
        color,
        size,
        sku:
          input.sku?.trim() ||
          null,
        price: input.price,
        compare_at_price:
          compareAtPrice,
        stock,
        status:
          input.status ??
          "active",
      })
      .select(variantSelect)
      .single();

  if (error) {
    console.error(
      "createAdminVariant:",
      error
    );

    throw new Error(
      `Failed to create variant: ${error.message}`
    );
  }

  return mapAdminVariant(
    data as unknown as ProductVariantRow
  );
}

export async function updateAdminVariant(
  id: number,
  input: UpdateAdminVariantInput
): Promise<AdminProductVariant> {
  const supabase =
    await assertAdmin();

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      "Invalid variant ID"
    );
  }

  const payload: Record<
    string,
    unknown
  > = {};

  if (input.color !== undefined) {
    const color =
      input.color.trim();

    if (!color) {
      throw new Error(
        "Color is required"
      );
    }

    payload.color = color;
  }

  if (input.size !== undefined) {
    const size =
      input.size.trim();

    if (!size) {
      throw new Error(
        "Size is required"
      );
    }

    payload.size = size;
  }

  if (input.sku !== undefined) {
    payload.sku =
      input.sku?.trim() || null;
  }

  if (input.price !== undefined) {
    if (
      !Number.isFinite(
        input.price
      ) ||
      input.price < 0
    ) {
      throw new Error(
        "Price must be a valid non-negative number"
      );
    }

    payload.price =
      input.price;
  }

  if (
    input.compareAtPrice !==
    undefined
  ) {
    if (
      input.compareAtPrice !==
        null &&
      (!Number.isFinite(
        input.compareAtPrice
      ) ||
        input.compareAtPrice < 0)
    ) {
      throw new Error(
        "Compare at price must be a valid non-negative number"
      );
    }

    payload.compare_at_price =
      input.compareAtPrice;
  }

  if (input.stock !== undefined) {
    if (
      !Number.isInteger(
        input.stock
      ) ||
      input.stock < 0
    ) {
      throw new Error(
        "Stock must be a non-negative integer"
      );
    }

    payload.stock =
      input.stock;
  }

  if (input.status !== undefined) {
    payload.status =
      input.status;
  }

  if (
    Object.keys(payload).length ===
    0
  ) {
    throw new Error(
      "No variant changes provided"
    );
  }

  const {
    data,
    error,
  } =
    await supabase
      .from("product_variants")
      .update(payload)
      .eq("id", id)
      .select(variantSelect)
      .single();

  if (error) {
    console.error(
      "updateAdminVariant:",
      error
    );

    throw new Error(
      `Failed to update variant: ${error.message}`
    );
  }

  return mapAdminVariant(
    data as unknown as ProductVariantRow
  );
}

export async function deleteAdminVariant(
  id: number
): Promise<void> {
  const supabase =
    await assertAdmin();

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      "Invalid variant ID"
    );
  }

  const {
    error,
  } =
    await supabase
      .from("product_variants")
      .delete()
      .eq("id", id);

  if (error) {
    console.error(
      "deleteAdminVariant:",
      error
    );

    if (error.code === "23503") {
      throw new Error(
        "This variant cannot be deleted because it is already referenced by an order or inventory movement. Set the variant to Inactive instead."
      );
    }

    throw new Error(
      `Failed to delete variant: ${error.message}`
    );
  }
}