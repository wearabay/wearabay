"use client";

import { createClient } from "@/lib/supabase/client";


export type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
  size?: string;
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
      error
    );

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


  return cart;

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
        data: candidates,
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


  if (
    existingIndex >= 0
  ) {

    cart[
      existingIndex
    ].quantity +=
      item.quantity;

  } else {

    cart.push(
      item
    );

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
              Math.max(
                1,
                quantity
              ),
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