import Link from "next/link";
import { redirect } from "next/navigation";

import { getAdminUser } from "@/lib/admin";

import ProductForm from "./ProductForm";

export default async function NewProductPage() {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/login");
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

          <span className="text-neutral-500">
            New Product
          </span>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-neutral-400">
              Product Workspace
            </p>

            <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
              Add Product
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
              Create the basic product information first. Variants and
              media can be added after the product is created.
            </p>
          </div>

          <Link
            href="/admin/products"
            className="inline-flex h-10 w-fit items-center justify-center rounded-full border border-stone-200 bg-white px-4 text-xs font-medium text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900"
          >
            Back to Products
          </Link>
        </div>
      </div>

      {/* Product Creation Form */}
      <ProductForm />
    </main>
  );
}