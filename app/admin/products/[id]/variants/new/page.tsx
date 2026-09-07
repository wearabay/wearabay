import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getAdminUser } from "@/lib/admin";
import { getAdminProductById } from "@/lib/admin-products";

import VariantForm from "./VariantForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function NewVariantPage({
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

  return (
    <main className="px-6 py-24 lg:px-10">
      <div className="mx-auto max-w-3xl">
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

            <Link
              href={`/admin/products/${product.id}/variants`}
              className="transition hover:text-black"
            >
              Variants
            </Link>

            <span>/</span>

            <span>New</span>
          </div>

          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-neutral-500">
            Product Variant
          </p>

          <h1 className="text-3xl font-medium tracking-tight">
            Add Variant
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            {product.name}
          </p>
        </div>

        <VariantForm
          productId={product.id}
          productName={product.name}
        />
      </div>
    </main>
  );
}