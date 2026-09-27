import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getAdminUser } from "@/lib/admin";
import { getAdminProductById } from "@/lib/admin-products";
import { getAdminVariantById } from "@/lib/admin-variants";

type Props = {
  params: Promise<{
    id: string;
    variantId: string;
  }>;
};

function formatPrice(value: number) {
  const amount = Math.round(value);

  const formatted = String(amount).replace(
    /\B(?=(\d{3})+(?!\d))/g,
    "."
  );

  return `Rp${formatted}`;
}

function statusClass(status: "active" | "inactive") {
  return status === "active"
    ? "bg-neutral-100 text-neutral-900"
    : "bg-stone-50 text-neutral-400";
}

export default async function VariantDetailPage({
  params,
}: Props) {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/login");
  }

  const { id, variantId } = await params;

  const productId = Number(id);
  const variantIdNumber = Number(variantId);

  if (
    !Number.isInteger(productId) ||
    productId <= 0 ||
    !Number.isInteger(variantIdNumber) ||
    variantIdNumber <= 0
  ) {
    notFound();
  }

  const product = await getAdminProductById(productId);

  if (!product) {
    notFound();
  }

  const variant = await getAdminVariantById(variantIdNumber);

  if (
    !variant ||
    variant.productId !== productId
  ) {
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

          <Link
            href={`/admin/products/${product.id}`}
            className="max-w-[220px] truncate transition hover:text-neutral-900"
          >
            {product.name}
          </Link>

          <span>/</span>

          <Link
            href={`/admin/products/${product.id}/variants`}
            className="transition hover:text-neutral-900"
          >
            Variants
          </Link>

          <span>/</span>

          <span className="text-neutral-500">
            {variant.color} / {variant.size}
          </span>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-neutral-400">
              Variant Workspace
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
                {variant.color} / {variant.size}
              </h1>

              <span
                className={`rounded-full px-3 py-1.5 text-[10px] font-medium ${statusClass(
                  variant.status
                )}`}
              >
                {variant.status === "active"
                  ? "Active"
                  : "Inactive"}
              </span>
            </div>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Variant #{variant.id} for {product.name}.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/products/${product.id}/variants`}
              className="inline-flex h-10 items-center justify-center rounded-full border border-stone-200 bg-white px-4 text-xs font-medium text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900"
            >
              Back to Variants
            </Link>

            <Link
              href={`/admin/products/${product.id}/variants/${variant.id}/edit`}
              className="inline-flex h-10 items-center justify-center rounded-full bg-neutral-900 px-4 text-xs font-medium text-white transition hover:bg-neutral-800"
            >
              Edit Variant
            </Link>
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            Color
          </p>

          <p className="mt-3 text-base font-medium text-neutral-900">
            {variant.color}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            Size
          </p>

          <p className="mt-3 text-base font-medium text-neutral-900">
            {variant.size}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            Stock
          </p>

          <p className="mt-3 text-2xl font-medium tracking-tight text-neutral-900">
            {variant.stock}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            Price
          </p>

          <p className="mt-3 text-base font-medium text-neutral-900">
            {formatPrice(variant.price)}
          </p>
        </div>
      </div>

      {/* Variant Information */}
      <section className="mb-5 rounded-2xl border border-stone-200 bg-white">
        <div className="border-b border-stone-100 px-5 py-5 sm:px-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            Variant Details
          </p>

          <h2 className="mt-2 text-base font-medium text-neutral-900">
            Variant Information
          </h2>

          <p className="mt-1 text-sm leading-6 text-neutral-500">
            Product-level information for this specific variant.
          </p>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <p className="text-xs text-neutral-400">
              Color
            </p>

            <p className="mt-1 text-sm font-medium text-neutral-900">
              {variant.color}
            </p>
          </div>

          <div>
            <p className="text-xs text-neutral-400">
              Size
            </p>

            <p className="mt-1 text-sm font-medium text-neutral-900">
              {variant.size}
            </p>
          </div>

          <div>
            <p className="text-xs text-neutral-400">
              SKU
            </p>

            <p className="mt-1 break-all text-sm font-medium text-neutral-900">
              {variant.sku || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs text-neutral-400">
              Status
            </p>

            <p className="mt-1 text-sm font-medium text-neutral-900">
              {variant.status === "active"
                ? "Active"
                : "Inactive"}
            </p>
          </div>
        </div>
      </section>

      {/* Pricing & Stock */}
      <section className="rounded-2xl border border-stone-200 bg-white">
        <div className="border-b border-stone-100 px-5 py-5 sm:px-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            Commercial
          </p>

          <h2 className="mt-2 text-base font-medium text-neutral-900">
            Pricing & Stock
          </h2>

          <p className="mt-1 text-sm leading-6 text-neutral-500">
            Current pricing and inventory information.
          </p>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <p className="text-xs text-neutral-400">
              Price
            </p>

            <p className="mt-1 text-sm font-medium text-neutral-900">
              {formatPrice(variant.price)}
            </p>
          </div>

          <div>
            <p className="text-xs text-neutral-400">
              Compare at Price
            </p>

            <p className="mt-1 text-sm font-medium text-neutral-900">
              {variant.compareAtPrice !== null
                ? formatPrice(variant.compareAtPrice)
                : "—"}
            </p>
          </div>

          <div>
            <p className="text-xs text-neutral-400">
              Stock
            </p>

            <p className="mt-1 text-sm font-medium text-neutral-900">
              {variant.stock}
            </p>
          </div>

          <div>
            <p className="text-xs text-neutral-400">
              Product
            </p>

            <Link
              href={`/admin/products/${product.id}`}
              className="mt-1 block text-sm font-medium text-neutral-900 transition hover:text-neutral-500"
            >
              {product.name}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}