import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Accedi" };

type LoginPageProps = {
  searchParams: Promise<{ reason?: string }>;
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-semibold">Accedi</h1>

        <Suspense fallback={null}>
          <ReasonNotice searchParams={searchParams} />
        </Suspense>

        <LoginForm />
      </div>
    </main>
  );
}

async function ReasonNotice({ searchParams }: LoginPageProps) {
  const { reason } = await searchParams;

  if (reason !== "not-approved") {
    return null;
  }

  return (
    <p
      role="status"
      className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800"
    >
      Il tuo account non è abilitato all&apos;accesso. Contatta un
      amministratore.
    </p>
  );
}
