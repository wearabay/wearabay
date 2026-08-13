"use client";

import Link from "next/link";

import {
  Trash2,
  ArrowLeft,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";


import {
  products,
} from "@/data/products";


import ProductCard from "@/components/product/ProductCard";


import {
  getWishlist,
  clearWishlist,
} from "@/lib/wishlist";


import EmptyWishlist from "@/components/wishlist/EmptyWishlist";


import {
  useAuthUser,
} from "@/hooks/useAuthUser";




export default function WishlistPage() {


  const {
    user,
  } = useAuthUser();



  const [
    wishlist,
    setWishlist
  ] = useState<number[]>([]);



  const [
    showClearModal,
    setShowClearModal
  ] = useState(false);






  useEffect(() => {


    const loadWishlist = () => {


      setWishlist(

        getWishlist(
          user?.id
        )

      );


    };



    loadWishlist();



    window.addEventListener(
      "wishlist-updated",
      loadWishlist
    );



    return () => {


      window.removeEventListener(
        "wishlist-updated",
        loadWishlist
      );


    };



  }, [
    user?.id
  ]);







  const wishlistProducts =
    products.filter(
      (product) =>
        wishlist.includes(
          product.id
        )
    );







  const handleClearWishlist = () => {


    clearWishlist(
      user?.id
    );



    setWishlist([]);



    setShowClearModal(false);



    window.dispatchEvent(
      new Event(
        "wishlist-updated"
      )
    );


  };







  return (

    <>


      <main
        className="
          mx-auto
          w-full
          max-w-[1450px]
          px-8
          py-24
        "
      >


        <h1
          className="
            text-5xl
            font-light
          "
        >
          Wishlist
        </h1>




        <p
          className="
            mt-3
            text-neutral-500
          "
        >

          {wishlistProducts.length}
          {" "}
          saved item
          {
            wishlistProducts.length !== 1 &&
            "s"
          }

        </p>





        {
          wishlistProducts.length === 0
          ?

          (

            <EmptyWishlist />

          )

          :

          (


            <>


              <div
                className="
                  mt-12
                  flex
                  items-center
                  justify-between
                  border-b
                  border-stone-200
                  pb-6
                "
              >



                <Link

                  href="/shop"

                  className="
                    inline-flex
                    items-center
                    gap-2
                    text-sm
                    uppercase
                    tracking-[0.18em]
                    text-neutral-500
                    hover:text-black
                  "

                >

                  <ArrowLeft size={16}/>

                  Continue Shopping


                </Link>





                <span
                  className="
                    text-sm
                    text-neutral-400
                  "
                >

                  {wishlistProducts.length}
                  {" "}
                  items

                </span>





                <button

                  type="button"

                  onClick={() =>
                    setShowClearModal(true)
                  }

                  className="
                    inline-flex
                    items-center
                    gap-2
                    text-sm
                    uppercase
                    tracking-[0.18em]
                    text-neutral-500
                    hover:text-red-500
                  "

                >

                  <Trash2 size={16}/>

                  Clear All


                </button>



              </div>






              <div

                className="
                  mt-14
                  grid
                  grid-cols-2
                  gap-x-6
                  gap-y-12
                  md:grid-cols-3
                  xl:grid-cols-4
                "

              >


                {
                  wishlistProducts.map(
                    (product)=>(

                      <ProductCard

                        key={
                          product.id
                        }

                        product={
                          product
                        }

                      />

                    )
                  )
                }


              </div>



            </>


          )

        }







        {
          showClearModal && (


            <div

              className="
                fixed
                inset-0
                z-[100]
                flex
                items-center
                justify-center
                bg-black/30
                backdrop-blur-sm
                px-6
              "

            >



              <div

                className="
                  w-full
                  max-w-md
                  rounded-md
                  bg-white
                  px-10
                  py-12
                  shadow-xl
                "

              >


                <h2

                  className="
                    text-2xl
                    font-light
                    tracking-wide
                  "

                >

                  Clear wishlist?

                </h2>




                <p

                  className="
                    mt-5
                    text-sm
                    leading-relaxed
                    text-neutral-500
                  "

                >

                  Are you sure you want to remove all saved items?

                </p>





                <div

                  className="
                    mt-10
                    flex
                    justify-end
                    gap-8
                  "

                >



                  <button

                    onClick={() =>
                      setShowClearModal(false)
                    }

                    className="
                      text-sm
                      uppercase
                      tracking-[0.18em]
                      text-neutral-500
                    "

                  >

                    Cancel

                  </button>





                  <button

                    onClick={
                      handleClearWishlist
                    }

                    className="
                      text-sm
                      uppercase
                      tracking-[0.25em]
                      text-neutral-900
                      transition-opacity
                      hover:opacity-60
                    "

                  >

                    Clear All

                  </button>



                </div>



              </div>



            </div>


          )
        }





      </main>



    </>

  );

}