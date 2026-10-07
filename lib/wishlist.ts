"use client";

import { createClient } from "@/lib/supabase/client";

/*
 * Tracks local wishlist mutations.
 *
 * This prevents an older async loadWishlist()
 * request from writing stale Supabase data back
 * into localStorage after the user has already
 * added, removed, or cleared wishlist items.
 */
const wishlistMutationVersions =
  new Map<string, number>();

function getWishlistKey(
  userId?: string
) {
  if (userId) {
    return `wearing-abaya-user-${userId}-wishlist`;
  }

  return "wearing-abaya-guest-wishlist";
}

function getMutationVersion(
  userId?: string
) {
  return wishlistMutationVersions.get(
    getWishlistKey(userId)
  ) ?? 0;
}

function markWishlistMutation(
  userId?: string
) {
  const key =
    getWishlistKey(userId);

  const nextVersion =
    getMutationVersion(userId) + 1;

  wishlistMutationVersions.set(
    key,
    nextVersion
  );

  return nextVersion;
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

    if (!data) {
      return [];
    }

    const parsed =
      JSON.parse(data);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(Number)
      .filter(
        (id) =>
          Number.isInteger(id) &&
          id > 0
      );

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

  const normalizedIds =
    Array.from(
      new Set(
        ids.filter(
          (id) =>
            Number.isInteger(id) &&
            id > 0
        )
      )
    );

  localStorage.setItem(
    getWishlistKey(userId),
    JSON.stringify(
      normalizedIds
    )
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
  if (!userId) {
    return [];
  }

  const requestVersion =
    getMutationVersion(userId);

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

    return getLocalWishlist(
      userId
    );
  }

  /*
   * A wishlist mutation happened while
   * this request was in flight.
   *
   * Do not overwrite the newer local state
   * with this potentially stale response.
   */
  if (
    requestVersion !==
    getMutationVersion(userId)
  ) {
    return getLocalWishlist(
      userId
    );
  }

  const ids =
    (data ?? [])
      .map(
        (item) =>
          Number(item.product_id)
      )
      .filter(
        (id) =>
          Number.isInteger(id) &&
          id > 0
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
  const normalizedIds =
    Array.from(
      new Set(
        ids.filter(
          (id) =>
            Number.isInteger(id) &&
            id > 0
        )
      )
    );

  /*
   * Every explicit save is a new local
   * wishlist state. This invalidates any
   * older loadWishlist request.
   */
  markWishlistMutation(
    userId
  );

  /*
   * GUEST
   */

  if (!userId) {
    saveLocalWishlist(
      normalizedIds
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
   * Get current remote wishlist.
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

    /*
     * Keep the optimistic local
     * state instead of replacing it
     * with stale data.
     */
    saveLocalWishlist(
      normalizedIds,
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

    return;
  }


  /*
   * IDs that already exist.
   */

  const existingIds =
    (existing ?? [])
      .map(
        (item) =>
          Number(
            item.product_id
          )
      )
      .filter(
        (id) =>
          Number.isInteger(id) &&
          id > 0
      );


  /*
   * Add new items.
   */

  const idsToAdd =
    normalizedIds.filter(
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
          product_id:
            productId,
        })
      );

    const {
      error,
    } =
      await supabase
        .from("wishlist")
        .insert(rows);

    if (error) {
      console.error(
        "Failed to insert wishlist:",
        error
      );

      saveLocalWishlist(
        normalizedIds,
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

      return;
    }
  }


  /*
   * Remove items no longer wanted.
   */

  const idsToRemove =
    existingIds.filter(
      (id) =>
        !normalizedIds.includes(
          id
        )
    );

  for (
    const productId
    of idsToRemove
  ) {
    const {
      error,
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
   * Update local cache using the
   * exact state requested by the user.
   */

  saveLocalWishlist(
    normalizedIds,
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
   * Immediately invalidate older
   * async loads and update the UI.
   */
  markWishlistMutation(
    userId
  );

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
   * Persist the same state.
   *
   * saveWishlist() also marks a new
   * mutation version, which is safe.
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
   * Immediately invalidate any older
   * load request before contacting Supabase.
   */
  markWishlistMutation(
    userId
  );

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
    error,
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