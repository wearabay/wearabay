"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
} from "react";

import type { Order } from "@/lib/order";
import { formatPrice } from "@/lib/currency";

import {
  verifyAdminPaymentProofAction,
} from "./[id]/actions";

type Props = {
  orders: Order[];
};

const filters = [
  "all",
  "pending",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
] as const;

type Filter = (typeof filters)[number];

function formatFilterLabel(
  value: Filter
) {
  if (value === "all") {
    return "All Orders";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatStatusLabel(
  value: string
) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function getStatusClassName(
  status: Order["status"]
) {
  switch (status) {
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "paid":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "processing":
      return "border-violet-200 bg-violet-50 text-violet-700";

    case "shipped":
      return "border-indigo-200 bg-indigo-50 text-indigo-700";

    case "delivered":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "completed":
      return "border-green-200 bg-green-50 text-green-700";

    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-stone-200 bg-stone-50 text-neutral-600";
  }
}

function getPaymentClassName(
  paymentStatus: Order["paymentStatus"]
) {
  switch (paymentStatus) {
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "paid":
      return "border-green-200 bg-green-50 text-green-700";

    case "failed":
      return "border-red-200 bg-red-50 text-red-700";

    case "expired":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "refunded":
      return "border-neutral-300 bg-neutral-100 text-neutral-700";

    default:
      return "border-stone-200 bg-stone-50 text-neutral-600";
  }
}

export default function OrdersTable({
  orders,
}: Props) {
  const [filter, setFilter] =
    useState<Filter>("all");

  const [search, setSearch] =
    useState("");

  const filteredOrders =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return orders.filter(
        (order) => {
          const matchStatus =
            filter === "all" ||
            order.status === filter;

          const matchSearch =
            !query ||
            order.orderNumber
              .toLowerCase()
              .includes(query);

          return (
            matchStatus &&
            matchSearch
          );
        }
      );
    }, [
      orders,
      filter,
      search,
    ]);

  return (
    <div className="space-y-5">
      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <section
        className="
          rounded-2xl
          border
          border-stone-200
          bg-white
          p-4
          sm:p-5
        "
      >
        <div
          className="
            flex
            flex-col
            gap-4
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          {/* SEARCH */}

          <div className="relative w-full lg:max-w-md">
            <label
              htmlFor="order-search"
              className="
                sr-only
              "
            >
              Search order number
            </label>

            <input
              id="order-search"
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search order number..."
              className="
                h-11
                w-full
                rounded-xl
                border
                border-stone-200
                bg-stone-50
                px-4
                text-sm
                text-neutral-900
                outline-none
                transition
                placeholder:text-neutral-400
                focus:border-neutral-900
                focus:bg-white
              "
            />
          </div>

          {/* FILTER */}

          <div className="w-full lg:w-auto">
            <label
              htmlFor="order-status-filter"
              className="
                sr-only
              "
            >
              Filter orders by status
            </label>

            <select
              id="order-status-filter"
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value as Filter
                )
              }
              className="
                h-11
                w-full
                rounded-xl
                border
                border-stone-200
                bg-stone-50
                px-4
                text-sm
                text-neutral-700
                outline-none
                transition
                focus:border-neutral-900
                focus:bg-white
                lg:min-w-[190px]
              "
            >
              {filters.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {formatFilterLabel(
                      item
                    )}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* RESULT META */}

        <div
          className="
            mt-4
            flex
            flex-col
            gap-2
            border-t
            border-stone-100
            pt-4
            text-[10px]
            uppercase
            tracking-[0.18em]
            text-neutral-400
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <span>
            Showing{" "}
            <span className="text-neutral-700">
              {filteredOrders.length}
            </span>{" "}
            of{" "}
            <span className="text-neutral-700">
              {orders.length}
            </span>{" "}
            orders
          </span>

          {filter !== "all" && (
            <button
              type="button"
              onClick={() =>
                setFilter("all")
              }
              className="
                w-fit
                text-neutral-500
                underline
                underline-offset-4
                transition
                hover:text-neutral-900
              "
            >
              Clear status filter
            </button>
          )}
        </div>
      </section>

      {/* =====================================================
          EMPTY FILTER RESULT
      ===================================================== */}

      {!filteredOrders.length ? (
        <div
          className="
            rounded-2xl
            border
            border-stone-200
            bg-white
            px-6
            py-12
            text-center
          "
        >
          <p className="text-sm text-neutral-500">
            No orders found.
          </p>

          {(search || filter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
              className="
                mt-4
                text-[10px]
                uppercase
                tracking-[0.18em]
                text-neutral-500
                underline
                underline-offset-4
                transition
                hover:text-neutral-900
              "
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map(
            (order) => {
              const needsPaymentReview =
                order.paymentStatus ===
                  "pending" &&
                Boolean(
                  order.paymentProofPath
                );

              return (
                <article
                  key={order.id}
                  className="
                    rounded-2xl
                    border
                    border-stone-200
                    bg-white
                    transition
                    hover:border-stone-300
                  "
                >
                  <div className="p-4 sm:p-5">
                    <div
                      className="
                        flex
                        flex-col
                        gap-5
                        lg:flex-row
                        lg:items-center
                        lg:justify-between
                      "
                    >
                      {/* =================================================
                          ORDER
                      ================================================= */}

                      <div className="min-w-0 flex-1">
                        <div
                          className="
                            flex
                            flex-wrap
                            items-center
                            gap-x-3
                            gap-y-2
                          "
                        >
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="
                              text-sm
                              font-medium
                              transition
                              hover:underline
                              hover:underline-offset-4
                            "
                          >
                            {order.orderNumber}
                          </Link>

                          <span
                            className="
                              text-[10px]
                              text-neutral-300
                            "
                          >
                            •
                          </span>

                          <span
                            className="
                              text-[10px]
                              uppercase
                              tracking-[0.12em]
                              text-neutral-400
                            "
                          >
                            {new Date(
                              order.createdAt
                            ).toLocaleDateString(
                              "en-GB"
                            )}
                          </span>
                        </div>

                        <p
                          className="
                            mt-2
                            truncate
                            text-xs
                            text-neutral-500
                          "
                        >
                          {order.customer.email ||
                            "Customer"}
                        </p>

                        {/* STATUS */}

                        <div
                          className="
                            mt-3
                            flex
                            flex-wrap
                            gap-2
                          "
                        >
                          <span
                            className={[
                              "rounded-full border px-3 py-1 text-[9px] uppercase tracking-[0.12em]",
                              getStatusClassName(
                                order.status
                              ),
                            ].join(" ")}
                          >
                            {formatStatusLabel(
                              order.status
                            )}
                          </span>

                          <span
                            className={[
                              "rounded-full border px-3 py-1 text-[9px] uppercase tracking-[0.12em]",
                              getPaymentClassName(
                                order.paymentStatus
                              ),
                            ].join(" ")}
                          >
                            Payment:{" "}
                            {formatStatusLabel(
                              order.paymentStatus
                            )}
                          </span>
                        </div>

                        {needsPaymentReview && (
                          <div
                            className="
                              mt-3
                              flex
                              items-center
                              gap-2
                              text-xs
                              font-medium
                              text-amber-700
                            "
                          >
                            <span
                              className="
                                h-1.5
                                w-1.5
                                rounded-full
                                bg-amber-500
                              "
                            />

                            <span>
                              Payment proof
                              awaiting review
                            </span>
                          </div>
                        )}
                      </div>

                      {/* =================================================
                          TOTAL
                      ================================================= */}

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-6
                          border-t
                          border-stone-100
                          pt-4
                          sm:justify-start
                          sm:border-t-0
                          sm:pt-0
                          lg:min-w-[150px]
                          lg:flex-col
                          lg:items-end
                          lg:gap-1
                        "
                      >
                        <p
                          className="
                            text-[9px]
                            uppercase
                            tracking-[0.18em]
                            text-neutral-400
                          "
                        >
                          Total
                        </p>

                        <p
                          className="
                            text-base
                            font-medium
                            tracking-tight
                          "
                        >
                          {formatPrice(
                            order.total
                          )}
                        </p>
                      </div>

                      {/* =================================================
                          ACTIONS
                      ================================================= */}

                      <div
                        className="
                          flex
                          flex-col
                          gap-2
                          border-t
                          border-stone-100
                          pt-4
                          sm:flex-row
                          sm:border-t-0
                          sm:pt-0
                          lg:min-w-[220px]
                          lg:justify-end
                        "
                      >
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="
                            inline-flex
                            h-10
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-stone-300
                            px-5
                            text-[10px]
                            font-medium
                            uppercase
                            tracking-[0.15em]
                            transition
                            hover:border-neutral-900
                            hover:bg-neutral-900
                            hover:text-white
                          "
                        >
                          View Order
                        </Link>

                        {needsPaymentReview && (
                          <form
                            action={
                              verifyAdminPaymentProofAction
                            }
                          >
                            <input
                              type="hidden"
                              name="orderId"
                              value={
                                order.id
                              }
                            />

                            <button
                              type="submit"
                              className="
                                inline-flex
                                h-10
                                w-full
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
                                sm:w-auto
                              "
                            >
                              Verify Payment
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}