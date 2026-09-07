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

  const { id, variantId } =
    await params;

  const productId = Number(id);
  const variantIdNumber = Number(
    variantId
  );

  if (
    !Number.isInteger(productId) ||
    productId <= 0 ||
    !Number.isInteger(variantIdNumber) ||
    variantIdNumber <= 0
  ) {
    notFound();
  }

  const product =
    await getAdminProductById(productId);

  if (!product) {
    notFound();
  }

  const variant =
    await getAdminVariantById(
      variantIdNumber
    );

  if (
    !variant ||
    variant.productId !== productId
  ) {
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

            <span>
              {variant.color} /{" "}
              {variant.size}
            </span>
          </div>

          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-neutral-500">
            Product Variant
          </p>

          <h1 className="text-3xl font-medium tracking-tight">
            Edit Variant
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            {product.name}
          </p>
        </div>

        <VariantForm
          productId={product.id}
          variant={variant}
        />
      </div>
    </main>
  );
}