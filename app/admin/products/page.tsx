import Link from "next/link";
import { redirect } from "next/navigation";

import { getAdminUser } from "@/lib/admin";
import { getAdminProducts } from "@/lib/admin-products";

import ProductTable from "./ProductTable";

export default async function AdminProductsPage() {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/login");
  }

  const products = await getAdminProducts();

  return (
    <main className="px-6 py-24 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-neutral-500">
              Administration
            </p>

            <h1 className="text-3xl font-medium tracking-tight">
              Products
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Manage your product catalog.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="inline-flex h-11 items-center justify-center rounded-full border border-black bg-black px-6 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            + Add Product
          </Link>
        </div>

        <ProductTable products={products} />
      </div>
    </main>
  );
}