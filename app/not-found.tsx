import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-white px-6">
      <div className="w-full max-w-xl text-center">
        <p className="text-[11px] uppercase tracking-[0.35em] text-neutral-500">
          404
        </p>

        <h1 className="mt-5 text-4xl font-light tracking-[0.02em] text-neutral-900 md:text-5xl">
          Page Not Found
        </h1>

        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-neutral-500">
          The page you are looking for may have been moved, removed, or is no
          longer available.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-6 py-3 text-[11px] uppercase tracking-[0.25em] text-white transition hover:bg-neutral-700"
          >
            Back to Home
          </Link>

          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-6 py-3 text-[11px] uppercase tracking-[0.25em] text-neutral-900 transition hover:border-neutral-900"
          >
            Shop Collection
          </Link>
        </div>
      </div>
    </main>
  );
}