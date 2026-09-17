"use client";

import { useEffect } from "react";
import Link from "next/link";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({
  error,
  reset,
}: Props) {
  useEffect(() => {
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-white px-6">
      <div className="w-full max-w-xl text-center">
        <p className="text-[11px] uppercase tracking-[0.35em] text-neutral-500">
          Something went wrong
        </p>

        <h1 className="mt-5 text-4xl font-light tracking-[0.02em] text-neutral-900 md:text-5xl">
          We Couldn&apos;t Complete That
        </h1>

        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-neutral-500">
          An unexpected error occurred. Please try again, or return to the
          homepage.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-6 py-3 text-[11px] uppercase tracking-[0.25em] text-white transition hover:bg-neutral-700"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-6 py-3 text-[11px] uppercase tracking-[0.25em] text-neutral-900 transition hover:border-neutral-900"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}