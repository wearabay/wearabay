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

  const products =
    await getAdminProducts();

  return (
    <main className="space-y-8 pt-2 lg:pt-8">
      {/* HEADER */}

      <section
        className="
          flex
          flex-col
          gap-5
          md:flex-row
          md:items-end
          md:justify-between
        "
      >
        <div>
          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.3em]
              text-neutral-400
            "
          >
            Administration
          </p>

          <h1
            className="
              mt-2
              text-3xl
              font-light
              tracking-tight
              sm:text-4xl
            "
          >
            Products
          </h1>

          <p
            className="
              mt-2
              max-w-xl
              text-sm
              leading-6
              text-neutral-500
            "
          >
            Manage your product catalog,
            content, and publishing status.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="
            inline-flex
            h-11
            w-fit
            items-center
            justify-center
            rounded-xl
            bg-neutral-900
            px-5
            text-[10px]
            font-medium
            uppercase
            tracking-[0.15em]
            text-white
            transition
            hover:bg-black
          "
        >
          + Add Product
        </Link>
      </section>

      {/* PRODUCTS */}

      <ProductTable
        products={products}
      />
    </main>
  );
}