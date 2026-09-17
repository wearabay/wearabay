"use client";

import { useState } from "react";

import {
  updateReviewStatusAction,
} from "./actions";

import type {
  AdminReview,
} from "@/lib/admin-reviews";


type Props = {
  reviews: AdminReview[];
};


function formatDate(
  value: string
) {

  return new Date(
    value
  ).toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );

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


  return (
    <span
      className={`
        inline-flex
        rounded-full
        px-3
        py-1
        text-[10px]
        uppercase
        tracking-[0.15em]
        ${
          status === "pending"
            ? "bg-neutral-100 text-neutral-700"
            : status === "approved"
              ? "bg-black text-white"
              : "bg-neutral-200 text-neutral-500"
        }
      `}
    >
      {label}
    </span>
  );

}


export default function ReviewsTable({
  reviews,
}: Props) {

  const [items, setItems] =
    useState(reviews);

  const [loadingId, setLoadingId] =
    useState<number | null>(null);


  async function updateStatus(
    reviewId: number,
    status: "approved" | "rejected"
  ) {

    setLoadingId(
      reviewId
    );


    const result =
      await updateReviewStatusAction(
        reviewId,
        status
      );


    if (!result.success) {

      window.alert(
        result.message
      );

      setLoadingId(
        null
      );

      return;

    }


    setItems(
      (current) =>
        current.map(
          (review) =>
            review.id === reviewId
              ? {
                  ...review,
                  status,
                }
              : review
        )
    );


    setLoadingId(
      null
    );

  }


  if (
    items.length === 0
  ) {

    return (

      <div
        className="
          rounded-2xl
          border
          border-stone-200
          p-10
          text-center
        "
      >

        <p className="text-sm text-neutral-500">
          No reviews found.
        </p>

      </div>

    );

  }


  return (

    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-stone-200
      "
    >

      <div
        className="
          divide-y
          divide-stone-200
        "
      >

        {items.map(
          (review) => (

            <article
              key={review.id}
              className="
                p-6
              "
            >

              <div
                className="
                  flex
                  flex-col
                  gap-5
                  lg:flex-row
                  lg:items-start
                  lg:justify-between
                "
              >

                <div className="min-w-0 flex-1">

                  <div
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-3
                    "
                  >

                    <p
                      className="
                        text-sm
                        font-medium
                      "
                    >
                      {review.productName}
                    </p>

                    <StatusBadge
                      status={
                        review.status
                      }
                    />

                  </div>


                  <div
                    className="
                      mt-3
                      flex
                      items-center
                      gap-1
                      text-sm
                    "
                    aria-label={`${review.rating} out of 5 stars`}
                  >

                    {[
                      1,
                      2,
                      3,
                      4,
                      5,
                    ].map(
                      (star) => (

                        <span
                          key={star}
                          className={
                            star <=
                            review.rating
                              ? "text-black"
                              : "text-neutral-300"
                          }
                        >
                          ★
                        </span>

                      )
                    )}

                  </div>


                  {review.title && (

                    <h2
                      className="
                        mt-4
                        text-lg
                        font-medium
                      "
                    >
                      {review.title}
                    </h2>

                  )}


                  {review.comment && (

                    <p
                      className="
                        mt-3
                        max-w-3xl
                        text-sm
                        leading-7
                        text-neutral-600
                      "
                    >
                      {review.comment}
                    </p>

                  )}


                  <div
                    className="
                      mt-5
                      flex
                      flex-col
                      gap-1
                      text-xs
                      text-neutral-500
                    "
                  >

                    <span>
                      {review.customerName}
                      {review.customerEmail
                        ? ` • ${review.customerEmail}`
                        : ""}
                    </span>

                    <span>
                      Order {review.orderNumber}
                    </span>

                    <span>
                      {formatDate(
                        review.createdAt
                      )}
                    </span>

                  </div>

                </div>


                <div
                  className="
                    flex
                    shrink-0
                    flex-wrap
                    gap-2
                  "
                >

                  {/* PENDING → APPROVE */}

                  {review.status !==
                    "approved" && (

                    <button
                      type="button"
                      disabled={
                        loadingId ===
                        review.id
                      }
                      onClick={() =>
                        updateStatus(
                          review.id,
                          "approved"
                        )
                      }
                      className="
                        rounded-full
                        bg-black
                        px-5
                        py-2.5
                        text-[10px]
                        uppercase
                        tracking-[0.15em]
                        text-white
                        transition
                        hover:bg-stone-800
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      {loadingId ===
                      review.id
                        ? "Updating..."
                        : "Approve"}
                    </button>

                  )}


                  {/* PENDING → REJECT */}

                  {review.status ===
                    "pending" && (

                    <button
                      type="button"
                      disabled={
                        loadingId ===
                        review.id
                      }
                      onClick={() =>
                        updateStatus(
                          review.id,
                          "rejected"
                        )
                      }
                      className="
                        rounded-full
                        border
                        border-stone-300
                        px-5
                        py-2.5
                        text-[10px]
                        uppercase
                        tracking-[0.15em]
                        transition
                        hover:border-black
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      Reject
                    </button>

                  )}

                </div>

              </div>

            </article>

          )
        )}

      </div>

    </div>

  );

}