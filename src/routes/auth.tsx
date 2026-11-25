import { crmOriginFor } from "@/lib/host-routing";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StaffAuthFrame, staffAuthText, useStaffLang } from "@/components/crm-foundation/StaffAuth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { libraryDictionaries } from "@/i18n/library";

const meta = libraryDictionaries.nl.auth;

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: meta.metaTitle },
      { name: "description", content: meta.metaDescription },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: meta.metaTitle },
      { property: "og:description", content: meta.metaDescription },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [lang, setLang] = useStaffLang();
  const a = staffAuthText[lang];
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "busy">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        // A pending team invitation takes priority over the dashboard.
        const invite = window.sessionStorage.getItem("zadiassure.invite");
        if (invite) {
          window.sessionStorage.removeItem("zadiassure.invite");
          void navigate({ to: "/uitnodiging", search: { token: invite }, replace: true });
          return;
        }
        void navigate({ to: "/crm", replace: true });
      }

    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState("busy");
    setError(null);
    setMessage(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
    } catch {
      setError(a.error);
    } finally {
      setState("idle");
    }
  };

  const onGoogle = async () => {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: crmOriginFor(window.location.origin),
    });
    if (result.error) setError(a.error);
  };

  return (
    <StaffAuthFrame lang={lang} onLang={setLang}>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">{a.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{a.intro}</p>
      <form onSubmit={onSubmit} className="mt-7 grid gap-4" noValidate>
        <div>
          <Label htmlFor="staff-email" className="mb-1.5 block text-sm font-medium">{a.email}</Label>
          <Input
            id="staff-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            maxLength={255}
          />
        </div>
        <div>
          <Label htmlFor="staff-password" className="mb-1.5 block text-sm font-medium">{a.password}</Label>
          <Input
            id="staff-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            minLength={8}
            maxLength={72}
          />
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {message && <p className="text-sm">{message}</p>}
        <Button type="submit" size="lg" disabled={state === "busy"} className="w-full">
          {state === "busy" && <Loader2 className="size-4 animate-spin" />}
          {state === "busy" ? a.working : a.signIn}
        </Button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        {a.or}
        <span className="h-px flex-1 bg-border" />
      </div>
      <Button type="button" variant="outline" size="lg" onClick={onGoogle} className="w-full">
        {a.google}
      </Button>
    </StaffAuthFrame>
  );
}
