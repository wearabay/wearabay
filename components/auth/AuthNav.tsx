"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";

import { createClient } from "@/lib/supabase/client";


export default function AuthNav(){

  const [user,setUser] = useState<any>(null);



  useEffect(()=>{

    const supabase = createClient();


    async function loadUser(){

      const {
        data:{
          session
        }
      } = await supabase.auth.getSession();


      setUser(
        session?.user ?? null
      );

    }


    loadUser();



    const {
      data:{
        subscription
      }
    } =
    supabase.auth.onAuthStateChange(
      (event, session)=>{

  if(
    event === "USER_UPDATED" ||
    event === "SIGNED_IN"
  ){

    setUser(
      session?.user ?? null
    );

  }

}
    );


    return ()=>{

      subscription.unsubscribe();

    };


  },[]);




  const fullName =
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    "";



  const firstName =
    fullName.split(" ")[0];




  return (

    <Link

      href={
        user
        ? "/account"
        : "/login"
      }

      className="
        flex
        items-center
        gap-2
        transition-opacity
        hover:opacity-60
      "

    >


      {
        user

        ?

        (

          <>

            <span

              className="
                hidden
                md:block
                text-sm
              "

            >

              Hi, {firstName}

            </span>



            <UserRound

              size={22}

              strokeWidth={1.8}

            />


          </>

        )

        :

        (

          <UserRound

            size={22}

            strokeWidth={1.8}

          />

        )

      }


    </Link>

  );

}