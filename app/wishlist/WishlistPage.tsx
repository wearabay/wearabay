"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Trash2,
} from "lucide-react";
import {
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

import type { Product } from "@/types/product";

import ProductCard from "@/components/product/ProductCard";
import EmptyWishlist from "@/components/wishlist/EmptyWishlist";

import {
  clearWishlist,
  getWishlist,
  loadWishlist,
} from "@/lib/wishlist";

import { useAuthUser } from "@/hooks/useAuthUser";


type WishlistPageProps = {
  products: Product[];
};


export default function WishlistPage({
  products,
}: WishlistPageProps) {

  const {
    user,
    loading: authLoading,
  } = useAuthUser();


  const userId =
    user?.id;


  const [
    wishlist,
    setWishlist,
  ] = useState<number[]>([]);


  const [
    pageLoading,
    setPageLoading,
  ] = useState(true);


  const [
    showClearModal,
    setShowClearModal,
  ] = useState(false);


  /*
   * Hydration state.
   *
   * useSyncExternalStore gives us:
   * - false during the server render
   * - false during the first client render
   * - true after hydration
   *
   * This avoids a synchronous setState inside
   * useEffect and keeps the server/client shell
   * identical during hydration.
   */

  const mounted =
    useSyncExternalStore(
      () => () => {},
      () => true,
      () => false
    );


  /*
   * Load wishlist after hydration.
   */

  useEffect(() => {

    if (!mounted) {
      return;
    }


    if (authLoading) {
      return;
    }


    let cancelled = false;


    async function load() {

      setPageLoading(true);


      try {

        /*
         * Guest
         */

        if (!userId) {

          const localWishlist =
            getWishlist();


          if (!cancelled) {

            setWishlist(
              localWishlist
            );

          }

          return;

        }


        /*
         * Logged-in user
         *
         * Load wishlist from Supabase.
         */

        const remoteWishlist =
          await loadWishlist(
            userId
          );


        if (!cancelled) {

          setWishlist(
            remoteWishlist
          );

        }

      } catch (error) {

        console.error(
          "Failed to load wishlist:",
          error
        );


        /*
         * If remote loading fails,
         * do not display another user's
         * or guest's wishlist.
         */

        if (!cancelled) {

          setWishlist([]);

        }

      } finally {

        if (!cancelled) {

          setPageLoading(false);

        }

      }

    }


    load();


    return () => {

      cancelled = true;

    };

  }, [
    mounted,
    authLoading,
    userId,
  ]);


  /*
   * Listen for wishlist changes.
   */

  useEffect(() => {

    if (!mounted) {
      return;
    }


    const updateWishlist = () => {

      setWishlist(
        getWishlist(
          userId
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
    mounted,
    userId,
  ]);


  /*
   * Match saved IDs with products.
   */

  const wishlistProducts =
    products.filter(
      (product) =>
        wishlist.includes(
          product.id
        )
    );


  /*
   * Clear wishlist.
   */

  const handleClearWishlist =
    async () => {

      if (pageLoading) {
        return;
      }


      setPageLoading(true);


      try {

        await clearWishlist(
          userId
        );


        setWishlist([]);

        setShowClearModal(
          false
        );

      } catch (error) {

        console.error(
          "Failed to clear wishlist:",
          error
        );

      } finally {

        setPageLoading(false);

      }

    };


  /*
   * IMPORTANT:
   *
   * Before hydration is complete,
   * render exactly the same structure
   * on server and client.
   */

  if (!mounted) {

    return (

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
          Loading your wishlist...
        </p>

      </main>

    );

  }


  /*
   * Auth / wishlist loading.
   */

  if (
    authLoading ||
    pageLoading
  ) {

    return (

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
          Loading your wishlist...
        </p>

      </main>

    );

  }


  return (

    <main
      className="
        mx-auto
        w-full
        max-w-[1450px]
        px-8
        py-24
      "
    >

      {/* Header */}

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
        {wishlistProducts.length !== 1 &&
          "s"}

      </p>


      {/* Empty */}

      {wishlistProducts.length === 0 ? (

        <EmptyWishlist />

      ) : (

        <>

          {/* Toolbar */}

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

              <ArrowLeft
                size={16}
              />

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
                setShowClearModal(
                  true
                )
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

              <Trash2
                size={16}
              />

              Clear All

            </button>

          </div>


          {/* Products */}

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

            {wishlistProducts.map(
              (product) => (

                <ProductCard
                  key={product.id}
                  product={product}
                />

              )
            )}

          </div>

        </>

      )}


      {/* Clear Modal */}

      {showClearModal && (

        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/30
            px-6
            backdrop-blur-sm
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
              Are you sure you want to
              remove all saved items?
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
                type="button"
                onClick={() =>
                  setShowClearModal(
                    false
                  )
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
                type="button"
                onClick={
                  handleClearWishlist
                }
                disabled={pageLoading}
                className="
                  text-sm
                  uppercase
                  tracking-[0.25em]
                  text-neutral-900
                  transition-opacity
                  hover:opacity-60
                  disabled:opacity-40
                "
              >
                Clear All
              </button>

            </div>

          </div>

        </div>

      )}

    </main>

  );

}