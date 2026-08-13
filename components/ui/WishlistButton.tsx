"use client";

import { useEffect, useState } from "react";

import {
  isWishlisted,
  toggleWishlist,
} from "@/lib/wishlist";

import {
  useAuthUser,
} from "@/hooks/useAuthUser";


type WishlistButtonProps = {
  productId: number;
  size?: number;
};


export default function WishlistButton({
  productId,
  size = 22,
}: WishlistButtonProps) {


  const {
    user
  } = useAuthUser();



  const [liked,setLiked] =
    useState(false);




  useEffect(()=>{


    const userId =
      user?.id;



    const update = ()=>{


      setLiked(

        isWishlisted(
          productId,
          userId
        )

      );


    };



    update();



    window.addEventListener(
      "wishlist-updated",
      update
    );



    return ()=>{

      window.removeEventListener(
        "wishlist-updated",
        update
      );

    };


  },[
    productId,
    user?.id
  ]);






  function handleClick(
    e: React.MouseEvent<HTMLButtonElement>
  ){

    e.preventDefault();

    e.stopPropagation();



    const updated =

      toggleWishlist(
        productId,
        user?.id
      );



    setLiked(
      updated.includes(productId)
    );


  }





  return (

    <button

      type="button"

      onClick={handleClick}

      className="
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-full
        bg-white/90
        shadow-md
        transition-all
        duration-300
        hover:scale-110
      "

      aria-label="Wishlist"

    >

      <span

        style={{
          fontSize:size
        }}

        className={`
          transition-all
          duration-300
          ${
            liked
            ? "scale-110 text-red-500"
            : "text-neutral-700"
          }
        `}

      >

        {
          liked
          ? "♥"
          : "♡"
        }

      </span>


    </button>

  );

}