import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  getAdminUser,
  isSuperAdminRole,
} from "@/lib/admin";
import { getAdminCustomerById } from "@/lib/admin-customers";

import RoleManagement from "./RoleManagement";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(value: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const day = String(
    date.getUTCDate(),
  ).padStart(2, "0");

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

  const month =
    months[date.getUTCMonth()];

  const year =
    date.getUTCFullYear();

  return `${day} ${month} ${year}`;
}

function formatPrice(value: number) {
  const amount = Math.round(
    Number(value) || 0,
  );

  const formatted =
    String(amount).replace(
      /\B(?=(\d{3})+(?!\d))/g,
      ".",
    );

  return `Rp ${formatted}`;
}

function formatStatus(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

function orderStatusClass(
  status: string,
) {
  switch (status) {
    case "delivered":
      return "border-green-200 bg-green-50 text-green-700";

    case "processing":
    case "shipped":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "cancelled":
    case "refunded":
      return "border-stone-200 bg-stone-100 text-neutral-500";

    default:
      return "border-stone-200 bg-stone-50 text-neutral-600";
  }
}

function paymentStatusClass(
  status: string,
) {
  switch (status) {
    case "paid":
      return "border-green-200 bg-green-50 text-green-700";

    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "failed":
    case "refunded":
      return "border-stone-200 bg-stone-100 text-neutral-500";

    default:
      return "border-stone-200 bg-stone-50 text-neutral-600";
  }
}

function roleLabel(
  role: string,
) {
  switch (role) {
    case "super_admin":
      return "Admin Utama";

    case "admin":
      return "Admin 2";

    default:
      return "Customer";
  }
}

export default async function AdminCustomerDetailPage({
  params,
}: Props) {
  const admin =
    await getAdminUser();

  if (!admin) {
    redirect("/account");
  }

  const { id } =
    await params;

  const customer =
    await getAdminCustomerById(id);

  if (!customer) {
    notFound();
  }

  const latestOrder =
    customer.orders[0] ?? null;

  const canManageRole =
    isSuperAdminRole(
      admin.role,
    );

  return (
    <main className="min-w-0 pb-10">
      {/* HEADER */}
      <div className="mb-8">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
          <Link
            href="/admin/customers"
            className="transition hover:text-neutral-900"
          >
            Customers
          </Link>

          <span>/</span>

          <span className="truncate text-neutral-500">
            {customer.name}
          </span>
        </div>

        <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-neutral-400">
              Customer Workspace
            </p>

            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <h1 className="min-w-0 truncate text-2xl font-medium tracking-tight sm:text-3xl">
                {customer.name}
              </h1>

              <span className="inline-flex shrink-0 items-center rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-neutral-600">
                {roleLabel(
                  customer.role,
                )}
              </span>
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
              Customer account and order history.
            </p>
          </div>

          <Link
            href="/admin/customers"
            className="inline-flex h-10 w-fit shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white px-4 text-xs font-medium text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900"
          >
            Back to Customers
          </Link>
        </div>
      </div>

      {/* CUSTOMER INFORMATION */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 lg:p-7">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">
            Customer Information
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            Account information and registration details.
          </p>
        </div>

        <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">
              Name
            </p>

            <p className="mt-2.5 truncate text-sm text-neutral-900">
              {customer.name}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">
              Email
            </p>

            <p className="mt-2.5 break-all text-sm text-neutral-600">
              {customer.email ||
                "No email available"}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">
              Phone
            </p>

            <p className="mt-2.5 truncate text-sm text-neutral-600">
              {customer.phone ||
                "—"}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">
              Joined
            </p>

            <p className="mt-2.5 text-sm text-neutral-600">
              {formatDate(
                customer.joinedAt,
              )}
            </p>
          </div>
        </div>
      </section>

      {/* CUSTOMER SUMMARY */}
      <section className="mt-8">
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">
            Customer Summary
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            Overview of this customer&apos;s purchasing activity.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-xs text-neutral-500">
              Total Orders
            </p>

            <p className="mt-2 text-2xl font-light">
              {customer.orderCount}
            </p>

            <p className="mt-2 text-xs text-neutral-400">
              Orders placed
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-xs text-neutral-500">
              Total Spent
            </p>

            <p className="mt-2 text-2xl font-light">
              {formatPrice(
                customer.totalSpent,
              )}
            </p>

            <p className="mt-2 text-xs text-neutral-400">
              Total order value
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-xs text-neutral-500">
              Last Order
            </p>

            <p className="mt-2 truncate text-sm font-medium text-neutral-900">
              {latestOrder
                ? latestOrder.orderNumber ||
                  "Order"
                : "No orders"}
            </p>

            {latestOrder ? (
              <p className="mt-2 text-xs text-neutral-400">
                {formatDate(
                  latestOrder.createdAt,
                )}
              </p>
            ) : (
              <p className="mt-2 text-xs text-neutral-400">
                No order history
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ROLE MANAGEMENT */}
      <RoleManagement
        customerId={customer.id}
        currentRole={
          customer.role ===
            "super_admin" ||
          customer.role === "admin"
            ? customer.role
            : "customer"
        }
        canManageRole={
          canManageRole
        }
      />

      {/* ORDER HISTORY */}
      <section className="mt-8">
        <div className="mb-5 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">
              Order History
            </p>

            <p className="mt-2 text-sm text-neutral-500">
              {customer.orders.length}{" "}
              {customer.orders.length ===
              1
                ? "order"
                : "orders"}
            </p>
          </div>
        </div>

        {customer.orders.length ===
        0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
            <p className="text-sm text-neutral-500">
              This customer has no orders yet.
            </p>
          </div>
        ) : (
          <div className="min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white">
            {/* MOBILE / TABLET */}
            <div className="divide-y divide-stone-200 lg:hidden">
              {customer.orders.map(
                (order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="block transition-colors hover:bg-neutral-50"
                  >
                    <article className="p-5 sm:p-6">
                      <div className="flex min-w-0 items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-neutral-900">
                            {order.orderNumber ||
                              "Order"}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            {formatDate(
                              order.createdAt,
                            )}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-medium text-neutral-900">
                          {formatPrice(
                            order.total,
                          )}
                        </p>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        <span
                          className={[
                            "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.12em]",
                            orderStatusClass(
                              order.status,
                            ),
                          ].join(" ")}
                        >
                          {formatStatus(
                            order.status,
                          )}
                        </span>

                        <span
                          className={[
                            "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.12em]",
                            paymentStatusClass(
                              order.paymentStatus,
                            ),
                          ].join(" ")}
                        >
                          {formatStatus(
                            order.paymentStatus,
                          )}
                        </span>
                      </div>

                      <p className="mt-5 text-xs text-neutral-400">
                        View order →
                      </p>
                    </article>
                  </Link>
                ),
              )}
            </div>

            {/* DESKTOP */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50/70">
                  <tr>
                    <th className="px-5 py-4 font-normal text-neutral-500">
                      Order
                    </th>

                    <th className="px-5 py-4 font-normal text-neutral-500">
                      Date
                    </th>

                    <th className="px-5 py-4 font-normal text-neutral-500">
                      Status
                    </th>

                    <th className="px-5 py-4 font-normal text-neutral-500">
                      Payment
                    </th>

                    <th className="px-5 py-4 text-right font-normal text-neutral-500">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-100">
                  {customer.orders.map(
                    (order) => (
                      <tr
                        key={order.id}
                        className="transition-colors hover:bg-neutral-50"
                      >
                        <td className="px-5 py-5">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="block font-medium text-neutral-900 hover:underline"
                          >
                            {order.orderNumber ||
                              "Order"}
                          </Link>
                        </td>

                        <td className="px-5 py-5 text-sm text-neutral-600">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="block"
                          >
                            {formatDate(
                              order.createdAt,
                            )}
                          </Link>
                        </td>

                        <td className="px-5 py-5">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="block w-fit"
                          >
                            <span
                              className={[
                                "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.12em]",
                                orderStatusClass(
                                  order.status,
                                ),
                              ].join(" ")}
                            >
                              {formatStatus(
                                order.status,
                              )}
                            </span>
                          </Link>
                        </td>

                        <td className="px-5 py-5">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="block w-fit"
                          >
                            <span
                              className={[
                                "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.12em]",
                                paymentStatusClass(
                                  order.paymentStatus,
                                ),
                              ].join(" ")}
                            >
                              {formatStatus(
                                order.paymentStatus,
                              )}
                            </span>
                          </Link>
                        </td>

                        <td className="px-5 py-5 text-right text-sm text-neutral-900">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="block"
                          >
                            {formatPrice(
                              order.total,
                            )}
                          </Link>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}