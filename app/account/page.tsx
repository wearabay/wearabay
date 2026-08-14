import Container from "@/components/ui/Container";
import AccountDashboard from "@/components/account/AccountDashboard";
import LogoutButton from "@/components/auth/LogoutButton";

import { createClient } from "@/lib/supabase/server";


export default async function AccountPage() {


  const supabase =
    await createClient();


  await supabase.auth.refreshSession();


  const {
    data:{
      user,
    },
  } =
    await supabase.auth.getUser();



  const name =
    user?.user_metadata?.full_name ??
    "Customer";


  const email =
    user?.email ??
    "-";



  return (

    <main>

      <Container
        className="
          mx-auto
          max-w-7xl
          px-6
          py-24
        "
      >

        <AccountDashboard

          name={name}

          email={email}

        />


        <div
          className="
            mt-10
          "
        >

          <LogoutButton />

        </div>


      </Container>

    </main>

  );

}