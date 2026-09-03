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


export default function OrdersTable({
  orders,
}: Props) {

  const [filter, setFilter] =
    useState<
      typeof filters[number]
    >("all");


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

    <div className="space-y-6">


      {/* =====================================================
          FILTER
      ===================================================== */}

      <div
        className="
          flex
          flex-col
          gap-4
          md:flex-row
        "
      >

        <input
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
            rounded-full
            border
            border-stone-300
            px-5
            text-sm
            outline-none
            transition
            focus:border-black
            md:max-w-sm
          "
        />


        <select
          value={filter}
          onChange={(event) =>
            setFilter(
              event.target.value as
                typeof filters[number]
            )
          }
          className="
            h-11
            rounded-full
            border
            border-stone-300
            bg-white
            px-5
            text-sm
            outline-none
            focus:border-black
          "
        >

          {filters.map(
            (item) => (

              <option
                key={item}
                value={item}
              >
                {item}
              </option>

            )
          )}

        </select>

      </div>


      {/* =====================================================
          RESULT COUNT
      ===================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          text-xs
          uppercase
          tracking-widest
          text-neutral-500
        "
      >

        <span>
          {filteredOrders.length}{" "}
          {filteredOrders.length === 1
            ? "order"
            : "orders"}
        </span>

      </div>


      {/* =====================================================
          LIST
      ===================================================== */}

      <div className="space-y-5">

        {!filteredOrders.length ? (

          <div
            className="
              rounded-2xl
              border
              border-stone-200
              p-8
            "
          >

            <p className="text-sm text-neutral-500">
              No orders found.
            </p>

          </div>

        ) : (

          filteredOrders.map(
            (order) => {

              const needsPaymentReview =
                order.paymentStatus === "pending" &&
                Boolean(
                  order.paymentProofPath
                );


              return (

                <div
                  key={order.id}
                  className="
                    rounded-2xl
                    border
                    border-stone-200
                    p-6
                  "
                >

                  <div
                    className="
                      flex
                      flex-col
                      gap-6
                      lg:flex-row
                      lg:items-center
                      lg:justify-between
                    "
                  >

                    {/* =================================================
                        ORDER INFORMATION
                    ================================================= */}

                    <div>

                      <p
                        className="
                          text-xs
                          uppercase
                          tracking-widest
                          text-neutral-500
                        "
                      >
                        Order
                      </p>


                      <p
                        className="
                          mt-2
                          font-medium
                        "
                      >
                        {order.orderNumber}
                      </p>


                      <div
                        className="
                          mt-2
                          flex
                          flex-wrap
                          gap-2
                        "
                      >

                        <span
                          className="
                            rounded-full
                            border
                            border-stone-300
                            px-3
                            py-1
                            text-xs
                            uppercase
                            tracking-wider
                          "
                        >
                          {order.status}
                        </span>


                        <span
                          className="
                            rounded-full
                            border
                            border-stone-300
                            px-3
                            py-1
                            text-xs
                            uppercase
                            tracking-wider
                          "
                        >
                          Payment:{" "}
                          {order.paymentStatus}
                        </span>

                      </div>


                      {needsPaymentReview && (

                        <p
                          className="
                            mt-3
                            text-sm
                            font-medium
                            text-amber-700
                          "
                        >
                          Payment proof awaiting review
                        </p>

                      )}

                    </div>


                    {/* =================================================
                        TOTAL
                    ================================================= */}

                    <div>

                      <p
                        className="
                          text-xs
                          uppercase
                          tracking-widest
                          text-neutral-500
                        "
                      >
                        Total
                      </p>


                      <p
                        className="
                          mt-2
                          text-lg
                          font-medium
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
                        gap-3
                        sm:flex-row
                      "
                    >

                      {/* VIEW */}

                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="
                          rounded-full
                          border
                          border-black
                          px-6
                          py-3
                          text-center
                          text-xs
                          font-medium
                          uppercase
                          tracking-[0.15em]
                          transition
                          hover:bg-black
                          hover:text-white
                        "
                      >
                        View
                      </Link>


                      {/* VERIFY PAYMENT */}

                      {needsPaymentReview && (

                        <form
                          action={
                            verifyAdminPaymentProofAction
                          }
                        >

                          <input
                            type="hidden"
                            name="orderId"
                            value={order.id}
                          />


                          <button
                            type="submit"
                            className="
                              w-full
                              rounded-full
                              bg-neutral-900
                              px-6
                              py-3
                              text-xs
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

              );

            }
          )

        )}

      </div>

    </div>

  );

}