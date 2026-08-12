import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoMark } from "@/components/brand/Logo";
import { ctaVariants } from "@/components/ui/cta";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { libraryDictionaries } from "@/i18n/library";
import { useLib } from "@/i18n/useLibrary";
import { cn } from "@/lib/utils";

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
  const lib = useLib();
  const a = lib.auth;
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
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
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/crm` },
        });
        if (signUpError) throw signUpError;
        setMessage(a.checkEmail);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch {
      setError(a.error);
    } finally {
      setState("idle");
    }
  };

  const onGoogle = async () => {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) setError(a.error);
  };

  return (
    <section className="bg-sand py-20">
      <div className="container-page">
        <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-8 shadow-soft">
          <LogoMark className="size-12" />
          <h1 className="mt-6 text-2xl font-bold text-primary">{a.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{a.intro}</p>

          <form onSubmit={onSubmit} className="mt-7 grid gap-4" noValidate>
            <div>
              <Label className="mb-1.5 block text-sm font-semibold text-primary">{a.email}</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                maxLength={255}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-semibold text-primary">{a.password}</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
                minLength={8}
                maxLength={72}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {message && <p className="text-sm text-primary">{message}</p>}
            <button
              type="submit"
              disabled={state === "busy"}
              className={cn(ctaVariants({ size: "lg" }), "w-full")}
            >
              {state === "busy" && <Loader2 className="size-4 animate-spin" />}
              {state === "busy" ? a.working : mode === "signup" ? a.signUp : a.signIn}
            </button>
          </form>

          <button
            type="button"
            onClick={onGoogle}
            className={cn(ctaVariants({ variant: "outline", size: "lg" }), "mt-3 w-full")}
          >
            {a.google}
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-5 w-full text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            {mode === "signin" ? a.toggleToSignUp : a.toggleToSignIn}
          </button>
        </div>
      </div>
    </section>
  );
}
