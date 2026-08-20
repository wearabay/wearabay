"use client";

import { CreditCard } from "lucide-react";
import { useCheckout } from "@/context/CheckoutContext";

const paymentOptions = [
  {
    id: "bank",
    title: "Bank Transfer",
    description: "BCA • Mandiri",
  },
];

export default function PaymentMethod() {
  const {
    payment,
    setPayment,
  } = useCheckout();

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6">

      <div className="mb-6 flex items-center gap-2">
        <CreditCard className="h-5 w-5" />

        <h2 className="text-lg font-medium">
          Payment Method
        </h2>
      </div>

      <div className="space-y-4">

        {paymentOptions.map((option) => (
          <label
            key={option.id}
            className={`
              flex
              cursor-pointer
              items-center
              justify-between
              rounded-xl
              border
              p-4
              transition-all
              ${
                payment === option.id
                  ? "border-black bg-stone-50"
                  : "border-stone-200 hover:border-stone-400"
              }
            `}
          >
            <div className="flex items-start gap-4">

              <input
                type="radio"
                name="payment"
                value={option.id}
                checked={payment === option.id}
                onChange={() => setPayment(option.id)}
                className="mt-1"
              />

              <div>

                <p className="font-medium">
                  {option.title}
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  {option.description}
                </p>

              </div>

            </div>

          </label>
        ))}

      </div>

    </section>
  );
}