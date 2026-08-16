import WishlistPage from "./WishlistPage";
import { getProducts } from "@/lib/products";

export default async function Page() {
  const products = await getProducts();

  return (
    <WishlistPage
      products={products}
    />
  );
}