import type { Locale } from "./types";

export interface MailDict {
  title: string;
  intro: string;
  connect: string;
  connecting: string;
  connected: string;
  disconnect: string;
  notConnected: string;
  noMessages: string;
  noEmail: string;
  loading: string;
  incoming: string;
  outgoing: string;
  reply: string;
  newMail: string;
  subject: string;
  message: string;
  send: string;
  sending: string;
  sent: string;
  failed: string;
  popupBlocked: string;
  gmailSettings: string;
  gmailSettingsIntro: string;
}

const nl: MailDict = {
  title: "Mailopvolging",
  intro: "Alle e-mails met deze klant, uit je gekoppelde werkmailbox.",
  connect: "Gmail koppelen",
  connecting: "Koppelen…",
  connected: "Gekoppeld",
  disconnect: "Koppeling verbreken",
  notConnected: "Koppel je werkmailbox om e-mails hier te zien en te versturen.",
  noMessages: "Nog geen e-mails met dit adres.",
  noEmail: "Deze klant heeft geen e-mailadres.",
  loading: "E-mails laden…",
  incoming: "Ontvangen",
  outgoing: "Verzonden",
  reply: "Antwoorden",
  newMail: "Nieuwe e-mail",
  subject: "Onderwerp",
  message: "Bericht",
  send: "Versturen",
  sending: "Versturen…",
  sent: "E-mail verzonden.",
  failed: "Versturen mislukt.",
  popupBlocked: "Sta pop-ups toe om de koppeling af te ronden.",
  gmailSettings: "Werkmailbox (Gmail)",
  gmailSettingsIntro: "Elke medewerker koppelt zijn eigen werkmailbox aan het CRM.",
};

const fr: MailDict = {
  title: "Suivi des e-mails",
  intro: "Tous les e-mails avec ce client, depuis votre boîte professionnelle liée.",
  connect: "Connecter Gmail",
  connecting: "Connexion…",
  connected: "Connecté",
  disconnect: "Déconnecter",
  notConnected: "Connectez votre boîte professionnelle pour voir et envoyer des e-mails ici.",
  noMessages: "Aucun e-mail avec cette adresse pour l'instant.",
  noEmail: "Ce client n'a pas d'adresse e-mail.",
  loading: "Chargement des e-mails…",
  incoming: "Reçu",
  outgoing: "Envoyé",
  reply: "Répondre",
  newMail: "Nouvel e-mail",
  subject: "Objet",
  message: "Message",
  send: "Envoyer",
  sending: "Envoi…",
  sent: "E-mail envoyé.",
  failed: "Échec de l'envoi.",
  popupBlocked: "Autorisez les pop-ups pour terminer la connexion.",
  gmailSettings: "Boîte professionnelle (Gmail)",
  gmailSettingsIntro: "Chaque collaborateur connecte sa propre boîte professionnelle au CRM.",
};

const en: MailDict = {
  title: "Email follow-up",
  intro: "All email with this client, from your linked work mailbox.",
  connect: "Connect Gmail",
  connecting: "Connecting…",
  connected: "Connected",
  disconnect: "Disconnect",
  notConnected: "Connect your work mailbox to see and send email here.",
  noMessages: "No email with this address yet.",
  noEmail: "This client has no email address.",
  loading: "Loading email…",
  incoming: "Received",
  outgoing: "Sent",
  reply: "Reply",
  newMail: "New email",
  subject: "Subject",
  message: "Message",
  send: "Send",
  sending: "Sending…",
  sent: "Email sent.",
  failed: "Sending failed.",
  popupBlocked: "Allow pop-ups to finish connecting.",
  gmailSettings: "Work mailbox (Gmail)",
  gmailSettingsIntro: "Every team member links their own work mailbox to the CRM.",
};

export const mailDictionaries: Record<Locale, MailDict> = { nl, fr, en };
