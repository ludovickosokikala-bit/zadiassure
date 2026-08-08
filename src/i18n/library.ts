import type { Locale } from "./types";

/**
 * Copy for the legislation library ("Wetgeving") and the request-form library
 * ("Documenten & formulieren"), plus the sign-in and admin surfaces.
 * Kept separate from the main dictionary so the marketing copy stays readable.
 */
export interface LibraryDict {
  themes: Record<"immigration" | "budget" | "business" | "social", string>;
  legislation: {
    nav: string;
    eyebrow: string;
    title: string;
    intro: string;
    metaTitle: string;
    metaDescription: string;
    filterAll: string;
    effective: string;
    empty: string;
    unavailable: string;
    read: string;
    source: string;
    changes: string;
    action: string;
    back: string;
    disclaimer: string;
    relatedForms: string;
  };
  forms: {
    nav: string;
    eyebrow: string;
    title: string;
    intro: string;
    metaTitle: string;
    metaDescription: string;
    filterAll: string;
    authority: string;
    empty: string;
    unavailable: string;
    open: string;
    back: string;
    who: string;
    checklist: string;
    officialLink: string;
    officialNote: string;
    print: string;
    startOnline: string;
    formTitle: string;
    formIntro: string;
    fields: {
      fullName: string;
      email: string;
      phone: string;
      audience: string;
      message: string;
      messagePlaceholder: string;
      consent: string;
      submit: string;
      sending: string;
      required: string;
      invalidEmail: string;
      successTitle: string;
      successText: string;
      failed: string;
      checklistLegend: string;
      haveIt: string;
    };
    audienceOptions: { value: string; label: string }[];
  };
  auth: {
    metaTitle: string;
    metaDescription: string;
    title: string;
    intro: string;
    email: string;
    password: string;
    signIn: string;
    signUp: string;
    google: string;
    toggleToSignUp: string;
    toggleToSignIn: string;
    checkEmail: string;
    error: string;
    working: string;
  };
  admin: {
    title: string;
    intro: string;
    notAdminTitle: string;
    notAdminText: string;
    signOut: string;
    tabs: { legislation: string; forms: string; submissions: string };
    newLegislation: string;
    newForm: string;
    edit: string;
    delete: string;
    save: string;
    saving: string;
    cancel: string;
    published: string;
    draft: string;
    confirmDelete: string;
    saved: string;
    saveFailed: string;
    noSubmissions: string;
    status: string;
    checklistHint: string;
    audiencesHint: string;
    fieldSlug: string;
    fieldTheme: string;
    fieldEffective: string;
    fieldSource: string;
    fieldSourceLabel: string;
    fieldAuthority: string;
    fieldOfficialUrl: string;
    fieldOfficialLabel: string;
    fieldOrder: string;
    labelTitle: string;
    labelSummary: string;
    labelChanges: string;
    labelAction: string;
    labelDescription: string;
    labelWho: string;
    labelChecklist: string;
  };
}

const nl: LibraryDict = {
  themes: {
    immigration: "Verblijf & immigratie",
    budget: "Budget & schulden",
    business: "Zelfstandigen & ondernemingen",
    social: "Sociale rechten & gezin",
  },
  legislation: {
    nav: "Wetgeving",
    eyebrow: "Wetgeving & updates",
    title: "Wat verandert er, en wat betekent dat voor u?",
    intro:
      "Wij volgen de wijzigingen in de Belgische regelgeving die onze doelgroepen raken en zetten ze om in klare taal: wat verandert er, en welke stap zet u vandaag.",
    metaTitle: "Wetgeving & updates — ZADIASSURE",
    metaDescription:
      "Overzicht van wijzigingen in de Belgische regelgeving rond verblijf, budget, zelfstandigen en sociale rechten, uitgelegd in klare taal.",
    filterAll: "Alle thema's",
    effective: "Van toepassing vanaf",
    empty: "Er zijn nog geen updates voor dit thema.",
    unavailable: "De updates zijn even niet beschikbaar. Probeer het later opnieuw.",
    read: "Lees de update",
    source: "Bron",
    changes: "Wat verandert er",
    action: "Wat moet u doen",
    back: "Alle updates",
    disclaimer:
      "Deze informatie is algemeen en vervangt geen juridisch of fiscaal advies over uw persoonlijke situatie.",
    relatedForms: "Bekijk de bijhorende formulieren",
  },
  forms: {
    nav: "Documenten",
    eyebrow: "Documenten & formulieren",
    title: "Uw aanvraag correct en volledig voorbereiden",
    intro:
      "Per aanvraag vindt u hier waarvoor het dient, wie ze kan gebruiken en welke bewijsstukken nodig zijn. U vult het voorbereidingsformulier online in of print de checklist af.",
    metaTitle: "Documenten & formulieren — ZADIASSURE",
    metaDescription:
      "Checklists en voorbereidingsformulieren voor uw administratieve aanvraag: verblijf, sociaal tarief, budgetbegeleiding, betwistingen en opstart als zelfstandige.",
    filterAll: "Alle thema's",
    authority: "Instantie",
    empty: "Er zijn nog geen formulieren voor dit thema.",
    unavailable: "De formulieren zijn even niet beschikbaar. Probeer het later opnieuw.",
    open: "Openen",
    back: "Alle documenten",
    who: "Voor wie",
    checklist: "Wat u nodig hebt",
    officialLink: "Officieel formulier van de instantie",
    officialNote:
      "Belangrijk: de officiële indiening gebeurt altijd bij de bevoegde instantie. Ons formulier dient om uw dossier correct voor te bereiden — wij begeleiden u daarna bij de indiening.",
    print: "Checklist afdrukken of als PDF opslaan",
    startOnline: "Online invullen",
    formTitle: "Voorbereidingsformulier",
    formIntro:
      "Vul uw gegevens in en geef aan welke documenten u al hebt. Wij nemen binnen twee werkdagen contact met u op.",
    fields: {
      fullName: "Voor- en achternaam",
      email: "E-mailadres",
      phone: "Telefoon",
      audience: "U bent",
      message: "Uw situatie kort beschreven",
      messagePlaceholder: "Bijvoorbeeld: welke brief u ontving, welke deadline er staat …",
      consent: "Ik geef ZADIASSURE toestemming om mijn gegevens te gebruiken voor de opvolging van deze aanvraag.",
      submit: "Aanvraag versturen",
      sending: "Versturen …",
      required: "Dit veld is verplicht",
      invalidEmail: "Vul een geldig e-mailadres in",
      successTitle: "Bedankt, uw aanvraag is verstuurd",
      successText: "Wij bekijken uw dossier en contacteren u binnen twee werkdagen.",
      failed: "Het versturen is niet gelukt. Probeer opnieuw of mail ons.",
      checklistLegend: "Welke documenten hebt u al?",
      haveIt: "Ik heb dit document",
    },
    audienceOptions: [
      { value: "particulier", label: "Particulier" },
      { value: "gezin", label: "Gezin" },
      { value: "zelfstandige", label: "Zelfstandige" },
      { value: "onderneming", label: "Onderneming" },
    ],
  },
  auth: {
    metaTitle: "Beheer — ZADIASSURE",
    metaDescription: "Beveiligde aanmelding voor het beheer van de ZADIASSURE-website.",
    title: "Aanmelden",
    intro: "Deze omgeving is voorbehouden voor het team van ZADIASSURE.",
    email: "E-mailadres",
    password: "Wachtwoord",
    signIn: "Aanmelden",
    signUp: "Account aanmaken",
    google: "Verdergaan met Google",
    toggleToSignUp: "Nog geen account? Account aanmaken",
    toggleToSignIn: "Al een account? Aanmelden",
    checkEmail: "Bekijk uw e-mail om uw account te bevestigen.",
    error: "Aanmelden is niet gelukt. Controleer uw gegevens.",
    working: "Even geduld …",
  },
  admin: {
    title: "Beheer",
    intro: "Beheer hier de wetgevingsupdates, de formulieren en de binnengekomen aanvragen.",
    notAdminTitle: "Geen beheerdersrechten",
    notAdminText:
      "Uw account is aangemeld, maar heeft nog geen beheerdersrol. Vraag een bestaande beheerder om uw account de rol 'admin' te geven.",
    signOut: "Afmelden",
    tabs: { legislation: "Wetgeving", forms: "Formulieren", submissions: "Aanvragen" },
    newLegislation: "Nieuwe update",
    newForm: "Nieuw formulier",
    edit: "Wijzigen",
    delete: "Verwijderen",
    save: "Opslaan",
    saving: "Opslaan …",
    cancel: "Annuleren",
    published: "Gepubliceerd",
    draft: "Concept",
    confirmDelete: "Definitief verwijderen?",
    saved: "Opgeslagen",
    saveFailed: "Opslaan is niet gelukt. Controleer de velden.",
    noSubmissions: "Nog geen aanvragen.",
    status: "Status",
    checklistHint: "Eén document per lijn",
    audiencesHint: "Doelgroepen, gescheiden door komma's",
    fieldSlug: "Slug (URL)",
    fieldTheme: "Thema",
    fieldEffective: "Van toepassing vanaf",
    fieldSource: "Bron-URL",
    fieldSourceLabel: "Bron (naam)",
    fieldAuthority: "Instantie",
    fieldOfficialUrl: "URL officieel formulier",
    fieldOfficialLabel: "Naam officiële instantie",
    fieldOrder: "Sorteervolgorde",
    labelTitle: "Titel",
    labelSummary: "Samenvatting",
    labelChanges: "Wat verandert er",
    labelAction: "Wat moet u doen",
    labelDescription: "Beschrijving",
    labelWho: "Voor wie",
    labelChecklist: "Checklist",
  },
};

const fr: LibraryDict = {
  themes: {
    immigration: "Séjour & immigration",
    budget: "Budget & dettes",
    business: "Indépendants & entreprises",
    social: "Droits sociaux & famille",
  },
  legislation: {
    nav: "Législation",
    eyebrow: "Législation & actualités",
    title: "Ce qui change, et ce que cela signifie pour vous",
    intro:
      "Nous suivons les évolutions de la réglementation belge qui concernent nos publics et les traduisons en langage clair : ce qui change, et l'étape à poser aujourd'hui.",
    metaTitle: "Législation & actualités — ZADIASSURE",
    metaDescription:
      "Aperçu des évolutions de la réglementation belge en matière de séjour, budget, indépendants et droits sociaux, expliquées en langage clair.",
    filterAll: "Tous les thèmes",
    effective: "Applicable à partir du",
    empty: "Aucune actualité pour ce thème pour l'instant.",
    unavailable: "Les actualités sont momentanément indisponibles. Réessayez plus tard.",
    read: "Lire l'actualité",
    source: "Source",
    changes: "Ce qui change",
    action: "Ce que vous devez faire",
    back: "Toutes les actualités",
    disclaimer:
      "Ces informations sont générales et ne remplacent pas un conseil juridique ou fiscal sur votre situation personnelle.",
    relatedForms: "Voir les formulaires liés",
  },
  forms: {
    nav: "Documents",
    eyebrow: "Documents & formulaires",
    title: "Préparer votre demande correctement et complètement",
    intro:
      "Pour chaque demande, vous trouvez ici son objet, les personnes concernées et les pièces requises. Remplissez le formulaire de préparation en ligne ou imprimez la checklist.",
    metaTitle: "Documents & formulaires — ZADIASSURE",
    metaDescription:
      "Checklists et formulaires de préparation pour votre demande administrative : séjour, tarif social, accompagnement budgétaire, contestations et lancement en indépendant.",
    filterAll: "Tous les thèmes",
    authority: "Instance",
    empty: "Aucun formulaire pour ce thème pour l'instant.",
    unavailable: "Les formulaires sont momentanément indisponibles. Réessayez plus tard.",
    open: "Ouvrir",
    back: "Tous les documents",
    who: "Pour qui",
    checklist: "Ce dont vous avez besoin",
    officialLink: "Formulaire officiel de l'instance",
    officialNote:
      "Important : le dépôt officiel se fait toujours auprès de l'instance compétente. Notre formulaire sert à préparer correctement votre dossier — nous vous accompagnons ensuite lors du dépôt.",
    print: "Imprimer la checklist ou l'enregistrer en PDF",
    startOnline: "Remplir en ligne",
    formTitle: "Formulaire de préparation",
    formIntro:
      "Complétez vos données et indiquez les documents déjà en votre possession. Nous vous contactons dans les deux jours ouvrables.",
    fields: {
      fullName: "Prénom et nom",
      email: "Adresse e-mail",
      phone: "Téléphone",
      audience: "Vous êtes",
      message: "Votre situation en quelques mots",
      messagePlaceholder: "Par exemple : le courrier reçu, l'échéance annoncée …",
      consent: "J'autorise ZADIASSURE à utiliser mes données pour le suivi de cette demande.",
      submit: "Envoyer la demande",
      sending: "Envoi …",
      required: "Ce champ est obligatoire",
      invalidEmail: "Indiquez une adresse e-mail valide",
      successTitle: "Merci, votre demande est envoyée",
      successText: "Nous examinons votre dossier et vous contactons dans les deux jours ouvrables.",
      failed: "L'envoi a échoué. Réessayez ou écrivez-nous.",
      checklistLegend: "Quels documents avez-vous déjà ?",
      haveIt: "J'ai ce document",
    },
    audienceOptions: [
      { value: "particulier", label: "Particulier" },
      { value: "gezin", label: "Famille" },
      { value: "zelfstandige", label: "Indépendant" },
      { value: "onderneming", label: "Entreprise" },
    ],
  },
  auth: {
    metaTitle: "Administration — ZADIASSURE",
    metaDescription: "Connexion sécurisée pour la gestion du site ZADIASSURE.",
    title: "Connexion",
    intro: "Cet espace est réservé à l'équipe de ZADIASSURE.",
    email: "Adresse e-mail",
    password: "Mot de passe",
    signIn: "Se connecter",
    signUp: "Créer un compte",
    google: "Continuer avec Google",
    toggleToSignUp: "Pas encore de compte ? Créer un compte",
    toggleToSignIn: "Déjà un compte ? Se connecter",
    checkEmail: "Consultez votre e-mail pour confirmer votre compte.",
    error: "La connexion a échoué. Vérifiez vos données.",
    working: "Un instant …",
  },
  admin: {
    title: "Administration",
    intro: "Gérez ici les actualités législatives, les formulaires et les demandes reçues.",
    notAdminTitle: "Pas de droits d'administrateur",
    notAdminText:
      "Votre compte est connecté mais n'a pas encore le rôle d'administrateur. Demandez à un administrateur d'attribuer le rôle « admin » à votre compte.",
    signOut: "Se déconnecter",
    tabs: { legislation: "Législation", forms: "Formulaires", submissions: "Demandes" },
    newLegislation: "Nouvelle actualité",
    newForm: "Nouveau formulaire",
    edit: "Modifier",
    delete: "Supprimer",
    save: "Enregistrer",
    saving: "Enregistrement …",
    cancel: "Annuler",
    published: "Publié",
    draft: "Brouillon",
    confirmDelete: "Supprimer définitivement ?",
    saved: "Enregistré",
    saveFailed: "L'enregistrement a échoué. Vérifiez les champs.",
    noSubmissions: "Aucune demande pour l'instant.",
    status: "Statut",
    checklistHint: "Un document par ligne",
    audiencesHint: "Publics, séparés par des virgules",
    fieldSlug: "Slug (URL)",
    fieldTheme: "Thème",
    fieldEffective: "Applicable à partir du",
    fieldSource: "URL de la source",
    fieldSourceLabel: "Source (nom)",
    fieldAuthority: "Instance",
    fieldOfficialUrl: "URL du formulaire officiel",
    fieldOfficialLabel: "Nom de l'instance officielle",
    fieldOrder: "Ordre de tri",
    labelTitle: "Titre",
    labelSummary: "Résumé",
    labelChanges: "Ce qui change",
    labelAction: "Ce que vous devez faire",
    labelDescription: "Description",
    labelWho: "Pour qui",
    labelChecklist: "Checklist",
  },
};

const en: LibraryDict = {
  themes: {
    immigration: "Residence & immigration",
    budget: "Budget & debt",
    business: "Self-employed & companies",
    social: "Social rights & family",
  },
  legislation: {
    nav: "Legislation",
    eyebrow: "Legislation & updates",
    title: "What is changing, and what it means for you",
    intro:
      "We follow the changes in Belgian regulation that affect our audiences and translate them into plain language: what changes, and the step to take today.",
    metaTitle: "Legislation & updates — ZADIASSURE",
    metaDescription:
      "Overview of changes in Belgian regulation on residence, budget, self-employment and social rights, explained in plain language.",
    filterAll: "All themes",
    effective: "Applies from",
    empty: "No updates for this theme yet.",
    unavailable: "Updates are temporarily unavailable. Please try again later.",
    read: "Read the update",
    source: "Source",
    changes: "What changes",
    action: "What you should do",
    back: "All updates",
    disclaimer:
      "This information is general and does not replace legal or tax advice on your personal situation.",
    relatedForms: "See the related forms",
  },
  forms: {
    nav: "Documents",
    eyebrow: "Documents & forms",
    title: "Prepare your application correctly and completely",
    intro:
      "For each application you will find what it is for, who can use it and which supporting documents are needed. Complete the preparation form online or print the checklist.",
    metaTitle: "Documents & forms — ZADIASSURE",
    metaDescription:
      "Checklists and preparation forms for your administrative application: residence, social tariff, budget guidance, disputes and starting as self-employed.",
    filterAll: "All themes",
    authority: "Authority",
    empty: "No forms for this theme yet.",
    unavailable: "Forms are temporarily unavailable. Please try again later.",
    open: "Open",
    back: "All documents",
    who: "Who it is for",
    checklist: "What you need",
    officialLink: "Official form from the authority",
    officialNote:
      "Important: the official filing always happens with the competent authority. Our form is there to prepare your file correctly — we then guide you through the filing.",
    print: "Print the checklist or save as PDF",
    startOnline: "Complete online",
    formTitle: "Preparation form",
    formIntro:
      "Fill in your details and indicate which documents you already have. We contact you within two working days.",
    fields: {
      fullName: "First and last name",
      email: "E-mail address",
      phone: "Phone",
      audience: "You are",
      message: "Your situation in short",
      messagePlaceholder: "For example: the letter you received, the deadline given …",
      consent: "I allow ZADIASSURE to use my details to follow up on this request.",
      submit: "Send request",
      sending: "Sending …",
      required: "This field is required",
      invalidEmail: "Enter a valid e-mail address",
      successTitle: "Thank you, your request has been sent",
      successText: "We review your file and contact you within two working days.",
      failed: "Sending failed. Please try again or e-mail us.",
      checklistLegend: "Which documents do you already have?",
      haveIt: "I have this document",
    },
    audienceOptions: [
      { value: "particulier", label: "Individual" },
      { value: "gezin", label: "Family" },
      { value: "zelfstandige", label: "Self-employed" },
      { value: "onderneming", label: "Company" },
    ],
  },
  auth: {
    metaTitle: "Admin — ZADIASSURE",
    metaDescription: "Secure sign-in for managing the ZADIASSURE website.",
    title: "Sign in",
    intro: "This area is reserved for the ZADIASSURE team.",
    email: "E-mail address",
    password: "Password",
    signIn: "Sign in",
    signUp: "Create account",
    google: "Continue with Google",
    toggleToSignUp: "No account yet? Create one",
    toggleToSignIn: "Already have an account? Sign in",
    checkEmail: "Check your e-mail to confirm your account.",
    error: "Sign-in failed. Please check your details.",
    working: "One moment …",
  },
  admin: {
    title: "Admin",
    intro: "Manage legislation updates, forms and incoming requests here.",
    notAdminTitle: "No admin rights",
    notAdminText:
      "Your account is signed in but does not have the admin role yet. Ask an existing admin to grant your account the 'admin' role.",
    signOut: "Sign out",
    tabs: { legislation: "Legislation", forms: "Forms", submissions: "Requests" },
    newLegislation: "New update",
    newForm: "New form",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    saving: "Saving …",
    cancel: "Cancel",
    published: "Published",
    draft: "Draft",
    confirmDelete: "Delete permanently?",
    saved: "Saved",
    saveFailed: "Saving failed. Please check the fields.",
    noSubmissions: "No requests yet.",
    status: "Status",
    checklistHint: "One document per line",
    audiencesHint: "Audiences, comma separated",
    fieldSlug: "Slug (URL)",
    fieldTheme: "Theme",
    fieldEffective: "Applies from",
    fieldSource: "Source URL",
    fieldSourceLabel: "Source (name)",
    fieldAuthority: "Authority",
    fieldOfficialUrl: "Official form URL",
    fieldOfficialLabel: "Official authority name",
    fieldOrder: "Sort order",
    labelTitle: "Title",
    labelSummary: "Summary",
    labelChanges: "What changes",
    labelAction: "What you should do",
    labelDescription: "Description",
    labelWho: "Who it is for",
    labelChecklist: "Checklist",
  },
};

export const libraryDictionaries: Record<Locale, LibraryDict> = { nl, fr, en };

export type ThemeKey = keyof LibraryDict["themes"];
export const THEME_KEYS: ThemeKey[] = ["immigration", "budget", "business", "social"];
