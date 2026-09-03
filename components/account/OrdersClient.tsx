"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  getOrders,
  type Order,
} from "@/lib/order";

import {
  formatPrice,
} from "@/lib/currency";


export default function OrdersClient() {

  const [
    orders,
    setOrders,
  ] =
    useState<Order[]>([]);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState("");


  /* =====================================================
     LOAD ORDERS
  ===================================================== */

  useEffect(() => {

    let mounted = true;


    async function loadOrders() {

      try {

        setLoading(true);
        setError("");


        const data =
          await getOrders();


        if (!mounted) {
          return;
        }


        setOrders(data);

      } catch (error) {

        console.error(
          "Failed to load orders:",
          error
        );


        if (!mounted) {
          return;
        }


        setOrders([]);


        setError(
          "Unable to load your orders. Please try again."
        );

      } finally {

        if (mounted) {

          setLoading(false);

        }

      }

    }


    loadOrders();


    return () => {

      mounted = false;

    };

  }, []);


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

    return (

      <div>

        <div className="mb-12">

          <p
            className="
              text-xs
              uppercase
              tracking-[0.3em]
              text-neutral-500
            "
          >
            Account
          </p>


          <h1
            className="
              mt-3
              text-4xl
              font-light
            "
          >
            My Orders
          </h1>

        </div>


        <div
          className="
            rounded-2xl
            border
            border-stone-200
            p-8
          "
        >

          <p className="text-sm text-neutral-500">
            Loading your orders...
          </p>

        </div>

      </div>

    );

  }


  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {

    return (

      <div>

        <div className="mb-12">

          <p
            className="
              text-xs
              uppercase
              tracking-[0.3em]
              text-neutral-500
            "
          >
            Account
          </p>


          <h1
            className="
              mt-3
              text-4xl
              font-light
            "
          >
            My Orders
          </h1>

        </div>


        <div
          className="
            rounded-2xl
            border
            border-stone-200
            p-8
          "
        >

          <p
            className="
              text-sm
              text-red-600
            "
          >
            {error}
          </p>

        </div>

      </div>

    );

  }


  /* =====================================================
     EMPTY
  ===================================================== */

  if (!orders.length) {

    return (

      <div className="py-20 text-center">

        <p
          className="
            text-xs
            uppercase
            tracking-[0.3em]
            text-neutral-500
          "
        >
          Account
        </p>


        <h1
          className="
            mt-3
            text-3xl
            font-light
          "
        >
          No Orders Yet
        </h1>


        <p
          className="
            mt-4
            text-sm
            text-neutral-500
          "
        >
          Your orders will appear here.
        </p>


        <Link
          href="/shop"
          className="
            mt-8
            inline-flex
            h-12
            items-center
            justify-center
            rounded-full
            bg-neutral-900
            px-8
            text-xs
            font-medium
            uppercase
            tracking-[0.2em]
            text-white
            transition
            hover:bg-black
          "
        >
          Continue Shopping
        </Link>

      </div>

    );

  }


  /* =====================================================
     ORDER LIST
  ===================================================== */

  return (

    <div>

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-12">

        <p
          className="
            text-xs
            uppercase
            tracking-[0.3em]
            text-neutral-500
          "
        >
          Account
        </p>


        <h1
          className="
            mt-3
            text-4xl
            font-light
          "
        >
          My Orders
        </h1>


        <p
          className="
            mt-3
            text-sm
            text-neutral-500
          "
        >
          View and track your orders.
        </p>

      </div>


      {/* =================================================
          ORDERS
      ================================================= */}

      <div className="space-y-6">

        {orders.map(
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
                  gap-6
                  md:flex-row
                  md:items-center
                  md:justify-between
                "
              >

                {/* =========================================
                    ORDER NUMBER
                ========================================= */}

                <div>

                  <p
                    className="
                      text-xs
                      uppercase
                      tracking-widest
                      text-neutral-500
                    "
                  >
                    Order Number
                  </p>


                  <p
                    className="
                      mt-2
                      font-medium
                    "
                  >
                    {order.orderNumber}
                  </p>


                  <p
                    className="
                      mt-2
                      text-xs
                      text-neutral-500
                    "
                  >
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString(
                      "en-ID",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </p>

                </div>


                {/* =========================================
                    ORDER STATUS
                ========================================= */}

                <div>

                  <p
                    className="
                      text-xs
                      uppercase
                      tracking-widest
                      text-neutral-500
                    "
                  >
                    Order Status
                  </p>


                  <p
                    className="
                      mt-2
                      font-medium
                      uppercase
                    "
                  >
                    {order.status}
                  </p>

                </div>


                {/* =========================================
                    PAYMENT STATUS
                ========================================= */}

                <div>

                  <p
                    className="
                      text-xs
                      uppercase
                      tracking-widest
                      text-neutral-500
                    "
                  >
                    Payment
                  </p>


                  <p
                    className="
                      mt-2
                      font-medium
                      uppercase
                    "
                  >
                    {order.paymentStatus}
                  </p>

                </div>


                {/* =========================================
                    TOTAL
                ========================================= */}

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
                      font-medium
                    "
                  >
                    {formatPrice(
                      order.total
                    )}
                  </p>

                </div>


                {/* =========================================
                    VIEW
                ========================================= */}

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
                    font-medium
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

          )
        )}

      </div>

    </div>

  );

}