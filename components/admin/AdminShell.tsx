"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
  },
  {
    name: "Orders",
    href: "/admin/orders",
  },
  {
    name: "Products",
    href: "/admin/products",
  },
  {
    name: "Inventory",
    href: "/admin/inventory",
  },
  {
    name: "Media",
    href: "/admin/media",
  },
  {
    name: "Customers",
    href: "/admin/customers",
  },
  {
    name: "Reviews",
    href: "/admin/reviews",
  },
  {
    name: "Settings",
    href: "/admin/settings",
  },
];

function isActivePath(
  pathname: string,
  href: string
) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  /*
   * Prevent the page behind the drawer
   * from scrolling while the mobile menu
   * is open.
   */
  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-neutral-900">
      {/* =================================================
          DESKTOP SIDEBAR
      ================================================= */}

      <aside
        className="
          fixed
          inset-y-0
          left-0
          z-40
          hidden
          w-64
          border-r
          border-stone-200
          bg-white
          lg:flex
          lg:flex-col
        "
      >
        {/* BRAND */}

        <div
          className="
            flex
            h-20
            items-center
            border-b
            border-stone-200
            px-7
          "
        >
          <Link
            href="/admin"
            aria-label="Wearabay Admin Dashboard"
          >
            <p
              className="
                text-lg
                font-light
                tracking-[0.18em]
              "
            >
              WEARABAY
            </p>

            <p
              className="
                mt-1
                text-[9px]
                uppercase
                tracking-[0.35em]
                text-neutral-400
              "
            >
              Administration
            </p>
          </Link>
        </div>

        {/* NAVIGATION */}

        <nav
          aria-label="Admin navigation"
          className="
            flex-1
            overflow-y-auto
            px-4
            py-6
          "
        >
          <p
            className="
              px-3
              text-[10px]
              uppercase
              tracking-[0.25em]
              text-neutral-400
            "
          >
            Workspace
          </p>

          <div className="mt-3 space-y-1">
            {navigation.map((item) => {
              const active =
                isActivePath(
                  pathname,
                  item.href
                );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  className={[
                    "block rounded-xl px-3 py-3 text-sm transition",
                    active
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-600 hover:bg-stone-100 hover:text-neutral-900",
                  ].join(" ")}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* STORE LINK */}

        <div
          className="
            border-t
            border-stone-200
            p-4
          "
        >
          <Link
            href="/"
            className="
              block
              rounded-xl
              px-3
              py-3
              text-sm
              text-neutral-500
              transition
              hover:bg-stone-100
              hover:text-neutral-900
            "
          >
            View Store
          </Link>
        </div>
      </aside>

      {/* =================================================
          MOBILE HEADER
      ================================================= */}

      <header
        className="
          sticky
          top-0
          z-30
          flex
          h-16
          items-center
          justify-between
          border-b
          border-stone-200
          bg-white/95
          px-4
          backdrop-blur
          lg:hidden
        "
      >
        {/* MENU BUTTON */}

        <button
          type="button"
          aria-label={
            mobileOpen
              ? "Close admin navigation"
              : "Open admin navigation"
          }
          aria-expanded={mobileOpen}
          aria-controls="admin-mobile-navigation"
          onClick={() =>
            setMobileOpen(
              (open) => !open
            )
          }
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-stone-200
            text-lg
            transition
            hover:border-neutral-900
          "
        >
          {mobileOpen ? "×" : "☰"}
        </button>

        {/* BRAND */}

        <Link
          href="/admin"
          className="
            text-sm
            font-light
            tracking-[0.18em]
          "
        >
          WEARABAY
        </Link>

        {/* ACCOUNT */}

        <Link
          href="/account"
          aria-label="Admin account"
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-stone-200
            text-xs
            uppercase
            transition
            hover:border-neutral-900
          "
        >
          A
        </Link>
      </header>

      {/* =================================================
          MOBILE NAVIGATION
      ================================================= */}

      {mobileOpen && (
        <div
          className="
            fixed
            inset-0
            z-40
            lg:hidden
          "
        >
          {/* OVERLAY */}

          <button
            type="button"
            aria-label="Close admin navigation"
            onClick={() =>
              setMobileOpen(false)
            }
            className="
              absolute
              inset-0
              bg-black/20
            "
          />

          {/* DRAWER */}

          <nav
            id="admin-mobile-navigation"
            aria-label="Admin navigation"
            className="
              absolute
              left-0
              top-16
              bottom-0
              z-10
              w-[min(85vw,320px)]
              overflow-y-auto
              border-r
              border-stone-200
              bg-white
              px-4
              py-6
            "
          >
            <p
              className="
                px-3
                text-[10px]
                uppercase
                tracking-[0.25em]
                text-neutral-400
              "
            >
              Workspace
            </p>

            <div className="mt-3 space-y-1">
              {navigation.map((item) => {
                const active =
                  isActivePath(
                    pathname,
                    item.href
                  );

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={
                      active
                        ? "page"
                        : undefined
                    }
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    className={[
                      "block rounded-xl px-3 py-3 text-sm transition",
                      active
                        ? "bg-neutral-900 text-white"
                        : "text-neutral-600 hover:bg-stone-100 hover:text-neutral-900",
                    ].join(" ")}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* STORE */}

            <div
              className="
                mt-8
                border-t
                border-stone-200
                pt-5
              "
            >
              <Link
                href="/"
                onClick={() =>
                  setMobileOpen(false)
                }
                className="
                  block
                  rounded-xl
                  px-3
                  py-3
                  text-sm
                  text-neutral-500
                  transition
                  hover:bg-stone-100
                  hover:text-neutral-900
                "
              >
                View Store
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* =================================================
          ADMIN WORKSPACE
      ================================================= */}

      <div
        className="
          min-h-screen
          lg:pl-64
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-[1600px]
            px-4
            py-6
            sm:px-6
            lg:px-8
            lg:py-8
          "
        >
          {children}
        </div>
      </div>
    </div>
  );
}