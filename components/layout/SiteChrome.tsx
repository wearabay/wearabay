"use client";

import { usePathname } from "next/navigation";

type SiteChromeProps = {
  navbar: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
};

export default function SiteChrome({
  navbar,
  footer,
  children,
}: SiteChromeProps) {
  const pathname = usePathname();

  const isAdmin =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {navbar}

      {children}

      {footer}
    </>
  );
}