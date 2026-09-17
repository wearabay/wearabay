"use client";

import { useMemo, useState } from "react";

import type { Review } from "@/types/review";

import ReviewCard from "./ReviewCard";
import ReviewSummary from "./ReviewSummary";
import RatingBreakdown from "./RatingBreakdown";


type Props = {
  productId: number;
  reviews: Review[];
};


export default function ReviewList({
  productId,
  reviews,
}: Props) {

  const [visible, setVisible] =
    useState(3);


  const productReviews =
    useMemo(
      () =>
        reviews.filter(
          (review) =>
            review.productId === productId
        ),
      [
        productId,
        reviews,
      ]
    );


  const average =
    productReviews.length === 0
      ? 0
      : productReviews.reduce(
          (sum, review) =>
            sum + review.rating,
          0
        ) / productReviews.length;


  const ratings =
    productReviews.map(
      (review) =>
        review.rating
    );


  return (
    <section className="mt-24">

      <ReviewSummary
        rating={average}
        total={
          productReviews.length
        }
      />


      <RatingBreakdown
        ratings={ratings}
      />


      <div className="mt-10">

        {productReviews
          .slice(0, visible)
          .map(
            (review) => (
              <ReviewCard
                key={review.id}
                review={review}
              />
            )
          )}

      </div>


      {visible <
        productReviews.length && (

        <button
          type="button"
          onClick={() =>
            setVisible(
              (prev) =>
                prev + 3
            )
          }
          className="mt-10 rounded-full border border-black px-6 py-3 text-xs uppercase tracking-[0.25em] transition hover:bg-black hover:text-white"
        >
          Load More
        </button>

      )}

    </section>
  );
}