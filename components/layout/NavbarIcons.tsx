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
  getWishlistCount,
  loadWishlist,
} from "@/lib/wishlist";

import {
  getCartCount,
} from "@/lib/cart";

import {
  useAuthUser,
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
    user,
    loading: authLoading,
  } = useAuthUser();


  const [
    wishlistCount,
    setWishlistCount,
  ] = useState(0);


  const [
    cartCount,
    setCartCount,
  ] = useState(0);


  /*
   * Load wishlist and cart
   * whenever authentication changes.
   */

  useEffect(() => {

    if (
      authLoading
    ) {

      return;

    }


    let cancelled = false;


    async function loadData() {

      const userId =
        user?.id;


      /*
       * GUEST
       */

      if (!userId) {

        if (
          cancelled
        ) {

          return;

        }


        setWishlistCount(
          getWishlistCount()
        );


        setCartCount(
          getCartCount()
        );


        return;

      }


      /*
       * USER
       *
       * Load wishlist from Supabase
       * first so a new device/browser
       * receives the user's saved wishlist.
       */

      try {

        await loadWishlist(
          userId
        );

      } catch (
        error
      ) {

        console.error(
          "Failed to load wishlist for navbar:",
          error
        );

      }


      /*
       * Prevent an old auth request
       * from updating the current user.
       */

      if (
        cancelled
      ) {

        return;

      }


      setWishlistCount(
        getWishlistCount(
          userId
        )
      );


      setCartCount(
        getCartCount(
          userId
        )
      );

    }


    loadData();


    return () => {

      cancelled = true;

    };

  }, [
    user?.id,
    authLoading,
  ]);


  /*
   * Listen for wishlist/cart changes.
   */

  useEffect(() => {

    if (
      authLoading
    ) {

      return;

    }


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


    window.addEventListener(
      "wishlist-updated",
      updateWishlist
    );


    window.addEventListener(
      "cart-updated",
      updateCart
    );


    return () => {

      window.removeEventListener(
        "wishlist-updated",
        updateWishlist
      );


      window.removeEventListener(
        "cart-updated",
        updateCart
      );

    };

  }, [
    user?.id,
    authLoading,
  ]);


  /*
   * Icon color.
   */

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

        onClick={
          onSearchClick
        }

        aria-label="Search"

        className={
          iconClass
        }

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


        {wishlistCount > 0 && (

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

        )}

      </Link>


      {/* BAG */}

      <button

        type="button"

        onClick={
          onCartClick
        }

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


        {cartCount > 0 && (

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

        )}

      </button>


    </div>

  );

}