"use client";

import { useEffect, useState } from "react";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import { createClient } from "@/lib/supabase/client";


export default function ProfileForm() {


  const supabase = createClient();


  const [profile, setProfile] = useState({

    name: "",
    email: "",
    phone: "",

  });


  const [loading, setLoading] = useState(true);

  const [success, setSuccess] = useState("");



  useEffect(() => {


    async function loadProfile() {


      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();



      if (!user) {

        setLoading(false);
        return;

      }



      const {
        data
      } = await supabase
        .from("profiles")
        .select("*")
        .eq(
          "id",
          user.id
        )
        .single();



      setProfile({

        name:
          data?.full_name || "",

        email:
          user.email || "",

        phone:
          data?.phone || "",

      });



      setLoading(false);


    }


    loadProfile();


  }, [supabase]);





  function updateField(
    field: keyof typeof profile,
    value: string
  ) {


    setProfile((prev) => ({

      ...prev,

      [field]: value,

    }));


  }





  async function handleSave() {


    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();



    if (!user) return;



    const {
      error
    } = await supabase
      .from("profiles")
      .update({

        full_name:
          profile.name,

        phone:
          profile.phone,

      })
      .eq(
        "id",
        user.id
      );



    if (error) {

      setSuccess(
        "Failed to update profile"
      );

      return;

    }



    setSuccess(
      "Profile updated successfully"
    );



    setTimeout(() => {

      setSuccess("");

    }, 3000);


  }





  if (loading) {


    return (

      <p
        className="
          text-sm
          text-neutral-500
        "
      >
        Loading...
      </p>

    );


  }





  return (

    <div
      className="
        max-w-xl
        space-y-10
      "
    >


      <div>

        <p
          className="
            text-xs
            uppercase
            tracking-[0.3em]
            text-neutral-500
          "
        >
          Account
        </p>


        <h1
          className="
            mt-3
            text-4xl
            font-light
          "
        >
          My Profile
        </h1>


      </div>





      <section
        className="
          rounded-2xl
          border
          border-stone-200
          bg-white
          p-8
          space-y-5
        "
      >


        <Input
          label="Full Name"
          value={profile.name}
          onChange={(e) =>
            updateField(
              "name",
              e.target.value
            )
          }
        />



        <Input
          label="Email Address"
          type="email"
          value={profile.email}
          disabled
        />



        <Input
          label="Phone Number"
          placeholder="+62"
          value={profile.phone}
          onChange={(e) =>
            updateField(
              "phone",
              e.target.value
            )
          }
        />



        {success && (

          <div
            className="
              rounded-lg
              bg-neutral-100
              px-4
              py-3
              text-sm
              text-neutral-700
            "
          >
            {success}
          </div>

        )}



        <Button
          onClick={handleSave}
        >
          Save Changes
        </Button>


      </section>


    </div>

  );

}