import { getStoreSettings } from "@/lib/store-settings";
import { getProductBadgesForProducts } from "@/lib/product-badge-service";

import NavbarClient from "./NavbarClient";

import type { Product } from "@/types/product";


type NavbarProps = {
  transparent?: boolean;
  products: Product[];
};


export default async function Navbar({
  transparent = false,
  products,
}: NavbarProps) {

  const [settings, badgeMap] = await Promise.all([
    getStoreSettings(),
    getProductBadgesForProducts(products.map((product) => product.id)),
  ]);
  const badgesByProductId = Object.fromEntries(badgeMap.entries());


  return (
    <NavbarClient
      transparent={transparent}
      products={products}
      badgesByProductId={badgesByProductId}
      storeName={settings.storeName}
      tagline={settings.tagline}
      instagram={settings.instagram}
      tiktok={settings.tiktok}
    />
  );
}