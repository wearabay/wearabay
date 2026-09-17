import { createClient } from "@supabase/supabase-js";

import { siteConfig } from "@/data/settings";


export type StoreSettings = {
  storeName: string;
  tagline: string;
  storeEmail: string;
  whatsapp: string;
  instagram: string;
  tiktok: string;
  announcement: string;
  announcementEnabled: boolean;
  footerText: string;
};


type StoreSettingsRow = {
  id: number;
  store_name: string;
  tagline: string;
  store_email: string;
  whatsapp: string;
  instagram: string;
  tiktok: string;
  announcement: string;
  announcement_enabled: boolean;
  footer_text: string;
};


const fallbackSettings: StoreSettings = {
  storeName: siteConfig.brand,
  tagline: "Modest Fashion",
  storeEmail: siteConfig.email,
  whatsapp: siteConfig.whatsapp,
  instagram: siteConfig.instagram,
  tiktok: siteConfig.tiktok,
  announcement: "",
  announcementEnabled: false,
  footerText: "",
};


function mapStoreSettings(
  row: StoreSettingsRow,
): StoreSettings {

  return {
    storeName:
      row.store_name?.trim() ||
      fallbackSettings.storeName,

    tagline:
      row.tagline?.trim() ||
      fallbackSettings.tagline,

    storeEmail:
      row.store_email?.trim() ||
      fallbackSettings.storeEmail,

    whatsapp:
      row.whatsapp?.trim() ||
      fallbackSettings.whatsapp,

    instagram:
      row.instagram?.trim() ||
      fallbackSettings.instagram,

    tiktok:
      row.tiktok?.trim() ||
      fallbackSettings.tiktok,

    announcement:
      row.announcement?.trim() || "",

    announcementEnabled:
      row.announcement_enabled ?? false,

    footerText:
      row.footer_text?.trim() || "",
  };

}


function createPublicSupabaseClient() {

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;


  if (
    !supabaseUrl ||
    !supabaseAnonKey
  ) {
    return null;
  }


  return createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );

}


export async function getStoreSettings(): Promise<StoreSettings> {

  try {

    const supabase =
      createPublicSupabaseClient();


    if (!supabase) {

      console.error(
        "Supabase public environment variables are missing.",
      );

      return fallbackSettings;

    }


    const {
      data,
      error,
    } = await supabase
      .from("store_settings")
      .select(
        `
          id,
          store_name,
          tagline,
          store_email,
          whatsapp,
          instagram,
          tiktok,
          announcement,
          announcement_enabled,
          footer_text
        `,
      )
      .eq("id", 1)
      .maybeSingle();


    if (error) {

      console.error(
        "Failed to load store settings:",
        error,
      );

      return fallbackSettings;

    }


    if (!data) {

      return fallbackSettings;

    }


    return mapStoreSettings(
      data as StoreSettingsRow,
    );

  } catch (error) {

    console.error(
      "Unexpected error loading store settings:",
      error,
    );

    return fallbackSettings;

  }

}