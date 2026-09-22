"use client";

import { useState } from "react";

import type { AdminReview } from "@/lib/admin-reviews";

import { updateReviewStatusAction } from "./actions";

type Props = {
  reviews: AdminReview[];
};

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

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

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  return `${day} ${month} ${year}`;
}

function StatusBadge({
  status,
}: {
  status: AdminReview["status"];
}) {
  const label =
    status === "pending"
      ? "Pending"
      : status === "approved"
        ? "Approved"
        : "Rejected";

  const className =
    status === "pending"
      ? "border-stone-200 bg-stone-100 text-neutral-700"
      : status === "approved"
        ? "border-neutral-900 bg-neutral-900 text-white"
        : "border-stone-200 bg-stone-100 text-neutral-500";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-3 py-1",
        "text-[10px] uppercase tracking-[0.15em]",
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}

function Rating({
  rating,
}: {
  rating: number;
}) {
  return (
    <div
      className="flex items-center gap-1"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          aria-hidden="true"
          className={
            star <= rating ? "text-neutral-900" : "text-neutral-300"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
}

function ActionButton({
  children,
  disabled,
  onClick,
  variant,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
  variant: "primary" | "secondary";
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "min-h-10 rounded-full px-5 py-2.5",
        "text-[10px] uppercase tracking-[0.15em]",
        "transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary"
          ? "bg-neutral-900 text-white hover:bg-stone-800"
          : "border border-stone-300 bg-white text-neutral-900 hover:border-neutral-900",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function ReviewsTable({ reviews }: Props) {
  const [items, setItems] = useState(reviews);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function updateStatus(
    reviewId: number,
    status: "approved" | "rejected",
  ) {
    setLoadingId(reviewId);

    const result = await updateReviewStatusAction(reviewId, status);

    if (!result.success) {
      window.alert(result.message);
      setLoadingId(null);
      return;
    }

    setItems((current) =>
      current.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              status,
            }
          : review,
      ),
    );

    setLoadingId(null);
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center sm:p-14">
        <p className="text-sm text-neutral-500">No reviews found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <div className="divide-y divide-stone-200">
        {items.map((review) => {
          const isLoading = loadingId === review.id;

          return (
            <article
              key={review.id}
              className="p-5 sm:p-6 lg:p-7"
            >
              <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                    <p className="min-w-0 break-words text-sm font-medium text-neutral-900">
                      {review.productName}
                    </p>

                    <StatusBadge status={review.status} />
                  </div>

                  <div className="mt-3">
                    <Rating rating={review.rating} />
                  </div>

                  {review.title && (
                    <h2 className="mt-4 break-words text-base font-medium text-neutral-900 sm:text-lg">
                      {review.title}
                    </h2>
                  )}

                  {review.comment && (
                    <p className="mt-3 max-w-3xl break-words text-sm leading-7 text-neutral-600">
                      {review.comment}
                    </p>
                  )}

                  <div className="mt-5 grid gap-1 text-xs leading-5 text-neutral-500 sm:grid-cols-2 sm:gap-x-6">
                    <span className="min-w-0 break-words">
                      {review.customerName}
                      {review.customerEmail
                        ? ` • ${review.customerEmail}`
                        : ""}
                    </span>

                    <span className="min-w-0 break-words">
                      Order {review.orderNumber}
                    </span>

                    <span>{formatDate(review.createdAt)}</span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:w-auto lg:flex-col">
                  {review.status !== "approved" && (
                    <ActionButton
                      disabled={isLoading}
                      onClick={() =>
                        updateStatus(review.id, "approved")
                      }
                      variant="primary"
                    >
                      {isLoading ? "Updating..." : "Approve"}
                    </ActionButton>
                  )}

                  {review.status === "pending" && (
                    <ActionButton
                      disabled={isLoading}
                      onClick={() =>
                        updateStatus(review.id, "rejected")
                      }
                      variant="secondary"
                    >
                      Reject
                    </ActionButton>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}