"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";


export default function LogoutButton(){

  const router = useRouter();


  async function handleLogout(){

    const supabase = createClient();


    await supabase.auth.signOut();


    router.refresh();

    router.push("/");

  }


  return (

    <Button
      onClick={handleLogout}
    >
      Logout
    </Button>

  );

}