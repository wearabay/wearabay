import { createClient } from "@/lib/supabase/server";

export type AdminProductStatus =
  | "draft"
  | "published"
  | "archived";

export type AdminProductSpecification = {
  label: string;
  value: string;
};

export type AdminProduct = {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: string;
  badge: string | null;
  features: string[];
  specifications: AdminProductSpecification[];

  sizeGuide: string;
  shippingReturns: string;
  careInstructions: string;
  craftsmanship: string;

  status: AdminProductStatus;
  variantCount: number;
  mediaCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateAdminProductInput = {
  name: string;
  slug: string;
  description?: string;
  category?: string;
  badge?: string | null;
  features?: string[];
  specifications?: AdminProductSpecification[];

  sizeGuide?: string;
  shippingReturns?: string;
  careInstructions?: string;
  craftsmanship?: string;

  status?: AdminProductStatus;
};

export type UpdateAdminProductInput =
  Partial<CreateAdminProductInput>;

type ProductRow = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  badge: string | null;
  features: string[] | null;
  specifications:
    | AdminProductSpecification[]
    | null;

  size_guide: string | null;
  shipping_returns: string | null;
  care_instructions: string | null;
  craftsmanship: string | null;

  status: AdminProductStatus;
  created_at: string;
  updated_at: string;

  product_variants?: Array<{
    id: number;
  }>;

  product_media?: Array<{
    id: number;
  }>;
};

function normalizeString(value: unknown) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeNullableString(
  value: unknown
) {
  const normalized =
    normalizeString(value);

  return normalized === ""
    ? null
    : normalized;
}

function normalizeFeatures(
  value: unknown
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is string =>
        typeof item === "string"
    )
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeSpecifications(
  value: unknown
): AdminProductSpecification[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (
        item
      ): item is AdminProductSpecification =>
        typeof item === "object" &&
        item !== null &&
        typeof (
          item as {
            label?: unknown;
          }
        ).label === "string" &&
        typeof (
          item as {
            value?: unknown;
          }
        ).value === "string"
    )
    .map((item) => ({
      label: item.label.trim(),
      value: item.value.trim(),
    }))
    .filter(
      (item) =>
        item.label !== "" &&
        item.value !== ""
    );
}

function mapAdminProduct(
  row: ProductRow
): AdminProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description:
      row.description ?? "",
    category:
      row.category ?? "",
    badge:
      row.badge ?? null,

    features:
      normalizeFeatures(row.features),

    specifications:
      normalizeSpecifications(
        row.specifications
      ),

    sizeGuide:
      row.size_guide ?? "",

    shippingReturns:
      row.shipping_returns ?? "",

    careInstructions:
      row.care_instructions ?? "",

    craftsmanship:
      row.craftsmanship ?? "",

    status: row.status,

    variantCount:
      row.product_variants?.length ?? 0,

    mediaCount:
      row.product_media?.length ?? 0,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}

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

const productSelect = `
  id,
  slug,
  name,
  description,
  category,
  badge,
  features,
  specifications,
  size_guide,
  shipping_returns,
  care_instructions,
  craftsmanship,
  status,
  created_at,
  updated_at,
  product_variants (
    id
  ),
  product_media (
    id
  )
`;

export async function getAdminProducts(): Promise<
  AdminProduct[]
> {
  const supabase =
    await assertAdmin();

  const {
    data,
    error,
  } =
    await supabase
      .from("products")
      .select(productSelect)
      .order("id", {
        ascending: true,
      });

  if (error) {
    console.error(
      "getAdminProducts:",
      error
    );

    throw new Error(
      `Failed to load products: ${error.message}`
    );
  }

  return (data ?? []).map(
    (row) =>
      mapAdminProduct(
        row as unknown as ProductRow
      )
  );
}

export async function getAdminProductById(
  id: number
): Promise<AdminProduct | null> {
  const supabase =
    await assertAdmin();

  if (
    !Number.isInteger(id) ||
    id <= 0
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
      .from("products")
      .select(productSelect)
      .eq("id", id)
      .maybeSingle();

  if (error) {
    console.error(
      "getAdminProductById:",
      error
    );

    throw new Error(
      `Failed to load product: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return mapAdminProduct(
    data as unknown as ProductRow
  );
}

export async function createAdminProduct(
  input: CreateAdminProductInput
): Promise<AdminProduct> {
  const supabase =
    await assertAdmin();

  const name =
    normalizeString(input.name);

  const slug =
    normalizeString(input.slug);

  if (!name) {
    throw new Error(
      "Product name is required"
    );
  }

  if (!slug) {
    throw new Error(
      "Product slug is required"
    );
  }

  const {
    data,
    error,
  } =
    await supabase
      .from("products")
      .insert({
        name,
        slug,

        description:
          normalizeString(
            input.description
          ),

        category:
          normalizeString(
            input.category
          ),

        badge:
          normalizeNullableString(
            input.badge
          ),

        features:
          normalizeFeatures(
            input.features
          ),

        specifications:
          normalizeSpecifications(
            input.specifications
          ),

        size_guide:
          normalizeString(
            input.sizeGuide
          ),

        shipping_returns:
          normalizeString(
            input.shippingReturns
          ),

        care_instructions:
          normalizeString(
            input.careInstructions
          ),

        craftsmanship:
          normalizeString(
            input.craftsmanship
          ),

        status:
          input.status ?? "draft",
      })
      .select(productSelect)
      .single();

  if (error) {
    console.error(
      "createAdminProduct:",
      error
    );

    throw new Error(
      `Failed to create product: ${error.message}`
    );
  }

  return mapAdminProduct(
    data as unknown as ProductRow
  );
}

export async function updateAdminProduct(
  id: number,
  input: UpdateAdminProductInput
): Promise<AdminProduct> {
  const supabase =
    await assertAdmin();

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      "Invalid product ID"
    );
  }

  const payload: Record<
    string,
    unknown
  > = {};

  if (input.name !== undefined) {
    const name =
      normalizeString(input.name);

    if (!name) {
      throw new Error(
        "Product name is required"
      );
    }

    payload.name = name;
  }

  if (input.slug !== undefined) {
    const slug =
      normalizeString(input.slug);

    if (!slug) {
      throw new Error(
        "Product slug is required"
      );
    }

    payload.slug = slug;
  }

  if (
    input.description !== undefined
  ) {
    payload.description =
      normalizeString(
        input.description
      );
  }

  if (
    input.category !== undefined
  ) {
    payload.category =
      normalizeString(
        input.category
      );
  }

  if (input.badge !== undefined) {
    payload.badge =
      normalizeNullableString(
        input.badge
      );
  }

  if (input.features !== undefined) {
    payload.features =
      normalizeFeatures(
        input.features
      );
  }

  if (
    input.specifications !== undefined
  ) {
    payload.specifications =
      normalizeSpecifications(
        input.specifications
      );
  }

  if (
    input.sizeGuide !== undefined
  ) {
    payload.size_guide =
      normalizeString(
        input.sizeGuide
      );
  }

  if (
    input.shippingReturns !== undefined
  ) {
    payload.shipping_returns =
      normalizeString(
        input.shippingReturns
      );
  }

  if (
    input.careInstructions !== undefined
  ) {
    payload.care_instructions =
      normalizeString(
        input.careInstructions
      );
  }

  if (
    input.craftsmanship !== undefined
  ) {
    payload.craftsmanship =
      normalizeString(
        input.craftsmanship
      );
  }

  if (input.status !== undefined) {
    payload.status =
      input.status;
  }

  if (
    Object.keys(payload).length === 0
  ) {
    throw new Error(
      "No product changes provided"
    );
  }

  const {
    data,
    error,
  } =
    await supabase
      .from("products")
      .update(payload)
      .eq("id", id)
      .select(productSelect)
      .single();

  if (error) {
    console.error(
      "updateAdminProduct:",
      error
    );

    throw new Error(
      `Failed to update product: ${error.message}`
    );
  }

  return mapAdminProduct(
    data as unknown as ProductRow
  );
}

export async function deleteAdminProduct(
  id: number
): Promise<void> {
  const supabase =
    await assertAdmin();

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      "Invalid product ID"
    );
  }

  const {
    error,
  } =
    await supabase
      .from("products")
      .delete()
      .eq("id", id);

  if (error) {
    console.error(
      "deleteAdminProduct:",
      error
    );

    if (error.code === "23503") {
      throw new Error(
        "This product cannot be deleted because it is already referenced by existing orders or inventory records. Archive the product instead."
      );
    }

    throw new Error(
      `Failed to delete product: ${error.message}`
    );
  }
}

export async function archiveAdminProduct(
  id: number
): Promise<AdminProduct> {
  return updateAdminProduct(id, {
    status: "archived",
  });
}

export async function restoreAdminProduct(
  id: number
): Promise<AdminProduct> {
  return updateAdminProduct(id, {
    status: "draft",
  });
}