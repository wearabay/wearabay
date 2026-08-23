"use client";

import Link from "next/link";

import { useMemo, useState } from "react";

import type { Order } from "@/lib/order";

import { formatPrice } from "@/lib/currency";


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

      return orders.filter(
        (order) => {

          const matchStatus =
            filter === "all" ||
            order.status === filter;


          const matchSearch =
            order.orderNumber
              .toLowerCase()
              .includes(
                search.toLowerCase()
              );


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


      {/* FILTER */}

      <div
        className="
          flex
          flex-col
          gap-4
          md:flex-row
        "
      >

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search order number..."
          className="
            h-11
            rounded-full
            border
            border-stone-300
            px-5
            text-sm
            outline-none
          "
        />


        <select
          value={filter}
          onChange={(e) =>
            setFilter(
              e.target.value as any
            )
          }
          className="
            h-11
            rounded-full
            border
            border-stone-300
            px-5
            text-sm
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




      {/* LIST */}

      <div className="space-y-5">


        {filteredOrders.map(
          (order) => (

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
                  gap-5
                  lg:flex-row
                  lg:items-center
                  lg:justify-between
                "
              >


                <div>

                  <p className="text-xs uppercase tracking-widest text-neutral-500">
                    Order
                  </p>

                  <p className="mt-2 font-medium">
                    {order.orderNumber}
                  </p>


                  <p className="mt-1 text-sm text-neutral-500">
                    {order.status}
                  </p>

                </div>



                <div>

                  <p className="text-xs uppercase tracking-widest text-neutral-500">
                    Total
                  </p>

                  <p className="mt-2">
                    {formatPrice(
                      order.total
                    )}
                  </p>

                </div>



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
                    uppercase
                    tracking-[0.15em]
                  "
                >
                  View
                </Link>


              </div>


            </div>

          )
        )}


      </div>


    </div>

  );

}