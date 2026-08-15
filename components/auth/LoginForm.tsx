"use client";

import { useState } from "react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";


export default function LoginForm() {


  const [email,setEmail] =
    useState("");

  const [password,setPassword] =
    useState("");

  const [showPassword,setShowPassword] =
    useState(false);

  const [message,setMessage] =
    useState("");

  const [loading,setLoading] =
    useState(false);





  async function handleLogin(
  e: React.FormEvent<HTMLFormElement>
) {

  e.preventDefault();

  if (!email || !password) {

    setMessage(
      "Please enter email and password."
    );

    return;

  }

  setLoading(true);
  setMessage("");

  try {

    const supabase =
      createClient();


    const {
      data,
      error,
    } =
      await supabase.auth.signInWithPassword({

        email,
        password,

      });


    if (error) {

      setMessage(
        error.message
      );

      return;

    }


    /*
     * Login berhasil tetapi
     * pastikan session benar-benar tersedia.
     */

    if (!data.session) {

      setMessage(
        "Login failed. Please try again."
      );

      return;

    }


    /*
     * Full navigation.
     *
     * Ini sengaja menggunakan window.location
     * agar request /account dibuat ulang
     * setelah session Supabase tersimpan.
     */

    window.location.assign(
      "/account"
    );


  } catch (error) {

    console.error(
      "Login failed:",
      error
    );

    setMessage(
      "Something went wrong. Please try again."
    );

  } finally {

    setLoading(false);

  }

}


  return (

    <form
      onSubmit={handleLogin}
      className="space-y-5"
    >



      <Input
        label="Email Address"
        type="email"
        value={email}
        onChange={(e)=>
          setEmail(e.target.value)
        }
      />





      <div className="relative">


        <Input
          label="Password"
          type={
            showPassword
            ? "text"
            : "password"
          }
          value={password}
          onChange={(e)=>
            setPassword(e.target.value)
          }
        />



        <button
          type="button"
          onClick={() =>
            setShowPassword(
              !showPassword
            )
          }
          className="
            absolute
            right-4
            top-10
            text-xs
            uppercase
            tracking-wider
            text-neutral-500
          "
        >

          {
            showPassword
            ? "Hide"
            : "Show"
          }


        </button>


      </div>





      <div className="flex justify-end">


        <Link
          href="/forgot-password"
          className="
            text-xs
            text-neutral-500
            hover:text-black
          "
        >

          Forgot password?

        </Link>


      </div>





      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >

        {
          loading
          ? "Signing In..."
          : "Login"
        }


      </Button>





      {
        message && (

          <p
            className="
              text-sm
              text-neutral-600
            "
          >

            {message}

          </p>

        )
      }





      <p
        className="
          text-center
          text-sm
          text-neutral-500
        "
      >

        Don't have an account?


        {" "}


        <Link
          href="/register"
          className="
            text-black
            underline
          "
        >

          Create account

        </Link>


      </p>




    </form>

  );

}