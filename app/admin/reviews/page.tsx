import { redirect } from "next/navigation";

import { getAdminUser } from "@/lib/admin";
import { getAdminReviews } from "@/lib/admin-reviews";

import ReviewsTable from "./ReviewsTable";

export default async function AdminReviewsPage() {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/account");
  }

  const reviews = await getAdminReviews();

  const pendingCount = reviews.filter(
    (review) => review.status === "pending",
  ).length;

  const approvedCount = reviews.filter(
    (review) => review.status === "approved",
  ).length;

  const rejectedCount = reviews.filter(
    (review) => review.status === "rejected",
  ).length;

  return (
    <main className="min-w-0 space-y-8 pt-2 lg:pt-8">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">
          Workspace
        </p>

        <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-light tracking-tight sm:text-4xl">
              Reviews
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
              Review and moderate customer feedback.
            </p>
          </div>
        </div>
      </div>

      <section
        aria-label="Review overview"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            Total Reviews
          </p>
          <p className="mt-3 text-2xl font-light">{reviews.length}</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            Pending
          </p>
          <p className="mt-3 text-2xl font-light">{pendingCount}</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            Approved
          </p>
          <p className="mt-3 text-2xl font-light">{approvedCount}</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            Rejected
          </p>
          <p className="mt-3 text-2xl font-light">{rejectedCount}</p>
        </div>
      </section>

      <section className="min-w-0">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">
              Review Queue
            </p>

            <p className="mt-2 text-sm text-neutral-500">
              {reviews.length}{" "}
              {reviews.length === 1 ? "review" : "reviews"} in the workspace.
            </p>
          </div>
        </div>

        <ReviewsTable reviews={reviews} />
      </section>
    </main>
  );
}