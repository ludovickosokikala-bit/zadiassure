import { useEffect, useState, type ReactNode } from "react";
import logoLight from "@/assets/zadiassure-mark-transparent.png.asset.json";
import logoDark from "@/assets/zadiassure-mark-dark.png.asset.json";
import "./crm.css";

export type StaffLang = "nl" | "fr";
const KEY = "zadiassure.crm.lang";

export const staffAuthText = {
  nl: {
    title: "Aanmelden",
    intro: "ZADIASSURE CRM — voorbehouden voor het team.",
    email: "E-mailadres",
    password: "Wachtwoord",
    signIn: "Aanmelden",
    working: "Even geduld…",
    google: "Verdergaan met Google",
    or: "of",
    error: "Aanmelden is niet gelukt. Controleer je gegevens.",
    loading: "Laden…",
    inviteTitle: "Uitnodiging aanvaarden",
    inviteText: "Je bent uitgenodigd om lid te worden van het ZADIASSURE-team.",
    inviteAccept: "Uitnodiging aanvaarden",
    inviteAccepted: "Welkom! Je wordt doorgestuurd naar het CRM…",
    inviteWrongEmail: "Deze uitnodiging hoort bij een ander e-mailadres. Meld je aan met het uitgenodigde adres.",
    inviteFailed: "Deze uitnodiging is ongeldig of verlopen. Vraag een nieuwe uitnodiging aan je beheerder.",
  },
  fr: {
    title: "Connexion",
    intro: "ZADIASSURE CRM — réservé à l’équipe.",
    email: "Adresse e-mail",
    password: "Mot de passe",
    signIn: "Se connecter",
    working: "Un instant…",
    google: "Continuer avec Google",
    or: "ou",
    error: "La connexion a échoué. Vérifiez vos données.",
    loading: "Chargement…",
    inviteTitle: "Accepter l’invitation",
    inviteText: "Vous êtes invité(e) à rejoindre l’équipe ZADIASSURE.",
    inviteAccept: "Accepter l’invitation",
    inviteAccepted: "Bienvenue ! Redirection vers le CRM…",
    inviteWrongEmail: "Cette invitation correspond à une autre adresse e-mail. Connectez-vous avec l’adresse invitée.",
    inviteFailed: "Cette invitation est invalide ou expirée. Demandez une nouvelle invitation à votre administrateur.",
  },
} as const;

/** Standalone Apple-style frame for staff sign-in and invitations (Dutch by default). */
export function useStaffLang() {
  const [lang, setLang] = useState<StaffLang>("nl");
  useEffect(() => {
    const stored = window.localStorage.getItem(KEY);
    if (stored === "fr" || stored === "nl") setLang(stored);
  }, []);
  const change = (next: StaffLang) => {
    setLang(next);
    window.localStorage.setItem(KEY, next);
  };
  return [lang, change] as const;
}

export function StaffAuthFrame({
  lang,
  onLang,
  children,
}: {
  lang: StaffLang;
  onLang: (l: StaffLang) => void;
  children: ReactNode;
}) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-color-scheme: dark)");
    setDark(m.matches);
    const on = () => setDark(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return (
    <div className="crm-app crm-auth" data-theme={dark ? "dark" : "light"} lang={lang}>
      <div className="w-full max-w-[400px]">
        <div className="mb-4 flex justify-end">
          <div className="crm-segmented" role="group" aria-label="Taal / Langue">
            {(["nl", "fr"] as const).map((l) => (
              <button key={l} type="button" aria-selected={lang === l} onClick={() => onLang(l)}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="crm-auth-card">
          <img
            src={dark ? logoDark.url : logoLight.url}
            alt="ZADIASSURE"
            width={52}
            height={52}
            className="size-13 object-contain"
          />
          {children}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">ZADIASSURE CRM</p>
      </div>
    </div>
  );
}
