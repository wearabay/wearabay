import { getStoreSettings } from "@/lib/store-settings";

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

  const settings =
    await getStoreSettings();


  return (
    <NavbarClient
      transparent={transparent}
      products={products}
      storeName={settings.storeName}
      tagline={settings.tagline}
      instagram={settings.instagram}
      tiktok={settings.tiktok}
    />
  );
}