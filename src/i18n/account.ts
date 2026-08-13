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
  copyCredentials: "Instructiemail kopiëren",
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
  copyCredentials: "Copier l'e-mail d'instructions",
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
  mailSubject: "Votre compte CRM ZADIASSURE — instructions de démarrage",
  mailBody:
    "Bonjour {name},\n\nVotre compte pour le CRM ZADIASSURE est prêt. Vous trouverez ci-dessous toutes les informations pour démarrer.\n\n1. CONNEXION\n   URL : {loginUrl}\n   E-mail : {email}\n   Mot de passe temporaire : {password}\n\n2. CHANGER LE MOT DE PASSE\n   Après votre première connexion, allez dans CRM › Paramètres › Mot de passe et choisissez un mot de passe sécurisé.\n\n3. CONNECTER VOTRE BOÎTE PROFESSIONNELLE (Gmail)\n   Allez dans CRM › Paramètres › Boîte mail professionnelle et cliquez sur \"Connecter Gmail\".\n   Les e-mails entrants et sortants seront ainsi enregistrés dans les dossiers clients.\n   Important : utilisez votre adresse professionnelle ZADIASSURE.\n\n4. AGENDA & TÂCHES\n   Dans CRM › Agenda, vous voyez rendez-vous et tâches. Vous y trouverez un lien ICS personnel pour synchroniser votre agenda Google ou Outlook.\n   Les tâches auxquelles vous ajoutez une date et une heure apparaissent automatiquement comme un bloc de temps dans cet agenda.\n\n5. TRAVAILLER AVEC LES DOSSIERS\n   - Tableau de bord : aperçu des priorités du jour.\n   - Clients : gérez les coordonnées et appelez ou envoyez un WhatsApp depuis la fiche client.\n   - Dossiers : suivez le statut, les tâches, les documents et les notes par client.\n   - Documents : demandez et recevez documents d'identité, procurations et formulaires.\n\n6. APPLICATION MOBILE\n   Ouvrez {origin} sur votre téléphone et choisissez \"Ajouter à l'écran d'accueil\" (iOS/Android). Le CRM fonctionne alors comme une application, avec notifications.\n\n7. ACCÈS EMPLOYÉS\n   Sur le site public, un lien discret \"Employés\" en bas de page permet d'accéder rapidement à l'écran de connexion.\n\nDes questions ? Envoyez un e-mail à info@zadiassure.be.\n\nBienvenue à bord,\nZADIASSURE",
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
  mailSubject: "Your ZADIASSURE CRM account — getting started",
  mailBody:
    "Hello {name},\n\nYour ZADIASSURE CRM account is ready. Below you will find everything you need to get started.\n\n1. SIGN IN\n   URL: {loginUrl}\n   Email: {email}\n   Temporary password: {password}\n\n2. CHANGE YOUR PASSWORD\n   After signing in for the first time, go to CRM › Settings › Password and choose your own secure password.\n\n3. CONNECT YOUR WORK MAILBOX (Gmail)\n   Go to CRM › Settings › Work mailbox and click \"Connect Gmail\".\n   Incoming and outgoing emails will then be logged against client cases.\n   Important: use your ZADIASSURE work email address for this.\n\n4. CALENDAR & TASKS\n   In CRM › Agenda you see appointments and tasks. You will find a personal ICS link there to sync your own Google or Outlook calendar.\n   Tasks that you give both a date and a time automatically appear as a time block in that calendar.\n\n5. WORKING WITH CASES\n   - Dashboard: overview of what needs attention today.\n   - Clients: manage contact details and call or WhatsApp directly from a client record.\n   - Cases: track status, tasks, documents and notes per client.\n   - Documents: request and receive ID documents, mandates and forms.\n\n6. MOBILE APP\n   Open {origin} on your phone and choose \"Add to Home Screen\" (iOS/Android). The CRM website then works like an app, including notifications.\n\n7. STAFF ACCESS\n   On the public website there is a subtle \"Staff\" link at the bottom to quickly reach the sign-in screen.\n\nQuestions? Email info@zadiassure.be.\n\nWelcome aboard,\nZADIASSURE",
};

export const accountDictionaries: Record<Locale, AccountDict> = { nl, fr, en };
