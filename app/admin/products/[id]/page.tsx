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

export default async function AdminProductEditPage({
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
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
            <Link
              href="/admin/products"
              className="transition hover:text-black"
            >
              Products
            </Link>

            <span>/</span>

            <span>{product.name}</span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-neutral-500">
                Administration / Products
              </p>

              <h1 className="text-3xl font-medium tracking-tight">
                Edit Product
              </h1>

              <p className="mt-2 text-sm text-neutral-500">
                Update the basic product information.
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600">
              {product.status}
            </span>
          </div>
        </div>

        <ProductEditForm product={product} />
      </div>
    </main>
  );
}