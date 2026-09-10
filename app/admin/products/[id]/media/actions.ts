"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import type { AdminMediaType } from "@/lib/admin-media";

type CreateAdminMediaInput = {
  productId: number;
  variantId: number | null;
  type: AdminMediaType;
  storagePath: string;
  altText: string | null;
  isPrimary: boolean;
};

type SetPrimaryInput = {
  productId: number;
  mediaId: number;
};

type UpdateAltTextInput = {
  productId: number;
  mediaId: number;
  altText: string | null;
};

type ChangeVariantInput = {
  productId: number;
  mediaId: number;
  variantId: number | null;
};

type DeleteMediaInput = {
  productId: number;
  mediaId: number;
};

type ReorderMediaInput = {
  productId: number;
  mediaId: number;
  direction: "up" | "down";
};

const MEDIA_BUCKET = "wearabay-media";

async function assertAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile, error } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  if (
    error ||
    profile?.role !== "admin"
  ) {
    throw new Error("Unauthorized");
  }

  return supabase;
}

function validateProductId(
  productId: number
) {
  if (
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    throw new Error(
      "Invalid product ID."
    );
  }
}

function validateMediaId(
  mediaId: number
) {
  if (
    !Number.isInteger(mediaId) ||
    mediaId <= 0
  ) {
    throw new Error(
      "Invalid media ID."
    );
  }
}

function validateVariantId(
  variantId: number | null
) {
  if (
    variantId !== null &&
    (!Number.isInteger(
      variantId
    ) ||
      variantId <= 0)
  ) {
    throw new Error(
      "Invalid variant ID."
    );
  }
}

function validateStoragePath(
  productId: number,
  variantId: number | null,
  storagePath: string
) {
  const expectedPrefix =
    variantId !== null
      ? `products/${productId}/variants/${variantId}/`
      : `products/${productId}/`;

  if (
    !storagePath.startsWith(
      expectedPrefix
    )
  ) {
    throw new Error(
      "Invalid media storage path."
    );
  }
}

export async function createAdminMediaAction(
  input: CreateAdminMediaInput
) {
  const {
    productId,
    variantId,
    type,
    storagePath,
    altText,
    isPrimary,
  } = input;

  validateProductId(productId);
  validateVariantId(variantId);

  if (
    type !== "image" &&
    type !== "video"
  ) {
    throw new Error(
      "Invalid media type."
    );
  }

  validateStoragePath(
    productId,
    variantId,
    storagePath
  );

  const supabase =
    await assertAdmin();

  let shouldCleanupStorage = true;

  try {
    const {
      data: product,
      error: productError,
    } = await supabase
      .from("products")
      .select("id")
      .eq("id", productId)
      .maybeSingle();

    if (productError) {
      throw new Error(
        `Failed to verify product: ${productError.message}`
      );
    }

    if (!product) {
      throw new Error(
        "Product not found."
      );
    }

    if (variantId !== null) {
      const {
        data: variant,
        error: variantError,
      } = await supabase
        .from("product_variants")
        .select("id")
        .eq("id", variantId)
        .eq(
          "product_id",
          productId
        )
        .maybeSingle();

      if (variantError) {
        throw new Error(
          `Failed to verify variant: ${variantError.message}`
        );
      }

      if (!variant) {
        throw new Error(
          "Variant not found for this product."
        );
      }
    }

    let existingMediaQuery =
      supabase
        .from("product_media")
        .select("sort_order")
        .eq(
          "product_id",
          productId
        );

    if (variantId === null) {
      existingMediaQuery =
        existingMediaQuery.is(
          "variant_id",
          null
        );
    } else {
      existingMediaQuery =
        existingMediaQuery.eq(
          "variant_id",
          variantId
        );
    }

    const {
      data: existingMedia,
      error: existingMediaError,
    } =
      await existingMediaQuery
        .order("sort_order", {
          ascending: false,
        })
        .limit(1);

    if (existingMediaError) {
      throw new Error(
        `Failed to determine media order: ${existingMediaError.message}`
      );
    }

    const nextSortOrder =
      existingMedia &&
      existingMedia.length > 0
        ? Number(
            existingMedia[0]
              .sort_order
          ) + 1
        : 0;

    const {
      data,
      error,
    } = await supabase
      .from("product_media")
      .insert({
        product_id: productId,
        variant_id: variantId,
        type,
        storage_path:
          storagePath,
        alt_text:
          altText?.trim() ||
          null,
        sort_order:
          nextSortOrder,
        is_primary: false,
      })
      .select(
        `
          id,
          product_id,
          variant_id,
          type,
          storage_path,
          alt_text,
          sort_order,
          is_primary
        `
      )
      .single();

    if (error || !data) {
      throw new Error(
        `Failed to save media: ${
          error?.message ??
          "Unknown database error."
        }`
      );
    }

    if (isPrimary) {
      const {
        error: primaryError,
      } = await supabase.rpc(
        "set_product_media_primary",
        {
          p_product_id:
            productId,
          p_media_id:
            data.id,
        }
      );

      if (primaryError) {
        await supabase
          .from("product_media")
          .delete()
          .eq(
            "id",
            data.id
          )
          .eq(
            "product_id",
            productId
          );

        throw new Error(
          `Failed to set primary media: ${primaryError.message}`
        );
      }
    }

    shouldCleanupStorage = false;

    revalidatePath(
      `/admin/products/${productId}/media`
    );

    revalidatePath(
      `/admin/products/${productId}`
    );

    revalidatePath(
      "/admin/media"
    );

    return data;
  } catch (error) {
    if (shouldCleanupStorage) {
      await supabase.storage
        .from(MEDIA_BUCKET)
        .remove([
          storagePath,
        ]);
    }

    throw error;
  }
}

export async function setAdminMediaPrimaryAction(
  input: SetPrimaryInput
) {
  const {
    productId,
    mediaId,
  } = input;

  validateProductId(productId);
  validateMediaId(mediaId);

  const supabase =
    await assertAdmin();

  const { error } =
    await supabase.rpc(
      "set_product_media_primary",
      {
        p_product_id:
          productId,
        p_media_id:
          mediaId,
      }
    );

  if (error) {
    throw new Error(
      `Failed to set primary media: ${error.message}`
    );
  }

  revalidatePath(
    `/admin/products/${productId}/media`
  );

  revalidatePath(
    `/admin/products/${productId}`
  );

  revalidatePath(
    "/admin/media"
  );
}

export async function updateAdminMediaAltTextAction(
  input: UpdateAltTextInput
) {
  const {
    productId,
    mediaId,
    altText,
  } = input;

  validateProductId(productId);
  validateMediaId(mediaId);

  const supabase =
    await assertAdmin();

  const { error } =
    await supabase
      .from("product_media")
      .update({
        alt_text:
          altText?.trim() ||
          null,
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        mediaId
      )
      .eq(
        "product_id",
        productId
      );

  if (error) {
    throw new Error(
      `Failed to update alt text: ${error.message}`
    );
  }

  revalidatePath(
    `/admin/products/${productId}/media`
  );

  revalidatePath(
    "/admin/media"
  );
}

export async function changeAdminMediaVariantAction(
  input: ChangeVariantInput
) {
  const {
    productId,
    mediaId,
    variantId,
  } = input;

  validateProductId(productId);
  validateMediaId(mediaId);
  validateVariantId(variantId);

  const supabase =
    await assertAdmin();

  const {
    data: media,
    error: mediaError,
  } = await supabase
    .from("product_media")
    .select(
      `
        id,
        product_id,
        variant_id,
        is_primary
      `
    )
    .eq(
      "id",
      mediaId
    )
    .eq(
      "product_id",
      productId
    )
    .maybeSingle();

  if (mediaError) {
    throw new Error(
      `Failed to load media: ${mediaError.message}`
    );
  }

  if (!media) {
    throw new Error(
      "Media not found."
    );
  }

  if (
    media.variant_id ===
    variantId
  ) {
    return;
  }

  if (variantId !== null) {
    const {
      data: variant,
      error: variantError,
    } = await supabase
      .from("product_variants")
      .select("id")
      .eq(
        "id",
        variantId
      )
      .eq(
        "product_id",
        productId
      )
      .maybeSingle();

    if (variantError) {
      throw new Error(
        `Failed to verify variant: ${variantError.message}`
      );
    }

    if (!variant) {
      throw new Error(
        "Variant not found for this product."
      );
    }
  }

  let existingPrimaryQuery =
    supabase
      .from("product_media")
      .select("id")
      .eq(
        "product_id",
        productId
      )
      .eq(
        "is_primary",
        true
      )
      .neq(
        "id",
        mediaId
      );

  if (variantId === null) {
    existingPrimaryQuery =
      existingPrimaryQuery.is(
        "variant_id",
        null
      );
  } else {
    existingPrimaryQuery =
      existingPrimaryQuery.eq(
        "variant_id",
        variantId
      );
  }

  if (media.is_primary) {
    const {
      data: existingPrimary,
      error:
        existingPrimaryError,
    } =
      await existingPrimaryQuery
        .maybeSingle();

    if (existingPrimaryError) {
      throw new Error(
        `Failed to check target primary media: ${existingPrimaryError.message}`
      );
    }

    if (existingPrimary) {
      throw new Error(
        "Media ini adalah Primary. Variant tujuan sudah memiliki Primary media. Set media lain sebagai Primary terlebih dahulu."
      );
    }
  }

  let maxOrderQuery =
    supabase
      .from("product_media")
      .select("sort_order")
      .eq(
        "product_id",
        productId
      );

  if (variantId === null) {
    maxOrderQuery =
      maxOrderQuery.is(
        "variant_id",
        null
      );
  } else {
    maxOrderQuery =
      maxOrderQuery.eq(
        "variant_id",
        variantId
      );
  }

  const {
    data: maxOrderRows,
    error: maxOrderError,
  } =
    await maxOrderQuery
      .order("sort_order", {
        ascending: false,
      })
      .limit(1);

  if (maxOrderError) {
    throw new Error(
      `Failed to determine target media order: ${maxOrderError.message}`
    );
  }

  const nextSortOrder =
    maxOrderRows &&
    maxOrderRows.length > 0
      ? Number(
          maxOrderRows[0]
            .sort_order
        ) + 1
      : 0;

  const {
    error: updateError,
  } = await supabase
    .from("product_media")
    .update({
      variant_id:
        variantId,
      sort_order:
        nextSortOrder,
      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      mediaId
    )
    .eq(
      "product_id",
      productId
    );

  if (updateError) {
    throw new Error(
      `Failed to change media variant: ${updateError.message}`
    );
  }

  revalidatePath(
    `/admin/products/${productId}/media`
  );

  revalidatePath(
    `/admin/products/${productId}`
  );

  revalidatePath(
    "/admin/media"
  );
}

export async function deleteAdminMediaAction(
  input: DeleteMediaInput
) {
  const {
    productId,
    mediaId,
  } = input;

  validateProductId(productId);
  validateMediaId(mediaId);

  const supabase =
    await assertAdmin();

  const {
    data: media,
    error: mediaError,
  } = await supabase
    .from("product_media")
    .select(
      `
        id,
        product_id,
        variant_id,
        storage_path,
        is_primary
      `
    )
    .eq(
      "id",
      mediaId
    )
    .eq(
      "product_id",
      productId
    )
    .maybeSingle();

  if (mediaError) {
    throw new Error(
      `Failed to load media: ${mediaError.message}`
    );
  }

  if (!media) {
    throw new Error(
      "Media not found."
    );
  }

  if (media.is_primary) {
    let mediaCountQuery =
      supabase
        .from("product_media")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq(
          "product_id",
          productId
        );

    if (media.variant_id === null) {
      mediaCountQuery =
        mediaCountQuery.is(
          "variant_id",
          null
        );
    } else {
      mediaCountQuery =
        mediaCountQuery.eq(
          "variant_id",
          media.variant_id
        );
    }

    const {
      count,
      error: countError,
    } =
      await mediaCountQuery;

    if (countError) {
      throw new Error(
        `Failed to check media count: ${countError.message}`
      );
    }

    if ((count ?? 0) > 1) {
      throw new Error(
        "Primary media tidak dapat dihapus. Set media lain sebagai Primary terlebih dahulu."
      );
    }
  }

  const {
    error: deleteError,
  } = await supabase
    .from("product_media")
    .delete()
    .eq(
      "id",
      mediaId
    )
    .eq(
      "product_id",
      productId
    );

  if (deleteError) {
    throw new Error(
      `Failed to delete media: ${deleteError.message}`
    );
  }

  const {
    error: storageError,
  } = await supabase.storage
    .from(MEDIA_BUCKET)
    .remove([
      media.storage_path,
    ]);

  if (storageError) {
    throw new Error(
      `Media record deleted, but Storage cleanup failed: ${storageError.message}`
    );
  }

  revalidatePath(
    `/admin/products/${productId}/media`
  );

  revalidatePath(
    `/admin/products/${productId}`
  );

  revalidatePath(
    "/admin/media"
  );
}

export async function reorderAdminMediaAction(
  input: ReorderMediaInput
) {
  const {
    productId,
    mediaId,
    direction,
  } = input;

  validateProductId(productId);
  validateMediaId(mediaId);

  if (
    direction !== "up" &&
    direction !== "down"
  ) {
    throw new Error(
      "Invalid reorder direction."
    );
  }

  const supabase =
    await assertAdmin();

  const { error } =
    await supabase.rpc(
      "reorder_product_media",
      {
        p_product_id:
          productId,
        p_media_id:
          mediaId,
        p_direction:
          direction,
      }
    );

  if (error) {
    throw new Error(
      `Failed to reorder media: ${error.message}`
    );
  }

  revalidatePath(
    `/admin/products/${productId}/media`
  );

  revalidatePath(
    `/admin/products/${productId}`
  );

  revalidatePath(
    "/admin/media"
  );
}