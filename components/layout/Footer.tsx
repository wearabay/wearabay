import Link from "next/link";

import { getStoreSettings } from "@/lib/store-settings";


export default async function Footer() {

  const settings =
    await getStoreSettings();


  const whatsappUrl =
    settings.whatsapp
      ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`
      : "#";


  const currentYear =
    new Date().getFullYear();


  return (
    <footer className="border-t bg-[#FAF8F5] text-neutral-900">

      <div className="mx-auto grid max-w-7xl gap-16 px-6 py-20 md:grid-cols-4">

        {/* Brand */}

        <div>

          <h3 className="text-2xl font-light tracking-[0.18em]">
            {settings.storeName.toUpperCase()}
          </h3>


          <p className="mt-1 text-xs uppercase tracking-[0.60em]">
            {settings.tagline}
          </p>


          <p className="mt-8 leading-8 text-neutral-500">
            {settings.footerText ||
              "Timeless modest fashion crafted with premium fabrics, elegant silhouettes and refined craftsmanship."}
          </p>

        </div>


        {/* Shop */}

        <div>

          <h4 className="mb-6 uppercase tracking-[0.25em] text-sm">
            Shop
          </h4>


          <ul className="space-y-4 text-neutral-500">

            <li>
              <Link href="/shop">
                All Products
              </Link>
            </li>


            <li>
              <Link href="/shop?category=abaya">
                Abaya
              </Link>
            </li>


            <li>
              <Link href="/shop?category=dress">
                Dress
              </Link>
            </li>


            <li>
              <Link href="/shop?category=mukena">
                Mukena
              </Link>
            </li>

          </ul>

        </div>


        {/* Company */}

        <div>

          <h4 className="mb-6 uppercase tracking-[0.25em] text-sm">
            Company
          </h4>


          <ul className="space-y-4 text-neutral-500">

            <li>
              <Link href="/about">
                About
              </Link>
            </li>


            <li>
              <Link href="/journal">
                Journal
              </Link>
            </li>


            <li>
              <Link href="/contact">
                Contact
              </Link>
            </li>

          </ul>

        </div>


        {/* Social */}

        <div>

          <h4 className="mb-6 uppercase tracking-[0.25em] text-sm">
            Follow
          </h4>


          <ul className="space-y-4 text-neutral-500">

            <li>
              <a
                href={settings.instagram || "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            </li>


            <li>
              <a
                href={settings.tiktok || "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                TikTok
              </a>
            </li>


            <li>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </li>


            <li>
              <a
                href={`mailto:${settings.storeEmail}`}
              >
                Email
              </a>
            </li>

          </ul>

        </div>

      </div>


      {/* Bottom */}

      <div className="border-t">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-neutral-500 md:flex-row">

          <p>
            © {currentYear} {settings.storeName}. All rights reserved.
          </p>


          <div className="flex gap-8">

            <Link href="/privacy">
              Privacy
            </Link>


            <Link href="/terms">
              Terms
            </Link>

          </div>

        </div>

      </div>

    </footer>
  );
}