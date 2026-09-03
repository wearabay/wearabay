"use client";

import {
  useFormStatus,
} from "react-dom";


export default function RefundPaymentButton() {

  const {
    pending,
  } =
    useFormStatus();


  function handleClick(
    event: React.MouseEvent<HTMLButtonElement>
  ) {

    const confirmed =
      window.confirm(
        "Refund this payment?\n\nThis will change the payment status from Paid to Refunded."
      );


    if (!confirmed) {

      event.preventDefault();

    }

  }


  return (

    <button
      type="submit"
      disabled={pending}
      onClick={handleClick}
      className="
        inline-flex
        h-11
        w-full
        items-center
        justify-center
        rounded-full
        border
        border-stone-300
        bg-white
        px-6
        text-xs
        font-medium
        uppercase
        tracking-[0.15em]
        text-neutral-700
        transition
        hover:border-black
        hover:text-black
        disabled:cursor-not-allowed
        disabled:opacity-50
        sm:w-auto
      "
    >

      {pending
        ? "Refunding..."
        : "Refund Payment"}

    </button>

  );

}