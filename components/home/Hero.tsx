import Image from "next/image";

import Button from "../ui/Button";

import { getStoreSettings } from "@/lib/store-settings";


export default async function Hero() {

  const settings =
    await getStoreSettings();


  return (

    <section className="relative h-[90vh] w-full overflow-hidden">

      {/* Background */}

      <div className="absolute inset-0">

        <Image
          src="/images/hero/hero.jpg"
          alt={`${settings.storeName} Hero`}
          fill
          priority
          sizes="100vw"
          className="object-cover animate-hero"
        />

      </div>


      {/* Overlay */}

      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/45" />


      {/* Content */}

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">

        <p className="mb-5 text-sm font-medium uppercase tracking-[0.35em] text-white/90">

          {settings.tagline}

        </p>


        <h1 className="text-5xl md:text-7xl xl:text-8xl font-light tracking-[0.35em]">

          {settings.storeName.toUpperCase()}

        </h1>


        <p className="mt-8 max-w-2xl text-lg md:text-xl font-light leading-8 text-white/90">

          Timeless elegance crafted for the modern woman.

        </p>


        <div className="mt-10">

          <Button
            href="/shop"
            variant="outline"
          >
            Shop Collection
          </Button>

        </div>

      </div>


      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">

        <div className="flex flex-col items-center gap-2">

          <span className="text-[10px] tracking-[0.4em] uppercase text-white/80">

            Scroll

          </span>


          <div className="h-10 w-[1px] bg-white/70 animate-pulse" />

        </div>

      </div>

    </section>

  );
}