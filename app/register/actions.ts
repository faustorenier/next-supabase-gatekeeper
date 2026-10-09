"use server";

import { createClient } from "@/lib/supabase/server";

type RegisterFields = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type RegisterState = {
  error?: string;
  success?: boolean;
  fields?: RegisterFields;
};

export async function register(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const fields: RegisterFields = {
    firstName: String(formData.get("firstName") ?? "").trim(),
    lastName: String(formData.get("lastName") ?? "").trim(),
    email: String(formData.get("email") ?? "")
      .trim()
      .toLowerCase(),
    phone: String(formData.get("phone") ?? "").trim(),
  };

  const password = String(formData.get("password") ?? "");

  if (Object.values(fields).some((value) => !value)) {
    return { error: "Compila tutti i campi.", fields };
  }

  if (password.length < 8) {
    return { error: "La password deve avere almeno 8 caratteri.", fields };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: fields.email,
    password,
    options: {
      data: {
        first_name: fields.firstName,
        last_name: fields.lastName,
        phone: fields.phone,
      },
    },
  });

  if (error) {
    return { error: error.message, fields };
  }

  // With email confirmation off, signUp opens a session: close it until an admin approves.
  await supabase.auth.signOut();

  return { success: true };
}
