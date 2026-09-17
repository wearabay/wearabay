import Hero from "../components/home/Hero";
import FeaturedCollections from "../components/home/FeaturedCollections";
import FeaturedProducts from "../components/home/FeaturedProducts";
import JournalSection from "../components/home/JournalSection";
import BrandValues from "../components/home/BrandValues";
import InstagramGallery from "../components/home/InstagramGallery";
import Newsletter from "../components/home/Newsletter";

import { getProducts } from "@/lib/products";

export default async function Home() {
  const products = await getProducts();

  return (
    <>
      <Hero />

      <FeaturedCollections />

      <FeaturedProducts
        products={products}
      />

      <JournalSection />

      <BrandValues />

      <InstagramGallery />

      <Newsletter />
    </>
  );
}