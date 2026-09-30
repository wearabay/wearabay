import { createClient } from "@/lib/supabase/server";

export type AdminRole =
  | "admin"
  | "super_admin";

export function isAdminRole(
  role: string | null | undefined,
): role is AdminRole {
  return (
    role === "admin" ||
    role === "super_admin"
  );
}

export function isSuperAdminRole(
  role: string | null | undefined,
): boolean {
  return role === "super_admin";
}

export async function getAdminUser() {
  const supabase = await createClient();

  const {
    data: {
      user,
    },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return null;
  }

  if (!isAdminRole(profile.role)) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profile.full_name ?? "",
    role: profile.role,
  };
}