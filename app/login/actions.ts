"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error?: string;
  email?: string;
};

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Inserisci email e password.", email };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const message =
      error.code === "invalid_credentials"
        ? "Email o password non corretti."
        : error.message;
    return { error: message, email };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", data.user.id)
    .single();

  if (profile?.status !== "approved") {
    await supabase.auth.signOut();
    const message =
      profile?.status === "rejected"
        ? "La tua richiesta di accesso è stata rifiutata."
        : "La tua richiesta è in attesa di approvazione.";
    return { error: message, email };
  }

  redirect("/dashboard");
}
