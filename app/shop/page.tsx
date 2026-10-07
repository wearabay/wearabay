import { ShopProvider } from "@/components/shop/context/ShopContext";
import ShopHeader from "@/components/shop/ShopHeader";
import ShopToolbar from "@/components/shop/ShopToolbar";
import ProductGrid from "@/components/shop/ProductGrid";

import { getProducts } from "@/lib/products";
import { getProductBadgesForProducts } from "@/lib/product-badge-service";

export default async function ShopPage() {
  const products = await getProducts();

  const badgeMap =
    await getProductBadgesForProducts(
      products.map((product) => product.id),
    );

  const badgesByProduct = Object.fromEntries(
    badgeMap.entries(),
  );

  return (
    <ShopProvider>
      <main>
        <ShopHeader />

        <ShopToolbar />

        <ProductGrid
          products={products}
          badgesByProduct={badgesByProduct}
        />
      </main>
    </ShopProvider>
  );
}