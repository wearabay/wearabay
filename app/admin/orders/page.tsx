import OrdersTable from "./OrdersTable";
import { redirect } from "next/navigation";

import Container from "@/components/ui/Container";

import { getAdminUser } from "@/lib/admin";
import {
  getAdminOrders,
  getAdminOrderStats,
} from "@/lib/admin-orders";



export default async function AdminOrdersPage() {

  const admin = await getAdminUser();


  if (!admin) {
    redirect("/account");
  }


  const orders =
    await getAdminOrders();

  const stats =
  await getAdminOrderStats();


  return (
    <main>

      <Container className="py-24">

        <div className="space-y-10">


          {/* Header */}

          <div>

            <p
              className="
                text-xs
                uppercase
                tracking-[0.3em]
                text-neutral-500
              "
            >
              Administration
            </p>


            <h1
              className="
                mt-3
                text-4xl
                font-light
              "
            >
              Orders
            </h1>


            <p className="mt-3 text-sm text-neutral-500">
              Manage customer orders and payment status.
            </p>

          </div>


          {/* SUMMARY */}

<div
  className="
    grid
    gap-5
    sm:grid-cols-2
    lg:grid-cols-3
  "
>

  <div
    className="
      rounded-2xl
      border
      border-stone-200
      p-6
    "
  >
    <p className="text-xs uppercase tracking-widest text-neutral-500">
      Total Orders
    </p>

    <p className="mt-3 text-3xl font-light">
      {stats?.total ?? 0}
    </p>

  </div>



  <div
    className="
      rounded-2xl
      border
      border-stone-200
      p-6
    "
  >
    <p className="text-xs uppercase tracking-widest text-neutral-500">
      Payment Review
    </p>

    <p className="mt-3 text-3xl font-light">
      {stats?.needPaymentReview ?? 0}
    </p>
  </div>



  <div
    className="
      rounded-2xl
      border
      border-stone-200
      p-6
    "
  >
    <p className="text-xs uppercase tracking-widest text-neutral-500">
      Paid
    </p>

    <p className="mt-3 text-3xl font-light">
      {stats?.paid ?? 0}
    </p>
  </div>



  <div
    className="
      rounded-2xl
      border
      border-stone-200
      p-6
    "
  >
    <p className="text-xs uppercase tracking-widest text-neutral-500">
      Processing
    </p>

    <p className="mt-3 text-3xl font-light">
      {stats?.processing ?? 0}
    </p>
  </div>



  <div
    className="
      rounded-2xl
      border
      border-stone-200
      p-6
    "
  >
    <p className="text-xs uppercase tracking-widest text-neutral-500">
      Shipped
    </p>

    <p className="mt-3 text-3xl font-light">
      {stats?.shipped ?? 0}
    </p>
  </div>



  <div
    className="
      rounded-2xl
      border
      border-stone-200
      p-6
    "
  >
    <p className="text-xs uppercase tracking-widest text-neutral-500">
      Completed
    </p>

    <p className="mt-3 text-3xl font-light">
      {stats?.completed ?? 0}
    </p>
  </div>


</div>



          {/* Orders */}

          {!orders.length ? (

            <div
              className="
                rounded-2xl
                border
                border-stone-200
                p-8
              "
            >

              <p className="text-neutral-500">
                No orders yet.
              </p>

            </div>

          ) : (

              <OrdersTable orders={orders} />

          )}

        </div>

      </Container>

    </main>
  );
}