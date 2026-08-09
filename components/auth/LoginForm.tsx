"use client";


import { useState } from "react";
import { useRouter } from "next/navigation";


import { createClient } from "@/lib/supabase/client";


import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";



export default function LoginForm() {


  const router = useRouter();


  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");


  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);




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


      const supabase = createClient();



      const {

        error

      } = await supabase.auth.signInWithPassword({

        email,

        password,

      });





      if (error) {


        setMessage(
          error.message
        );


        return;


      }



      setMessage(
        "Login successful..."
      );



      setTimeout(() => {


        router.push("/account");


      }, 800);




    } catch {


      setMessage(
        "Something went wrong."
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

        label="Email"

        type="email"

        value={email}

        onChange={(e)=>

          setEmail(e.target.value)

        }

      />




      <Input

        label="Password"

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

          ? "Signing In..."

          : "Login"

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