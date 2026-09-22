import { redirect } from "next/navigation";

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
    <main className="space-y-8 pt-2 lg:pt-8">
      {/* HEADER */}

      <section>
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
          Inventory
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
          Monitor product stock by color
          and size.
        </p>
      </section>

      {/* SUMMARY */}

      <section
        className="
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <div
          className="
            rounded-2xl
            border
            border-stone-200
            bg-white
            p-5
          "
        >
          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.2em]
              text-neutral-400
            "
          >
            Variants
          </p>

          <p
            className="
              mt-5
              text-3xl
              font-light
              tracking-tight
            "
          >
            {totalVariants}
          </p>

          <p
            className="
              mt-2
              text-xs
              text-neutral-500
            "
          >
            Total product variants
          </p>
        </div>

        <div
          className="
            rounded-2xl
            border
            border-stone-200
            bg-white
            p-5
          "
        >
          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.2em]
              text-neutral-400
            "
          >
            Units
          </p>

          <p
            className="
              mt-5
              text-3xl
              font-light
              tracking-tight
            "
          >
            {totalUnits}
          </p>

          <p
            className="
              mt-2
              text-xs
              text-neutral-500
            "
          >
            Current stock
          </p>
        </div>

        <div
          className="
            rounded-2xl
            border
            border-stone-200
            bg-white
            p-5
          "
        >
          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.2em]
              text-neutral-400
            "
          >
            Low Stock
          </p>

          <p
            className="
              mt-5
              text-3xl
              font-light
              tracking-tight
            "
          >
            {lowStock}
          </p>

          <p
            className="
              mt-2
              text-xs
              text-neutral-500
            "
          >
            1–2 units remaining
          </p>
        </div>

        <div
          className="
            rounded-2xl
            border
            border-stone-200
            bg-white
            p-5
          "
        >
          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.2em]
              text-neutral-400
            "
          >
            Out of Stock
          </p>

          <p
            className="
              mt-5
              text-3xl
              font-light
              tracking-tight
            "
          >
            {outOfStock}
          </p>

          <p
            className="
              mt-2
              text-xs
              text-neutral-500
            "
          >
            No units remaining
          </p>
        </div>
      </section>

      {/* INVENTORY */}

      <InventoryTable
        inventory={inventory}
      />
    </main>
  );
}