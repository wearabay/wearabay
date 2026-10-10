"use client";

import Image from "next/image";

import Container from "@/components/ui/Container";

type Props = {
  storeName: string;
};

export default function JournalPageClient({ storeName }: Props) {
  return (
    <main className="bg-[#FAF8F5]">
      <section className="relative isolate min-h-[580px] overflow-hidden bg-[#E9DFD2] md:min-h-[660px] lg:min-h-[720px]">
        <Image
          src="/images/journal/journal-coming-soon.svg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="z-0 object-cover object-center"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#FAF5EE]/95 via-[#FAF5EE]/88 to-[#FAF5EE]/20" />

        <Container>
          <div className="relative z-20 flex min-h-[580px] items-center md:min-h-[660px] lg:min-h-[720px]">
            <div className="max-w-2xl py-20 md:py-28">
              <p className="text-[10px] uppercase tracking-[0.38em] text-neutral-600 md:text-[11px]">
                {storeName} Journal
              </p>

              <h1 className="mt-7 max-w-xl text-4xl font-light leading-[1.12] tracking-[-0.04em] text-neutral-950 sm:text-5xl md:text-6xl lg:text-7xl">
                Stories with intention.
                <span className="mt-2 block font-normal italic text-neutral-600">
                  Coming soon.
                </span>
              </h1>

              <p className="mt-7 max-w-lg text-sm leading-7 text-neutral-700 md:text-base md:leading-8">
                We’re preparing thoughtful stories on modest style,
                craftsmanship, and the little details that make each piece
                meaningful. The Journal will be here soon.
              </p>

              <div className="mt-9 inline-flex items-center gap-3 border-y border-neutral-400/70 py-4">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-800" />
                <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-700 md:text-[10px]">
                  The Journal is on its way
                </p>
              </div>
            </div>
          </div>
        </Container>

        <p className="absolute bottom-6 right-6 z-20 text-[8px] uppercase tracking-[0.3em] text-neutral-700 md:bottom-9 md:right-10 md:text-[9px]">
          A considered point of view
        </p>
      </section>

      <section className="bg-[#F6EFE6]">
        <div className="grid lg:min-h-[620px] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative min-h-[320px] overflow-hidden sm:min-h-[420px] lg:min-h-full">
            <Image
              src="/images/journal/journal-ethos.svg"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="object-cover object-[42%_center]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#8D765D]/15 to-transparent" />
          </div>

          <div className="flex items-center">
            <Container>
              <div className="mx-auto max-w-3xl py-16 sm:py-20 lg:py-24 lg:pl-4">
                <p className="text-[10px] uppercase tracking-[0.38em] text-neutral-600">
                  Our Ethos
                </p>

                <h2 className="mt-6 text-3xl font-light leading-snug tracking-[-0.035em] text-neutral-950 sm:text-4xl md:text-5xl">
                  Modesty, made meaningful.
                </h2>

                <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-700 md:text-base md:leading-8">
                  We believe true elegance is never loud. It lives in thoughtful
                  design, considered details, and pieces made to feel timeless.
                  Through Wearabay, we celebrate a quieter kind of confidence —
                  where comfort, craftsmanship, and modesty meet.
                </p>

                <div className="mt-10 grid gap-7 border-t border-neutral-400/50 pt-7 sm:grid-cols-3 sm:gap-4">
                  <div className="sm:pr-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-800">
                      Timeless Design
                    </p>
                    <p className="mt-3 text-xs leading-6 text-neutral-600 md:text-sm">
                      Pieces designed to transcend trends and remain meaningful.
                    </p>
                  </div>

                  <div className="border-neutral-400/50 sm:border-x sm:px-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-800">
                      Thoughtful Craft
                    </p>
                    <p className="mt-3 text-xs leading-6 text-neutral-600 md:text-sm">
                      Considered materials, careful details, and quality made to last.
                    </p>
                  </div>

                  <div className="sm:pl-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-800">
                      Quiet Confidence
                    </p>
                    <p className="mt-3 text-xs leading-6 text-neutral-600 md:text-sm">
                      Modesty that feels effortless, personal, and assured.
                    </p>
                  </div>
                </div>
              </div>
            </Container>
          </div>
        </div>
      </section>
    </main>
  );
}
