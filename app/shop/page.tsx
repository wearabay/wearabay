import { ShopProvider } from "@/components/shop/context/ShopContext";
import ShopHeader from "@/components/shop/ShopHeader";
import ShopToolbar from "@/components/shop/ShopToolbar";
import ProductGrid from "@/components/shop/ProductGrid";

import { getProducts } from "@/lib/products";

export default async function ShopPage() {

  const products = await getProducts();

  return (
    <ShopProvider>

      <main>
        <ShopHeader />

        <ShopToolbar />

        <ProductGrid
          products={products}
        />

      </main>

    </ShopProvider>
  );
}