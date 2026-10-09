import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { logout } from "@/app/auth/actions";
import { requireProfile, type Role } from "@/lib/auth";

export const metadata: Metadata = { title: "Dashboard" };

const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

const SAMPLE_CONTENT = ["Project guidelines", "Q4 roadmap", "Release notes"];

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium"
          >
            Esci
          </button>
        </form>
      </header>

      <Suspense
        fallback={<p className="text-sm text-zinc-500">Caricamento…</p>}
      >
        <DashboardContent />
      </Suspense>
    </main>
  );
}

async function DashboardContent() {
  const profile = await requireProfile();
  const canEdit = profile.role === "admin" || profile.role === "editor";

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <p className="text-lg">
          Ciao,{" "}
          <strong>
            {profile.first_name} {profile.last_name}
          </strong>
        </p>
        <p className="mt-1 text-sm text-zinc-600">
          Ruolo:{" "}
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-medium text-zinc-900">
            {ROLE_LABELS[profile.role]}
          </span>
        </p>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 font-semibold">Contenuti</h2>
        <ul className="divide-y divide-zinc-100">
          {SAMPLE_CONTENT.map((title) => (
            <li
              key={title}
              className="flex items-center justify-between py-2 text-sm"
            >
              {title}
              {canEdit && (
                <button type="button" className="text-sm font-medium underline">
                  Modifica
                </button>
              )}
            </li>
          ))}
        </ul>
        {!canEdit && (
          <p className="mt-4 text-xs text-zinc-500">
            Hai accesso in sola lettura.
          </p>
        )}
      </section>

      {profile.role === "admin" && (
        <section className="rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="mb-2 font-semibold">Amministrazione</h2>
          <Link href="/admin" className="text-sm font-medium underline">
            Gestisci le richieste di accesso →
          </Link>
        </section>
      )}
    </div>
  );
}
