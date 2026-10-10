"use client";

import Image from "next/image";

import Container from "@/components/ui/Container";

type Props = {
  storeName: string;
};

export default function JournalPageClient({ storeName }: Props) {
  return (
    <main className="bg-[#FAF8F5]">
      <section className="px-6 py-12 md:py-16 lg:py-20">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
            <div className="order-2 text-center lg:order-1 lg:py-12 lg:text-left">
              <p className="text-[10px] uppercase tracking-[0.38em] text-neutral-500 md:text-[11px]">
                {storeName} Journal
              </p>

              <h1 className="mx-auto mt-6 max-w-xl text-4xl font-light leading-[1.15] tracking-[-0.035em] text-neutral-900 md:text-5xl lg:mx-0 lg:text-6xl">
                Stories with intention.
                <span className="mt-1 block text-neutral-500">
                  Coming soon.
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-lg text-sm leading-8 text-neutral-600 md:text-base lg:mx-0">
                We’re preparing thoughtful stories on modest style,
                craftsmanship, and the little details that make each piece
                meaningful.
              </p>

              <div className="mt-9 inline-flex items-center gap-3 border-y border-neutral-300 py-4">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-800" />
                <p className="text-[10px] uppercase tracking-[0.32em] text-neutral-700">
                  The Journal is on its way
                </p>
              </div>
            </div>

            <div className="relative order-1 aspect-[5/4] overflow-hidden bg-[#E9DFD2] lg:order-2 lg:aspect-[4/5]">
              <Image
                src="/images/journal/journal-coming-soon.svg"
                alt="Softly draped neutral fabric and natural textures in a warm editorial setting"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-5 border border-white/50 md:inset-7" />
              <p className="absolute bottom-8 left-8 text-[9px] uppercase tracking-[0.32em] text-neutral-700 md:bottom-10 md:left-10">
                A considered point of view
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-neutral-200 bg-white px-6 py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] uppercase tracking-[0.38em] text-neutral-500">
              Our Ethos
            </p>

            <h2 className="mt-6 text-3xl font-light leading-snug tracking-[-0.025em] text-neutral-900 md:text-4xl">
              Modesty, made meaningful.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-8 text-neutral-600 md:text-base">
              We believe true elegance is never loud. It lives in thoughtful
              design, considered details, and pieces made to feel timeless.
              Through Wearabay, we celebrate a quieter kind of confidence —
              where comfort, craftsmanship, and modesty meet.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[9px] uppercase tracking-[0.28em] text-neutral-500 md:text-[10px]">
              <span>Timeless Design</span>
              <span className="hidden h-1 w-1 rounded-full bg-neutral-400 sm:block" />
              <span>Thoughtful Craft</span>
              <span className="hidden h-1 w-1 rounded-full bg-neutral-400 sm:block" />
              <span>Quiet Confidence</span>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
