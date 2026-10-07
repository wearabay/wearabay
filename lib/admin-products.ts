import { createClient } from "@/lib/supabase/server";

import {
  getSuperAdminUser,
  isAdminRole,
} from "@/lib/admin";

export type AdminProductStatus =
  | "draft"
  | "published"
  | "archived";

export type AdminProductFulfillmentType =
  | "ready_stock"
  | "pre_order";

export type AdminProductSpecification = {
  label: string;
  value: string;
};

export type AdminProduct = {
  id: number;
  slug: string;
  name: string;
  description: string;

  categoryId: number | null;
  category: string;

  badge: string | null;
  features: string[];
  specifications: AdminProductSpecification[];

  sizeGuide: string;
  shippingReturns: string;
  careInstructions: string;
  craftsmanship: string;

  status: AdminProductStatus;

  fulfillmentType: AdminProductFulfillmentType;
  preorderReadyDate: string | null;

  variantCount: number;
  mediaCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateAdminProductInput = {
  name: string;
  slug: string;
  description?: string;

  categoryId?: number;
  category?: string;

  badge?: string | null;
  features?: string[];
  specifications?: AdminProductSpecification[];

  sizeGuide?: string;
  shippingReturns?: string;
  careInstructions?: string;
  craftsmanship?: string;

  status?: AdminProductStatus;

  fulfillmentType?: AdminProductFulfillmentType;
  preorderReadyDate?: string | null;
};

export type UpdateAdminProductInput =
  Partial<CreateAdminProductInput>;

type ProductRow = {
  id: number;
  slug: string;
  name: string;
  description: string | null;

  category_id: number | null;
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

  fulfillment_type: AdminProductFulfillmentType;
  preorder_ready_date: string | null;

  created_at: string;
  updated_at: string;

  product_variants?: Array<{
    id: number;
  }>;

  product_media?: Array<{
    id: number;
  }>;
};

type CategoryRow = {
  id: number;
  name: string;
  is_active: boolean;
};

type ExistingProductFulfillment = {
  fulfillment_type: AdminProductFulfillmentType;
  preorder_ready_date: string | null;
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

function requireCategoryId(
  value: number | undefined
): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value <= 0
  ) {
    throw new Error(
      "Product category is required"
    );
  }

  return value;
}

function normalizeFulfillmentType(
  value: unknown
): AdminProductFulfillmentType {
  if (value === "pre_order") {
    return "pre_order";
  }

  return "ready_stock";
}

function normalizePreorderReadyDate(
  value: unknown
): string | null {
  const normalized =
    normalizeString(value);

  if (!normalized) {
    return null;
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      normalized
    )
  ) {
    throw new Error(
      "Pre-order ready date must use YYYY-MM-DD format."
    );
  }

  const parsedDate = new Date(
    `${normalized}T00:00:00Z`
  );

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    throw new Error(
      "Invalid pre-order ready date."
    );
  }

  const normalizedDate =
    parsedDate
      .toISOString()
      .slice(0, 10);

  if (
    normalizedDate !== normalized
  ) {
    throw new Error(
      "Invalid pre-order ready date."
    );
  }

  return normalized;
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

    categoryId:
      row.category_id ?? null,

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

    status:
      row.status,

    fulfillmentType:
      row.fulfillment_type,

    preorderReadyDate:
      row.preorder_ready_date ?? null,

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
    !isAdminRole(profile.role)
  ) {
    throw new Error("Unauthorized");
  }

  return supabase;
}

async function assertSuperAdmin() {
  const supabase =
    await getSuperAdminUser();

  if (!supabase) {
    throw new Error("Unauthorized");
  }

  return supabase;
}

const productSelect = `
  id,
  slug,
  name,
  description,
  category_id,
  category,
  badge,
  features,
  specifications,
  size_guide,
  shipping_returns,
  care_instructions,
  craftsmanship,
  status,
  fulfillment_type,
  preorder_ready_date,
  created_at,
  updated_at,
  product_variants (
    id
  ),
  product_media (
    id
  )
`;

async function getCategoryForProduct(
  supabase: Awaited<
    ReturnType<typeof createClient>
  >,
  categoryId: number,
  options?: {
    allowInactive?: boolean;
  }
): Promise<CategoryRow> {
  const {
    data,
    error,
  } =
    await supabase
      .from("categories")
      .select(
        "id, name, is_active"
      )
      .eq("id", categoryId)
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to validate category: ${error.message}`
    );
  }

  if (!data) {
    throw new Error(
      "Selected category does not exist."
    );
  }

  if (
    !options?.allowInactive &&
    !data.is_active
  ) {
    throw new Error(
      "Selected category is inactive. Please choose an active category."
    );
  }

  return data as CategoryRow;
}

async function getExistingProductFulfillment(
  supabase: Awaited<
    ReturnType<typeof createClient>
  >,
  id: number
): Promise<ExistingProductFulfillment> {
  const {
    data,
    error,
  } =
    await supabase
      .from("products")
      .select(
        "fulfillment_type, preorder_ready_date"
      )
      .eq("id", id)
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load product fulfillment: ${error.message}`
    );
  }

  if (!data) {
    throw new Error(
      "Product not found."
    );
  }

  return {
    fulfillment_type:
      data.fulfillment_type as AdminProductFulfillmentType,
    preorder_ready_date:
      data.preorder_ready_date ?? null,
  };
}

async function validateFulfillment(
  fulfillmentType: AdminProductFulfillmentType,
  preorderReadyDate: string | null
) {
  if (
    fulfillmentType ===
    "ready_stock"
  ) {
    return {
      fulfillmentType,
      preorderReadyDate: null,
    };
  }

  if (!preorderReadyDate) {
    throw new Error(
      "Pre-order ready date is required."
    );
  }

  return {
    fulfillmentType,
    preorderReadyDate,
  };
}

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

  const categoryId =
    requireCategoryId(
      input.categoryId
    );

  const category =
    await getCategoryForProduct(
      supabase,
      categoryId
    );

  const fulfillmentType =
    normalizeFulfillmentType(
      input.fulfillmentType
    );

  const preorderReadyDate =
    normalizePreorderReadyDate(
      input.preorderReadyDate
    );

  const fulfillment =
    await validateFulfillment(
      fulfillmentType,
      preorderReadyDate
    );

  if (
    fulfillment.fulfillmentType ===
    "pre_order"
  ) {
    await assertSuperAdmin();
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

        category_id:
          category.id,

        category:
          category.name,

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

        fulfillment_type:
          fulfillment.fulfillmentType,

        preorder_ready_date:
          fulfillment.preorderReadyDate,
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

  if (
    fulfillment.fulfillmentType ===
      "pre_order" &&
    fulfillment.preorderReadyDate
  ) {
    const {
      data: {
        user,
      },
    } =
      await supabase.auth.getUser();

    const {
      error:
        historyError,
    } =
      await supabase
        .from(
          "product_preorder_history"
        )
        .insert({
          product_id:
            data.id,
          previous_ready_date:
            null,
          new_ready_date:
            fulfillment.preorderReadyDate,
          reason:
            "Initial pre-order schedule",
          changed_by:
            user?.id ?? null,
        });

    if (historyError) {
      console.error(
        "createAdminProduct history:",
        historyError
      );

      throw new Error(
        `Product created, but failed to record pre-order history: ${historyError.message}`
      );
    }
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
    input.categoryId !== undefined
  ) {
    const categoryId =
      requireCategoryId(
        input.categoryId
      );

    const existingProduct =
      await supabase
        .from("products")
        .select("category_id")
        .eq("id", id)
        .maybeSingle();

    if (existingProduct.error) {
      throw new Error(
        `Failed to load product category: ${existingProduct.error.message}`
      );
    }

    const allowInactive =
      existingProduct.data?.category_id ===
      categoryId;

    const category =
      await getCategoryForProduct(
        supabase,
        categoryId,
        {
          allowInactive,
        }
      );

    payload.category_id =
      category.id;

    payload.category =
      category.name;
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

  let fulfillmentChanged = false;
  let previousReadyDate: string | null =
    null;
  let nextReadyDate: string | null =
    null;

  if (
    input.fulfillmentType !==
      undefined ||
    input.preorderReadyDate !==
      undefined
  ) {
    const existingFulfillment =
      await getExistingProductFulfillment(
        supabase,
        id
      );

    const nextFulfillmentType =
      input.fulfillmentType !==
      undefined
        ? normalizeFulfillmentType(
            input.fulfillmentType
          )
        : existingFulfillment.fulfillment_type;

    const nextPreorderReadyDate =
      input.preorderReadyDate !==
      undefined
        ? normalizePreorderReadyDate(
            input.preorderReadyDate
          )
        : existingFulfillment.preorder_ready_date;

    const fulfillment =
      await validateFulfillment(
        nextFulfillmentType,
        nextPreorderReadyDate
      );

    if (
      fulfillment.fulfillmentType !==
        existingFulfillment.fulfillment_type ||
      fulfillment.preorderReadyDate !==
        existingFulfillment.preorder_ready_date
    ) {
      fulfillmentChanged = true;

      previousReadyDate =
        existingFulfillment.preorder_ready_date;

      nextReadyDate =
        fulfillment.preorderReadyDate;
    }

    if (
      fulfillmentChanged
    ) {
      await assertSuperAdmin();
    }

    payload.fulfillment_type =
      fulfillment.fulfillmentType;

    payload.preorder_ready_date =
      fulfillment.preorderReadyDate;
  }

  if (
    Object.keys(payload).length ===
    0
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

  if (
    fulfillmentChanged &&
    nextReadyDate
  ) {
    const {
      data: {
        user,
      },
    } =
      await supabase.auth.getUser();

    const {
      error:
        historyError,
    } =
      await supabase
        .from(
          "product_preorder_history"
        )
        .insert({
          product_id: id,
          previous_ready_date:
            previousReadyDate,
          new_ready_date:
            nextReadyDate,
          reason:
            "Pre-order schedule updated",
          changed_by:
            user?.id ?? null,
        });

    if (historyError) {
      console.error(
        "updateAdminProduct history:",
        historyError
      );

      throw new Error(
        `Product updated, but failed to record pre-order history: ${historyError.message}`
      );
    }
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