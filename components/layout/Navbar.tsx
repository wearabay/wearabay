"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import Logo from "./Logo";
import NavbarMenu from "./NavbarMenu";
import NavbarIcons from "./NavbarIcons";
import MobileMenu from "./MobileMenu";
import AuthNav from "@/components/auth/AuthNav";

import CartDrawer from "@/components/cart/CartDrawer";
import SearchDrawer from "@/components/search/SearchDrawer";

import { openCart } from "@/lib/cart-drawer";


type NavbarProps = {
  transparent?: boolean;
};


export default function Navbar({
  transparent = false,
}: NavbarProps) {


  const pathname = usePathname();


  const [searchOpen,setSearchOpen] =
    useState(false);


  const [scrolled,setScrolled] =
    useState(false);



  useEffect(()=>{


    const handleScroll = ()=>{

      setScrolled(
        window.scrollY > 80
      );

    };


    handleScroll();


    window.addEventListener(
      "scroll",
      handleScroll
    );


    return ()=>{

      window.removeEventListener(
        "scroll",
        handleScroll
      );

    };


  },[]);





  const isTransparentPage =
    pathname === "/" ||
    pathname === "/shop";



  const darkNavbar =
    isTransparentPage
      ? scrolled
      : true;



  return (

    <>


      <header

        className={`
          fixed
          left-0
          right-0
          top-0
          z-50

          transition-all
          duration-500

          ${
            darkNavbar

            ? `
              bg-white/90
              backdrop-blur-md
              shadow-sm
              border-b
              border-neutral-200
              text-neutral-900
            `

            :

            `
              bg-transparent
              text-white
            `
          }

        `}

      >



        <div

          className="
            mx-auto
            flex
            h-20
            max-w-7xl
            items-center
            justify-between
            px-4
            sm:px-6
          "

        >



          <Logo
            dark={darkNavbar}
          />




          <div
            className="
              hidden
              md:block
            "
          >

            <NavbarMenu
              dark={darkNavbar}
            />

          </div>





          <div

            className="
              flex
              items-center
              gap-5
            "

          >



            <NavbarIcons

              dark={darkNavbar}

              onSearchClick={()=> 
                setSearchOpen(true)
              }


              onCartClick={()=>
                openCart()
              }

            />



            <AuthNav />



            <MobileMenu
              dark={darkNavbar}
            />



          </div>



        </div>



      </header>





      <CartDrawer />





      <SearchDrawer

        open={searchOpen}

        onClose={()=>
          setSearchOpen(false)
        }

      />



    </>

  );

}