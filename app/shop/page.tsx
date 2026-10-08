import { ShopProvider } from "@/components/shop/context/ShopContext";
import ShopHeader from "@/components/shop/ShopHeader";
import ShopToolbar from "@/components/shop/ShopToolbar";
import ProductGrid from "@/components/shop/ProductGrid";

import { getProducts } from "@/lib/products";
import { getProductBadgesForProducts } from "@/lib/product-badge-service";
import { getStorefrontCategories } from "@/lib/categories";

type ShopPageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

export default async function ShopPage({
  searchParams,
}: ShopPageProps) {
  const params = await searchParams;

  const [
    products,
    storefrontCategories,
  ] = await Promise.all([
    getProducts(),
    getStorefrontCategories(),
  ]);

  const badgeMap =
    await getProductBadgesForProducts(
      products.map((product) => product.id),
    );

  const badgesByProduct = Object.fromEntries(
    badgeMap.entries(),
  );

  const requestedCategories =
    params.category
      ?.split(",")
      .map((slug) => slug.trim())
      .filter(Boolean) ?? [];

  const initialCategories =
    storefrontCategories
      .filter((category) =>
        requestedCategories.includes(
          category.slug,
        ),
      )
      .map((category) => category.name);

  return (
    <ShopProvider
      categories={storefrontCategories}
      initialCategory={initialCategories}
    >
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