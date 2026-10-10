import Image from "next/image";
import Link from "next/link";

import Container from "../ui/Container";

export default function JournalSection() {
  return (
    <section className="bg-[#FAF8F5] px-4 py-12 sm:px-6 md:py-16 lg:py-20">
      <Container>
        <div className="relative isolate min-h-[420px] overflow-hidden bg-[#DCCBBB] sm:min-h-[480px] lg:min-h-[540px]">
          <Image
            src="/images/journal/journal-01.jpg"
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 1200px"
            className="z-0 object-cover object-center"
          />

          {/* The original artwork contains branding; the opaque left panel keeps the new copy clean and editable. */}
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#F7EDE1] from-0% via-[#F7EDE1]/98 via-45% via-[#F7EDE1]/92 via-62% to-[#F7EDE1]/5 to-100%" />

          <div className="relative z-20 flex min-h-[420px] items-center sm:min-h-[480px] lg:min-h-[540px]">
            <div className="max-w-2xl px-7 py-14 sm:px-10 md:px-14 md:py-16 lg:px-16">
              <p className="text-[10px] uppercase tracking-[0.34em] text-neutral-700 md:text-[11px]">
                Wearabay Journal
              </p>

              <h2 className="mt-6 max-w-xl text-4xl font-light leading-[1.12] tracking-[-0.04em] text-neutral-950 sm:text-5xl md:text-6xl">
                Stories with intention.
                <span className="mt-2 block font-normal italic text-neutral-600">
                  Coming soon.
                </span>
              </h2>

              <p className="mt-6 max-w-lg text-sm leading-7 text-neutral-700 md:text-base md:leading-8">
                We’re preparing thoughtful stories on modest style,
                craftsmanship, and the details behind our collections.
              </p>

              <Link
                href="/journal"
                className="mt-8 inline-flex items-center gap-3 rounded-full border border-neutral-700/70 px-6 py-3 text-[10px] uppercase tracking-[0.22em] text-neutral-900 transition-colors hover:border-neutral-950 hover:bg-white/30 md:px-7 md:text-[11px]"
              >
                Visit Journal
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
