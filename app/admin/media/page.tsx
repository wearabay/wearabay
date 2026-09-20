import { notFound, redirect } from "next/navigation";

import { getAdminUser } from "@/lib/admin";
import { getAdminMediaLibrary } from "@/lib/admin-media";

import MediaLibrary from "./MediaLibrary";

export default async function AdminMediaPage() {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/login");
  }

  let media;

  try {
    media = await getAdminMediaLibrary();
  } catch {
    notFound();
  }

  return <MediaLibrary media={media} />;
}