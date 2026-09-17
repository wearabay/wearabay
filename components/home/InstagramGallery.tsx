import Image from "next/image";
import Link from "next/link";

import Container from "../ui/Container";
import SectionTitle from "../ui/SectionTitle";

import { getStoreSettings } from "@/lib/store-settings";


export default async function InstagramGallery() {

  const settings =
    await getStoreSettings();


  const instagramUrl =
    settings.instagram || "#";


  return (
    <section className="bg-[#FAF8F5] py-16 lg:py-20">

      <Container>

        <SectionTitle
          eyebrow="Follow Our Journey"
          title={settings.storeName}
          description="Discover timeless elegance through our latest collections, styling inspiration and behind-the-scenes moments."
        />


        <div className="mt-20 grid gap-6 lg:grid-cols-[2fr_1fr]">

          {/* ================= VIDEO ================= */}

          <Link
            href={instagramUrl}
            target="_blank"
            className="group"
          >

            <div className="relative aspect-[16/12] overflow-hidden rounded-3xl bg-neutral-200">

              <video
                src="/videos/instagram/reel-01.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="
                  h-full
                  w-full
                  object-cover
                  transition-all
                  duration-700
                  group-hover:scale-105
                "
              />


              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/20
                  to-transparent
                "
              />


              {/* Play Badge */}

              <div
                className="
                  absolute
                  bottom-8
                  left-8
                  rounded-full
                  bg-white/90
                  px-6
                  py-3
                  backdrop-blur-md
                "
              >

                <span
                  className="
                    text-[9px]
                    uppercase
                    tracking-[0.18em]
                    text-neutral-900
                  "
                >
                  Instagram →
                </span>

              </div>

            </div>

          </Link>


          {/* ================= RIGHT ================= */}

          <div className="grid gap-6">

            <Link
              href={instagramUrl}
              target="_blank"
              className="group"
            >

              <div className="relative aspect-[16/11.5] justify-center overflow-hidden rounded-3xl">

                <Image
                  src="/images/instagram/instagram-01.jpg"
                  alt="Instagram"
                  fill
                  sizes="33vw"
                  className="
                    object-cover
                    transition-all
                    duration-700
                    group-hover:scale-105
                  "
                />


                <div
                  className="
                    absolute
                    inset-0
                    bg-black/0
                    transition
                    duration-500
                    group-hover:bg-black/10
                  "
                />

              </div>

            </Link>


            <Link
              href={instagramUrl}
              target="_blank"
              className="group"
            >

              <div className="relative aspect-[16/11.5] justify-center overflow-hidden rounded-3xl">

                <Image
                  src="/images/instagram/instagram-02.jpg"
                  alt="Instagram"
                  fill
                  sizes="33vw"
                  className="
                    object-cover
                    transition-all
                    duration-700
                    group-hover:scale-105
                  "
                />


                <div
                  className="
                    absolute
                    inset-0
                    bg-black/0
                    transition
                    duration-500
                    group-hover:bg-black/10
                  "
                />

              </div>

            </Link>

          </div>

        </div>


        {/* Bottom CTA */}

        <div className="mt-16 text-center">

          <Link
            href={instagramUrl}
            target="_blank"
            className="
              inline-flex
              items-center
              gap-3
              text-[12px]
              uppercase
              tracking-[0.30em]
              transition
              hover:opacity-60
              text-neutral-700
            "
          >
            Follow on Instagram →
          </Link>

        </div>

      </Container>

    </section>
  );
}