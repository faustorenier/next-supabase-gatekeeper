import "server-only";
import { connection } from "next/server";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "admin" | "editor" | "viewer";
export type AccountStatus = "pending" | "approved" | "rejected";

export type Profile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: Role | null;
  status: AccountStatus;
};

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  // Supabase checks token expiry with Date.now(), which must not run during prerendering.
  await connection();

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;

  if (!userId) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, phone, role, status")
    .eq("id", userId)
    .maybeSingle<Profile>();

  return profile;
});

export async function requireProfile(allowedRoles?: Role[]) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }
  if (profile.status !== "approved" || !profile.role) {
    redirect("/auth/signout?reason=not-approved");
  }
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    redirect("/dashboard");
  }

  return { ...profile, role: profile.role };
}
