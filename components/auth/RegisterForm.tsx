"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";


function getPasswordStrength(password: string) {

  let score = 0;


  if (password.length >= 8) {
    score++;
  }


  if (/[A-Z]/.test(password)) {
    score++;
  }


  if (/[a-z]/.test(password)) {
    score++;
  }


  if (/[0-9]/.test(password)) {
    score++;
  }


  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
  }


  if (score <= 2) {
    return {
      label: "Weak",
      width: "w-1/3",
    };
  }


  if (score <= 4) {
    return {
      label: "Medium",
      width: "w-2/3",
    };
  }


  return {
    label: "Strong",
    width: "w-full",
  };

}




export default function RegisterForm() {


  const router = useRouter();


  const [name,setName] =
    useState("");

  const [phone,setPhone] =
    useState("");

  const [email,setEmail] =
    useState("");

  const [password,setPassword] =
    useState("");

  const [confirmPassword,setConfirmPassword] =
    useState("");



  const [showPassword,setShowPassword] =
    useState(false);

  const [showConfirmPassword,setShowConfirmPassword] =
    useState(false);



  const [message,setMessage] =
    useState("");

  const [loading,setLoading] =
    useState(false);




  const strength =
    getPasswordStrength(password);

    const passwordMatch =
  confirmPassword.length > 0 &&
  password === confirmPassword;





  async function handleRegister(
    e: React.FormEvent<HTMLFormElement>
  ) {


    e.preventDefault();



    if(
      !name ||
      !phone ||
      !email ||
      !password ||
      !confirmPassword
    ){

      setMessage(
        "Please complete all fields."
      );

      return;

    }



    if(password !== confirmPassword){

      setMessage(
        "Passwords do not match."
      );

      return;

    }



    if(password.length < 8){

      setMessage(
        "Password must be at least 8 characters."
      );

      return;

    }




    setLoading(true);
    setMessage("");



    try {


      const supabase =
        createClient();



      const {
        error
      } =
      await supabase.auth.signUp({

        email,

        password,


        options: {

          data: {

            full_name:name,

            phone:phone,

          },

        },

      });





      if(error){

        setMessage(
          error.message
        );

        return;

      }




      setMessage(
        "Account created successfully. Redirecting..."
      );



      setName("");
      setPhone("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");



      setTimeout(()=>{

        router.push("/login");

      },1500);



    }
    catch{

      setMessage(
        "Something went wrong."
      );

    }
    finally{

      setLoading(false);

    }


  }





  return (

    <form
      onSubmit={handleRegister}
      className="space-y-5"
    >



      <Input
        label="Full Name"
        value={name}
        onChange={(e)=>
          setName(e.target.value)
        }
      />



      <Input
        label="Phone Number"
        placeholder="+62 812 xxxx xxxx"
        value={phone}
        onChange={(e)=>
          setPhone(e.target.value)
        }
      />



      <Input
        label="Email"
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
            setShowPassword(!showPassword)
          }
          className="
            absolute
            right-4
            top-10
            text-xs
            uppercase
            tracking-wider
          "
        >
          {showPassword
            ? "Hide"
            : "Show"}
        </button>


      </div>



      {password && (

        <div className="space-y-2">

          <div
            className="
              h-2
              rounded-full
              bg-neutral-200
              overflow-hidden
            "
          >

            <div
              className={`
                h-full
                ${strength.width}
                bg-black
              `}
            />

          </div>


          <p className="text-xs text-neutral-500">

            Password strength:
            {" "}
            {strength.label}

          </p>


        </div>

      )}




      <div className="relative">


        <Input
  label="Confirm Password"
  type={
    showConfirmPassword
    ? "text"
    : "password"
  }
  value={confirmPassword}
  onChange={(e)=>
    setConfirmPassword(e.target.value)
  }
/>


{confirmPassword && (

  <p
    className={`
      text-xs
      ${
        passwordMatch
        ? "text-green-600"
        : "text-red-500"
      }
    `}
  >

    {passwordMatch
      ? "✓ Passwords match"
      : "✕ Passwords do not match"
    }

  </p>

)}


        <button
          type="button"
          onClick={() =>
            setShowConfirmPassword(
              !showConfirmPassword
            )
          }
          className="
            absolute
            right-4
            top-10
            text-xs
            uppercase
            tracking-wider
          "
        >
          {showConfirmPassword
            ? "Hide"
            : "Show"}
        </button>


      </div>




      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >

        {loading
          ? "Creating Account..."
          : "Create Account"
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