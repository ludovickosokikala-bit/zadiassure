import type { Locale } from "./types";

export const MANDATE_SCOPES = [
  "administration",
  "mail",
  "authorities",
  "budget",
  "banking",
  "insurance",
  "housing",
  "other",
] as const;
export type MandateScope = (typeof MANDATE_SCOPES)[number];

export const MANDATE_STATUSES = [
  "pending_signature",
  "signed",
  "active",
  "revoked",
  "expired",
] as const;
export type MandateStatus = (typeof MANDATE_STATUSES)[number];

export interface MandateDict {
  scopes: Record<MandateScope, string>;
  statuses: Record<MandateStatus, string>;
  crm: {
    title: string;
    intro: string;
    newMandate: string;
    editMandate: string;
    client: string;
    holder: string;
    holderHint: string;
    scope: string;
    purpose: string;
    startsOn: string;
    endsOn: string;
    status: string;
    notes: string;
    signedBy: string;
    signedAt: string;
    signature: string;
    fromWebsite: string;
    applicant: string;
    activate: string;
    revoke: string;
    empty: string;
    expiringSoon: string;
    noClient: string;
    linkClient: string;
    linkClientDone: string;
    save: string;
    cancel: string;
    delete: string;
  };
  team: {
    title: string;
    intro: string;
    invite: string;
    inviteTitle: string;
    email: string;
    fullName: string;
    role: string;
    send: string;
    pending: string;
    noPending: string;
    copyLink: string;
    copied: string;
    revoke: string;
    inviteHint: string;
    expires: string;
    members: string;
    changeRole: string;
    deactivate: string;
    activate: string;
    inactive: string;
    onlyAdmins: string;
    acceptTitle: string;
    acceptText: string;
    acceptButton: string;
    accepted: string;
    acceptFailed: string;
    wrongEmail: string;
    mailTitle: string;
    mailHint: string;
    mailSubjectLabel: string;
    mailBodyLabel: string;
    copyMail: string;
    mailSubject: string;
    mailBody: string;
  };
  page: {
    eyebrow: string;
    title: string;
    text: string;
    who: string;
    whoText: string;
    formTitle: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    birthDate: string;
    scopeTitle: string;
    scopeHint: string;
    purpose: string;
    period: string;
    startsOn: string;
    endsOn: string;
    signatureTitle: string;
    signatureHint: string;
    clear: string;
    signedName: string;
    consent: string;
    submit: string;
    sending: string;
    success: string;
    successText: string;
    error: string;
    required: string;
    legal: string;
  };
}

const nl: MandateDict = {
  scopes: {
    administration: "Algemene administratie",
    mail: "Post en briefwisseling openen",
    authorities: "Contact met overheden en instellingen",
    budget: "Budgetbegeleiding",
    banking: "Bankbrieven en afrekeningen opvolgen (geen toegang tot uw geld, geen betalingen)",
    insurance: "Verzekeringen en mutualiteit",
    housing: "Huisvesting en energie",
    other: "Andere",
  },
  statuses: {
    pending_signature: "Te ondertekenen",
    signed: "Ondertekend — na te kijken",
    active: "Actief",
    revoked: "Ingetrokken",
    expired: "Verlopen",
  },
  crm: {
    title: "Volmachten",
    intro: "Beheer wie welke klant mag vertegenwoordigen, met bevoegdheden en geldigheidsperiode.",
    newMandate: "Nieuwe volmacht",
    editMandate: "Volmacht aanpassen",
    client: "Klant",
    holder: "Volmachthouder",
    holderHint: "De medewerker die de klant mag vertegenwoordigen.",
    scope: "Bevoegdheden",
    purpose: "Voorwerp / toelichting",
    startsOn: "Geldig vanaf",
    endsOn: "Geldig tot",
    status: "Status",
    notes: "Interne nota",
    signedBy: "Ondertekend door",
    signedAt: "Ondertekend op",
    signature: "Handtekening",
    fromWebsite: "Via website",
    applicant: "Aanvrager",
    activate: "Activeren",
    revoke: "Intrekken",
    empty: "Nog geen volmachten.",
    expiringSoon: "Verloopt binnen 30 dagen",
    noClient: "Nog niet aan een klant gekoppeld",
    linkClient: "Klant koppelen",
    linkClientDone: "Klant gekoppeld",
    save: "Opslaan",
    cancel: "Annuleren",
    delete: "Verwijderen",
  },
  team: {
    title: "Medewerkers",
    intro: "Nodig medewerkers uit en bepaal hun rol.",
    invite: "Medewerker uitnodigen",
    inviteTitle: "Nieuwe medewerker",
    email: "E-mailadres",
    fullName: "Naam",
    role: "Rol",
    send: "Uitnodiging aanmaken",
    pending: "Openstaande uitnodigingen",
    noPending: "Geen openstaande uitnodigingen.",
    copyLink: "Link kopiëren",
    copied: "Gekopieerd",
    revoke: "Intrekken",
    inviteHint:
      "Bezorg de link aan je medewerker. Hij maakt een account met dit e-mailadres en krijgt dan meteen toegang.",
    expires: "Geldig tot",
    members: "Team",
    changeRole: "Rol wijzigen",
    deactivate: "Deactiveren",
    activate: "Heractiveren",
    inactive: "Inactief",
    onlyAdmins: "Alleen beheerders kunnen medewerkers beheren.",
    acceptTitle: "Uitnodiging",
    acceptText: "Je bent uitgenodigd om als medewerker toegang te krijgen tot het dossierbeheer.",
    acceptButton: "Uitnodiging aanvaarden",
    accepted: "Je hebt nu toegang. Welkom!",
    acceptFailed: "Deze uitnodiging is niet meer geldig.",
    wrongEmail: "Deze uitnodiging is voor een ander e-mailadres. Meld je aan met dat adres.",
    mailTitle: "Uitnodigingsmail",
    mailHint: "Kopieer deze mail en stuur ze naar je medewerker.",
    mailSubjectLabel: "Onderwerp",
    mailBodyLabel: "Bericht",
    copyMail: "Mail kopiëren",
    mailSubject: "Je toegang tot het ZADIASSURE dossierbeheer",
    mailBody: `Beste {name},

Je bent uitgenodigd om als medewerker ({role}) toegang te krijgen tot het dossierbeheer van ZADIASSURE.

Zo krijg je toegang:
1. Open deze link: {link}
2. Meld je aan (of maak een account) met exact dit e-mailadres: {email}
3. Klik daarna op "Uitnodiging aanvaarden".

Je komt dan automatisch in het dashboard terecht. Later log je gewoon in via {loginUrl}.

Belangrijk: deze uitnodiging is geldig tot {expires}. Deel de link met niemand anders.

Met vriendelijke groeten,
ZADIASSURE`,
  },
  page: {
    eyebrow: "Volmacht",
    title: "Volmacht geven aan ZADIASSURE",
    text: "Met een volmacht mag onze medewerker je administratie opvolgen en je vertegenwoordigen bij instellingen. Je bepaalt zelf welke bevoegdheden en hoe lang.",
    who: "Voor wie?",
    whoText:
      "Particulieren, gezinnen, zelfstandigen en ondernemingen die hun administratie of budgetopvolging willen toevertrouwen aan ZADIASSURE.",
    formTitle: "Volmachtformulier",
    fullName: "Voornaam en naam",
    email: "E-mailadres",
    phone: "Telefoon",
    address: "Adres",
    birthDate: "Geboortedatum",
    scopeTitle: "Waarvoor geef je volmacht?",
    scopeHint: "Kies minstens één bevoegdheid.",
    purpose: "Extra toelichting",
    period: "Geldigheidsperiode",
    startsOn: "Vanaf",
    endsOn: "Tot",
    signatureTitle: "Digitale ondertekening",
    signatureHint: "Teken hieronder met je vinger of muis.",
    clear: "Wissen",
    signedName: "Naam ter ondertekening",
    consent:
      "Ik verklaar de bovenstaande volmacht vrijwillig te geven en bevestig dat mijn gegevens correct zijn.",
    submit: "Volmacht ondertekenen en versturen",
    sending: "Versturen…",
    success: "Bedankt, je volmacht is verstuurd.",
    successText: "Wij nemen contact op om de volmacht te bevestigen en te activeren.",
    error: "Er ging iets mis. Probeer opnieuw of neem contact op.",
    required: "Vul de verplichte velden in en onderteken.",
    legal:
      "Deze volmacht is een begeleidingsvolmacht: ZADIASSURE voert geen betalingen uit, beheert geen geld en vervangt geen advocaat of notaris. De cliënt behoudt zelf de controle over zijn bankrekening en blijft verantwoordelijk voor zijn financiële beslissingen en betalingen. Je kan de volmacht op elk moment intrekken.",
  },
};

const fr: MandateDict = {
  scopes: {
    administration: "Administration générale",
    mail: "Ouvrir le courrier",
    authorities: "Contacts avec les administrations et institutions",
    budget: "Accompagnement budgétaire",
    banking: "Suivi des courriers et décomptes bancaires (sans accès à votre argent, sans paiements)",
    insurance: "Assurances et mutualité",
    housing: "Logement et énergie",
    other: "Autre",
  },
  statuses: {
    pending_signature: "À signer",
    signed: "Signé — à vérifier",
    active: "Active",
    revoked: "Révoquée",
    expired: "Expirée",
  },
  crm: {
    title: "Mandats",
    intro: "Gérez qui peut représenter quel client, avec les pouvoirs et la période de validité.",
    newMandate: "Nouveau mandat",
    editMandate: "Modifier le mandat",
    client: "Client",
    holder: "Mandataire",
    holderHint: "Le collaborateur autorisé à représenter le client.",
    scope: "Pouvoirs",
    purpose: "Objet / précisions",
    startsOn: "Valable à partir du",
    endsOn: "Valable jusqu'au",
    status: "Statut",
    notes: "Note interne",
    signedBy: "Signé par",
    signedAt: "Signé le",
    signature: "Signature",
    fromWebsite: "Via le site",
    applicant: "Demandeur",
    activate: "Activer",
    revoke: "Révoquer",
    empty: "Aucun mandat pour le moment.",
    expiringSoon: "Expire dans 30 jours",
    noClient: "Pas encore lié à un client",
    linkClient: "Lier un client",
    linkClientDone: "Client lié",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
  },
  team: {
    title: "Collaborateurs",
    intro: "Invitez des collaborateurs et définissez leur rôle.",
    invite: "Inviter un collaborateur",
    inviteTitle: "Nouveau collaborateur",
    email: "Adresse e-mail",
    fullName: "Nom",
    role: "Rôle",
    send: "Créer l'invitation",
    pending: "Invitations en attente",
    noPending: "Aucune invitation en attente.",
    copyLink: "Copier le lien",
    copied: "Copié",
    revoke: "Révoquer",
    inviteHint:
      "Transmettez le lien à votre collaborateur. Il crée un compte avec cette adresse e-mail et obtient l'accès.",
    expires: "Valable jusqu'au",
    members: "Équipe",
    changeRole: "Modifier le rôle",
    deactivate: "Désactiver",
    activate: "Réactiver",
    inactive: "Inactif",
    onlyAdmins: "Seuls les administrateurs peuvent gérer les collaborateurs.",
    acceptTitle: "Invitation",
    acceptText: "Vous êtes invité à accéder à la gestion des dossiers en tant que collaborateur.",
    acceptButton: "Accepter l'invitation",
    accepted: "Vous avez désormais accès. Bienvenue !",
    acceptFailed: "Cette invitation n'est plus valable.",
    wrongEmail: "Cette invitation concerne une autre adresse e-mail. Connectez-vous avec celle-ci.",
    mailTitle: "E-mail d'invitation",
    mailHint: "Copiez cet e-mail et envoyez-le à votre collaborateur.",
    mailSubjectLabel: "Objet",
    mailBodyLabel: "Message",
    copyMail: "Copier l'e-mail",
    mailSubject: "Votre accès à la gestion de dossiers ZADIASSURE",
    mailBody: `Bonjour {name},

Vous êtes invité(e) à accéder à la gestion de dossiers de ZADIASSURE en tant que collaborateur ({role}).

Comment accéder :
1. Ouvrez ce lien : {link}
2. Connectez-vous (ou créez un compte) avec exactement cette adresse e-mail : {email}
3. Cliquez ensuite sur « Accepter l'invitation ».

Vous arriverez directement dans le tableau de bord. Par la suite, connectez-vous simplement via {loginUrl}.

Important : cette invitation est valable jusqu'au {expires}. Ne partagez ce lien avec personne.

Cordialement,
ZADIASSURE`,
  },
  page: {
    eyebrow: "Mandat",
    title: "Donner mandat à ZADIASSURE",
    text: "Avec un mandat, notre collaborateur peut suivre votre administration et vous représenter auprès des institutions. Vous choisissez les pouvoirs et la durée.",
    who: "Pour qui ?",
    whoText:
      "Particuliers, familles, indépendants et entreprises qui souhaitent confier leur administration ou leur suivi budgétaire à ZADIASSURE.",
    formTitle: "Formulaire de mandat",
    fullName: "Prénom et nom",
    email: "Adresse e-mail",
    phone: "Téléphone",
    address: "Adresse",
    birthDate: "Date de naissance",
    scopeTitle: "Pour quoi donnez-vous mandat ?",
    scopeHint: "Choisissez au moins un pouvoir.",
    purpose: "Précisions supplémentaires",
    period: "Période de validité",
    startsOn: "Du",
    endsOn: "Au",
    signatureTitle: "Signature électronique",
    signatureHint: "Signez ci-dessous avec le doigt ou la souris.",
    clear: "Effacer",
    signedName: "Nom du signataire",
    consent:
      "Je déclare donner ce mandat volontairement et confirme l'exactitude de mes données.",
    submit: "Signer et envoyer le mandat",
    sending: "Envoi…",
    success: "Merci, votre mandat a été envoyé.",
    successText: "Nous vous contactons pour confirmer et activer le mandat.",
    error: "Une erreur est survenue. Réessayez ou contactez-nous.",
    required: "Complétez les champs obligatoires et signez.",
    legal:
      "Ce mandat est un mandat d'accompagnement : ZADIASSURE n'effectue pas de paiements, ne gère pas votre argent et ne remplace ni avocat ni notaire. Le client conserve le contrôle de son compte bancaire et reste responsable de ses décisions financières et de ses paiements. Vous pouvez le révoquer à tout moment.",
  },
};

const en: MandateDict = {
  scopes: {
    administration: "General administration",
    mail: "Opening mail and correspondence",
    authorities: "Contact with authorities and institutions",
    budget: "Budget guidance",
    banking: "Follow-up of bank letters and statements (no access to your money, no payments)",
    insurance: "Insurance and health fund",
    housing: "Housing and energy",
    other: "Other",
  },
  statuses: {
    pending_signature: "To be signed",
    signed: "Signed — to review",
    active: "Active",
    revoked: "Revoked",
    expired: "Expired",
  },
  crm: {
    title: "Mandates",
    intro: "Manage who may represent which client, with powers and validity period.",
    newMandate: "New mandate",
    editMandate: "Edit mandate",
    client: "Client",
    holder: "Mandate holder",
    holderHint: "The team member allowed to represent the client.",
    scope: "Powers",
    purpose: "Subject / details",
    startsOn: "Valid from",
    endsOn: "Valid until",
    status: "Status",
    notes: "Internal note",
    signedBy: "Signed by",
    signedAt: "Signed on",
    signature: "Signature",
    fromWebsite: "Via website",
    applicant: "Applicant",
    activate: "Activate",
    revoke: "Revoke",
    empty: "No mandates yet.",
    expiringSoon: "Expires within 30 days",
    noClient: "Not linked to a client yet",
    linkClient: "Link client",
    linkClientDone: "Client linked",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
  },
  team: {
    title: "Team members",
    intro: "Invite team members and set their role.",
    invite: "Invite team member",
    inviteTitle: "New team member",
    email: "Email address",
    fullName: "Name",
    role: "Role",
    send: "Create invitation",
    pending: "Pending invitations",
    noPending: "No pending invitations.",
    copyLink: "Copy link",
    copied: "Copied",
    revoke: "Revoke",
    inviteHint:
      "Send the link to your team member. They create an account with this email address and get access.",
    expires: "Valid until",
    members: "Team",
    changeRole: "Change role",
    deactivate: "Deactivate",
    activate: "Reactivate",
    inactive: "Inactive",
    onlyAdmins: "Only administrators can manage team members.",
    acceptTitle: "Invitation",
    acceptText: "You have been invited to access case management as a team member.",
    acceptButton: "Accept invitation",
    accepted: "You now have access. Welcome!",
    acceptFailed: "This invitation is no longer valid.",
    wrongEmail: "This invitation is for another email address. Sign in with that address.",
    mailTitle: "Invitation email",
    mailHint: "Copy this email and send it to your team member.",
    mailSubjectLabel: "Subject",
    mailBodyLabel: "Message",
    copyMail: "Copy email",
    mailSubject: "Your access to the ZADIASSURE case management",
    mailBody: `Hello {name},

You have been invited to access the ZADIASSURE case management as a team member ({role}).

How to get access:
1. Open this link: {link}
2. Sign in (or create an account) with exactly this email address: {email}
3. Then click "Accept invitation".

You will land straight in the dashboard. Afterwards you simply sign in via {loginUrl}.

Important: this invitation is valid until {expires}. Do not share the link with anyone else.

Kind regards,
ZADIASSURE`,
  },
  page: {
    eyebrow: "Mandate",
    title: "Give a mandate to ZADIASSURE",
    text: "With a mandate our team member can follow up your administration and represent you with institutions. You decide which powers and for how long.",
    who: "Who is it for?",
    whoText:
      "Individuals, families, self-employed people and companies who want to entrust their administration or budget follow-up to ZADIASSURE.",
    formTitle: "Mandate form",
    fullName: "First and last name",
    email: "Email address",
    phone: "Phone",
    address: "Address",
    birthDate: "Date of birth",
    scopeTitle: "What do you give a mandate for?",
    scopeHint: "Choose at least one power.",
    purpose: "Additional details",
    period: "Validity period",
    startsOn: "From",
    endsOn: "Until",
    signatureTitle: "Digital signature",
    signatureHint: "Sign below with your finger or mouse.",
    clear: "Clear",
    signedName: "Name of the signatory",
    consent:
      "I declare that I give this mandate voluntarily and confirm that my details are correct.",
    submit: "Sign and send mandate",
    sending: "Sending…",
    success: "Thank you, your mandate has been sent.",
    successText: "We will contact you to confirm and activate the mandate.",
    error: "Something went wrong. Please try again or contact us.",
    required: "Please complete the required fields and sign.",
    legal:
      "This is a guidance mandate: ZADIASSURE does not make payments, does not manage your money and does not replace a lawyer or notary. The client keeps control of their bank account and remains responsible for their financial decisions and payments. You can revoke the mandate at any time.",
  },
};

export const mandateDictionaries: Record<Locale, MandateDict> = { nl, fr, en };
