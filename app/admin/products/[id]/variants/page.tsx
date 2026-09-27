import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getAdminUser } from "@/lib/admin";
import { getAdminProductById } from "@/lib/admin-products";
import { getAdminProductVariants } from "@/lib/admin-variants";

import VariantTable from "./VariantTable";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductVariantsPage({
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

  const variants = await getAdminProductVariants(productId);

  return (
    <main className="pb-10">
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

          <span className="text-neutral-500">Variants</span>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-neutral-400">
              Product Workspace
            </p>

            <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
              Variants
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
              Manage colors, sizes, SKU, pricing, stock, and status for{" "}
              {product.name}.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/products/${product.id}`}
              className="inline-flex h-10 items-center justify-center rounded-full border border-stone-200 bg-white px-4 text-xs font-medium text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900"
            >
              Product
            </Link>

            <Link
              href={`/admin/products/${product.id}/variants/new`}
              className="inline-flex h-10 items-center justify-center rounded-full bg-neutral-900 px-4 text-xs font-medium text-white transition hover:bg-neutral-800"
            >
              + Add Variant
            </Link>
          </div>
        </div>
      </div>

      <VariantTable
        product={product}
        variants={variants}
      />
    </main>
  );
}