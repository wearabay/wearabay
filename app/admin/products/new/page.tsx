import { redirect } from "next/navigation";

import Container from "@/components/ui/Container";

import { getAdminUser } from "@/lib/admin";

import ProductForm from "./ProductForm";

export default async function NewProductPage() {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/login");
  }

  return (
    <main>
      <Container className="py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-neutral-500">
              Administration / Products
            </p>

            <h1 className="text-3xl font-medium tracking-tight">
              Add Product
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Create the basic product information.
              Variants and media can be added after
              the product is created.
            </p>
          </div>

          <ProductForm />
        </div>
      </Container>
    </main>
  );
}