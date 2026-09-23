import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getAdminUser } from "@/lib/admin";
import { getAdminProductById } from "@/lib/admin-products";

import ProductEditForm from "./ProductEditForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function getStatusClasses(status: string) {
  switch (status) {
    case "published":
      return "bg-neutral-900 text-white";
    case "archived":
      return "bg-neutral-100 text-neutral-500";
    default:
      return "bg-stone-100 text-neutral-600";
  }
}

export default async function AdminProductEditPage({
  params,
}: Props) {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/login");
  }

  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    notFound();
  }

  const product = await getAdminProductById(productId);

  if (!product) {
    notFound();
  }

  return (
    <main className="pb-10">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
          <Link
            href="/admin/products"
            className="transition hover:text-neutral-900"
          >
            Products
          </Link>

          <span>/</span>

          <span className="max-w-[220px] truncate text-neutral-500">
            {product.name}
          </span>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-neutral-400">
              Product Workspace
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
                {product.name}
              </h1>

              <span
                className={[
                  "inline-flex rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.12em]",
                  getStatusClasses(product.status),
                ].join(" ")}
              >
                {product.status}
              </span>
            </div>

            <p className="mt-2 max-w-2xl text-sm text-neutral-500">
              Edit the product information and manage its connected
              variants and media.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/products/${product.id}/variants`}
              className="inline-flex h-10 items-center justify-center rounded-full border border-stone-200 bg-white px-4 text-xs font-medium text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900"
            >
              Variants
            </Link>

            <Link
              href={`/admin/products/${product.id}/media`}
              className="inline-flex h-10 items-center justify-center rounded-full border border-stone-200 bg-white px-4 text-xs font-medium text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900"
            >
              Media
            </Link>
          </div>
        </div>
      </div>

      {/* Product Summary */}
      <section className="mb-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white px-5 py-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            Category
          </p>

          <p className="mt-2 text-sm font-medium text-neutral-900">
            {product.category || "—"}
          </p>
        </div>

        <Link
          href={`/admin/products/${product.id}/variants`}
          className="rounded-2xl border border-stone-200 bg-white px-5 py-4 transition hover:border-neutral-400"
        >
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            Variants
          </p>

          <p className="mt-2 text-sm font-medium text-neutral-900">
            {product.variantCount}
          </p>
        </Link>

        <Link
          href={`/admin/products/${product.id}/media`}
          className="rounded-2xl border border-stone-200 bg-white px-5 py-4 transition hover:border-neutral-400"
        >
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            Media
          </p>

          <p className="mt-2 text-sm font-medium text-neutral-900">
            {product.mediaCount}
          </p>
        </Link>
      </section>

      <ProductEditForm product={product} />
    </main>
  );
}