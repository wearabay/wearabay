import WishlistPage from "./WishlistPage";
import { getProducts } from "@/lib/products";
import { getProductBadgesForProducts } from "@/lib/product-badge-service";

export default async function Page() {
  const products = await getProducts();

  const badgesMap = await getProductBadgesForProducts(
    products.map((product) => product.id)
  );

  const badgesByProduct = Object.fromEntries(
    badgesMap.entries()
  );

  return (
    <WishlistPage
      products={products}
      badgesByProduct={badgesByProduct}
    />
  );
}