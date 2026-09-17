import { getStoreSettings } from "@/lib/store-settings";

import JournalPageClient from "./JournalPageClient";


export default async function JournalPage() {

  const settings =
    await getStoreSettings();


  return (
    <JournalPageClient
      storeName={settings.storeName}
    />
  );

}