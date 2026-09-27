import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getAdminUser } from "@/lib/admin";
import { getAdminProductById } from "@/lib/admin-products";
import { getAdminVariantById } from "@/lib/admin-variants";

import VariantForm from "./VariantForm";

type Props = {
  params: Promise<{
    id: string;
    variantId: string;
  }>;
};

export default async function EditVariantPage({
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

          <Link
            href={`/admin/products/${product.id}/variants/${variant.id}`}
            className="max-w-[220px] truncate transition hover:text-neutral-900"
          >
            {variant.color} / {variant.size}
          </Link>

          <span>/</span>

          <span className="text-neutral-500">
            Edit
          </span>
        </div>

        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-neutral-400">
            Variant Workspace
          </p>

          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
            Edit Variant
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Update the details, pricing, stock, and status for{" "}
            {variant.color} / {variant.size}.
          </p>
        </div>
      </div>

      <div className="max-w-4xl">
        <VariantForm
          productId={product.id}
          variant={variant}
        />
      </div>
    </main>
  );
}