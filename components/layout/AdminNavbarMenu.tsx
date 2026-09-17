"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const adminNavigation = [
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

type Props = {
  dark?: boolean;
};

export default function AdminNavbarMenu({
  dark = true,
}: Props) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin navigation"
      className="flex items-center gap-6"
    >
      {adminNavigation.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href ||
              pathname.startsWith(
                `${item.href}/`
              );

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              text-[11px]
              uppercase
              tracking-[0.16em]
              transition-all
              ${
                isActive
                  ? dark
                    ? "font-medium text-neutral-900"
                    : "font-medium text-white"
                  : dark
                    ? "font-light text-neutral-500 hover:text-neutral-900"
                    : "font-light text-white/70 hover:text-white"
              }
            `}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}