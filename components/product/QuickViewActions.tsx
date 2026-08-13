"use client";

import {
  useState,
} from "react";

import type { Product } from "@/types/product";

import Link from "next/link";

import {
  addToCart,
} from "@/lib/cart";

import {
  closeQuickView,
} from "@/lib/quick-view";

import {
  openCartWithBanner,
} from "@/lib/cart-drawer";

import {
  useAuthUser,
} from "@/hooks/useAuthUser";



type Props = {
  product: Product;
};



export default function QuickViewActions({
  product,
}: Props) {


  const {
    user,
  } = useAuthUser();



  const [color, setColor] =
    useState(
      product.colors?.[0] ?? ""
    );



  const [size, setSize] =
    useState(
      product.sizes?.[0] ?? ""
    );



  const [qty, setQty] =
    useState(1);





  return (

    <div className="mt-10 space-y-8">


      {/* Color */}

      {product.colors && (

        <div>

          <p className="
            mb-4
            text-xs
            uppercase
            tracking-[0.2em]
            text-neutral-500
          ">
            Color
          </p>



          <div className="flex flex-wrap gap-3">

            {product.colors.map((item) => (

              <button

                key={item}

                onClick={() =>
                  setColor(item)
                }

                className={`rounded-full border px-5 py-2 text-sm transition text-neutral-400 ${
                  color === item
                    ? "border-black bg-black text-white"
                    : "border-stone-300 hover:border-black"
                }`}

              >

                {item}

              </button>

            ))}

          </div>


        </div>

      )}






      {/* Size */}

      {product.sizes && (

        <div>


          <p className="
            mb-4
            text-xs
            uppercase
            tracking-[0.2em]
            text-neutral-500
          ">
            Size
          </p>



          <div className="flex flex-wrap gap-3">

            {product.sizes.map((item) => (

              <button

                key={item}

                onClick={() =>
                  setSize(item)
                }

                className={`h-11 min-w-[48px] rounded-full border px-4 transition ${
                  size === item
                    ? "border-black bg-black text-white"
                    : "border-stone-300 hover:border-black"
                }`}

              >

                {item}

              </button>

            ))}


          </div>


        </div>

      )}






      {/* Quantity */}

      <div>


        <p className="
          mb-4
          text-xs
          uppercase
          tracking-[0.2em]
          text-neutral-500
        ">
          Quantity
        </p>



        <div className="
          flex
          w-fit
          items-center
          rounded-full
          border
          border-stone-300
        ">


          <button

            onClick={() =>
              qty > 1 &&
              setQty(qty - 1)
            }

            className="
              h-11
              w-11
              text-neutral-700
              transition
              hover:bg-stone-100
            "

          >

            −

          </button>




          <span className="
            w-12
            text-center
            text-neutral-700
          ">

            {qty}

          </span>





          <button

            onClick={() =>
              setQty(qty + 1)
            }

            className="
              h-11
              w-11
              text-neutral-700
              transition
              hover:bg-stone-100
            "

          >

            +

          </button>


        </div>


      </div>







      {/* Buttons */}


      <div className="space-y-3 pt-2">


        <button

          type="button"

          onClick={(e)=>{


            e.preventDefault();

            e.stopPropagation();



            addToCart(

              {

                id: product.id,

                name: product.name,

                price: product.price,

                image: product.image,

                quantity: qty,

                color,

                size,

              },


              user?.id

            );



            closeQuickView();


            openCartWithBanner();



          }}


          className="
            w-full
            rounded-full
            bg-black
            py-4
            text-xs
            uppercase
            tracking-[0.22em]
            text-white
            transition
            hover:bg-neutral-900
          "

        >

          Add To Bag


        </button>






        <Link

          href={`/shop/${product.slug}`}

          className="
            block
            w-full
            rounded-full
            border
            border-stone-300
            py-4
            text-center
            text-xs
            uppercase
            tracking-[0.22em]
            text-neutral-700
            transition
            hover:border-black
          "

        >

          View Full Details


        </Link>









        {/* Highlights */}


        {product.features && (

          <div className="
            border-t
            pt-8
          ">


            <p className="
              mb-4
              text-xs
              font-medium
              uppercase
              tracking-[0.22em]
              text-neutral-700
            ">

              Highlights

            </p>



            <ul className="space-y-3">


              {product.features.map((item)=>(


                <li

                  key={item}

                  className="
                    flex
                    items-center
                    gap-3
                    text-sm
                    text-neutral-800
                  "

                >

                  <span className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-black
                  " />

                  {item}


                </li>


              ))}


            </ul>


          </div>

        )}









        {/* Specifications */}


        {product.specifications && (

          <div className="
            border-t
            pt-8
          ">


            <p className="
              mb-5
              text-xs
              font-medium
              uppercase
              tracking-[0.22em]
              text-neutral-700
            ">

              Specifications

            </p>





            <div className="space-y-4">


              {product.specifications.map((spec)=>(


                <div

                  key={spec.label}

                  className="
                    flex
                    justify-between
                    text-sm
                  "

                >


                  <span className="text-neutral-500">

                    {spec.label}

                  </span>



                  <span className="
                    font-medium
                    text-neutral-900
                  ">

                    {spec.value}

                  </span>



                </div>


              ))}


            </div>


          </div>

        )}



      </div>



    </div>

  );

}