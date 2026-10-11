
"use client";

import { useEffect } from "react";

import { useAuthUser } from "@/hooks/useAuthUser";
import { addRecentlyViewed } from "@/lib/recently-viewed";

export default function ProductTracker({
  slug,
}: {
  slug: string;
}) {
  const { user, loading } = useAuthUser();

  useEffect(() => {
    if (loading || !user?.id) {
      return;
    }

    addRecentlyViewed(user.id, slug);
  }, [loading, user?.id, slug]);

  return null;
}
