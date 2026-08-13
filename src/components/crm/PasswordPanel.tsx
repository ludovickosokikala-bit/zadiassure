import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, Panel } from "@/components/crm/ui";
import { useLanguage } from "@/i18n";
import { accountDictionaries } from "@/i18n/account";
import { supabase } from "@/integrations/supabase/client";

export function useAccountDict() {
  const { locale } = useLanguage();
  return accountDictionaries[locale];
}

export function PasswordPanel() {
  const a = useAccountDict();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return toast.error(a.passwordTooShort);
    if (pw !== pw2) return toast.error(a.passwordMismatch);
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return toast.error(a.failed);
    setPw("");
    setPw2("");
    toast.success(a.passwordChanged);
  }

  return (
    <Panel title={a.passwordTitle}>
      <form className="space-y-4" onSubmit={submit}>
        <p className="text-sm text-muted-foreground">{a.passwordIntro}</p>
        <Field label={a.newPassword}>
          <Input
            type="password"
            autoComplete="new-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
        </Field>
        <Field label={a.repeatPassword}>
          <Input
            type="password"
            autoComplete="new-password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
          />
        </Field>
        <Button type="submit" disabled={busy}>
          {busy ? a.saving : a.changePassword}
        </Button>
      </form>
    </Panel>
  );
}
