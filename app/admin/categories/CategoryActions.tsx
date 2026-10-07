"use client";

import Link from "next/link";
import { useState } from "react";

import {
  deleteAdminCategoryAction,
  toggleAdminCategoryAction,
} from "./actions";

import type { AdminCategory } from "@/lib/admin-categories";

type Props = {
  category: AdminCategory;
  mobile?: boolean;
};

export default function CategoryActions({
  category,
  mobile = false,
}: Props) {
  const [pending, setPending] = useState(false);

  async function handleToggle() {
    setPending(true);

    try {
      await toggleAdminCategoryAction(
        category.id,
        !category.isActive,
      );
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${category.name}"? This can only be done if no products are assigned to this category.`,
    );

    if (!confirmed) {
      return;
    }

    setPending(true);

    try {
      await deleteAdminCategoryAction(category.id);
    } finally {
      setPending(false);
    }
  }

  if (mobile) {
    return (
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/admin/categories/${category.id}`}
          className="rounded-full border border-stone-300 px-4 py-2 text-xs font-medium transition hover:border-black"
        >
          Edit
        </Link>

        <button
          type="button"
          onClick={() => void handleToggle()}
          disabled={pending}
          className="rounded-full border border-stone-300 px-4 py-2 text-xs font-medium transition hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending
            ? "Saving..."
            : category.isActive
              ? "Deactivate"
              : "Activate"}
        </button>

        {category.productCount === 0 && (
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={pending}
            className="rounded-full border border-red-200 px-4 py-2 text-xs font-medium text-red-600 transition hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/categories/${category.id}`}
        className="rounded-full border border-stone-300 px-4 py-2 text-xs font-medium transition hover:border-black"
      >
        Edit
      </Link>

      <button
        type="button"
        onClick={() => void handleToggle()}
        disabled={pending}
        className="rounded-full border border-stone-300 px-4 py-2 text-xs font-medium transition hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending
          ? "Saving..."
          : category.isActive
            ? "Deactivate"
            : "Activate"}
      </button>

      {category.productCount === 0 && (
        <button
          type="button"
          onClick={() => void handleDelete()}
          disabled={pending}
          className="rounded-full border border-red-200 px-4 py-2 text-xs font-medium text-red-600 transition hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Delete
        </button>
      )}
    </div>
  );
}