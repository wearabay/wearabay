import CartPage from "@/components/cart/CartPage";
import { getProducts } from "@/lib/products";

export default async function Page() {

  const products = await getProducts();

  return (
    <>

      <main className="mx-auto w-full max-w-[1450px] px-8 py-24">

        <h1 className="mb-12 text-5xl font-light">
          Shopping Bag
        </h1>


        <CartPage
          products={products}
        />

      </main>


    </>
  );
}