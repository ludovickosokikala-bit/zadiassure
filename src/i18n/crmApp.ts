import type { Locale } from "./types";

/** Extra dictionary for the app-like CRM layer (inbox, notifications, palette). */
export interface CrmAppDict {
  nav: { inbox: string; more: string };
  topbar: {
    searchPlaceholder: string;
    searchHint: string;
    create: string;
    notifications: string;
    markAllRead: string;
    noNotifications: string;
    online: string;
  };
  create: { client: string; case: string; task: string; document: string };
  notify: {
    newRequests: string;
    newMails: string;
    newCases: string;
    tasksToday: string;
    tasksOverdue: string;
    documentsPending: string;
  };
  search: { clients: string; cases: string; tasks: string; noResults: string; typing: string };
  inbox: {
    title: string;
    intro: string;
    all: string;
    contact: string;
    requests: string;
    status: string;
    statusNew: string;
    statusInProgress: string;
    statusDone: string;
    statusArchived: string;
    message: string;
    attachments: string;
    convert: string;
    convertWithCase: string;
    converted: string;
    markDone: string;
    markInProgress: string;
    archive: string;
    empty: string;
    openClient: string;
    openCase: string;
    reply: string;
    call: string;
  };
}

const nl: CrmAppDict = {
  nav: { inbox: "Postvak", more: "Meer" },
  topbar: {
    searchPlaceholder: "Zoek klant, dossier of taak…",
    searchHint: "Ctrl + K",
    create: "Nieuw",
    notifications: "Meldingen",
    markAllRead: "Alles bekeken",
    noNotifications: "Geen nieuwe meldingen.",
    online: "Live",
  },
  create: { client: "Klant", case: "Dossier", task: "Taak", document: "Document opvragen" },
  notify: {
    newRequests: "nieuwe aanvragen via de website",
    newMails: "nieuwe berichten via contactformulier",
    newCases: "dossiers met status nieuw",
    tasksToday: "taken vandaag te doen",
    tasksOverdue: "taken te laat",
    documentsPending: "documenten in afwachting",
  },
  search: {
    clients: "Klanten",
    cases: "Dossiers",
    tasks: "Taken",
    noResults: "Geen resultaten.",
    typing: "Typ minstens 2 letters…",
  },
  inbox: {
    title: "Postvak",
    intro: "Alle aanvragen en berichten van de website komen hier binnen.",
    all: "Alles",
    contact: "Berichten",
    requests: "Aanvragen",
    status: "Status",
    statusNew: "Nieuw",
    statusInProgress: "In behandeling",
    statusDone: "Afgehandeld",
    statusArchived: "Gearchiveerd",
    message: "Bericht",
    attachments: "Bijlagen",
    convert: "Klant aanmaken",
    convertWithCase: "Klant + dossier aanmaken",
    converted: "Aangemaakt",
    markDone: "Afgehandeld",
    markInProgress: "In behandeling",
    archive: "Archiveren",
    empty: "Geen berichten in deze weergave.",
    openClient: "Open klant",
    openCase: "Open dossier",
    reply: "Antwoorden",
    call: "Bellen",
  },
};

const fr: CrmAppDict = {
  nav: { inbox: "Boîte", more: "Plus" },
  topbar: {
    searchPlaceholder: "Rechercher client, dossier ou tâche…",
    searchHint: "Ctrl + K",
    create: "Nouveau",
    notifications: "Notifications",
    markAllRead: "Tout vu",
    noNotifications: "Aucune nouvelle notification.",
    online: "Live",
  },
  create: { client: "Client", case: "Dossier", task: "Tâche", document: "Demander un document" },
  notify: {
    newRequests: "nouvelles demandes via le site",
    newMails: "nouveaux messages du formulaire de contact",
    newCases: "dossiers au statut nouveau",
    tasksToday: "tâches à faire aujourd'hui",
    tasksOverdue: "tâches en retard",
    documentsPending: "documents en attente",
  },
  search: {
    clients: "Clients",
    cases: "Dossiers",
    tasks: "Tâches",
    noResults: "Aucun résultat.",
    typing: "Tapez au moins 2 lettres…",
  },
  inbox: {
    title: "Boîte de réception",
    intro: "Toutes les demandes et messages du site arrivent ici.",
    all: "Tout",
    contact: "Messages",
    requests: "Demandes",
    status: "Statut",
    statusNew: "Nouveau",
    statusInProgress: "En cours",
    statusDone: "Traité",
    statusArchived: "Archivé",
    message: "Message",
    attachments: "Pièces jointes",
    convert: "Créer le client",
    convertWithCase: "Créer client + dossier",
    converted: "Créé",
    markDone: "Traité",
    markInProgress: "En cours",
    archive: "Archiver",
    empty: "Aucun message dans cette vue.",
    openClient: "Ouvrir le client",
    openCase: "Ouvrir le dossier",
    reply: "Répondre",
    call: "Appeler",
  },
};

const en: CrmAppDict = {
  nav: { inbox: "Inbox", more: "More" },
  topbar: {
    searchPlaceholder: "Search client, case or task…",
    searchHint: "Ctrl + K",
    create: "New",
    notifications: "Notifications",
    markAllRead: "All seen",
    noNotifications: "No new notifications.",
    online: "Live",
  },
  create: { client: "Client", case: "Case", task: "Task", document: "Request document" },
  notify: {
    newRequests: "new website requests",
    newMails: "new contact form messages",
    newCases: "cases with status new",
    tasksToday: "tasks due today",
    tasksOverdue: "tasks overdue",
    documentsPending: "documents pending",
  },
  search: {
    clients: "Clients",
    cases: "Cases",
    tasks: "Tasks",
    noResults: "No results.",
    typing: "Type at least 2 characters…",
  },
  inbox: {
    title: "Inbox",
    intro: "Every request and message from the website lands here.",
    all: "All",
    contact: "Messages",
    requests: "Requests",
    status: "Status",
    statusNew: "New",
    statusInProgress: "In progress",
    statusDone: "Handled",
    statusArchived: "Archived",
    message: "Message",
    attachments: "Attachments",
    convert: "Create client",
    convertWithCase: "Create client + case",
    converted: "Created",
    markDone: "Handled",
    markInProgress: "In progress",
    archive: "Archive",
    empty: "No messages in this view.",
    openClient: "Open client",
    openCase: "Open case",
    reply: "Reply",
    call: "Call",
  },
};

export const crmAppDictionaries: Record<Locale, CrmAppDict> = { nl, fr, en };
