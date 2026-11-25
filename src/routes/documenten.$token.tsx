import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Upload } from "lucide-react";
import { getUploadRequest } from "@/lib/uploadRequest.functions";

export const Route = createFileRoute("/documenten/$token")({
  loader: ({ params }) => getUploadRequest({ data: { token: params.token } }),
  head: () => ({ meta: [{ title: "Documenten opladen — ZADIASSURE" }, { name: "robots", content: "noindex, nofollow" }] }),
  errorComponent: () => <p className="p-10 text-center">Er ging iets mis. / Une erreur est survenue.</p>,
  notFoundComponent: () => <p className="p-10 text-center">Niet gevonden. / Introuvable.</p>,
  component: Page,
});

const T = {
  nl: { title: "Documenten opladen", intro: "Laad hieronder de gevraagde documenten op. Toegestaan: pdf, jpg, png, heic – max. 20 MB per bestand.", received: "Ontvangen", choose: "Bestand kiezen", busy: "Bezig met opladen…", done: "Bedankt! Wij hebben alle documenten ontvangen.", expired: "Deze link is verlopen. Neem contact op met ZADIASSURE.", invalid: "Deze link is ongeldig.", error: "Opladen mislukt. Controleer het bestandstype en de grootte en probeer opnieuw.", rate: "Te veel pogingen. Probeer het over enkele minuten opnieuw." },
  fr: { title: "Envoyer vos documents", intro: "Envoyez ci-dessous les documents demandés. Autorisés : pdf, jpg, png, heic – max. 20 Mo par fichier.", received: "Reçu", choose: "Choisir un fichier", busy: "Envoi en cours…", done: "Merci ! Nous avons reçu tous les documents.", expired: "Ce lien a expiré. Veuillez contacter ZADIASSURE.", invalid: "Ce lien n'est pas valide.", error: "L'envoi a échoué. Vérifiez le type et la taille du fichier et réessayez.", rate: "Trop de tentatives. Réessayez dans quelques minutes." },
};

function Page() {
  const initial = Route.useLoaderData();
  const { token } = Route.useParams();
  const [view, setView] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const t = T[view?.language === "fr" ? "fr" : "nl"];
  async function upload(itemId: string, file: File) {
    setBusy(itemId);
    setError("");
    const body = new FormData();
    body.set("item", itemId);
    body.set("file", file);
    try {
      const res = await fetch(`/api/public/upload/${encodeURIComponent(token)}`, { method: "POST", body });
      if (res.status === 429) setError(t.rate);
      else if (!res.ok) setError(t.error);
      else setView(await res.json());
    } catch {
      setError(t.error);
    } finally {
      setBusy(null);
    }
  }
  return (
    <main className="mx-auto max-w-xl px-5 py-16">
      <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
        <h1 className="font-display text-2xl font-bold">{t.title}</h1>
        {!view ? (
          <p className="mt-4">{T.nl.invalid} / {T.fr.invalid}</p>
        ) : view.status === "expired" ? (
          <p className="mt-4">{t.expired}</p>
        ) : (
          <>
            <p className="mt-3 text-muted-foreground">{view.status === "complete" ? t.done : t.intro}</p>
            <ul className="mt-6 divide-y divide-border">
              {view.items.map((i) => (
                <li key={i.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-4">
                  <span className="min-w-0 font-medium">{i.label}</span>
                  {i.received ? (
                    <span className="inline-flex items-center gap-1 text-sm text-green-700"><CheckCircle2 className="size-4" />{t.received}</span>
                  ) : view.status !== "complete" ? (
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
                      <Upload className="size-4" />
                      {busy === i.id ? t.busy : t.choose}
                      <input type="file" className="sr-only" disabled={!!busy} accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,application/pdf,image/jpeg,image/png,image/heic" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(i.id, f); e.target.value = ""; }} />
                    </label>
                  ) : null}
                </li>
              ))}
            </ul>
            {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
          </>
        )}
      </div>
    </main>
  );
}
