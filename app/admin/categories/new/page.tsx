import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getSuperAdminUser,
} from "@/lib/admin";

import CategoryForm from "../CategoryForm";

export default async function NewCategoryPage() {
  const admin = await getSuperAdminUser();

  if (!admin) {
    redirect("/admin/categories");
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/categories"
          className="text-xs uppercase tracking-[0.2em] text-neutral-500 transition hover:text-black"
        >
          ← Categories
        </Link>

        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-neutral-500">
          Catalog
        </p>

        <h1 className="mt-2 text-3xl font-light tracking-tight">
          Add Category
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
          Create a category that can be used
          across the Wearabay catalog.
        </p>
      </div>

      <CategoryForm mode="create" />
    </div>
  );
}