"use client";

import {
  useEffect,
  useState,
} from "react";

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
    user,
    loading: authLoading,
  } = useAuthUser();


  const [liked, setLiked] =
    useState(false);


  const [loading, setLoading] =
    useState(false);


  /*
   * Read current wishlist from
   * the correct local cache.
   *
   * The WishlistPage / wishlist
   * loader is responsible for loading
   * authenticated data from Supabase.
   */

  useEffect(() => {

    if (
      authLoading
    ) {

      return;

    }


    setLiked(
      isWishlisted(
        productId,
        user?.id
      )
    );

  }, [
    productId,
    user?.id,
    authLoading,
  ]);


  /*
   * Listen for wishlist changes.
   */

  useEffect(() => {

    const updateWishlist = () => {

      setLiked(
        isWishlisted(
          productId,
          user?.id
        )
      );

    };


    window.addEventListener(
      "wishlist-updated",
      updateWishlist
    );


    return () => {

      window.removeEventListener(
        "wishlist-updated",
        updateWishlist
      );

    };

  }, [
    productId,
    user?.id,
  ]);


  /*
   * Toggle wishlist.
   */

  async function handleClick(
    e: React.MouseEvent<HTMLButtonElement>
  ) {

    e.preventDefault();

    e.stopPropagation();


    if (
      loading ||
      authLoading
    ) {

      return;

    }


    setLoading(true);


    try {

      const updated =
        await toggleWishlist(
          productId,
          user?.id
        );


      setLiked(
        updated.includes(
          productId
        )
      );

    } catch (
      error
    ) {

      console.error(
        "Failed to update wishlist:",
        error
      );

    } finally {

      setLoading(false);

    }

  }


  return (

    <button

      type="button"

      onClick={handleClick}

      disabled={
        loading ||
        authLoading
      }

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
        disabled:cursor-wait
      "

      aria-label={
        liked
          ? "Remove from wishlist"
          : "Add to wishlist"
      }

      aria-pressed={
        liked
      }

    >

      <span

        style={{
          fontSize: size,
        }}

        className={`
          transition-all
          duration-300

          ${
            liked
              ? "scale-110 text-red-500"
              : "text-neutral-700"
          }

          ${
            loading
              ? "opacity-50"
              : ""
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