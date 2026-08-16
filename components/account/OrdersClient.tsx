"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getOrders,
  type Order,
} from "@/lib/order";

import { formatPrice } from "@/lib/currency";


export default function OrdersClient() {

  const [orders, setOrders] =
    useState<Order[]>([]);


useEffect(() => {
  let mounted = true;

  async function loadOrders() {
    try {
      const data = await getOrders();

      if (mounted) {
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to load orders:", error);

      if (mounted) {
        setOrders([]);
      }
    }
  }

  loadOrders();

  return () => {
    mounted = false;
  };
}, []);



  if (!orders.length) {

    return (

      <div className="py-20 text-center">

        <h1 className="text-3xl font-light">
          No Orders Yet
        </h1>


        <p className="
          mt-4
          text-sm
          text-neutral-500
        ">
          Your orders will appear here.
        </p>

      </div>

    );

  }



  return (

    <div>

      <div className="mb-12">

        <p className="
          text-xs
          uppercase
          tracking-[0.3em]
          text-neutral-500
        ">
          Account
        </p>


        <h1 className="
          mt-3
          text-4xl
          font-light
        ">
          My Orders
        </h1>

      </div>



      <div className="space-y-6">


        {orders.map((order)=>(

          <div
            key={order.id}
            className="
              rounded-2xl
              border
              border-stone-200
              p-6
            "
          >

            <div className="
              flex
              flex-col
              gap-5
              md:flex-row
              md:items-center
              md:justify-between
            ">


              <div>

                <p className="
                  text-xs
                  uppercase
                  tracking-widest
                  text-neutral-500
                ">
                  Order Number
                </p>


<p className="mt-2 font-medium">
  {order.orderNumber}
</p>


              </div>



              <div>

                <p className="
                  text-xs
                  uppercase
                  tracking-widest
                  text-neutral-500
                ">
                  Status
                </p>


                <p className="
                  mt-2
                  font-medium
                  uppercase
                ">
                  {order.status}
                </p>

              </div>




              <div>

                <p className="
                  text-xs
                  uppercase
                  tracking-widest
                  text-neutral-500
                ">
                  Total
                </p>


                <p className="mt-2 font-medium">
                  {formatPrice(
                    order.subtotal
                  )}
                </p>


              </div>



              <Link
                href={`/account/orders/${order.id}`}
                className="
                  inline-flex
                  h-12
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-black
                  px-8
                  text-xs
                  uppercase
                  tracking-[0.2em]
                  transition
                  hover:bg-black
                  hover:text-white
                "
              >
                View Detail
              </Link>


            </div>


          </div>

        ))}


      </div>


    </div>

  );
}