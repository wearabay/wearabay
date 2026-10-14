import CartPage from "@/components/cart/CartPage";
import { getProducts } from "@/lib/products";
import { getProductBadgesForProducts } from "@/lib/product-badge-service";

export default async function Page() {

  const products = await getProducts();
  const badgeMap = await getProductBadgesForProducts(products.map((product) => product.id));
  const badgesByProductId = Object.fromEntries(badgeMap.entries());

  return (
    <>

      <main className="mx-auto w-full max-w-[1450px] px-8 py-24">

        <h1 className="mb-12 text-5xl font-light">
          Shopping Bag
        </h1>


        <CartPage
          products={products}
          badgesByProductId={badgesByProductId}
        />

      </main>


    </>
  );
}