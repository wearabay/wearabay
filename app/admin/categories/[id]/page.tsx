import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  getAdminCategoryById,
} from "@/lib/admin-categories";

import {
  getSuperAdminUser,
} from "@/lib/admin";

import CategoryForm from "../CategoryForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCategoryPage({
  params,
}: Props) {
  const admin = await getSuperAdminUser();

  if (!admin) {
    redirect("/admin/categories");
  }

  const { id } = await params;
  const categoryId = Number(id);

  if (
    !Number.isInteger(categoryId) ||
    categoryId <= 0
  ) {
    notFound();
  }

  const category =
    await getAdminCategoryById(categoryId);

  if (!category) {
    notFound();
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
          Edit Category
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
          Update the settings and presentation
          of {category.name}.
        </p>
      </div>

      <CategoryForm
        mode="edit"
        category={category}
      />
    </div>
  );
}