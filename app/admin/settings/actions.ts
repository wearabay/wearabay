"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/admin";


export type SaveSettingsState = {
  success: boolean;
  message: string;
};


export async function saveStoreSettings(
  _previousState: SaveSettingsState,
  formData: FormData,
): Promise<SaveSettingsState> {

  const admin = await getAdminUser();

  if (!admin) {

    return {
      success: false,
      message: "Unauthorized.",
    };

  }


  const storeName =
    String(formData.get("storeName") ?? "").trim();

  const tagline =
    String(formData.get("tagline") ?? "").trim();

  const storeEmail =
    String(formData.get("storeEmail") ?? "").trim();

  const whatsapp =
    String(formData.get("whatsapp") ?? "").trim();

  const instagram =
    String(formData.get("instagram") ?? "").trim();

  const tiktok =
    String(formData.get("tiktok") ?? "").trim();

  const announcement =
    String(formData.get("announcement") ?? "").trim();

  const announcementEnabled =
    formData.get("announcementEnabled") === "on";

  const footerText =
    String(formData.get("footerText") ?? "").trim();


  if (!storeName) {

    return {
      success: false,
      message: "Store name is required.",
    };

  }


  if (!storeEmail) {

    return {
      success: false,
      message: "Store email is required.",
    };

  }


  const supabase =
    await createClient();


  const {
    error,
  } = await supabase
    .from("store_settings")
    .update({
      store_name: storeName,
      tagline,
      store_email: storeEmail,
      whatsapp,
      instagram,
      tiktok,
      announcement,
      announcement_enabled: announcementEnabled,
      footer_text: footerText,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);


  if (error) {

    console.error(
      "Failed to update store settings:",
      error,
    );

    return {
      success: false,
      message: "Failed to save settings.",
    };

  }


  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");


  return {
    success: true,
    message: "Settings saved successfully.",
  };

}