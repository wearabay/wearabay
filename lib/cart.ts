"use client";

import { createClient } from "@/lib/supabase/client";

import { getMediaUrl } from "@/lib/media";


export type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
  size?: string;

  /*
   * Current stock for the selected variant.
   *
   * This is cached locally for cart UI purposes.
   * The database remains the source of truth at checkout.
   */
  stock?: number;
};


type VariantStockRow = {
  product_id: number;
  color: string;
  size: string;
  stock: number;
  status: "active" | "inactive";
};


type VariantMediaRow = {
  id: number;
  product_id: number;
  color: string;
  size: string;
  status: "active" | "inactive";
};


type ProductMediaRow = {
  variant_id: number | null;
  type: "image" | "video";
  storage_path: string;
  sort_order: number;
};


/* =========================================================
   LOCAL STORAGE
========================================================= */

function getCartKey(
  userId?: string
) {

  if (userId) {

    return `wearing-abaya-user-${userId}-cart`;

  }

  return "wearing-abaya-guest-cart";

}


function getLocalCart(
  userId?: string
): CartItem[] {

  if (
    typeof window === "undefined"
  ) {

    return [];

  }

  try {

    const data =
      localStorage.getItem(
        getCartKey(userId)
      );

    return data
      ? JSON.parse(data)
      : [];

  } catch {

    return [];

  }

}


function saveLocalCart(
  cart: CartItem[],
  userId?: string
) {

  if (
    typeof window === "undefined"
  ) {

    return;

  }

  localStorage.setItem(
    getCartKey(userId),
    JSON.stringify(cart)
  );

}


/* =========================================================
   STOCK
========================================================= */

function getVariantKey(
  productId: number,
  color?: string,
  size?: string
) {

  return [
    productId,
    color ?? "",
    size ?? "",
  ].join("::");

}


async function getVariantStock(
  productId: number,
  color?: string,
  size?: string
): Promise<number | undefined> {

  /*
   * Products without a color/size variant are not
   * stock-limited by this helper.
   */

  if (
    !color ||
    !size
  ) {

    return undefined;

  }


  const supabase =
    createClient();


  const {
    data,
    error,
  } =
    await supabase
      .from("product_variants")
      .select(
        `
        product_id,
        color,
        size,
        stock,
        status
        `
      )
      .eq(
        "product_id",
        productId
      )
      .eq(
        "color",
        color
      )
      .eq(
        "size",
        size
      )
      .eq(
        "status",
        "active"
      )
      .maybeSingle();


  if (error) {

    console.error(
      "Failed to load variant stock:",
      error
    );

    return undefined;

  }


  if (!data) {

    return 0;

  }


  return Math.max(
    0,
    Number(
      data.stock
    )
  );

}


async function hydrateCartStock(
  cart: CartItem[]
): Promise<CartItem[]> {

  const variantItems =
    cart.filter(
      (item) =>
        Boolean(
          item.color &&
          item.size
        )
    );


  if (
    variantItems.length === 0
  ) {

    return cart;

  }


  const productIds = [
    ...new Set(
      variantItems.map(
        (item) =>
          item.id
      )
    ),
  ];


  const supabase =
    createClient();


  const {
    data,
    error,
  } =
    await supabase
      .from("product_variants")
      .select(
        `
        product_id,
        color,
        size,
        stock,
        status
        `
      )
      .in(
        "product_id",
        productIds
      )
      .eq(
        "status",
        "active"
      );


  if (error) {

    console.error(
      "Failed to load cart variant stock:",
      error
    );

    return cart;

  }


  const stockMap =
    new Map<string, number>();


  (
    (data ?? []) as VariantStockRow[]
  ).forEach(
    (variant) => {

      stockMap.set(
        getVariantKey(
          Number(
            variant.product_id
          ),
          variant.color,
          variant.size
        ),
        Math.max(
          0,
          Number(
            variant.stock
          )
        )
      );

    }
  );


  return cart.map(
    (item) => {

      if (
        !item.color ||
        !item.size
      ) {

        return item;

      }


      const key =
        getVariantKey(
          item.id,
          item.color,
          item.size
        );


      const stock =
        stockMap.get(
          key
        );


      if (
        stock === undefined
      ) {

        return {
          ...item,
          stock: 0,
        };

      }


      return {
        ...item,
        stock,
        quantity:
          Math.min(
            Math.max(
              1,
              item.quantity
            ),
            Math.max(
              1,
              stock
            )
          ),
      };

    }
  );

}


/* =========================================================
   MEDIA
========================================================= */

/*
 * Refresh cart thumbnails from the exact active variant.
 *
 * Existing cart records may still contain the old product-level
 * image. This hydration makes the cart image follow:
 *
 * product + color + size
 *       ↓
 * active product variant
 *       ↓
 * variant media
 *
 * If exact variant media is unavailable, media from another
 * active variant with the same color is used as fallback.
 * If no variant media exists, the existing cart image remains.
 */

async function hydrateCartMedia(
  cart: CartItem[]
): Promise<CartItem[]> {

  const variantItems =
    cart.filter(
      (item) =>
        Boolean(
          item.color &&
          item.size
        )
    );


  if (
    variantItems.length === 0
  ) {

    return cart;

  }


  const productIds = [
    ...new Set(
      variantItems.map(
        (item) =>
          item.id
      )
    ),
  ];


  const supabase =
    createClient();


  /*
   * Load active variants so cart color + size can resolve
   * to the exact variant ID used by product_media.
   */

  const {
    data: variantsData,
    error: variantsError,
  } =
    await supabase
      .from("product_variants")
      .select(
        `
        id,
        product_id,
        color,
        size,
        status
        `
      )
      .in(
        "product_id",
        productIds
      )
      .eq(
        "status",
        "active"
      );


  if (
    variantsError
  ) {

    console.error(
      "Failed to load cart variant media mapping:",
      variantsError
    );

    return cart;

  }


  const variants =
    (variantsData ?? []) as VariantMediaRow[];


  if (
    variants.length === 0
  ) {

    return cart;

  }


  const variantByKey =
    new Map<string, VariantMediaRow>();


  const variantIdsByColor =
    new Map<string, number[]>();


  variants.forEach(
    (variant) => {

      variantByKey.set(
        getVariantKey(
          Number(
            variant.product_id
          ),
          variant.color,
          variant.size
        ),
        variant
      );


      const colorKey =
        getVariantKey(
          Number(
            variant.product_id
          ),
          variant.color
        );


      const existing =
        variantIdsByColor.get(
          colorKey
        ) ?? [];


      existing.push(
        Number(
          variant.id
        )
      );


      variantIdsByColor.set(
        colorKey,
        existing
      );

    }
  );


  const variantIds = [
    ...new Set(
      variants.map(
        (variant) =>
          Number(
            variant.id
          )
      )
    ),
  ];


  const {
    data: mediaData,
    error: mediaError,
  } =
    await supabase
      .from("product_media")
      .select(
        `
        variant_id,
        type,
        storage_path,
        sort_order
        `
      )
      .in(
        "variant_id",
        variantIds
      )
      .eq(
        "type",
        "image"
      )
      .order(
        "sort_order",
        {
          ascending: true,
        }
      );


  if (
    mediaError
  ) {

    console.error(
      "Failed to load cart variant media:",
      mediaError
    );

    return cart;

  }


  const media =
    (mediaData ?? []) as ProductMediaRow[];


  /*
   * First image for each exact variant.
   */

  const imageByVariantId =
    new Map<number, string>();


  media.forEach(
    (item) => {

      if (
        item.variant_id === null
      ) {

        return;

      }


      const variantId =
        Number(
          item.variant_id
        );


      if (
        imageByVariantId.has(
          variantId
        )
      ) {

        return;

      }


      imageByVariantId.set(
        variantId,
        getMediaUrl(
          item.storage_path
        )
      );

    }
  );


  /*
   * Color fallback:
   *
   * If the exact size variant has no media, use the first
   * available media belonging to another active variant
   * of the same product + color.
   */

  const imageByColor =
    new Map<string, string>();


  variantIdsByColor.forEach(
    (
      ids,
      colorKey
    ) => {

      for (
        const variantId
        of ids
      ) {

        const image =
          imageByVariantId.get(
            variantId
          );


        if (
          image
        ) {

          imageByColor.set(
            colorKey,
            image
          );

          break;

        }

      }

    }
  );


  /*
   * Apply media to cart items.
   */

  return cart.map(
    (item) => {

      if (
        !item.color ||
        !item.size
      ) {

        return item;

      }


      const variant =
        variantByKey.get(
          getVariantKey(
            item.id,
            item.color,
            item.size
          )
        );


      if (
        !variant
      ) {

        return item;

      }


      const exactImage =
        imageByVariantId.get(
          Number(
            variant.id
          )
        );


      if (
        exactImage
      ) {

        return {
          ...item,
          image:
            exactImage,
        };

      }


      const colorImage =
        imageByColor.get(
          getVariantKey(
            item.id,
            item.color
          )
        );


      if (
        colorImage
      ) {

        return {
          ...item,
          image:
            colorImage,
        };

      }


      return item;

    }
  );

}


/* =========================================================
   GET CART
========================================================= */

export function getCart(
  userId?: string
): CartItem[] {

  return getLocalCart(
    userId
  );

}


/* =========================================================
   LOAD CART FROM SUPABASE
========================================================= */

export async function loadCart(
  userId: string
): Promise<CartItem[]> {

  if (
    !userId
  ) {

    return [];

  }


  const supabase =
    createClient();


  const {
    data,
    error
  } =
    await supabase
      .from("cart_items")
      .select(
        `
        id,
        product_id,
        name,
        price,
        image,
        quantity,
        color,
        size
        `
      )
      .eq(
        "user_id",
        userId
      )
      .order(
        "created_at",
        {
          ascending: true,
        }
      );


  if (error) {

    console.error(
      "Failed to load cart:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      }
    );


    /*
     * JWT may temporarily be invalid
     * because the current auth session
     * needs to be refreshed.
     *
     * Keep the local cart instead of
     * destroying the user's cart UI.
     */

    return getLocalCart(
      userId
    );

  }


  const cart: CartItem[] =
    (data ?? []).map(
      (item) => ({
        id: Number(
          item.product_id
        ),

        name: item.name,

        price: Number(
          item.price
        ),

        image: item.image,

        quantity: Number(
          item.quantity
        ),

        color:
          item.color ??
          undefined,

        size:
          item.size ??
          undefined,
      })
    );


  /*
   * Refresh stock from the current
   * active product variants.
   */

  const stockHydratedCart =
    await hydrateCartStock(
      cart
    );


  /*
   * Refresh thumbnails from the current
   * variant media.
   */

  const hydratedCart =
    await hydrateCartMedia(
      stockHydratedCart
    );


  saveLocalCart(
    hydratedCart,
    userId
  );


  if (
    typeof window !== "undefined"
  ) {

    window.dispatchEvent(
      new Event(
        "cart-updated"
      )
    );

  }


  return hydratedCart;

}


/* =========================================================
   SAVE CART
========================================================= */

export async function saveCart(
  cart: CartItem[],
  userId?: string
) {

  /*
   * GUEST
   */

  if (!userId) {

    saveLocalCart(
      cart
    );

    if (
      typeof window !== "undefined"
    ) {

      window.dispatchEvent(
        new Event(
          "cart-updated"
        )
      );

    }

    return;

  }


  /*
   * USER
   */

  const supabase =
    createClient();


  /*
   * Get current remote items
   */

  const {
    data: existing,
    error: fetchError,
  } =
    await supabase
      .from("cart_items")
      .select(
        `
        id,
        product_id,
        color,
        size
        `
      )
      .eq(
        "user_id",
        userId
      );


  if (fetchError) {

    console.error(
      "Failed to read cart:",
      fetchError
    );

    return;

  }


  /*
   * Remove remote items
   * that are no longer present
   */

  for (
    const remoteItem
    of existing ?? []
  ) {

    const stillExists =
      cart.some(
        (item) =>
          Number(
            remoteItem.product_id
          ) === item.id &&
          (remoteItem.color ??
            undefined) ===
            item.color &&
          (remoteItem.size ??
            undefined) ===
            item.size
      );


    if (
      !stillExists
    ) {

      const {
        error
      } =
        await supabase
          .from("cart_items")
          .delete()
          .eq(
            "id",
            remoteItem.id
          )
          .eq(
            "user_id",
            userId
          );


      if (error) {

        console.error(
          "Failed to remove cart item:",
          error
        );

      }

    }

  }


  /*
   * Insert or update cart items
   */

  for (
    const item
    of cart
  ) {

    const {
      data: existingItem,
      error: findError,
    } =
      await supabase
        .from("cart_items")
        .select(
          "id"
        )
        .eq(
          "user_id",
          userId
        )
        .eq(
          "product_id",
          item.id
        )
        .eq(
          "color",
          item.color ?? ""
        )
        .eq(
          "size",
          item.size ?? ""
        )
        .maybeSingle();


    /*
     * Because nullable color/size
     * cannot safely use normal
     * equality when NULL is involved,
     * perform a fallback query.
     */

    let foundId =
      existingItem?.id;


    if (
      !foundId &&
      !findError
    ) {

      const {
        data: candidates
      } =
        await supabase
          .from("cart_items")
          .select(
            "id, color, size"
          )
          .eq(
            "user_id",
            userId
          )
          .eq(
            "product_id",
            item.id
          );


      const candidate =
        (candidates ?? [])
          .find(
            (candidate) =>
              (candidate.color ??
                undefined) ===
                item.color &&
              (candidate.size ??
                undefined) ===
                item.size
          );


      foundId =
        candidate?.id;

    }


    /*
     * UPDATE
     */

    if (
      foundId
    ) {

      const {
        error
      } =
        await supabase
          .from("cart_items")
          .update({
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
            color:
              item.color ??
              null,
            size:
              item.size ??
              null,
          })
          .eq(
            "id",
            foundId
          )
          .eq(
            "user_id",
            userId
          );


      if (error) {

        console.error(
          "Failed to update cart item:",
          error
        );

      }

    }


    /*
     * INSERT
     */

    else {

      const {
        error
      } =
        await supabase
          .from("cart_items")
          .insert({
            user_id: userId,
            product_id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
            color:
              item.color ??
              null,
            size:
              item.size ??
              null,
          });


      if (error) {

        console.error(
          "Failed to insert cart item:",
          error
        );

      }

    }

  }


  /*
   * Update local cache
   */

  saveLocalCart(
    cart,
    userId
  );


  if (
    typeof window !== "undefined"
  ) {

    window.dispatchEvent(
      new Event(
        "cart-updated"
      )
    );

  }

}


/* =========================================================
   ADD TO CART
========================================================= */

export async function addToCart(
  item: CartItem,
  userId?: string
) {

  const cart =
    getCart(
      userId
    );


  const existingIndex =
    cart.findIndex(
      (product) =>
        product.id === item.id &&
        product.color ===
          item.color &&
        product.size ===
          item.size
    );


  /*
   * Read the current stock before
   * changing the cart quantity.
   */

  const currentStock =
    await getVariantStock(
      item.id,
      item.color,
      item.size
    );


  const requestedQuantity =
    existingIndex >= 0
      ? cart[
          existingIndex
        ].quantity +
        item.quantity
      : item.quantity;


  /*
   * If this is a variant item, never allow
   * the cart quantity to exceed current stock.
   */

  const finalQuantity =
    currentStock === undefined
      ? Math.max(
          1,
          requestedQuantity
        )
      : Math.min(
          Math.max(
            1,
            requestedQuantity
          ),
          currentStock
        );


  /*
   * Do not add a variant that has no
   * stock remaining.
   */

  if (
    currentStock !== undefined &&
    currentStock <= 0
  ) {

    return cart;

  }


  if (
    existingIndex >= 0
  ) {

    cart[
      existingIndex
    ] = {
      ...cart[
        existingIndex
      ],

      quantity:
        finalQuantity,

      stock:
        currentStock,

      /*
       * Keep the latest variant-aware
       * thumbnail when the same cart item
       * is added again.
       */
      image:
        item.image ||
        cart[
          existingIndex
        ].image,
    };

  } else {

    cart.push({
      ...item,

      quantity:
        finalQuantity,

      stock:
        currentStock,
    });

  }


  /*
   * Optimistic local update
   */

  saveLocalCart(
    cart,
    userId
  );


  if (
    typeof window !== "undefined"
  ) {

    window.dispatchEvent(
      new Event(
        "cart-updated"
      )
    );

    window.dispatchEvent(
      new Event(
        "cart-added"
      )
    );

  }


  /*
   * Persist
   */

  await saveCart(
    cart,
    userId
  );


  return cart;

}


/* =========================================================
   CLEAR
========================================================= */

export async function clearCart(
  userId?: string
) {

  /*
   * GUEST
   */

  if (!userId) {

    saveLocalCart(
      []
    );

    if (
      typeof window !== "undefined"
    ) {

      window.dispatchEvent(
        new Event(
          "cart-updated"
        )
      );

    }

    return;

  }


  /*
   * USER
   */

  const supabase =
    createClient();


  const {
    error
  } =
    await supabase
      .from("cart_items")
      .delete()
      .eq(
        "user_id",
        userId
      );


  if (error) {

    console.error(
      "Failed to clear cart:",
      error
    );

    return;

  }


  saveLocalCart(
    [],
    userId
  );


  if (
    typeof window !== "undefined"
  ) {

    window.dispatchEvent(
      new Event(
        "cart-updated"
      )
    );

  }

}


/* =========================================================
   COUNT
========================================================= */

export function getCartCount(
  userId?: string
) {

  return getCart(
    userId
  ).reduce(
    (
      total,
      item
    ) =>
      total +
      item.quantity,
    0
  );

}


/* =========================================================
   TOTAL
========================================================= */

export function getCartTotal(
  userId?: string
) {

  return getCart(
    userId
  ).reduce(
    (
      total,
      item
    ) =>
      total +
      item.price *
        item.quantity,
    0
  );

}


/* =========================================================
   REMOVE ITEM
========================================================= */

export async function removeCartItem(
  id: number,
  color?: string,
  size?: string,
  userId?: string
) {

  const updated =
    getCart(
      userId
    ).filter(
      (item) =>
        !(
          item.id === id &&
          item.color === color &&
          item.size === size
        )
    );


  /*
   * Optimistic
   */

  saveLocalCart(
    updated,
    userId
  );


  if (
    typeof window !== "undefined"
  ) {

    window.dispatchEvent(
      new Event(
        "cart-updated"
      )
    );

  }


  await saveCart(
    updated,
    userId
  );

}


/* =========================================================
   UPDATE QUANTITY
========================================================= */

export async function updateCartQuantity(
  id: number,
  color: string | undefined,
  size: string | undefined,
  quantity: number,
  userId?: string
) {

  const cart =
    getCart(
      userId
    );


  /*
   * Refresh the current stock for this
   * exact variant before updating.
   */

  const currentStock =
    await getVariantStock(
      id,
      color,
      size
    );


  const safeQuantity =
    currentStock === undefined
      ? Math.max(
          1,
          quantity
        )
      : Math.min(
          Math.max(
            1,
            quantity
          ),
          currentStock
        );


  const updated =
    cart.map(
      (item) => {

        if (
          item.id === id &&
          item.color === color &&
          item.size === size
        ) {

          return {
            ...item,

            quantity:
              safeQuantity,

            stock:
              currentStock,
          };

        }

        return item;

      }
    );


  /*
   * Optimistic
   */

  saveLocalCart(
    updated,
    userId
  );


  if (
    typeof window !== "undefined"
  ) {

    window.dispatchEvent(
      new Event(
        "cart-updated"
      )
    );

  }


  await saveCart(
    updated,
    userId
  );

}


/* =========================================================
   CHECK ITEM
========================================================= */

export function isInCart(
  id: number,
  color?: string,
  size?: string,
  userId?: string
) {

  return getCart(
    userId
  ).some(
    (item) =>
      item.id === id &&
      item.color === color &&
      item.size === size
  );

}


/* =========================================================
   GET ITEM
========================================================= */

export function getCartItem(
  id: number,
  color?: string,
  size?: string,
  userId?: string
) {

  return getCart(
    userId
  ).find(
    (item) =>
      item.id === id &&
      item.color === color &&
      item.size === size
  );

}


/* =========================================================
   SUBSCRIBE
========================================================= */

export function subscribeCart(
  callback: () => void
) {

  if (
    typeof window === "undefined"
  ) {

    return () => {};

  }


  window.addEventListener(
    "cart-updated",
    callback
  );


  return () => {

    window.removeEventListener(
      "cart-updated",
      callback
    );

  };

}