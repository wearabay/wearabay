"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";


export default function ResetPasswordForm(){

  const router = useRouter();


  const [password,setPassword] =
    useState("");

  const [message,setMessage] =
    useState("");

  const [loading,setLoading] =
    useState(false);




  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ){

    e.preventDefault();


    setLoading(true);



    const supabase =
      createClient();



    const {
      error
    } =
    await supabase.auth.updateUser({

      password,

    });



    if(error){

      setMessage(
        error.message
      );

    } else {


      setMessage(
        "Password updated successfully."
      );


      setTimeout(()=>{

        router.push("/login");

      },1500);


    }


    setLoading(false);

  }



  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >

      <Input
        label="New Password"
        type="password"
        value={password}
        onChange={(e)=>
          setPassword(e.target.value)
        }
      />


      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >

        {loading
          ? "Updating..."
          : "Update Password"
        }

      </Button>


      {message && (

        <p className="text-sm text-neutral-600">

          {message}

        </p>

      )}


    </form>

  );

}