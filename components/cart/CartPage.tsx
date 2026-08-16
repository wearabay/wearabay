"use client";

import type { Product } from "@/types/product";

import { useCart } from "@/context/CartContext";

import EmptyCart from "./EmptyCart";
import CartItemCard from "./CartItemCard";
import CartSummary from "./CartSummary";
import FreeShippingProgress from "./FreeShippingProgress";
import RecommendedProducts from "./RecommendedProducts";
import RecentlyViewed from "./RecentlyViewed";


type CartPageProps = {
  products: Product[];
};


export default function CartPage({
  products,
}: CartPageProps) {

  const {
    items,
    subtotal,
  } = useCart();


  if (items.length === 0) {
    return <EmptyCart />;
  }


  return (
    <>

      {/* Cart Layout */}

      <div className="grid gap-12 lg:grid-cols-[1fr_380px]">


        {/* Cart Items */}

        <div className="space-y-6">

          {items.map((item) => (

            <CartItemCard
              key={`${item.id}-${item.color}-${item.size}`}
              item={item}
            />

          ))}

        </div>



        {/* Order Summary */}

        <aside
          className="
            h-fit
            space-y-6
            lg:sticky
            lg:top-28
            self-start
          "
        >

          <FreeShippingProgress
            subtotal={subtotal}
          />


          <CartSummary
            subtotal={subtotal}
          />

        </aside>


      </div>



      {/* Recommendations */}

      <section className="mt-20 space-y-20">


        <RecommendedProducts
          products={products}
        />


        <RecentlyViewed
  products={products}
/>


      </section>


    </>
  );
}