import { redirect } from "next/navigation";

import Container from "@/components/ui/Container";

import { getAdminUser } from "@/lib/admin";
import { getAdminInventory } from "@/lib/admin-inventory";

import InventoryTable from "./InventoryTable";

export default async function AdminInventoryPage() {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/account");
  }

  const inventory =
    await getAdminInventory();

  const totalVariants =
    inventory.length;

  const outOfStock =
    inventory.filter(
      (variant) => variant.stock === 0
    ).length;

  const lowStock =
    inventory.filter(
      (variant) =>
        variant.stock > 0 &&
        variant.stock <= 2
    ).length;

  const totalUnits =
    inventory.reduce(
      (total, variant) =>
        total + variant.stock,
      0
    );

  return (
    <main>
      <Container className="py-24">
        <div className="space-y-10">

          {/* HEADER */}

          <div>
            <p
              className="
                text-xs
                uppercase
                tracking-[0.3em]
                text-neutral-500
              "
            >
              Administration
            </p>

            <h1
              className="
                mt-3
                text-4xl
                font-light
              "
            >
              Inventory
            </h1>

            <p
              className="
                mt-3
                text-sm
                text-neutral-500
              "
            >
              Monitor product stock by color
              and size.
            </p>
          </div>


          {/* SUMMARY */}

          <div
            className="
              grid
              gap-5
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >

            <div
              className="
                rounded-2xl
                border
                border-stone-200
                p-6
              "
            >
              <p className="text-xs uppercase tracking-widest text-neutral-500">
                Variants
              </p>

              <p className="mt-3 text-3xl font-light">
                {totalVariants}
              </p>

              <p className="mt-2 text-xs text-neutral-500">
                Total product variants
              </p>
            </div>


            <div
              className="
                rounded-2xl
                border
                border-stone-200
                p-6
              "
            >
              <p className="text-xs uppercase tracking-widest text-neutral-500">
                Units
              </p>

              <p className="mt-3 text-3xl font-light">
                {totalUnits}
              </p>

              <p className="mt-2 text-xs text-neutral-500">
                Current stock
              </p>
            </div>


            <div
              className="
                rounded-2xl
                border
                border-stone-200
                p-6
              "
            >
              <p className="text-xs uppercase tracking-widest text-neutral-500">
                Low Stock
              </p>

              <p className="mt-3 text-3xl font-light">
                {lowStock}
              </p>

              <p className="mt-2 text-xs text-neutral-500">
                1–2 units remaining
              </p>
            </div>


            <div
              className="
                rounded-2xl
                border
                border-stone-200
                p-6
              "
            >
              <p className="text-xs uppercase tracking-widest text-neutral-500">
                Out of Stock
              </p>

              <p className="mt-3 text-3xl font-light">
                {outOfStock}
              </p>

              <p className="mt-2 text-xs text-neutral-500">
                No units remaining
              </p>
            </div>

          </div>


          {/* INVENTORY */}

          <InventoryTable
            inventory={inventory}
          />

        </div>
      </Container>
    </main>
  );
}