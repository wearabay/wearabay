"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { AdminCustomer } from "@/lib/admin-customers";

type Props = {
  customers: AdminCustomer[];
};

function formatDate(value: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const day = String(date.getUTCDate()).padStart(2, "0");

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];

  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  return `${day} ${month} ${year}`;
}

function formatPrice(value: number) {
  const amount = Math.round(Number(value) || 0);

  const formatted = String(amount).replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ".",
  );

  return `Rp ${formatted}`;
}

function RoleBadge({
  role,
}: {
  role: string;
}) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-neutral-600">
      {role}
    </span>
  );
}

export default function CustomersTable({
  customers,
}: Props) {
  const [search, setSearch] = useState("");

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter((customer) => {
      return [
        customer.name,
        customer.email,
        customer.phone,
        customer.role,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query),
        );
    });
  }, [customers, search]);

  if (customers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
        <p className="text-sm text-neutral-500">
          No customers found.
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <div className="border-b border-stone-200 p-4 sm:p-5">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="customer-search"
              className="text-[10px] uppercase tracking-[0.2em] text-neutral-400"
            >
              Search Customers
            </label>

            <input
              id="customer-search"
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search name, email, phone, role..."
              className="mt-3 h-11 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-900"
            />
          </div>

          <div className="shrink-0 text-xs text-neutral-400">
            Showing{" "}
            <span className="text-neutral-700">
              {filteredCustomers.length}
            </span>{" "}
            of{" "}
            <span className="text-neutral-700">
              {customers.length}
            </span>
          </div>
        </div>

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="mt-3 text-xs text-neutral-500 underline underline-offset-4 transition hover:text-neutral-900"
          >
            Clear search
          </button>
        )}
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-sm text-neutral-500">
            No customers match your search.
          </p>

          <button
            type="button"
            onClick={() => setSearch("")}
            className="mt-4 text-sm underline underline-offset-4"
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          {/* MOBILE / TABLET */}
          <div className="divide-y divide-stone-200 lg:hidden">
            {filteredCustomers.map((customer) => (
              <Link
                key={customer.id}
                href={`/admin/customers/${customer.id}`}
                className="block transition-colors hover:bg-neutral-50"
              >
                <article className="p-5 sm:p-6">
                  <div className="flex min-w-0 items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-900">
                        {customer.name}
                      </p>

                      <p className="mt-1 break-all text-xs text-neutral-500">
                        {customer.email ||
                          "No email available"}
                      </p>
                    </div>

                    <RoleBadge role={customer.role} />
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">
                        Phone
                      </p>

                      <p className="mt-2 truncate text-sm text-neutral-600">
                        {customer.phone || "—"}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">
                        Joined
                      </p>

                      <p className="mt-2 text-sm text-neutral-600">
                        {formatDate(
                          customer.joinedAt,
                        )}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">
                        Orders
                      </p>

                      <p className="mt-2 text-sm text-neutral-600">
                        {customer.orderCount}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">
                        Total Spent
                      </p>

                      <p className="mt-2 truncate text-sm text-neutral-900">
                        {formatPrice(
                          customer.totalSpent,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 text-xs text-neutral-400">
                    View customer →
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* DESKTOP */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50/70">
                <tr>
                  <th className="px-5 py-4 font-normal text-neutral-500">
                    Customer
                  </th>

                  <th className="px-5 py-4 font-normal text-neutral-500">
                    Phone
                  </th>

                  <th className="px-5 py-4 font-normal text-neutral-500">
                    Joined
                  </th>

                  <th className="px-5 py-4 font-normal text-neutral-500">
                    Orders
                  </th>

                  <th className="px-5 py-4 font-normal text-neutral-500">
                    Total Spent
                  </th>

                  <th className="px-5 py-4 font-normal text-neutral-500">
                    Role
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="transition-colors hover:bg-neutral-50"
                  >
                    <td className="px-5 py-5">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="block min-w-0"
                      >
                        <p className="truncate font-medium text-neutral-900">
                          {customer.name}
                        </p>

                        <p className="mt-1 max-w-xs truncate text-xs text-neutral-500">
                          {customer.email ||
                            "No email available"}
                        </p>
                      </Link>
                    </td>

                    <td className="px-5 py-5 text-sm text-neutral-600">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="block"
                      >
                        {customer.phone || "—"}
                      </Link>
                    </td>

                    <td className="px-5 py-5 text-sm text-neutral-600">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="block"
                      >
                        {formatDate(
                          customer.joinedAt,
                        )}
                      </Link>
                    </td>

                    <td className="px-5 py-5 text-sm text-neutral-600">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="block"
                      >
                        {customer.orderCount}
                      </Link>
                    </td>

                    <td className="px-5 py-5 text-sm text-neutral-900">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="block"
                      >
                        {formatPrice(
                          customer.totalSpent,
                        )}
                      </Link>
                    </td>

                    <td className="px-5 py-5">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="block"
                      >
                        <RoleBadge
                          role={customer.role}
                        />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}