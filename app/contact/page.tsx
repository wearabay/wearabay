import Link from "next/link";

import Container from "@/components/ui/Container";

import { getStoreSettings } from "@/lib/store-settings";


export default async function ContactPage() {

  const settings =
    await getStoreSettings();


  const whatsappUrl =
    settings.whatsapp
      ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`
      : "#";


  return (

    <main>

      <Container className="py-24">

        <div className="space-y-20">

          {/* =================================================
              HEADER
          ================================================= */}

          <section className="max-w-2xl">

            <p
              className="
                text-xs
                uppercase
                tracking-[0.3em]
                text-neutral-500
              "
            >
              Contact
            </p>


            <h1
              className="
                mt-4
                text-4xl
                font-light
                tracking-tight
                sm:text-5xl
              "
            >
              Get in touch
            </h1>


            <p
              className="
                mt-6
                max-w-xl
                text-base
                leading-8
                text-neutral-500
              "
            >
              We are here to help with product questions,
              orders, sizing, and anything else you may need.
            </p>

          </section>


          {/* =================================================
              CONTACT INFORMATION
          ================================================= */}

          <section>

            <div
              className="
                grid
                gap-12
                border-y
                border-neutral-200
                py-12
                md:grid-cols-2
              "
            >

              {/* Store */}

              <div>

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-[0.3em]
                    text-neutral-500
                  "
                >
                  Store
                </p>


                <h2
                  className="
                    mt-4
                    text-2xl
                    font-light
                    tracking-[0.12em]
                  "
                >
                  {settings.storeName.toUpperCase()}
                </h2>


                <p
                  className="
                    mt-2
                    text-xs
                    uppercase
                    tracking-[0.4em]
                    text-neutral-500
                  "
                >
                  {settings.tagline}
                </p>

              </div>


              {/* Email */}

              <div>

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-[0.3em]
                    text-neutral-500
                  "
                >
                  Email
                </p>


                <a
                  href={`mailto:${settings.storeEmail}`}
                  className="
                    mt-4
                    inline-block
                    text-base
                    text-neutral-900
                    underline
                    underline-offset-4
                    transition
                    hover:text-neutral-500
                  "
                >
                  {settings.storeEmail}
                </a>

              </div>


              {/* WhatsApp */}

              <div>

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-[0.3em]
                    text-neutral-500
                  "
                >
                  WhatsApp
                </p>


                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    mt-4
                    inline-block
                    text-base
                    text-neutral-900
                    underline
                    underline-offset-4
                    transition
                    hover:text-neutral-500
                  "
                >
                  {settings.whatsapp}
                </a>

              </div>


              {/* Social */}

              <div>

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-[0.3em]
                    text-neutral-500
                  "
                >
                  Social
                </p>


                <div
                  className="
                    mt-4
                    flex
                    flex-wrap
                    gap-x-8
                    gap-y-3
                    text-base
                  "
                >

                  {settings.instagram && (

                    <a
                      href={settings.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        underline
                        underline-offset-4
                        transition
                        hover:text-neutral-500
                      "
                    >
                      Instagram
                    </a>

                  )}


                  {settings.tiktok && (

                    <a
                      href={settings.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        underline
                        underline-offset-4
                        transition
                        hover:text-neutral-500
                      "
                    >
                      TikTok
                    </a>

                  )}

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              WHATSAPP CTA
          ================================================= */}

          <section>

            <div
              className="
                flex
                flex-col
                gap-8
                border-b
                border-neutral-200
                pb-16
                md:flex-row
                md:items-end
                md:justify-between
              "
            >

              <div className="max-w-xl">

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-[0.3em]
                    text-neutral-500
                  "
                >
                  Customer Care
                </p>


                <h2
                  className="
                    mt-4
                    text-2xl
                    font-light
                  "
                >
                  Need help with your order?
                </h2>


                <p
                  className="
                    mt-4
                    text-sm
                    leading-7
                    text-neutral-500
                  "
                >
                  For the fastest response, contact us directly
                  through WhatsApp.
                </p>

              </div>


              {settings.whatsapp && (

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex
                    shrink-0
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
                  Chat on WhatsApp
                </a>

              )}

            </div>

          </section>


          {/* =================================================
              NAVIGATION
          ================================================= */}

          <section>

            <div
              className="
                flex
                flex-wrap
                gap-x-8
                gap-y-4
                text-sm
                text-neutral-500
              "
            >

              <Link
                href="/shop"
                className="transition hover:text-neutral-900"
              >
                Shop
              </Link>


              <Link
                href="/about"
                className="transition hover:text-neutral-900"
              >
                About
              </Link>


              <Link
                href="/journal"
                className="transition hover:text-neutral-900"
              >
                Journal
              </Link>

            </div>

          </section>

        </div>

      </Container>

    </main>

  );

}