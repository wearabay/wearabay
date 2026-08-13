"use client";

import Link from "next/link";

import {
  Search,
  Heart,
  ShoppingBag,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";


import {
  getWishlistCount
} from "@/lib/wishlist";


import {
  getCartCount
} from "@/lib/cart";


import {
  useAuthUser
} from "@/hooks/useAuthUser";



type NavbarIconsProps = {

  dark?: boolean;

  onCartClick: () => void;

  onSearchClick: () => void;

};





export default function NavbarIcons({

  dark = false,

  onCartClick,

  onSearchClick,

}: NavbarIconsProps) {



  const {
    user
  } = useAuthUser();



  const [wishlistCount,setWishlistCount] =
    useState(0);



  const [cartCount,setCartCount] =
    useState(0);





  useEffect(()=>{


    const userId =
      user?.id;



    const updateWishlist = () => {


      setWishlistCount(

        getWishlistCount(
          userId
        )

      );


    };





    const updateCart = () => {


      setCartCount(

        getCartCount(
          userId
        )

      );


    };





    // refresh pertama kali
    updateWishlist();
    updateCart();





    // refresh ketika data berubah

    window.addEventListener(
      "wishlist-updated",
      updateWishlist
    );


    window.addEventListener(
      "cart-updated",
      updateCart
    );





    return ()=>{


      window.removeEventListener(
        "wishlist-updated",
        updateWishlist
      );


      window.removeEventListener(
        "cart-updated",
        updateCart
      );


    };


  },[
    user?.id
  ]);





  // refresh badge setelah login/logout

  useEffect(()=>{


    window.dispatchEvent(
      new Event("wishlist-updated")
    );


    window.dispatchEvent(
      new Event("cart-updated")
    );


  },[
    user?.id
  ]);






  const iconClass = `

    transition-all
    duration-300
    hover:opacity-60

    ${
      dark
      ? "text-neutral-900"
      : "text-white"
    }

  `;






  return (

    <div
      className="
        flex
        items-center
        gap-6
      "
    >



      {/* SEARCH */}

      <button

        type="button"

        onClick={onSearchClick}

        aria-label="Search"

        className={iconClass}

      >

        <Search
          size={22}
          strokeWidth={1.8}
        />

      </button>





      {/* WISHLIST */}

      <Link

        href="/wishlist"

        className={`
          relative
          ${iconClass}
        `}

        aria-label="Wishlist"

      >

        <Heart
          size={22}
          strokeWidth={1.8}
        />



        {
          wishlistCount > 0 && (

            <span

              className="
                absolute
                -right-3
                -top-3
                flex
                h-5
                w-5
                items-center
                justify-center
                rounded-full
                bg-[#B99143]
                text-[10px]
                font-semibold
                text-white
              "

            >

              {wishlistCount}

            </span>

          )
        }


      </Link>





      {/* BAG */}

      <button

        type="button"

        onClick={onCartClick}

        className={`
          relative
          ${iconClass}
        `}

        aria-label="Shopping Bag"

      >

        <ShoppingBag
          size={22}
          strokeWidth={1.8}
        />



        {
          cartCount > 0 && (

            <span

              className="
                absolute
                -right-3
                -top-3
                flex
                h-5
                w-5
                items-center
                justify-center
                rounded-full
                bg-[#B99143]
                text-[10px]
                font-semibold
                text-white
              "

            >

              {cartCount}

            </span>

          )
        }


      </button>



    </div>

  );

}