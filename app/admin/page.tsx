import Link from "next/link";
import { redirect } from "next/navigation";

import { getAdminUser } from "@/lib/admin";

import {
  getAdminOrderStats,
  getAdminOrders,
  getAdminPaymentReviewOrders,
} from "@/lib/admin-orders";

import { getAdminInventory } from "@/lib/admin-inventory";

import {
  getAdminReviewStats,
  getAdminReviews,
} from "@/lib/admin-reviews";

export default async function AdminPage() {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/account");
  }

  const [
    stats,
    orders,
    paymentReviewOrders,
    inventory,
    reviewStats,
    pendingReviews,
  ] = await Promise.all([
    getAdminOrderStats(),
    getAdminOrders(),
    getAdminPaymentReviewOrders(),
    getAdminInventory(),
    getAdminReviewStats(),
    getAdminReviews("pending"),
  ]);

  const lowStockVariants = inventory.filter(
    (variant) => variant.stock <= 2
  );

  const recentOrders = orders;
  const recentPaymentReviews = paymentReviewOrders.slice(0, 5);
  const recentPendingReviews = pendingReviews.slice(0, 5);

  return (
    <main className="space-y-8 pt-2 lg:pt-18">
      {/* =================================================
          HEADER
      ================================================= */}

      <section className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-light tracking-tight sm:text-4xl">
            Good to see you, {admin.fullName || "Admin"}.
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
            Here is what needs your attention across the Wearabay store.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex w-fit items-center rounded-full border border-stone-300 px-4 py-2.5 text-[11px] uppercase tracking-[0.15em] text-neutral-600 transition hover:border-neutral-900 hover:text-neutral-900"
        >
          View Store
        </Link>
      </section>

      {/* =================================================
          OVERVIEW
      ================================================= */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* ORDERS */}

        <Link
          href="/admin/orders"
          className="group rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-neutral-400 hover:shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
              Orders
            </p>

            <span className="text-xs text-neutral-300 transition group-hover:text-neutral-700">
              →
            </span>
          </div>

          <p className="mt-5 text-3xl font-light tracking-tight">
            {stats.total}
          </p>

          <p className="mt-2 text-xs text-neutral-500">
            Total orders
          </p>
        </Link>

        {/* PAYMENT REVIEW */}

        <Link
          href="/admin/orders"
          className="group rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-neutral-400 hover:shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
              Payment Review
            </p>

            <span className="text-xs text-neutral-300 transition group-hover:text-neutral-700">
              →
            </span>
          </div>

          <p className="mt-5 text-3xl font-light tracking-tight">
            {stats.needPaymentReview}
          </p>

          <p className="mt-2 text-xs text-neutral-500">
            Awaiting verification
          </p>
        </Link>

        {/* PROCESSING */}

        <Link
          href="/admin/orders"
          className="group rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-neutral-400 hover:shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
              Processing
            </p>

            <span className="text-xs text-neutral-300 transition group-hover:text-neutral-700">
              →
            </span>
          </div>

          <p className="mt-5 text-3xl font-light tracking-tight">
            {stats.processing}
          </p>

          <p className="mt-2 text-xs text-neutral-500">
            Orders being prepared
          </p>
        </Link>

        {/* LOW STOCK */}

        <Link
          href="/admin/inventory"
          className="group rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-neutral-400 hover:shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
              Low Stock
            </p>

            <span className="text-xs text-neutral-300 transition group-hover:text-neutral-700">
              →
            </span>
          </div>

          <p className="mt-5 text-3xl font-light tracking-tight">
            {lowStockVariants.length}
          </p>

          <p className="mt-2 text-xs text-neutral-500">
            Variants with stock ≤ 2
          </p>
        </Link>
      </section>

      {/* =================================================
          WORKSPACE
      ================================================= */}

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        {/* TODAY'S WORK */}

        <div className="rounded-2xl border border-stone-200 bg-white">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-5 sm:px-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                Today&apos;s Work
              </p>

              <h2 className="mt-1 text-lg font-light">
                What needs attention
              </h2>
            </div>
          </div>

          <div className="divide-y divide-stone-200">
            {/* PAYMENT */}

            <Link
              href="/admin/orders"
              className="group flex items-center justify-between gap-4 px-5 py-5 transition hover:bg-stone-50 sm:px-6"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-sm">
                  $
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    Payment verification
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    {stats.needPaymentReview === 0
                      ? "No payments waiting for verification."
                      : `${stats.needPaymentReview} payment${
                          stats.needPaymentReview === 1 ? "" : "s"
                        } waiting for verification.`}
                  </p>
                </div>
              </div>

              <span className="shrink-0 text-xs text-neutral-400 transition group-hover:translate-x-1 group-hover:text-neutral-900">
                →
              </span>
            </Link>

            {/* PROCESSING */}

            <Link
              href="/admin/orders"
              className="group flex items-center justify-between gap-4 px-5 py-5 transition hover:bg-stone-50 sm:px-6"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-sm">
                  ○
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    Orders to process
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    {stats.processing === 0
                      ? "No orders are currently processing."
                      : `${stats.processing} order${
                          stats.processing === 1 ? "" : "s"
                        } currently processing.`}
                  </p>
                </div>
              </div>

              <span className="shrink-0 text-xs text-neutral-400 transition group-hover:translate-x-1 group-hover:text-neutral-900">
                →
              </span>
            </Link>

            {/* LOW STOCK */}

            <Link
              href="/admin/inventory"
              className="group flex items-center justify-between gap-4 px-5 py-5 transition hover:bg-stone-50 sm:px-6"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-sm">
                  !
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    Inventory attention
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    {lowStockVariants.length === 0
                      ? "No low-stock variants."
                      : `${lowStockVariants.length} variant${
                          lowStockVariants.length === 1 ? "" : "s"
                        } with stock at or below 2.`}
                  </p>
                </div>
              </div>

              <span className="shrink-0 text-xs text-neutral-400 transition group-hover:translate-x-1 group-hover:text-neutral-900">
                →
              </span>
            </Link>

            {/* REVIEWS */}

            <Link
              href="/admin/reviews"
              className="group flex items-center justify-between gap-4 px-5 py-5 transition hover:bg-stone-50 sm:px-6"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-sm">
                  ★
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    Review moderation
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    {reviewStats.pending === 0
                      ? "No reviews waiting for moderation."
                      : `${reviewStats.pending} review${
                          reviewStats.pending === 1 ? "" : "s"
                        } waiting for moderation.`}
                  </p>
                </div>
              </div>

              <span className="shrink-0 text-xs text-neutral-400 transition group-hover:translate-x-1 group-hover:text-neutral-900">
                →
              </span>
            </Link>
          </div>
        </div>

        {/* QUICK ACTIONS */}

        <div className="rounded-2xl border border-stone-200 bg-neutral-900 p-5 text-white sm:p-6">
          <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">
            Quick Actions
          </p>

          <h2 className="mt-2 text-lg font-light">
            Get things done
          </h2>

          <div className="mt-6 space-y-2">
            <Link
              href="/admin/products"
              className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm transition hover:bg-white hover:text-neutral-900"
            >
              <span>Manage Products</span>
              <span>→</span>
            </Link>

            <Link
              href="/admin/products/new"
              className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm transition hover:bg-white hover:text-neutral-900"
            >
              <span>Add Product</span>
              <span>→</span>
            </Link>

            <Link
              href="/admin/inventory"
              className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm transition hover:bg-white hover:text-neutral-900"
            >
              <span>Manage Inventory</span>
              <span>→</span>
            </Link>

            <Link
              href="/admin/media"
              className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm transition hover:bg-white hover:text-neutral-900"
            >
              <span>Manage Media</span>
              <span>→</span>
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm transition hover:bg-white hover:text-neutral-900"
            >
              <span>View Orders</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =================================================
          RECENT ORDERS
      ================================================= */}

      <section className="rounded-2xl border border-stone-200 bg-white">
        <div className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">
              Orders
            </p>

            <h2 className="mt-1 text-lg font-light">
              Recent Orders
            </h2>
          </div>

          <Link
            href="/admin/orders"
            className="text-[10px] uppercase tracking-[0.15em] text-neutral-500 underline underline-offset-4 transition hover:text-neutral-900"
          >
            View All Orders
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-5 pb-6 sm:px-6">
            <div className="rounded-2xl border border-stone-200 px-5 py-10 text-center">
              <p className="text-sm text-neutral-500">
                No orders yet.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* =================================================
                MOBILE ORDER LIST
            ================================================= */}

            <div className="px-4 pb-4 sm:hidden">
              <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
                <div className="h-[430px] overflow-y-scroll overscroll-contain">
                  <div className="divide-y divide-stone-200">
                    {recentOrders.map((order) => (
                      <Link
                        key={order.id}
                        href={`/admin/orders/${order.id}`}
                        className="block bg-white px-4 py-4 transition active:bg-stone-50"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {order.orderNumber}
                            </p>

                            <p className="mt-1 text-[11px] text-neutral-400">
                              {new Date(
                                order.createdAt
                              ).toLocaleDateString("en-GB")}
                            </p>
                          </div>

                          <span className="shrink-0 text-xs text-neutral-300">
                            →
                          </span>
                        </div>

                        <p className="mt-3 truncate text-xs text-neutral-500">
                          {order.customer.email || "Customer"}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                          <span>
                            {order.status.replaceAll("_", " ")}
                          </span>

                          <span className="text-stone-300">
                            •
                          </span>

                          <span>
                            {order.paymentStatus.replaceAll(
                              "_",
                              " "
                            )}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                TABLET / DESKTOP ORDER TABLE
            ================================================= */}

            <div className="hidden px-4 pb-4 sm:block sm:px-6">
              <div className="overflow-hidden rounded-2xl border border-stone-200">
                <div className="overflow-x-auto">
                  <div className="min-w-[680px]">
                    <div className="grid grid-cols-[1.3fr_1fr_0.8fr_0.8fr] border-b border-stone-100 px-5 py-3 text-[9px] uppercase tracking-[0.2em] text-neutral-400">
                      <span>Order</span>

                      <span>Customer</span>

                      <span>Status</span>

                      <span className="text-right">
                        Payment
                      </span>
                    </div>

                    <div className="h-[390px] overflow-y-scroll overscroll-contain">
                      <div className="divide-y divide-stone-100">
                        {recentOrders.map((order) => (
                          <Link
                            key={order.id}
                            href={`/admin/orders/${order.id}`}
                            className="grid grid-cols-[1.3fr_1fr_0.8fr_0.8fr] items-center px-5 py-4 transition hover:bg-stone-50"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {order.orderNumber}
                              </p>

                              <p className="mt-1 text-[11px] text-neutral-400">
                                {new Date(
                                  order.createdAt
                                ).toLocaleDateString(
                                  "en-GB"
                                )}
                              </p>
                            </div>

                            <p className="truncate pr-4 text-sm text-neutral-600">
                              {order.customer.email ||
                                "Customer"}
                            </p>

                            <p className="text-xs capitalize text-neutral-600">
                              {order.status.replaceAll(
                                "_",
                                " "
                              )}
                            </p>

                            <p className="text-right text-xs capitalize text-neutral-500">
                              {order.paymentStatus.replaceAll(
                                "_",
                                " "
                              )}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* =================================================
          ATTENTION QUEUES
      ================================================= */}

      <section className="grid gap-6 lg:grid-cols-2">
        {/* PAYMENT QUEUE */}

        <div className="rounded-2xl border border-stone-200 bg-white">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-5 sm:px-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                Payment Verification
              </p>

              <h2 className="mt-1 text-lg font-light">
                Waiting for review
              </h2>
            </div>

            <Link
              href="/admin/orders"
              className="text-[10px] uppercase tracking-[0.15em] text-neutral-500 underline underline-offset-4"
            >
              View All
            </Link>
          </div>

          <div className="divide-y divide-stone-100">
            {recentPaymentReviews.length === 0 ? (
              <p className="px-5 py-8 text-sm text-neutral-500 sm:px-6">
                No payment requires review.
              </p>
            ) : (
              recentPaymentReviews.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-stone-50 sm:px-6"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {order.orderNumber}
                    </p>

                    <p className="mt-1 truncate text-xs text-neutral-500">
                      {order.customer.email || "Customer"}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full border border-stone-200 px-3 py-1.5 text-[9px] uppercase tracking-[0.15em] text-neutral-500">
                    Review
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* REVIEWS QUEUE */}

        <div className="rounded-2xl border border-stone-200 bg-white">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-5 sm:px-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                Review Moderation
              </p>

              <h2 className="mt-1 text-lg font-light">
                Waiting for approval
              </h2>
            </div>

            <Link
              href="/admin/reviews"
              className="text-[10px] uppercase tracking-[0.15em] text-neutral-500 underline underline-offset-4"
            >
              View All
            </Link>
          </div>

          <div className="divide-y divide-stone-100">
            {recentPendingReviews.length === 0 ? (
              <p className="px-5 py-8 text-sm text-neutral-500 sm:px-6">
                No reviews require moderation.
              </p>
            ) : (
              recentPendingReviews.map((review) => (
                <Link
                  key={review.id}
                  href="/admin/reviews"
                  className="block px-5 py-4 transition hover:bg-stone-50 sm:px-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {review.productName}
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        {review.customerName} ·{" "}
                        {"★".repeat(review.rating)}
                      </p>

                      {review.title && (
                        <p className="mt-2 truncate text-xs text-neutral-600">
                          {review.title}
                        </p>
                      )}
                    </div>

                    <span className="shrink-0 text-xs text-neutral-300">
                      →
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}