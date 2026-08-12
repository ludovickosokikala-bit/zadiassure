import type { Locale } from "./types";

export interface CrmDict {
  brand: string;
  nav: {
    dashboard: string;
    clients: string;
    cases: string;
    tasks: string;
    documents: string;
    settings: string;
    portal: string;
    website: string;
    signOut: string;
  };
  common: {
    save: string;
    cancel: string;
    edit: string;
    delete: string;
    add: string;
    search: string;
    loading: string;
    empty: string;
    all: string;
    none: string;
    notImplemented: string;
    confirmDelete: string;
    saveFailed: string;
    open: string;
    back: string;
    unassigned: string;
    created: string;
    updated: string;
    yes: string;
    no: string;
  };
  dashboard: {
    title: string;
    intro: string;
    activeCases: string;
    newRequests: string;
    dueToday: string;
    overdue: string;
    deadlinesWeek: string;
    attention: string;
    recentActivity: string;
    missingDocuments: string;
  };
  clients: {
    title: string;
    intro: string;
    newClient: string;
    editClient: string;
    firstName: string;
    lastName: string;
    companyName: string;
    dateOfBirth: string;
    email: string;
    phone: string;
    call: string;
    whatsapp: string;
    sendEmail: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    language: string;
    type: string;
    contactPreference: string;
    status: string;
    notes: string;
    assignedTo: string;
    cases: string;
    documents: string;
    tasks: string;
    activity: string;
    overview: string;
  };
  cases: {
    title: string;
    intro: string;
    newCase: string;
    editCase: string;
    caseTitle: string;
    client: string;
    type: string;
    description: string;
    status: string;
    stage: string;
    priority: string;
    assignedTo: string;
    startDate: string;
    targetDate: string;
    deadline: string;
    progress: string;
    tags: string;
    tabs: {
      overview: string;
      tasks: string;
      documents: string;
      timeline: string;
      notes: string;
    };
    workflow: string;
    noCases: string;
  };
  tasks: {
    title: string;
    intro: string;
    newTask: string;
    taskTitle: string;
    description: string;
    dueDate: string;
    dueTime: string;
    status: string;
    priority: string;
    assignedTo: string;
    views: { mine: string; team: string; today: string; overdue: string; upcoming: string };
    noTasks: string;
  };
  documents: {
    title: string;
    intro: string;
    request: string;
    name: string;
    type: string;
    status: string;
    expiresOn: string;
    notes: string;
    noDocuments: string;
    uploadHint: string;
  };
  notes: {
    internal: string;
    clientVisible: string;
    placeholder: string;
    addNote: string;
    noNotes: string;
  };
  settings: {
    title: string;
    intro: string;
    organization: string;
    team: string;
    caseTypes: string;
    caseStatuses: string;
    comingSoon: string;
  };
  priority: Record<"low" | "normal" | "high" | "urgent", string>;
  taskStatus: Record<"todo" | "in_progress" | "waiting" | "completed" | "cancelled", string>;
  docStatus: Record<
    "requested" | "received" | "under_review" | "approved" | "rejected" | "expired",
    string
  >;
  clientType: Record<
    "individual" | "family" | "self_employed" | "organization" | "other",
    string
  >;
  noAccess: { title: string; text: string };
}

const nl: CrmDict = {
  brand: "ZADIASSURE Dossierbeheer",
  nav: {
    dashboard: "Dashboard",
    clients: "Klanten",
    cases: "Dossiers",
    tasks: "Taken",
    documents: "Documenten",
    settings: "Instellingen",
    portal: "Klantenportaal",
    website: "Website",
    signOut: "Afmelden",
  },
  common: {
    save: "Opslaan",
    cancel: "Annuleren",
    edit: "Bewerken",
    delete: "Verwijderen",
    add: "Toevoegen",
    search: "Zoeken",
    loading: "Laden…",
    empty: "Nog niets om te tonen.",
    all: "Alle",
    none: "Geen",
    notImplemented: "Nog niet geïmplementeerd",
    confirmDelete: "Weet je zeker dat je dit wil verwijderen?",
    saveFailed: "Opslaan is niet gelukt. Probeer opnieuw.",
    open: "Openen",
    back: "Terug",
    unassigned: "Niet toegewezen",
    created: "Aangemaakt",
    updated: "Bijgewerkt",
    yes: "Ja",
    no: "Nee",
  },
  dashboard: {
    title: "Wat vraagt vandaag aandacht?",
    intro: "Overzicht van je actieve dossiers, taken en deadlines.",
    activeCases: "Actieve dossiers",
    newRequests: "Nieuwe aanvragen",
    dueToday: "Taken vandaag",
    overdue: "Achterstallig",
    deadlinesWeek: "Deadlines deze week",
    attention: "Dossiers die aandacht vragen",
    recentActivity: "Recente activiteit",
    missingDocuments: "Ontbrekende documenten",
  },
  clients: {
    title: "Klanten",
    intro: "Particulieren, gezinnen, zelfstandigen en ondernemingen.",
    newClient: "Nieuwe klant",
    editClient: "Klant bewerken",
    firstName: "Voornaam",
    lastName: "Naam",
    companyName: "Onderneming",
    dateOfBirth: "Geboortedatum",
    email: "E-mail",
    phone: "Telefoon",
    call: "Bellen",
    whatsapp: "WhatsApp",
    sendEmail: "E-mail sturen",
    address: "Adres",
    city: "Gemeente",
    postalCode: "Postcode",
    country: "Land",
    language: "Voorkeurstaal",
    type: "Klanttype",
    contactPreference: "Communicatievoorkeur",
    status: "Status",
    notes: "Notities",
    assignedTo: "Toegewezen aan",
    cases: "Dossiers",
    documents: "Documenten",
    tasks: "Taken",
    activity: "Activiteit",
    overview: "Overzicht",
  },
  cases: {
    title: "Dossiers",
    intro: "Elk dossier met eigen status, workflow, taken en deadlines.",
    newCase: "Nieuw dossier",
    editCase: "Dossier bewerken",
    caseTitle: "Titel",
    client: "Klant",
    type: "Dossiertype",
    description: "Omschrijving",
    status: "Status",
    stage: "Workflowstap",
    priority: "Prioriteit",
    assignedTo: "Toegewezen aan",
    startDate: "Startdatum",
    targetDate: "Streefdatum",
    deadline: "Deadline",
    progress: "Voortgang",
    tags: "Labels",
    tabs: {
      overview: "Overzicht",
      tasks: "Taken",
      documents: "Documenten",
      timeline: "Tijdlijn",
      notes: "Notities",
    },
    workflow: "Workflow",
    noCases: "Nog geen dossiers.",
  },
  tasks: {
    title: "Taken",
    intro: "Opvolging per dossier en per medewerker.",
    newTask: "Nieuwe taak",
    taskTitle: "Titel",
    description: "Omschrijving",
    dueDate: "Vervaldatum",
    dueTime: "Uur",
    status: "Status",
    priority: "Prioriteit",
    assignedTo: "Toegewezen aan",
    views: {
      mine: "Mijn taken",
      team: "Team",
      today: "Vandaag",
      overdue: "Achterstallig",
      upcoming: "Komende",
    },
    noTasks: "Geen taken in deze weergave.",
  },
  documents: {
    title: "Documenten",
    intro: "Opgevraagde en ontvangen documenten per dossier.",
    request: "Document opvragen",
    name: "Naam",
    type: "Documenttype",
    status: "Status",
    expiresOn: "Vervalt op",
    notes: "Notities",
    noDocuments: "Nog geen documenten.",
    uploadHint: "Opladen via het klantenportaal volgt in fase 2.",
  },
  notes: {
    internal: "Intern",
    clientVisible: "Zichtbaar voor klant",
    placeholder: "Notitie toevoegen…",
    addNote: "Notitie toevoegen",
    noNotes: "Nog geen notities.",
  },
  settings: {
    title: "Instellingen",
    intro: "Organisatie, team, dossiertypes en statussen.",
    organization: "Organisatie",
    team: "Team",
    caseTypes: "Dossiertypes",
    caseStatuses: "Dossierstatussen",
    comingSoon: "Beheer via de interface volgt in een volgende fase.",
  },
  priority: { low: "Laag", normal: "Normaal", high: "Hoog", urgent: "Urgent" },
  taskStatus: {
    todo: "Te doen",
    in_progress: "Bezig",
    waiting: "Wachten",
    completed: "Afgerond",
    cancelled: "Geannuleerd",
  },
  docStatus: {
    requested: "Gevraagd",
    received: "Ontvangen",
    under_review: "In nazicht",
    approved: "Goedgekeurd",
    rejected: "Afgekeurd",
    expired: "Vervallen",
  },
  clientType: {
    individual: "Particulier",
    family: "Gezin",
    self_employed: "Zelfstandige",
    organization: "Onderneming",
    other: "Andere",
  },
  noAccess: {
    title: "Geen toegang tot het dossierbeheer",
    text: "Je account heeft nog geen rol binnen een ZADIASSURE-organisatie. Vraag een beheerder om toegang.",
  },
};

const fr: CrmDict = {
  ...nl,
  brand: "ZADIASSURE Gestion de dossiers",
  nav: {
    dashboard: "Tableau de bord",
    clients: "Clients",
    cases: "Dossiers",
    tasks: "Tâches",
    documents: "Documents",
    settings: "Paramètres",
    portal: "Portail client",
    website: "Site web",
    signOut: "Se déconnecter",
  },
  common: {
    save: "Enregistrer",
    cancel: "Annuler",
    edit: "Modifier",
    delete: "Supprimer",
    add: "Ajouter",
    search: "Rechercher",
    loading: "Chargement…",
    empty: "Rien à afficher pour le moment.",
    all: "Tous",
    none: "Aucun",
    notImplemented: "Pas encore implémenté",
    confirmDelete: "Confirmer la suppression ?",
    saveFailed: "L'enregistrement a échoué. Réessayez.",
    open: "Ouvrir",
    back: "Retour",
    unassigned: "Non attribué",
    created: "Créé",
    updated: "Mis à jour",
    yes: "Oui",
    no: "Non",
  },
  dashboard: {
    title: "Qu'est-ce qui demande votre attention ?",
    intro: "Vue d'ensemble de vos dossiers, tâches et échéances.",
    activeCases: "Dossiers actifs",
    newRequests: "Nouvelles demandes",
    dueToday: "Tâches aujourd'hui",
    overdue: "En retard",
    deadlinesWeek: "Échéances cette semaine",
    attention: "Dossiers à surveiller",
    recentActivity: "Activité récente",
    missingDocuments: "Documents manquants",
  },
  clients: {
    title: "Clients",
    intro: "Particuliers, familles, indépendants et entreprises.",
    newClient: "Nouveau client",
    editClient: "Modifier le client",
    firstName: "Prénom",
    lastName: "Nom",
    companyName: "Entreprise",
    dateOfBirth: "Date de naissance",
    email: "E-mail",
    phone: "Téléphone",
    call: "Appeler",
    whatsapp: "WhatsApp",
    sendEmail: "Envoyer un e-mail",
    address: "Adresse",
    city: "Commune",
    postalCode: "Code postal",
    country: "Pays",
    language: "Langue préférée",
    type: "Type de client",
    contactPreference: "Préférence de contact",
    status: "Statut",
    notes: "Notes",
    assignedTo: "Attribué à",
    cases: "Dossiers",
    documents: "Documents",
    tasks: "Tâches",
    activity: "Activité",
    overview: "Aperçu",
  },
  cases: {
    title: "Dossiers",
    intro: "Chaque dossier avec son statut, workflow, tâches et échéances.",
    newCase: "Nouveau dossier",
    editCase: "Modifier le dossier",
    caseTitle: "Titre",
    client: "Client",
    type: "Type de dossier",
    description: "Description",
    status: "Statut",
    stage: "Étape du workflow",
    priority: "Priorité",
    assignedTo: "Attribué à",
    startDate: "Date de début",
    targetDate: "Date cible",
    deadline: "Échéance",
    progress: "Progression",
    tags: "Étiquettes",
    tabs: {
      overview: "Aperçu",
      tasks: "Tâches",
      documents: "Documents",
      timeline: "Chronologie",
      notes: "Notes",
    },
    workflow: "Workflow",
    noCases: "Aucun dossier.",
  },
  tasks: {
    title: "Tâches",
    intro: "Suivi par dossier et par collaborateur.",
    newTask: "Nouvelle tâche",
    taskTitle: "Titre",
    description: "Description",
    dueDate: "Échéance",
    dueTime: "Heure",
    status: "Statut",
    priority: "Priorité",
    assignedTo: "Attribué à",
    views: {
      mine: "Mes tâches",
      team: "Équipe",
      today: "Aujourd'hui",
      overdue: "En retard",
      upcoming: "À venir",
    },
    noTasks: "Aucune tâche dans cette vue.",
  },
  documents: {
    title: "Documents",
    intro: "Documents demandés et reçus par dossier.",
    request: "Demander un document",
    name: "Nom",
    type: "Type de document",
    status: "Statut",
    expiresOn: "Expire le",
    notes: "Notes",
    noDocuments: "Aucun document.",
    uploadHint: "Le téléchargement via le portail client arrive en phase 2.",
  },
  notes: {
    internal: "Interne",
    clientVisible: "Visible par le client",
    placeholder: "Ajouter une note…",
    addNote: "Ajouter la note",
    noNotes: "Aucune note.",
  },
  settings: {
    title: "Paramètres",
    intro: "Organisation, équipe, types de dossiers et statuts.",
    organization: "Organisation",
    team: "Équipe",
    caseTypes: "Types de dossiers",
    caseStatuses: "Statuts de dossiers",
    comingSoon: "La gestion via l'interface arrive dans une phase suivante.",
  },
  priority: { low: "Basse", normal: "Normale", high: "Haute", urgent: "Urgente" },
  taskStatus: {
    todo: "À faire",
    in_progress: "En cours",
    waiting: "En attente",
    completed: "Terminée",
    cancelled: "Annulée",
  },
  docStatus: {
    requested: "Demandé",
    received: "Reçu",
    under_review: "En cours d'examen",
    approved: "Approuvé",
    rejected: "Refusé",
    expired: "Expiré",
  },
  clientType: {
    individual: "Particulier",
    family: "Famille",
    self_employed: "Indépendant",
    organization: "Entreprise",
    other: "Autre",
  },
  noAccess: {
    title: "Pas d'accès à la gestion de dossiers",
    text: "Votre compte n'a pas encore de rôle dans une organisation ZADIASSURE. Demandez l'accès à un administrateur.",
  },
};

const en: CrmDict = {
  ...nl,
  brand: "ZADIASSURE Case Management",
  nav: {
    dashboard: "Dashboard",
    clients: "Clients",
    cases: "Cases",
    tasks: "Tasks",
    documents: "Documents",
    settings: "Settings",
    portal: "Client portal",
    website: "Website",
    signOut: "Sign out",
  },
  common: {
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    add: "Add",
    search: "Search",
    loading: "Loading…",
    empty: "Nothing to show yet.",
    all: "All",
    none: "None",
    notImplemented: "Not implemented yet",
    confirmDelete: "Are you sure you want to delete this?",
    saveFailed: "Saving failed. Please try again.",
    open: "Open",
    back: "Back",
    unassigned: "Unassigned",
    created: "Created",
    updated: "Updated",
    yes: "Yes",
    no: "No",
  },
  dashboard: {
    title: "What needs attention today?",
    intro: "Overview of your active cases, tasks and deadlines.",
    activeCases: "Active cases",
    newRequests: "New requests",
    dueToday: "Tasks due today",
    overdue: "Overdue",
    deadlinesWeek: "Deadlines this week",
    attention: "Cases requiring attention",
    recentActivity: "Recent activity",
    missingDocuments: "Missing documents",
  },
  clients: {
    title: "Clients",
    intro: "Individuals, families, self-employed and organizations.",
    newClient: "New client",
    editClient: "Edit client",
    firstName: "First name",
    lastName: "Last name",
    companyName: "Company",
    dateOfBirth: "Date of birth",
    email: "Email",
    phone: "Phone",
    call: "Call",
    whatsapp: "WhatsApp",
    sendEmail: "Send email",
    address: "Address",
    city: "City",
    postalCode: "Postal code",
    country: "Country",
    language: "Preferred language",
    type: "Client type",
    contactPreference: "Contact preference",
    status: "Status",
    notes: "Notes",
    assignedTo: "Assigned to",
    cases: "Cases",
    documents: "Documents",
    tasks: "Tasks",
    activity: "Activity",
    overview: "Overview",
  },
  cases: {
    title: "Cases",
    intro: "Every case with its own status, workflow, tasks and deadlines.",
    newCase: "New case",
    editCase: "Edit case",
    caseTitle: "Title",
    client: "Client",
    type: "Case type",
    description: "Description",
    status: "Status",
    stage: "Workflow stage",
    priority: "Priority",
    assignedTo: "Assigned to",
    startDate: "Start date",
    targetDate: "Target date",
    deadline: "Deadline",
    progress: "Progress",
    tags: "Tags",
    tabs: {
      overview: "Overview",
      tasks: "Tasks",
      documents: "Documents",
      timeline: "Timeline",
      notes: "Notes",
    },
    workflow: "Workflow",
    noCases: "No cases yet.",
  },
  tasks: {
    title: "Tasks",
    intro: "Follow-up per case and per team member.",
    newTask: "New task",
    taskTitle: "Title",
    description: "Description",
    dueDate: "Due date",
    dueTime: "Time",
    status: "Status",
    priority: "Priority",
    assignedTo: "Assigned to",
    views: {
      mine: "My tasks",
      team: "Team",
      today: "Today",
      overdue: "Overdue",
      upcoming: "Upcoming",
    },
    noTasks: "No tasks in this view.",
  },
  documents: {
    title: "Documents",
    intro: "Requested and received documents per case.",
    request: "Request document",
    name: "Name",
    type: "Document type",
    status: "Status",
    expiresOn: "Expires on",
    notes: "Notes",
    noDocuments: "No documents yet.",
    uploadHint: "Uploading through the client portal arrives in phase 2.",
  },
  notes: {
    internal: "Internal",
    clientVisible: "Client visible",
    placeholder: "Add a note…",
    addNote: "Add note",
    noNotes: "No notes yet.",
  },
  settings: {
    title: "Settings",
    intro: "Organization, team, case types and statuses.",
    organization: "Organization",
    team: "Team",
    caseTypes: "Case types",
    caseStatuses: "Case statuses",
    comingSoon: "Managing these in the interface arrives in a next phase.",
  },
  priority: { low: "Low", normal: "Normal", high: "High", urgent: "Urgent" },
  taskStatus: {
    todo: "To do",
    in_progress: "In progress",
    waiting: "Waiting",
    completed: "Completed",
    cancelled: "Cancelled",
  },
  docStatus: {
    requested: "Requested",
    received: "Received",
    under_review: "Under review",
    approved: "Approved",
    rejected: "Rejected",
    expired: "Expired",
  },
  clientType: {
    individual: "Individual",
    family: "Family",
    self_employed: "Self-employed",
    organization: "Organization",
    other: "Other",
  },
  noAccess: {
    title: "No access to case management",
    text: "Your account has no role in a ZADIASSURE organization yet. Ask an administrator for access.",
  },
};

export const crmDictionaries: Record<Locale, CrmDict> = { nl, fr, en };
