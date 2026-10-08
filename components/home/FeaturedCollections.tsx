import Link from "next/link";
import Image from "next/image";

import Container from "../ui/Container";
import SectionTitle from "../ui/SectionTitle";

import { getStorefrontCategories } from "@/lib/categories";

export default async function FeaturedCollections() {
  const categories = await getStorefrontCategories();

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#FAF8F5] py-24 lg:py-32">
      <Container>
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <SectionTitle
            eyebrow="Shop by Collection"
            title="Discover Our Collections"
          />

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-neutral-600">
            Discover timeless pieces crafted with elegance for every
            occasion, from everyday essentials to exclusive collections.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${encodeURIComponent(category.slug)}`}
              className="group block"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                <Image
                  src={category.coverImageUrl}
                  alt={category.name}
                  fill
                  sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
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
                    bg-gradient-to-t
                    from-black/65
                    via-black/15
                    to-transparent
                    transition-all
                    duration-500
                    group-hover:from-black/75
                  "
                />

                <div
                  className="
                    absolute
                    bottom-8
                    left-8
                    text-white
                    transition-all
                    duration-500
                    group-hover:-translate-y-2
                  "
                >
                  <h3 className="text-3xl font-light tracking-wide">
                    {category.name}
                  </h3>

                  {category.description && (
                    <p className="mt-3 max-w-xs text-sm leading-6 text-white/85">
                      {category.description}
                    </p>
                  )}

                  <span
                    className="
                      mt-7
                      inline-flex
                      items-center
                      gap-2
                      text-[11px]
                      uppercase
                      tracking-[0.28em]
                    "
                  >
                    Shop Now →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}