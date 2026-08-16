import { createClient } from "@/lib/supabase/client";

export const MEDIA_BUCKET = "wearabay-media";

/**
 * Folder media yang digunakan aplikasi.
 *
 * `MediaFolder` sengaja berupa string agar uploader tetap fleksibel
 * apabila nanti kita menambahkan folder lain.
 */
export const MEDIA_FOLDERS: Record<string, string> = {
  products: "products",
};

export type MediaFolder = string;

export type ProductMedia = {
  id: number;
  product_id: number;
  type: "image" | "video";
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
};

export function getMediaPublicUrl(
  supabase: ReturnType<typeof createClient>,
  storagePath: string
) {
  const { data } = supabase.storage
    .from(MEDIA_BUCKET)
    .getPublicUrl(storagePath);

  return data.publicUrl;
}

export function getMediaUrl(storagePath: string) {
  const supabase = createClient();

  return getMediaPublicUrl(supabase, storagePath);
}

export async function getProductMedia(productId: number) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("product_media")
    .select(
      `
        id,
        product_id,
        type,
        storage_path,
        alt_text,
        sort_order,
        is_primary
      `
    )
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to load product media: ${error.message}`);
  }

  return (data ?? []) as ProductMedia[];
}
