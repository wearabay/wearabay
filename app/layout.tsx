import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import Toast from "@/components/ui/Toast";
import BackToTop from "@/components/ui/BackToTop";

import { CartProvider } from "@/context/CartContext";
import { CheckoutProvider } from "@/context/CheckoutContext";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import { getProducts } from "@/lib/products";
import { getStoreSettings } from "@/lib/store-settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();

  const storeName = settings.storeName;
  const tagline = settings.tagline;

  const siteTitle =
    `${storeName} | ${tagline}`;

  const description =
    `${tagline}.`;

  const instagramHandle =
    settings.instagram
      ? settings.instagram
          .replace(/\/+$/, "")
          .split("/")
          .pop()
      : undefined;

  const twitterCreator =
    instagramHandle
      ? `@${instagramHandle}`
      : undefined;

  return {
    metadataBase: new URL(baseUrl),

    title: {
      default: storeName,
      template: `%s | ${storeName}`,
    },

    description,

    keywords: [
      storeName,
      "abaya",
      "modest fashion",
      "muslim fashion",
      "premium abaya",
      "luxury abaya",
      "muslimah clothing",
      "indonesia abaya",
    ],

    authors: [
      {
        name: storeName,
      },
    ],

    creator: storeName,

    publisher: storeName,

    openGraph: {
      type: "website",

      locale: "en_US",

      siteName: storeName,

      url: baseUrl,

      title: siteTitle,

      description,

      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: siteTitle,
        },
      ],
    },

    twitter: {
      card:
        "summary_large_image",

      title: siteTitle,

      description,

      images: [
        "/og-image.png",
      ],

      ...(twitterCreator
        ? {
            creator: twitterCreator,
          }
        : {}),
    },

    robots: {
      index: true,

      follow: true,
    },

    icons: {
      icon:
        "/favicon.ico",

      shortcut:
        "/favicon.ico",

      apple:
        "/apple-touch-icon.png",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const products = await getProducts();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <CheckoutProvider>
            <Toast />

            <Navbar
              products={products}
            />

            <main className="flex-1">
              {children}
            </main>

            <Footer />

            <BackToTop />
          </CheckoutProvider>
        </CartProvider>
      </body>
    </html>
  );
}