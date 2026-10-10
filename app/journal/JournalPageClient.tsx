"use client";

import Container from "@/components/ui/Container";

type Props = {
  storeName: string;
};

export default function JournalPageClient({ storeName }: Props) {
  return (
    <main className="flex min-h-[65vh] items-center justify-center bg-[#FAF8F5] px-6 py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] uppercase tracking-[0.35em] text-neutral-500">
            {storeName} Journal
          </p>

          <h1 className="mt-6 text-4xl font-light tracking-wide text-neutral-900 md:text-6xl">
            Something thoughtful is coming.
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-sm leading-8 text-neutral-600 md:text-base">
            We’re preparing stories on modest style, craftsmanship, and the
            details behind our collections. The Journal will be here soon.
          </p>

          <p className="mt-10 text-[10px] uppercase tracking-[0.3em] text-neutral-500">
            Coming Soon
          </p>
        </div>
      </Container>
    </main>
  );
}
