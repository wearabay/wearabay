"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function RegisterForm() {



  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);


  async function handleRegister(
  e: React.FormEvent
) {

  e.preventDefault();

  setLoading(true);
  setMessage("");

  const supabase = createClient();

  const {
    error,
  } = await supabase.auth.signUp({

      email,

      password,

      options: {

        data: {
          full_name: name,
        },

      },

    });


    if (error) {

      setMessage(
        error.message
      );

    } else {

      setMessage(
        "Registration successful. Please check your email."
      );

    }


    setLoading(false);

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