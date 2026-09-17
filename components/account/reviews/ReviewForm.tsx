"use client";

import { useState } from "react";

import {
  submitReviewAction,
} from "@/app/account/orders/[id]/actions";


type Props = {
  orderId: string;
  orderItemId: string;
  productId: number;
  variantId: number;
  productName: string;
  onSuccess: () => void;
};


export default function ReviewForm({
  orderId,
  orderItemId,
  productId,
  variantId,
  productName,
  onSuccess,
}: Props) {

  const [rating, setRating] =
    useState(5);

  const [title, setTitle] =
    useState("");

  const [comment, setComment] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);


  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setError("");
    setLoading(true);


    const formData =
      new FormData(
        event.currentTarget
      );


    formData.set(
      "orderId",
      orderId
    );

    formData.set(
      "orderItemId",
      orderItemId
    );

    formData.set(
      "productId",
      String(productId)
    );

    formData.set(
      "variantId",
      String(variantId)
    );

    formData.set(
      "rating",
      String(rating)
    );


    try {

      const result =
        await submitReviewAction(
          formData
        );


      if (!result.success) {

        setError(
          result.message
        );

        return;

      }


      setSuccess(true);

      onSuccess();

    } catch (error) {

      console.error(
        "Review submission failed:",
        error
      );

      setError(
        "Something went wrong. Please try again."
      );

    } finally {

      setLoading(false);

    }

  }


  if (success) {

    return (
      <div className="mt-5 rounded-xl bg-neutral-50 p-5">

        <p className="font-medium">
          Review submitted
        </p>

        <p className="mt-2 text-sm leading-6 text-neutral-600">
          Thank you for your review. It will appear
          after it has been approved.
        </p>

      </div>
    );

  }


  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 space-y-5"
    >

      <div>

        <p className="text-sm font-medium">
          Rating
        </p>


        <div className="mt-3 flex gap-2">

          {[1, 2, 3, 4, 5].map(
            (value) => (

              <button
                key={value}
                type="button"
                onClick={() =>
                  setRating(value)
                }
                aria-label={`Rate ${value} out of 5`}
                className={`
                  text-2xl
                  leading-none
                  transition
                  ${
                    value <= rating
                      ? "text-black"
                      : "text-neutral-300"
                  }
                `}
              >
                ★
              </button>

            )
          )}

        </div>

      </div>


      <div>

        <label
          htmlFor={`review-title-${orderItemId}`}
          className="text-sm font-medium"
        >
          Title
        </label>


        <input
          id={`review-title-${orderItemId}`}
          name="title"
          value={title}
          onChange={(event) =>
            setTitle(
              event.target.value
            )
          }
          maxLength={120}
          placeholder={`How was your ${productName}?`}
          className="
            mt-2
            h-12
            w-full
            rounded-xl
            border
            border-neutral-300
            px-4
            text-sm
            outline-none
            transition
            focus:border-black
          "
        />

      </div>


      <div>

        <label
          htmlFor={`review-comment-${orderItemId}`}
          className="text-sm font-medium"
        >
          Review
        </label>


        <textarea
          id={`review-comment-${orderItemId}`}
          name="comment"
          value={comment}
          onChange={(event) =>
            setComment(
              event.target.value
            )
          }
          maxLength={2000}
          rows={5}
          placeholder="Tell us about your experience..."
          className="
            mt-2
            w-full
            rounded-xl
            border
            border-neutral-300
            px-4
            py-3
            text-sm
            leading-6
            outline-none
            transition
            focus:border-black
          "
        />

      </div>


      {error && (

        <p className="text-sm text-red-600">
          {error}
        </p>

      )}


      <button
        type="submit"
        disabled={loading}
        className="
          inline-flex
          h-12
          items-center
          justify-center
          rounded-full
          bg-black
          px-7
          text-xs
          uppercase
          tracking-[0.2em]
          text-white
          transition
          hover:opacity-80
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >

        {loading
          ? "Submitting..."
          : "Submit Review"}

      </button>

    </form>
  );

}