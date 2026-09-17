import Link from "next/link";

import Container from "@/components/ui/Container";

import { getStoreSettings } from "@/lib/store-settings";


export default async function AboutPage() {

  const settings =
    await getStoreSettings();


  return (

    <main>

      <Container className="py-24">

        <div className="space-y-24">

          {/* =================================================
              INTRO
          ================================================= */}

          <section className="max-w-3xl">

            <p
              className="
                text-xs
                uppercase
                tracking-[0.3em]
                text-neutral-500
              "
            >
              About
            </p>


            <h1
              className="
                mt-5
                text-4xl
                font-light
                tracking-tight
                sm:text-6xl
              "
            >
              {settings.storeName}
            </h1>


            <p
              className="
                mt-4
                text-xs
                uppercase
                tracking-[0.45em]
                text-neutral-500
              "
            >
              {settings.tagline}
            </p>


            <p
              className="
                mt-10
                max-w-2xl
                text-base
                leading-8
                text-neutral-500
              "
            >
              We create timeless modest pieces designed to be
              worn with confidence, comfort and quiet elegance.
            </p>

          </section>


          {/* =================================================
              PHILOSOPHY
          ================================================= */}

          <section>

            <div
              className="
                grid
                gap-12
                border-y
                border-neutral-200
                py-16
                md:grid-cols-2
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-[0.3em]
                    text-neutral-500
                  "
                >
                  Our Philosophy
                </p>

              </div>


              <div>

                <h2
                  className="
                    text-2xl
                    font-light
                    leading-9
                  "
                >
                  Modesty, refined through thoughtful design.
                </h2>


                <p
                  className="
                    mt-6
                    text-sm
                    leading-8
                    text-neutral-500
                  "
                >
                  Every piece is created with a focus on refined
                  silhouettes, considered proportions and a sense
                  of effortless elegance.
                </p>


                <p
                  className="
                    mt-5
                    text-sm
                    leading-8
                    text-neutral-500
                  "
                >
                  We believe modest fashion can feel contemporary
                  while remaining timeless — pieces that become
                  part of a wardrobe rather than simply following
                  a season.
                </p>

              </div>

            </div>

          </section>


          {/* =================================================
              CRAFTSMANSHIP
          ================================================= */}

          <section>

            <div
              className="
                grid
                gap-12
                md:grid-cols-2
                md:items-start
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-[0.3em]
                    text-neutral-500
                  "
                >
                  Craftsmanship
                </p>


                <h2
                  className="
                    mt-5
                    max-w-md
                    text-3xl
                    font-light
                    leading-10
                  "
                >
                  Designed with intention.
                </h2>

              </div>


              <div>

                <p
                  className="
                    text-sm
                    leading-8
                    text-neutral-500
                  "
                >
                  From fabric selection to the final details,
                  our approach is centered around quality,
                  simplicity and longevity.
                </p>


                <p
                  className="
                    mt-6
                    text-sm
                    leading-8
                    text-neutral-500
                  "
                >
                  The result is modest wear that feels considered
                  from the first touch to the way it moves with you.
                </p>

              </div>

            </div>

          </section>


          {/* =================================================
              CLOSING
          ================================================= */}

          <section>

            <div
              className="
                border-t
                border-neutral-200
                pt-16
              "
            >

              <p
                className="
                  max-w-2xl
                  text-2xl
                  font-light
                  leading-10
                  sm:text-3xl
                "
              >
                Quietly elegant pieces for the way you choose
                to live, move and dress.
              </p>


              <div className="mt-10">

                <Link
                  href="/shop"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    rounded-full
                    bg-neutral-900
                    px-7
                    py-3
                    text-xs
                    uppercase
                    tracking-[0.18em]
                    text-white
                    transition
                    hover:bg-neutral-700
                  "
                >
                  Explore the Collection
                </Link>

              </div>

            </div>

          </section>

        </div>

      </Container>

    </main>

  );

}