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
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://d2ol7oe51mr4n9.cloudfront.net/user_3ISY4nI4NP5OoHjmvxc4f8TQg6w/4254efa1-3721-4fdc-9c8d-9a84cfa07a5d.jpg)",
          }}
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
      </section>

      <section className="bg-[#F6EFE6]">
        <div className="grid items-stretch lg:min-h-[600px] lg:grid-cols-[45fr_55fr]">
          <div className="relative flex min-h-[320px] items-center overflow-hidden bg-[#F6EFE6] sm:min-h-[420px] lg:min-h-[600px]">
            <Image
              src="https://d2ol7oe51mr4n9.cloudfront.net/user_3ISY4nI4NP5OoHjmvxc4f8TQg6w/b8022032-609e-4d97-ad46-1f028bcdbc07.jpg"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-contain object-left"
            />
            <div
              aria-hidden="true"
              className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-r from-transparent via-[#F6EFE6]/55 to-[#F6EFE6]"
            />
          </div>

          <div className="flex items-center">
            <Container>
              <div className="mx-auto max-w-3xl py-14 sm:py-16 lg:py-20 lg:pl-5">
                <p className="text-[10px] uppercase tracking-[0.38em] text-neutral-600">
                  Our Ethos
                </p>

                <h2 className="mt-5 text-3xl font-light leading-snug tracking-[-0.035em] text-neutral-950 sm:text-4xl md:text-5xl">
                  Modesty, made meaningful.
                </h2>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-neutral-700 md:text-base md:leading-8">
                  We believe true elegance is never loud. It lives in thoughtful
                  design, considered details, and pieces made to feel timeless.
                  Through Wearabay, we celebrate a quieter kind of confidence —
                  where comfort, craftsmanship, and modesty meet.
                </p>

                <div className="mt-8 grid gap-6 border-t border-neutral-400/50 pt-6 sm:grid-cols-3 sm:gap-4">
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
