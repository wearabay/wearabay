"use client";

import { createClient } from "@/lib/supabase/client";

function getWishlistKey(
  userId?: string
) {
  if (userId) {
    return `wearing-abaya-user-${userId}-wishlist`;
  }

  return "wearing-abaya-guest-wishlist";
}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function getLocalWishlist(
  userId?: string
): number[] {

  if (
    typeof window === "undefined"
  ) {
    return [];
  }

  try {

    const data =
      localStorage.getItem(
        getWishlistKey(userId)
      );

    return data
      ? JSON.parse(data)
      : [];

  } catch {

    return [];

  }
}


function saveLocalWishlist(
  ids: number[],
  userId?: string
) {

  if (
    typeof window === "undefined"
  ) {
    return;
  }

  localStorage.setItem(
    getWishlistKey(userId),
    JSON.stringify(ids)
  );
}


/* =========================================================
   GET
========================================================= */

export function getWishlist(
  userId?: string
): number[] {

  return getLocalWishlist(userId);

}


/* =========================================================
   LOAD FROM SUPABASE
========================================================= */

export async function loadWishlist(
  userId: string
): Promise<number[]> {

  if (
    !userId
  ) {
    return [];
  }

  const supabase =
    createClient();

  const {
    data,
    error,
  } =
    await supabase
      .from("wishlist")
      .select("product_id")
      .eq(
        "user_id",
        userId
      );

  if (error) {

    console.error(
      "Failed to load wishlist:",
      error
    );

    return getLocalWishlist(userId);

  }

  const ids =
    (data ?? [])
      .map(
        (item) =>
          Number(item.product_id)
      );

  saveLocalWishlist(
    ids,
    userId
  );

  if (
    typeof window !== "undefined"
  ) {

    window.dispatchEvent(
      new Event(
        "wishlist-updated"
      )
    );

  }

  return ids;

}


/* =========================================================
   SAVE
========================================================= */

export async function saveWishlist(
  ids: number[],
  userId?: string
) {

  /*
   * GUEST
   */

  if (!userId) {

    saveLocalWishlist(
      ids
    );

    if (
      typeof window !== "undefined"
    ) {

      window.dispatchEvent(
        new Event(
          "wishlist-updated"
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
   * Get current remote wishlist
   */

  const {
    data: existing,
    error: fetchError,
  } =
    await supabase
      .from("wishlist")
      .select(
        "id, product_id"
      )
      .eq(
        "user_id",
        userId
      );


  if (fetchError) {

    console.error(
      "Failed to read wishlist:",
      fetchError
    );

    return;

  }


  /*
   * IDs that already exist
   */

  const existingIds =
    (existing ?? [])
      .map(
        (item) =>
          Number(
            item.product_id
          )
      );


  /*
   * Add new items
   */

  const idsToAdd =
    ids.filter(
      (id) =>
        !existingIds.includes(id)
    );


  if (
    idsToAdd.length > 0
  ) {

    const rows =
      idsToAdd.map(
        (productId) => ({
          user_id: userId,
          product_id: productId,
        })
      );

    const {
      error
    } =
      await supabase
        .from("wishlist")
        .insert(rows);

    if (error) {

      console.error(
        "Failed to insert wishlist:",
        error
      );

      return;

    }

  }


  /*
   * Remove items no longer wanted
   */

  const idsToRemove =
    existingIds.filter(
      (id) =>
        !ids.includes(id)
    );


  for (
    const productId
    of idsToRemove
  ) {

    const {
      error
    } =
      await supabase
        .from("wishlist")
        .delete()
        .eq(
          "user_id",
          userId
        )
        .eq(
          "product_id",
          productId
        );

    if (error) {

      console.error(
        "Failed to remove wishlist item:",
        error
      );

    }

  }


  /*
   * Update local cache
   */

  saveLocalWishlist(
    ids,
    userId
  );


  if (
    typeof window !== "undefined"
  ) {

    window.dispatchEvent(
      new Event(
        "wishlist-updated"
      )
    );

  }

}


/* =========================================================
   CHECK
========================================================= */

export function isWishlisted(
  id: number,
  userId?: string
) {

  return getWishlist(
    userId
  ).includes(id);

}


/* =========================================================
   TOGGLE
========================================================= */

export async function toggleWishlist(
  id: number,
  userId?: string
) {

  const list =
    getWishlist(
      userId
    );


  let updated: number[];


  if (
    list.includes(id)
  ) {

    updated =
      list.filter(
        (item) =>
          item !== id
      );

  } else {

    updated = [
      ...list,
      id,
    ];

  }


  /*
   * Update UI immediately
   */

  saveLocalWishlist(
    updated,
    userId
  );


  if (
    typeof window !== "undefined"
  ) {

    window.dispatchEvent(
      new Event(
        "wishlist-updated"
      )
    );

  }


  /*
   * Persist
   */

  await saveWishlist(
    updated,
    userId
  );


  return updated;

}


/* =========================================================
   COUNT
========================================================= */

export function getWishlistCount(
  userId?: string
) {

  return getWishlist(
    userId
  ).length;

}


/* =========================================================
   REMOVE
========================================================= */

export async function removeWishlist(
  id: number,
  userId?: string
) {

  const updated =
    getWishlist(
      userId
    ).filter(
      (item) =>
        item !== id
    );


  await saveWishlist(
    updated,
    userId
  );

}


/* =========================================================
   CLEAR
========================================================= */

export async function clearWishlist(
  userId?: string
) {

  /*
   * GUEST
   */

  if (!userId) {

    if (
      typeof window !== "undefined"
    ) {

      localStorage.removeItem(
        getWishlistKey()
      );

      window.dispatchEvent(
        new Event(
          "wishlist-updated"
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
      .from("wishlist")
      .delete()
      .eq(
        "user_id",
        userId
      );


  if (error) {

    console.error(
      "Failed to clear wishlist:",
      error
    );

    return;

  }


  saveLocalWishlist(
    [],
    userId
  );


  if (
    typeof window !== "undefined"
  ) {

    window.dispatchEvent(
      new Event(
        "wishlist-updated"
      )
    );

  }

}