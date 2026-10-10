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

        <div className="mt-12 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">
            Coming Soon
          </p>

          <Link
            href="/journal"
            className="mt-6 inline-flex items-center justify-center rounded-full border border-neutral-300 px-7 py-3 text-[11px] uppercase tracking-[0.25em] text-neutral-900 transition hover:border-neutral-900"
          >
            Visit Journal
          </Link>
        </div>
      </Container>
    </section>
  );
}
