import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getAdminUser } from "@/lib/admin";
import { getAdminProductById } from "@/lib/admin-products";
import {
  getAdminProductVariants,
} from "@/lib/admin-variants";

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

  if (
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    notFound();
  }

  const product =
    await getAdminProductById(productId);

  if (!product) {
    notFound();
  }

  const variants =
    await getAdminProductVariants(
      productId
    );

  return (
    <main className="px-6 py-24 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}

        <div className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
            <Link
              href="/admin/products"
              className="transition hover:text-black"
            >
              Products
            </Link>

            <span>/</span>

            <Link
              href={`/admin/products/${product.id}`}
              className="transition hover:text-black"
            >
              {product.name}
            </Link>

            <span>/</span>

            <span>Variants</span>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-neutral-500">
                Product Variants
              </p>

              <h1 className="text-3xl font-medium tracking-tight">
                {product.name}
              </h1>

              <p className="mt-2 text-sm text-neutral-500">
                Manage color, size, SKU, pricing,
                and stock variants.
              </p>
            </div>

            <Link
              href={`/admin/products/${product.id}/variants/new`}
              className="inline-flex h-11 items-center justify-center rounded-full border border-black bg-black px-6 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              + Add Variant
            </Link>
          </div>
        </div>

        <VariantTable
          product={product}
          variants={variants}
        />
      </div>
    </main>
  );
}