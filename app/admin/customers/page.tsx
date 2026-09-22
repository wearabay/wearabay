import Link from "next/link";
import { redirect } from "next/navigation";

import { getAdminUser } from "@/lib/admin";
import { getAdminCustomers } from "@/lib/admin-customers";

import CustomersTable from "./CustomersTable";

export default async function AdminCustomersPage() {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/account");
  }

  const customers = await getAdminCustomers();

  const customersWithOrders = customers.filter(
    (customer) => customer.orderCount > 0,
  ).length;

  const totalOrders = customers.reduce(
    (total, customer) =>
      total + customer.orderCount,
    0,
  );

  return (
    <main className="min-w-0 space-y-8 pt-2 lg:pt-8">
      <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-400">
            Workspace
          </p>

          <h1 className="mt-2 text-2xl font-light tracking-tight sm:text-3xl">
            Customers
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            View customer accounts and order
            activity.
          </p>
        </div>

        <Link
          href="/admin/customers/export"
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white px-5 text-sm text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
        >
          Export Customers
        </Link>
      </div>

      <section className="grid min-w-0 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-xs text-neutral-500">
            Total Customers
          </p>

          <p className="mt-2 text-2xl font-light">
            {customers.length}
          </p>

          <p className="mt-2 text-xs text-neutral-400">
            Customer accounts
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-xs text-neutral-500">
            Customers with Orders
          </p>

          <p className="mt-2 text-2xl font-light">
            {customersWithOrders}
          </p>

          <p className="mt-2 text-xs text-neutral-400">
            Customers who have placed orders
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-xs text-neutral-500">
            Total Orders
          </p>

          <p className="mt-2 text-2xl font-light">
            {totalOrders}
          </p>

          <p className="mt-2 text-xs text-neutral-400">
            Across all customers
          </p>
        </div>
      </section>

      <section className="min-w-0">
        <div className="mb-5 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">
              Customer Directory
            </p>

            <p className="mt-2 text-sm text-neutral-500">
              {customers.length}{" "}
              {customers.length === 1
                ? "customer"
                : "customers"}
            </p>
          </div>
        </div>

        <CustomersTable customers={customers} />
      </section>
    </main>
  );
}