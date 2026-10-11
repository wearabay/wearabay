
const KEY_PREFIX = "wearing-abaya-recent";
const RECENTLY_VIEWED_EVENT = "wearabay:recently-viewed";
const MAX_ITEMS = 8;

function getStorageKey(userId: string): string {
  return `${KEY_PREFIX}:${userId}`;
}

export function getRecentlyViewed(userId: string): string[] {
  if (typeof window === "undefined" || !userId) {
    return [];
  }

  try {
    const stored = localStorage.getItem(getStorageKey(userId));
    const parsed: unknown = JSON.parse(stored ?? "[]");

    if (!Array.isArray(parsed)) {
      return [];
    }

    return [
      ...new Set(
        parsed.filter(
          (item): item is string =>
            typeof item === "string" && item.trim().length > 0,
        ),
      ),
    ].slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

export function addRecentlyViewed(
  userId: string,
  slug: string,
): void {
  if (
    typeof window === "undefined" ||
    !userId ||
    !slug.trim()
  ) {
    return;
  }

  const items = [
    slug,
    ...getRecentlyViewed(userId).filter((item) => item !== slug),
  ].slice(0, MAX_ITEMS);

  try {
    localStorage.setItem(
      getStorageKey(userId),
      JSON.stringify(items),
    );

    window.dispatchEvent(
      new CustomEvent(RECENTLY_VIEWED_EVENT, {
        detail: { userId },
      }),
    );
  } catch {
    // Keep the storefront usable if browser storage is unavailable.
  }
}

export function subscribeRecentlyViewed(
  userId: string | null,
  onStoreChange: () => void,
): () => void {
  if (typeof window === "undefined" || !userId) {
    return () => {};
  }

  const storageKey = getStorageKey(userId);

  function handleStorage(event: StorageEvent) {
    if (event.key === storageKey || event.key === null) {
      onStoreChange();
    }
  }

  function handleRecentlyViewed(event: Event) {
    const customEvent = event as CustomEvent<{ userId?: string }>;

    if (customEvent.detail?.userId === userId) {
      onStoreChange();
    }
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(RECENTLY_VIEWED_EVENT, handleRecentlyViewed);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(
      RECENTLY_VIEWED_EVENT,
      handleRecentlyViewed,
    );
  };
}
