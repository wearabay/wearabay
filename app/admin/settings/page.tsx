import { redirect } from "next/navigation";

import { getAdminUser } from "@/lib/admin";
import { getStoreSettings } from "@/lib/store-settings";

import SettingsForm from "./SettingsForm";

export default async function AdminSettingsPage() {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/account");
  }

  const settings = await getStoreSettings();

  return (
    <main className="min-w-0 space-y-8 pt-2 lg:pt-8">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">
          Workspace
        </p>

        <h1 className="mt-3 text-3xl font-light tracking-tight sm:text-4xl">
          Settings
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
          Manage store information and configuration.
        </p>
      </div>

      <SettingsForm initialSettings={settings} />
    </main>
  );
}