"use client";

import { useFormStatus } from "react-dom";

export default function VerifyPaymentButton() {

  const {
    pending,
  } = useFormStatus();


  return (

    <button
      type="submit"
      disabled={pending}
      className="
        inline-flex
        h-11
        w-full
        items-center
        justify-center
        rounded-full
        bg-black
        px-6
        text-xs
        font-medium
        uppercase
        tracking-[0.15em]
        text-white
        transition
        hover:bg-neutral-800
        disabled:cursor-not-allowed
        disabled:opacity-50
        sm:w-auto
      "
    >

      {pending
        ? "Verifying..."
        : "Verify Payment"}

    </button>

  );

}