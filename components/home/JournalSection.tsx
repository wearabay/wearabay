import Image from "next/image";
import Link from "next/link";

import Container from "../ui/Container";
import SectionTitle from "../ui/SectionTitle";

import { getStoreSettings } from "@/lib/store-settings";


export default async function JournalSection() {

  const settings =
    await getStoreSettings();


  return (
    <section className="bg-[#FAF8F5] py-20 lg:py-28">

      <Container>

        <SectionTitle
          eyebrow="Journal"
          title="Stories Behind The Collection"
          description="Discover inspiration, craftsmanship and timeless modest fashion."
        />


        <div className="mt-16 grid gap-8 lg:grid-cols-2">

          {/* Featured Article */}

          <Link
            href="/journal"
            className="group overflow-hidden rounded-2xl bg-white"
          >

            <div className="relative aspect-[4/5] overflow-hidden">

              <Image
                src="/images/journal/journal-01.jpg"
                alt="Journal"
                fill
                className="
                  object-cover
                  transition
                  duration-700
                  group-hover:scale-105
                "
              />

            </div>


            <div className="p-8">

              <p
                className="
                  text-xs
                  uppercase
                  tracking-[0.30em]
                  text-neutral-500
                "
              >
                Editorial
              </p>


              <h3
                className="
                  mt-3
                  text-3xl
                  font-light
                  text-neutral-900
                "
              >
                The Art of Modern Modesty
              </h3>


              <p
                className="
                  mt-5
                  leading-8
                  text-neutral-600
                "
              >
                Every {settings.storeName} piece is crafted
                with premium fabrics, elegant silhouettes and
                timeless details designed for women who
                appreciate understated luxury.
              </p>


              <span
                className="
                  mt-8
                  inline-block
                  uppercase
                  tracking-[0.25em]
                  text-sm
                  transition
                  group-hover:translate-x-2
                "
              >
                Read Story →
              </span>

            </div>

          </Link>


          {/* Side Articles */}

          <div className="grid gap-8">

            <Link
              href="/journal"
              className="
                group
                flex
                overflow-hidden
                rounded-2xl
                bg-white
              "
            >

              <div className="relative w-40 shrink-0">

                <Image
                  src="/images/journal/journal-02.jpg"
                  alt=""
                  fill
                  className="
                    object-cover
                    transition
                    duration-700
                    group-hover:scale-105
                  "
                />

              </div>


              <div
                className="
                  flex
                  flex-col
                  justify-center
                  p-6
                "
              >

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-[0.30em]
                    text-neutral-500
                  "
                >
                  Craftsmanship
                </p>


                <h3
                  className="
                    mt-3
                    text-xl
                    font-light
                  "
                >
                  Handmade Finishing
                </h3>


                <span
                  className="
                    mt-5
                    text-sm
                    uppercase
                    tracking-[0.25em]
                    transition
                    group-hover:translate-x-2
                  "
                >
                  Read →
                </span>

              </div>

            </Link>


            <Link
              href="/journal"
              className="
                group
                flex
                overflow-hidden
                rounded-2xl
                bg-white
              "
            >

              <div className="relative w-40 shrink-0">

                <Image
                  src="/images/journal/journal-03.jpg"
                  alt=""
                  fill
                  className="
                    object-cover
                    transition
                    duration-700
                    group-hover:scale-105
                  "
                />

              </div>


              <div
                className="
                  flex
                  flex-col
                  justify-center
                  p-6
                "
              >

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-[0.30em]
                    text-neutral-500
                  "
                >
                  Collection
                </p>


                <h3
                  className="
                    mt-3
                    text-xl
                    font-light
                  "
                >
                  Autumn 2026 Preview
                </h3>


                <span
                  className="
                    mt-5
                    text-sm
                    uppercase
                    tracking-[0.25em]
                    transition
                    group-hover:translate-x-2
                  "
                >
                  Read →
                </span>

              </div>

            </Link>

          </div>

        </div>

      </Container>

    </section>
  );
}