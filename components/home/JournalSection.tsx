import Image from "next/image";
import Link from "next/link";

import Container from "../ui/Container";
import SectionTitle from "../ui/SectionTitle";

export default function JournalSection() {
  return (
    <section className="bg-[#FAF8F5] py-20 lg:py-28">
      <Container>
        <SectionTitle
          eyebrow="Journal"
          title="Stories Behind The Collection"
          description="We’re preparing thoughtful stories on modest style, craftsmanship, and the details behind our collections."
        />

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[16/10] overflow-hidden bg-[#E9DFD2]">
            <Image
              src="/images/journal/journal-01.jpg"
              alt="Wearabay editorial image for stories behind the collection"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">
              Coming Soon
            </p>

            <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-neutral-600">
              We’re preparing thoughtful stories on modest style,
              craftsmanship, and the details behind our collections.
            </p>

            <Link
              href="/journal"
              className="mt-6 inline-flex items-center justify-center rounded-full border border-neutral-300 px-7 py-3 text-[11px] uppercase tracking-[0.25em] text-neutral-900 transition hover:border-neutral-900"
            >
              Visit Journal
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
