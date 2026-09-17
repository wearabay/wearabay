import { getStoreSettings } from "@/lib/store-settings";

import CheckoutPageClient from "./CheckoutPageClient";

export default async function CheckoutPage() {
  const settings = await getStoreSettings();

  return (
    <CheckoutPageClient
      storeName={settings.storeName}
    />
  );
}