import { ImmTemplatesSettings } from "./Immigration";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { saveFoundationProfile } from "@/lib/foundation.functions";
import { useFoundation } from "./context";
import { PageTitle, Field } from "./ui";
export function SettingsPage() {
  const { data, c, refresh } = useFoundation();
  const profile = useServerFn(saveFoundationProfile);
  const [name, setName] = useState(data.member?.full_name ?? "");
  const [pw, setPw] = useState("");
  const [repeat, setRepeat] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await profile({ data: { name } });
      await refresh();
      setMessage(c.saved);
    } catch {
      setMessage(c.failed);
    } finally {
      setBusy(false);
    }
  }
  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) {
      setMessage(c.passwordShort);
      return;
    }
    if (pw !== repeat) {
      setMessage(c.passwordMismatch);
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;
      setPw("");
      setRepeat("");
      setMessage(c.passwordDone);
    } catch {
      setMessage(c.failed);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageTitle title={c.settings} />
      <div className="grid max-w-4xl gap-12 md:grid-cols-2">
        <section>
          <h2 className="crm-section-title">{c.profile}</h2>
          <form onSubmit={saveProfile} className="space-y-5">
            <Field label={c.fullName}>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
            <Field label={c.email}>
              <Input value={data.member?.email ?? ""} disabled />
            </Field>
            <p className="text-sm text-muted-foreground">
              {data.member?.foundation_role === "admin" ? c.admin : c.staff}
            </p>
            <Button type="submit" disabled={busy}>
              {busy ? c.saving : c.save}
            </Button>
          </form>
        </section>
        <section>
          <h2 className="crm-section-title">{c.password}</h2>
          <form onSubmit={savePassword} className="space-y-5">
            <Field label={c.passwordNew}>
              <Input
                type="password"
                autoComplete="new-password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                required
                minLength={8}
              />
            </Field>
            <Field label={c.passwordRepeat}>
              <Input
                type="password"
                autoComplete="new-password"
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
                required
                minLength={8}
              />
            </Field>
            <Button type="submit" disabled={busy}>
              {busy ? c.saving : c.passwordChange}
            </Button>
          </form>
        </section>
      </div>
      <ImmTemplatesSettings />
      {message && (
        <p role="status" className="mt-6 text-sm">
          {message}
        </p>
      )}
    </>
  );
}
