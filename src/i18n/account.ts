import type { Locale } from "./types";

export interface AccountDict {
  createTitle: string;
  createIntro: string;
  create: string;
  creating: string;
  created: string;
  existed: string;
  defaultPassword: string;
  copyCredentials: string;
  copied: string;
  loginHint: string;
  passwordTitle: string;
  passwordIntro: string;
  newPassword: string;
  repeatPassword: string;
  changePassword: string;
  saving: string;
  passwordChanged: string;
  passwordMismatch: string;
  passwordTooShort: string;
  failed: string;
  mailSubject: string;
  mailBody: string;
}

const nl: AccountDict = {
  createTitle: "Account direct aanmaken",
  createIntro:
    "De medewerker krijgt het standaardwachtwoord Zadiassure123 en kan meteen inloggen. Wijzigen kan daarna via CRM › Instellingen › Wachtwoord.",
  create: "Account aanmaken",
  creating: "Aanmaken…",
  created: "Account aangemaakt met standaardwachtwoord.",
  existed: "Deze persoon had al een account — het bestaande wachtwoord blijft geldig.",
  defaultPassword: "Standaardwachtwoord",
  copyCredentials: "Logingegevens kopiëren",
  copied: "Gekopieerd",
  loginHint: "Aanmelden via /auth met dit e-mailadres en wachtwoord.",
  passwordTitle: "Wachtwoord",
  passwordIntro: "Wijzig hier je eigen wachtwoord (minstens 8 tekens).",
  newPassword: "Nieuw wachtwoord",
  repeatPassword: "Herhaal wachtwoord",
  changePassword: "Wachtwoord wijzigen",
  saving: "Bewaren…",
  passwordChanged: "Wachtwoord gewijzigd.",
  passwordMismatch: "De wachtwoorden zijn niet gelijk.",
  passwordTooShort: "Minstens 8 tekens.",
  failed: "Er ging iets mis.",
  mailSubject: "Je ZADIASSURE CRM-account — startinstructies",
  mailBody:
    "Beste {name},\n\nJe account voor het ZADIASSURE CRM staat klaar. Hieronder vind je alles om direct van start te gaan.\n\n1. AANMELDEN\n   URL: {loginUrl}\n   E-mail: {email}\n   Tijdelijk wachtwoord: {password}\n\n2. WACHTWOORD WIJZIGEN\n   Na je eerste aanmelding ga je naar CRM › Instellingen › Wachtwoord en kies je een eigen, veilig wachtwoord.\n\n3. WERKMAILBOX KOPPELEN (Gmail)\n   Ga naar CRM › Instellingen › Werkmailbox en klik op \"Gmail koppelen\".\n   Zo worden inkomende en uitgaande mails bij klantdossiers gelogd.\n   Belangrijk: gebruik hiervoor je ZADIASSURE-werkmailadres.\n\n4. AGENDA & TAKEN\n   In CRM › Agenda zie je afspraken en taken. Je krijgt er een persoonlijke ICS-link om je eigen Google- of Outlook-agenda te synchroniseren.\n   Taken waar je een datum én uur aan geeft, verschijnen automatisch als tijdsblok in die agenda.\n\n5. WERKEN MET DOSSIERS\n   - Dashboard: overzicht van wat vandaag aandacht vraagt.\n   - Klanten: beheer contactgegevens en bel/of WhatsApp direct vanuit een klantenfiche.\n   - Dossiers: volg status, taken, documenten en notities per cliënt.\n   - Documenten: vraag en ontvang identiteitsdocumenten, volmachten en formulieren.\n\n6. MOBIELE APP\n   Open {origin} op je telefoon en kies \"Toevoegen aan startscherm\" (iOS/Android). De CRM-website werkt dan als app, inclusief meldingen.\n\n7. TOEGANG VOOR MEDEWERKERS\n   Op de publieke website staat onderaan een subtiele \"Medewerkers\"-link om snel naar het aanmeldscherm te gaan.\n\nVragen? Mail naar info@zadiassure.be.\n\nWelkom aan boord,\nZADIASSURE",
};

const fr: AccountDict = {
  createTitle: "Créer un compte directement",
  createIntro:
    "Le collaborateur reçoit le mot de passe par défaut Zadiassure123 et peut se connecter immédiatement. Il peut le changer via CRM › Paramètres › Mot de passe.",
  create: "Créer le compte",
  creating: "Création…",
  created: "Compte créé avec le mot de passe par défaut.",
  existed: "Cette personne avait déjà un compte — son mot de passe actuel reste valable.",
  defaultPassword: "Mot de passe par défaut",
  copyCredentials: "Copier les identifiants",
  copied: "Copié",
  loginHint: "Connexion via /auth avec cette adresse e-mail et ce mot de passe.",
  passwordTitle: "Mot de passe",
  passwordIntro: "Modifiez ici votre propre mot de passe (8 caractères minimum).",
  newPassword: "Nouveau mot de passe",
  repeatPassword: "Répétez le mot de passe",
  changePassword: "Changer le mot de passe",
  saving: "Enregistrement…",
  passwordChanged: "Mot de passe modifié.",
  passwordMismatch: "Les mots de passe ne correspondent pas.",
  passwordTooShort: "8 caractères minimum.",
  failed: "Une erreur est survenue.",
  mailSubject: "Votre compte CRM ZADIASSURE",
  mailBody:
    "Bonjour {name},\n\nVotre compte pour le CRM ZADIASSURE est prêt.\n\nConnexion : {loginUrl}\nE-mail : {email}\nMot de passe temporaire : {password}\n\nChangez votre mot de passe après la première connexion via CRM › Paramètres › Mot de passe.\n\nCordialement,\nZADIASSURE",
};

const en: AccountDict = {
  createTitle: "Create account directly",
  createIntro:
    "The member gets the default password Zadiassure123 and can sign in right away. They can change it under CRM › Settings › Password.",
  create: "Create account",
  creating: "Creating…",
  created: "Account created with the default password.",
  existed: "This person already had an account — their current password stays valid.",
  defaultPassword: "Default password",
  copyCredentials: "Copy credentials",
  copied: "Copied",
  loginHint: "Sign in at /auth with this email address and password.",
  passwordTitle: "Password",
  passwordIntro: "Change your own password here (at least 8 characters).",
  newPassword: "New password",
  repeatPassword: "Repeat password",
  changePassword: "Change password",
  saving: "Saving…",
  passwordChanged: "Password changed.",
  passwordMismatch: "The passwords do not match.",
  passwordTooShort: "At least 8 characters.",
  failed: "Something went wrong.",
  mailSubject: "Your ZADIASSURE CRM account",
  mailBody:
    "Hello {name},\n\nYour ZADIASSURE CRM account is ready.\n\nSign in: {loginUrl}\nEmail: {email}\nTemporary password: {password}\n\nPlease change your password after the first sign-in under CRM › Settings › Password.\n\nKind regards,\nZADIASSURE",
};

export const accountDictionaries: Record<Locale, AccountDict> = { nl, fr, en };
