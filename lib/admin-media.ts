import { createClient } from "@/lib/supabase/server";

export const MEDIA_BUCKET =
  "wearabay-media";

export type AdminMediaType =
  | "image"
  | "video";

export type AdminVariantStatus =
  | "active"
  | "inactive";

export type AdminProductVariant = {
  id: number;
  productId: number;
  sku: string | null;
  color: string;
  size: string;
  status: AdminVariantStatus;
};

export type AdminProductMedia = {
  id: number;
  productId: number;
  variantId: number | null;
  variant: AdminProductVariant | null;
  type: AdminMediaType;
  storagePath: string;
  publicUrl: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminMediaLibraryItem = {
  id: number;
  productId: number;
  productName: string;
  variantId: number | null;
  variant: AdminProductVariant | null;
  type: AdminMediaType;
  storagePath: string;
  publicUrl: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
};

type ProductMediaRow = {
  id: number;
  product_id: number;
  variant_id: number | null;
  type: AdminMediaType;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

type ProductVariantRow = {
  id: number;
  product_id: number;
  sku: string | null;
  color: string;
  size: string;
  status: AdminVariantStatus;
};

type ProductMediaLibraryRow =
  ProductMediaRow & {
    products:
      | {
          name: string;
        }[]
      | null;
  };

async function assertAdmin() {
  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "Unauthorized"
    );
  }

  const {
    data: profile,
    error,
  } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (
    error ||
    profile?.role !== "admin"
  ) {
    throw new Error(
      "Unauthorized"
    );
  }

  return supabase;
}

function mapVariant(
  row: ProductVariantRow
): AdminProductVariant {
  return {
    id: row.id,
    productId:
      row.product_id,
    sku: row.sku,
    color: row.color,
    size: row.size,
    status: row.status,
  };
}

function getPublicUrl(
  supabase: Awaited<
    ReturnType<typeof createClient>
  >,
  storagePath: string
) {
  const { data } =
    supabase.storage
      .from(MEDIA_BUCKET)
      .getPublicUrl(
        storagePath
      );

  return data.publicUrl;
}

function mapAdminMedia(
  supabase: Awaited<
    ReturnType<typeof createClient>
  >,
  row: ProductMediaRow,
  variant: AdminProductVariant | null
): AdminProductMedia {
  return {
    id: row.id,
    productId:
      row.product_id,
    variantId:
      row.variant_id,
    variant,
    type: row.type,
    storagePath:
      row.storage_path,
    publicUrl: getPublicUrl(
      supabase,
      row.storage_path
    ),
    altText:
      row.alt_text,
    sortOrder:
      row.sort_order,
    isPrimary:
      row.is_primary,
    createdAt:
      row.created_at,
    updatedAt:
      row.updated_at,
  };
}

export async function getAdminProductVariants(
  productId: number
) {
  if (
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    throw new Error(
      "Invalid product ID"
    );
  }

  const supabase =
    await assertAdmin();

  const {
    data,
    error,
  } =
    await supabase
      .from("product_variants")
      .select(
        `
          id,
          product_id,
          sku,
          color,
          size,
          status
        `
      )
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
    throw new Error(
      `Failed to load product variants: ${error.message}`
    );
  }

  return (
    (data ??
      []) as ProductVariantRow[]
  ).map(mapVariant);
}

export async function getAdminProductMedia(
  productId: number
) {
  if (
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    throw new Error(
      "Invalid product ID"
    );
  }

  const supabase =
    await assertAdmin();

  const {
    data: mediaData,
    error: mediaError,
  } =
    await supabase
      .from("product_media")
      .select(
        `
          id,
          product_id,
          variant_id,
          type,
          storage_path,
          alt_text,
          sort_order,
          is_primary,
          created_at,
          updated_at
        `
      )
      .eq(
        "product_id",
        productId
      )
      .order("sort_order", {
        ascending: true,
      })
      .order("id", {
        ascending: true,
      });

  if (mediaError) {
    throw new Error(
      `Failed to load product media: ${mediaError.message}`
    );
  }

  const media =
    (mediaData ??
      []) as ProductMediaRow[];

  const {
    data: variantData,
    error: variantError,
  } =
    await supabase
      .from("product_variants")
      .select(
        `
          id,
          product_id,
          sku,
          color,
          size,
          status
        `
      )
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

  if (variantError) {
    throw new Error(
      `Failed to load product variants: ${variantError.message}`
    );
  }

  const variants =
    (
      (variantData ??
        []) as ProductVariantRow[]
    ).map(mapVariant);

  const variantMap =
    new Map<
      number,
      AdminProductVariant
    >();

  for (const variant of variants) {
    variantMap.set(
      variant.id,
      variant
    );
  }

  return {
    media: media.map(
      (row) =>
        mapAdminMedia(
          supabase,
          row,
          row.variant_id !== null
            ? variantMap.get(
                row.variant_id
              ) ?? null
            : null
        )
    ),
    variants,
  };
}

export async function getAdminMediaLibrary() {
  const supabase =
    await assertAdmin();

  const {
    data,
    error,
  } =
    await supabase
      .from("product_media")
      .select(
        `
          id,
          product_id,
          variant_id,
          type,
          storage_path,
          alt_text,
          sort_order,
          is_primary,
          created_at,
          updated_at,
          products (
            name
          )
        `
      )
      .order("created_at", {
        ascending: false,
      })
      .order("id", {
        ascending: false,
      });

  if (error) {
    throw new Error(
      `Failed to load media library: ${error.message}`
    );
  }

  const rows =
    (data ??
      []) as ProductMediaLibraryRow[];

  const variantIds = [
    ...new Set(
      rows
        .map(
          (row) =>
            row.variant_id
        )
        .filter(
          (
            id
          ): id is number =>
            id !== null
        )
    ),
  ];

  let variants:
    ProductVariantRow[] = [];

  if (
    variantIds.length > 0
  ) {
    const {
      data: variantData,
      error: variantError,
    } =
      await supabase
        .from(
          "product_variants"
        )
        .select(
          `
            id,
            product_id,
            sku,
            color,
            size,
            status
          `
        )
        .in(
          "id",
          variantIds
        );

    if (variantError) {
      throw new Error(
        `Failed to load media library variants: ${variantError.message}`
      );
    }

    variants =
      (variantData ??
        []) as ProductVariantRow[];
  }

  const variantMap =
    new Map<
      number,
      AdminProductVariant
    >();

  for (const variant of variants) {
    variantMap.set(
      variant.id,
      mapVariant(variant)
    );
  }

  return rows.map(
    (row): AdminMediaLibraryItem => {
      const variant =
        row.variant_id !== null
          ? variantMap.get(
              row.variant_id
            ) ?? null
          : null;

      const productName =
        row.products?.[0]
          ?.name ??
        `Product #${row.product_id}`;

      return {
        id: row.id,
        productId:
          row.product_id,
        productName,
        variantId:
          row.variant_id,
        variant,
        type: row.type,
        storagePath:
          row.storage_path,
        publicUrl:
          getPublicUrl(
            supabase,
            row.storage_path
          ),
        altText:
          row.alt_text,
        sortOrder:
          row.sort_order,
        isPrimary:
          row.is_primary,
        createdAt:
          row.created_at,
        updatedAt:
          row.updated_at,
      };
    }
  );
}