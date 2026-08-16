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


export const metadata: Metadata = {

  metadataBase: new URL(baseUrl),

  title: {
    default: "wearabay",
    template: "%s | wearabay",
  },

  description:
    "Premium modest fashion crafted for the modern Muslimah.",

  keywords: [
    "wearabay",
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
      name: "wearabay",
    },
  ],

  creator: "wearabay",

  publisher: "wearabay",

  openGraph: {

    type: "website",

    locale: "en_US",

    siteName: "wearabay",

    url: baseUrl,

    title:
      "wearabay | Premium Modest Fashion",

    description:
      "Premium modest fashion crafted for the modern Muslimah.",

    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt:
          "wearabay - Premium Modest Fashion",
      },
    ],

  },

  twitter: {

    card:
      "summary_large_image",

    title:
      "wearabay | Premium Modest Fashion",

    description:
      "Premium modest fashion crafted for the modern Muslimah.",

    images: [
      "/og-image.jpg",
    ],

    creator:
      "@wearabay",

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