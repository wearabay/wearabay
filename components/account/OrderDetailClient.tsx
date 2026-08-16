"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getOrderById,
  type Order,
} from "@/lib/order";

import { formatPrice } from "@/lib/currency";


type Props = {
  orderId: string;
};


const steps = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "completed",
];


export default function OrderDetailClient({
  orderId,
}: Props) {


  const [order, setOrder] =
  useState<Order | null>(null);

const [loading, setLoading] =
  useState(true);


  useEffect(() => {
  let mounted = true;

  async function loadOrder() {
    try {
      const data =
        await getOrderById(orderId);

      if (mounted) {
        setOrder(data ?? null);
      }
    } catch (error) {
      console.error(
        "Failed to load order:",
        error
      );

      if (mounted) {
        setOrder(null);
      }
    }
  }

  loadOrder();

  return () => {
    mounted = false;
  };
}, [orderId]);


if (loading) {

  return (
    <div className="py-24 text-center text-neutral-500">
      Loading order...
    </div>
  );

}
  
if (!order) {

    return (
      <div className="py-24">

        <h1 className="text-3xl font-light">
          Order Not Found
        </h1>

      </div>
    );

  }

  const currentIndex =
    steps.indexOf(order.status);

  return (

    <div className="space-y-10">


      {/* Header */}

      <div>

        <p className="
          text-xs
          uppercase
          tracking-[0.3em]
          text-neutral-500
        ">
          Order Detail
        </p>


<h1 className="
  mt-3
  text-4xl
  font-light
">
  {order.orderNumber}
</h1>


      </div>




      {/* Timeline */}

      <section
        className="
          rounded-2xl
          border
          border-stone-200
          p-6
        "
      >

        <h2 className="mb-6 font-medium">
          Order Status
        </h2>


        <div className="space-y-4">


          {steps.map((step,index)=>(

            <div
              key={step}
              className="
                flex
                items-center
                gap-4
              "
            >

              <div
                className={`
                  h-3
                  w-3
                  rounded-full

                  ${
                    index <= currentIndex
                    ? "bg-black"
                    : "bg-neutral-300"
                  }
                `}
              />


              <span
                className={`
                  text-sm
                  capitalize

                  ${
                    index <= currentIndex
                    ? "font-medium"
                    : "text-neutral-400"
                  }
                `}
              >
                {step}
              </span>


            </div>

          ))}


        </div>


      </section>





      {/* Product */}

      <section
        className="
          rounded-2xl
          border
          border-stone-200
          p-6
        "
      >

        <h2 className="mb-6 font-medium">
          Items
        </h2>



        <div className="space-y-6">


          {order.items.map((item)=>(

            <div
              key={`${item.id}-${item.size}`}
              className="
                flex
                gap-5
              "
            >

              <div
                className="
                  relative
                  h-24
                  w-20
                  overflow-hidden
                  rounded-xl
                  bg-stone-100
                "
              >

                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />

              </div>



              <div className="flex-1">

                <p className="font-medium">
                  {item.name}
                </p>


                <p className="
                  mt-1
                  text-sm
                  text-neutral-500
                ">
                  {item.color}
                  {item.color && item.size
                    ? " • "
                    : ""}
                  {item.size}
                </p>


                <p className="
                  mt-2
                  text-sm
                ">
                  Qty: {item.quantity}
                </p>


              </div>



              <p className="font-medium">

                {formatPrice(
                  item.price *
                  item.quantity
                )}

              </p>


            </div>


          ))}


        </div>


      </section>






      {/* Shipping */}


      <section
        className="
          rounded-2xl
          border
          border-stone-200
          p-6
        "
      >

        <h2 className="mb-5 font-medium">
          Shipping Address
        </h2>


        <div className="
          text-sm
          leading-7
          text-neutral-600
        ">

          <p className="font-medium text-black">
            {order.address.firstName}
            {" "}
            {order.address.lastName}
          </p>


          <p>
            {order.address.street}
          </p>


          <p>
            {order.address.city},
            {" "}
            {order.address.province}
          </p>


          <p>
            {order.address.postalCode}
          </p>


          <p>
            {order.address.country}
          </p>


        </div>


      </section>





      {/* Summary */}


      <section
        className="
          rounded-2xl
          border
          border-stone-200
          p-6
        "
      >

        <div className="
          flex
          justify-between
        ">

          <span>
            Payment
          </span>


          <span>
            {order.payment}
          </span>


        </div>



        <div className="
          mt-4
          flex
          justify-between
          text-lg
          font-medium
        ">

          <span>
            Total
          </span>


          <span>
            {formatPrice(order.total)}
          </span>


        </div>


      </section>



      {order.status === "pending" && (

        <Link
          href={`/checkout/payment?order=${order.id}`}
          className="
            inline-flex
            h-14
            w-full
            items-center
            justify-center
            rounded-full
            bg-black
            text-xs
            uppercase
            tracking-[0.25em]
            text-white
          "
        >
          Continue Payment
        </Link>

      )}


    </div>

  );
}