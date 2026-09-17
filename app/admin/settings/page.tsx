import { redirect } from "next/navigation";

import Container from "@/components/ui/Container";

import { getAdminUser } from "@/lib/admin";

import { getStoreSettings } from "@/lib/store-settings";

import SettingsForm from "./SettingsForm";


export default async function AdminSettingsPage() {

  const admin =
    await getAdminUser();


  if (!admin) {

    redirect("/account");

  }


  const settings =
    await getStoreSettings();


  return (

    <main>

      <Container className="py-24">

        <div className="space-y-16">

          {/* =================================================
              HEADER
          ================================================= */}

          <div>

            <p
              className="
                text-xs
                uppercase
                tracking-[0.3em]
                text-neutral-500
              "
            >
              Administration
            </p>


            <h1
              className="
                mt-3
                text-4xl
                font-light
              "
            >
              Settings
            </h1>


            <p
              className="
                mt-3
                max-w-xl
                text-sm
                leading-6
                text-neutral-500
              "
            >
              Manage store information and configuration.
            </p>

          </div>


          <SettingsForm
            initialSettings={settings}
          />

        </div>

      </Container>

    </main>

  );

}