"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormField } from "@/components/form-field";
import { register, type RegisterState } from "./actions";

const initialState: RegisterState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, initialState);

  if (state.success) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">Richiesta inviata</h2>
        <p className="text-sm text-zinc-600">
          Un amministratore deve approvare il tuo account prima che tu possa
          accedere.
        </p>
        <Link href="/login" className="text-sm font-medium underline">
          Vai al login
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Nome"
          name="firstName"
          autoComplete="given-name"
          defaultValue={state.fields?.firstName}
        />
        <FormField
          label="Cognome"
          name="lastName"
          autoComplete="family-name"
          defaultValue={state.fields?.lastName}
        />
      </div>
      <FormField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={state.fields?.email}
      />
      <FormField
        label="Telefono"
        name="phone"
        type="tel"
        autoComplete="tel"
        defaultValue={state.fields?.phone}
      />
      <FormField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
      />

      {state.error && (
        <p
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Invio in corso…" : "Richiedi accesso"}
      </button>

      <p className="text-center text-sm text-zinc-600">
        Hai già un account?{" "}
        <Link href="/login" className="font-medium underline">
          Accedi
        </Link>
      </p>
    </form>
  );
}
