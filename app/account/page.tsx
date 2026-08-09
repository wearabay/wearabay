import Container from "@/components/ui/Container";
import AccountDashboard from "@/components/account/AccountDashboard";

import { createClient } from "@/lib/supabase/server";


export default async function AccountPage() {


  const supabase = await createClient();


  const {
    data: {
      user,
    },
  } = await supabase.auth.getUser();



  const name =
    user?.user_metadata?.full_name ??
    "Customer";



  const email =
    user?.email ??
    "-";



  return (

    <main>

      <Container className="mx-auto max-w-7xl px-6 py-24">

        <AccountDashboard

          name={name}

          email={email}

        />

      </Container>

    </main>

  );

}