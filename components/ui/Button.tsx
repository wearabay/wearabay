"use client";

import Link from "next/link";
import {
  ButtonHTMLAttributes,
} from "react";


type ButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: string;
    children: React.ReactNode;

    variant?:
      | "primary"
      | "outline"
      | "ghost";

    external?: boolean;

    fullWidth?: boolean;

    loading?: boolean;
  };



export default function Button({

  href,

  children,

  variant = "primary",

  external = false,

  disabled = false,

  fullWidth = false,

  loading = false,

  type = "button",

  className = "",

  ...props


}: ButtonProps) {



  const baseClass =
    variant === "primary"

      ? "inline-flex h-14 items-center justify-center rounded-full bg-black px-10 text-xs font-medium uppercase tracking-[0.28em] text-white transition-all duration-300 hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"

      : variant === "outline"

      ? "inline-flex h-14 items-center justify-center rounded-full border border-black px-10 text-xs font-medium uppercase tracking-[0.28em] transition-all duration-300 hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"

      : "inline-flex h-14 items-center justify-center rounded-full px-10 text-xs font-medium uppercase tracking-[0.28em] transition-all duration-300 hover:text-[#B99143] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2";



  const isDisabled =
    disabled || loading;



  const disabledClass =
    isDisabled
      ? "opacity-50 cursor-not-allowed pointer-events-none"
      : "";



  const widthClass =
    fullWidth
      ? "w-full"
      : "";



  const classes =
    `${baseClass} ${disabledClass} ${widthClass} ${className}`;



  if (href) {


    if (external) {

      return (

        <a

          href={
            isDisabled
              ? undefined
              : href
          }

          target="_blank"

          rel="noopener noreferrer"

          className={classes}

          aria-disabled={isDisabled}

        >

          {loading
            ? "Loading..."
            : children}

        </a>

      );

    }



    return (

      <Link

        href={
          isDisabled
            ? "#"
            : href
        }

        className={classes}

        aria-disabled={isDisabled}

      >

        {loading
          ? "Loading..."
          : children}


      </Link>

    );

  }



  return (

    <button

      {...props}

      type={type}

      disabled={isDisabled}

      className={classes}

    >

      {loading
        ? "Loading..."
        : children}


    </button>

  );

}