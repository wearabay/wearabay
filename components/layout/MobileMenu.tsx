"use client";

import Link from "next/link";
import { X, Menu } from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

import { navigation } from "@/data/navigation";
import { adminNavigation } from "./AdminNavbarMenu";


type Props = {
  dark?: boolean;
  storeName: string;
  instagram: string;
  tiktok: string;
};


export default function MobileMenu({
  dark = false,
  storeName,
  instagram,
  tiktok,
}: Props) {

  const pathname = usePathname();


  const [open, setOpen] =
    useState(false);


  const [mounted, setMounted] =
    useState(false);


  const isAdminPage =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");


  const menuItems = isAdminPage
    ? adminNavigation
    : navigation;


  useEffect(() => {
    setMounted(true);
  }, []);


  /*
   * Lock background page while menu is open.
   */

  useEffect(() => {

    if (!open) {

      document.body.style.overflow = "";

      return;

    }


    const previousOverflow =
      document.body.style.overflow;


    document.body.style.overflow =
      "hidden";


    return () => {

      document.body.style.overflow =
        previousOverflow;

    };

  }, [open]);


  /*
   * Close after navigation.
   */

  useEffect(() => {

    setOpen(false);

  }, [pathname]);


  /*
   * Escape closes the drawer.
   */

  useEffect(() => {

    if (!open) {

      return;

    }


    const handleKeyDown = (
      event: KeyboardEvent
    ) => {

      if (event.key === "Escape") {

        setOpen(false);

      }

    };


    window.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };

  }, [open]);


  const drawer =
    open && mounted
      ? createPortal(

          <div
            className="
              fixed
              inset-0
              z-[9999]
            "
            onPointerDown={() =>
              setOpen(false)
            }
          >

            {/* =================================================
                BACKDROP
            ================================================= */}

            <div
              className="
                absolute
                inset-0
                bg-black/15
                backdrop-blur-sm
              "
              aria-hidden="true"
            />


            {/* =================================================
                FLOATING DRAWER
            ================================================= */}

            <aside
              className="
                absolute
                right-3
                top-3
                bottom-3
                flex
                h-[calc(100dvh-24px)]
                w-[86vw]
                max-w-[380px]
                flex-col
                overflow-hidden
                rounded-[32px]
                bg-white
                text-neutral-900
                shadow-2xl

                md:right-0
                md:top-0
                md:bottom-0
                md:h-[100dvh]
                md:w-[380px]
                md:max-w-[42vw]
                md:rounded-l-[30px]
                md:rounded-r-none
              "
              onPointerDown={(event) =>
                event.stopPropagation()
              }
            >

              {/* =================================================
                  HEADER
              ================================================= */}

              <div
                className="
                  flex
                  h-28
                  shrink-0
                  items-center
                  justify-between
                  border-b
                  border-neutral-200
                  px-7
                  md:px-8
                "
              >

                <div>

                  <span
                    className="
                      text-[18px]
                      font-light
                      tracking-[0.30em]
                      md:tracking-[0.34em]
                    "
                  >
                    {storeName.toUpperCase()}
                  </span>


                  {isAdminPage && (
                    <p
                      className="
                        mt-2
                        text-[9px]
                        uppercase
                        tracking-[0.30em]
                        text-neutral-400
                      "
                    >
                      Administration
                    </p>
                  )}

                </div>


                <button
                  type="button"
                  onClick={() =>
                    setOpen(false)
                  }
                  aria-label="Close menu"
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    transition
                    hover:bg-neutral-100
                  "
                >

                  <X
                    size={25}
                    strokeWidth={1.3}
                  />

                </button>

              </div>


              {/* =================================================
                  MAIN CONTENT

                  Only the menu area scrolls.
                  Footer remains visually separated.
              ================================================= */}

              <div
                className="
                  min-h-0
                  flex-1
                  overflow-y-auto
                  overscroll-contain
                "
              >

                <nav
                  aria-label={
                    isAdminPage
                      ? "Admin mobile navigation"
                      : "Mobile navigation"
                  }
                  className="
                    flex
                    flex-col
                    gap-8
                    px-7
                    py-11
                    md:gap-6
                    md:px-8
                    md:py-10
                  "
                >

                  {menuItems.map(
                    (item) => {

                      const isActive =
                        item.href ===
                        "/admin"
                          ? pathname ===
                            "/admin"
                          : pathname ===
                              item.href ||
                            pathname.startsWith(
                              `${item.href}/`
                            );


                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() =>
                            setOpen(false)
                          }
                          className={`
                            text-[17px]
                            font-light
                            uppercase
                            tracking-[0.24em]
                            transition-colors
                            md:text-[18px]
                            md:tracking-[0.25em]
                            ${
                              isActive
                                ? "font-medium text-black"
                                : "text-neutral-600 hover:text-black"
                            }
                          `}
                        >
                          {item.name}
                        </Link>
                      );

                    }
                  )}

                </nav>

              </div>


              {/* =================================================
                  BUYER FOOTER
                  
                  Separated from main navigation.
              ================================================= */}

              {!isAdminPage && (
                <div
                  className="
                    shrink-0
                    border-t
                    border-neutral-200
                    px-7
                    pb-10
                    pt-10
                    md:px-8
                    md:pb-9
                    md:pt-9
                  "
                >

                  <p
                    className="
                      text-[9px]
                      uppercase
                      tracking-[0.34em]
                      text-neutral-400
                    "
                  >
                    Follow Our Journey
                  </p>


                  <div
                    className="
                      mt-7
                      flex
                      items-center
                      gap-10
                    "
                  >

                    {instagram && (

                      <a
                        href={instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          text-[11px]
                          uppercase
                          tracking-[0.20em]
                          transition-opacity
                          hover:opacity-60
                        "
                      >
                        Instagram
                      </a>

                    )}


                    {tiktok && (

                      <a
                        href={tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          text-[11px]
                          uppercase
                          tracking-[0.20em]
                          transition-opacity
                          hover:opacity-60
                        "
                      >
                        TikTok
                      </a>

                    )}

                  </div>

                </div>
              )}


              {/* =================================================
                  ADMIN FOOTER

                  Separated from main navigation.
              ================================================= */}

              {isAdminPage && (
                <div
                  className="
                    shrink-0
                    border-t
                    border-neutral-200
                    px-7
                    pb-10
                    pt-12
                    md:px-8
                    md:pb-9
                    md:pt-9
                  "
                >

                  <p
                    className="
                      text-[9px]
                      uppercase
                      tracking-[0.32em]
                      text-neutral-400
                    "
                  >
                    Admin Workspace
                  </p>


                  <Link
                    href="/"
                    onClick={() =>
                      setOpen(false)
                    }
                    className="
                      mt-6
                      inline-flex
                      rounded-full
                      border
                      border-neutral-300
                      px-5
                      py-3
                      text-[10px]
                      uppercase
                      tracking-[0.20em]
                      transition
                      hover:border-black
                      hover:bg-black
                      hover:text-white
                    "
                  >
                    View Storefront
                  </Link>

                </div>
              )}

            </aside>

          </div>,

          document.body

        )
      : null;


  return (
    <>
      {/* =================================================
          HAMBURGER
      ================================================= */}

      <button
        type="button"
        onClick={() =>
          setOpen(true)
        }
        className={`
          xl:hidden
          transition-opacity
          hover:opacity-60
          ${
            dark
              ? "text-neutral-900"
              : "text-white"
          }
        `}
        aria-label="Open menu"
        aria-expanded={open}
      >

        <Menu
          size={24}
          strokeWidth={1.4}
        />

      </button>


      {drawer}

    </>
  );
}