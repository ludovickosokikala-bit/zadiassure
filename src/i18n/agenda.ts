import type { Locale } from "./types";

export interface AgendaDict {
  nav: string;
  title: string;
  intro: string;
  newAppointment: string;
  editAppointment: string;
  today: string;
  prev: string;
  next: string;
  week: string;
  month: string;
  mineOnly: string;
  noItems: string;
  task: string;
  appointment: string;
  fields: {
    title: string;
    client: string;
    case: string;
    start: string;
    end: string;
    allDay: string;
    location: string;
    kind: string;
    status: string;
    assignedTo: string;
    attendees: string;
    attendeesHint: string;
    description: string;
  };
  kinds: Record<"office" | "video" | "phone" | "home_visit" | "external", string>;
  statuses: Record<"scheduled" | "confirmed" | "cancelled" | "completed", string>;
  sync: {
    title: string;
    intro: string;
    copy: string;
    copied: string;
    reset: string;
    resetDone: string;
    steps: string[];
    note: string;
  };
}

const nl: AgendaDict = {
  nav: "Agenda",
  title: "Agenda",
  intro: "Afspraken en taken met vervaldatum in één overzicht, gekoppeld aan je werkagenda.",
  newAppointment: "Nieuwe afspraak",
  editAppointment: "Afspraak bewerken",
  today: "Vandaag",
  prev: "Vorige",
  next: "Volgende",
  week: "Week",
  month: "Maand",
  mineOnly: "Enkel mijn agenda",
  noItems: "Geen afspraken of taken in deze periode.",
  task: "Taak",
  appointment: "Afspraak",
  fields: {
    title: "Titel",
    client: "Klant",
    case: "Dossier",
    start: "Start",
    end: "Einde",
    allDay: "Hele dag",
    location: "Locatie",
    kind: "Soort",
    status: "Status",
    assignedTo: "Medewerker",
    attendees: "Deelnemers (e-mail)",
    attendeesHint: "Scheid meerdere e-mailadressen met een komma.",
    description: "Omschrijving",
  },
  kinds: {
    office: "Op kantoor",
    video: "Videogesprek",
    phone: "Telefonisch",
    home_visit: "Huisbezoek",
    external: "Extern",
  },
  statuses: {
    scheduled: "Gepland",
    confirmed: "Bevestigd",
    cancelled: "Geannuleerd",
    completed: "Afgerond",
  },
  sync: {
    title: "Koppelen met je werkagenda",
    intro:
      "Elke medewerker heeft een persoonlijke abonnementslink. Afspraken en taken verschijnen automatisch in de agenda van je werkmail (Google Agenda, Outlook of Apple Agenda).",
    copy: "Abonnementslink kopiëren",
    copied: "Link gekopieerd",
    reset: "Link vervangen",
    resetDone: "Er is een nieuwe link aangemaakt",
    steps: [
      "Kopieer je persoonlijke link.",
      "Google Agenda → Andere agenda's → Van URL → link plakken → Agenda toevoegen.",
      "Outlook → Agenda toevoegen → Abonneren via internet → link plakken.",
    ],
    note:
      "Deze link is privé: geef hem aan niemand door. Werd hij gedeeld? Vervang hem dan hier.",
  },
};

const fr: AgendaDict = {
  ...nl,
  nav: "Agenda",
  title: "Agenda",
  intro: "Rendez-vous et tâches à échéance dans une seule vue, liés à votre agenda de travail.",
  newAppointment: "Nouveau rendez-vous",
  editAppointment: "Modifier le rendez-vous",
  today: "Aujourd'hui",
  prev: "Précédent",
  next: "Suivant",
  week: "Semaine",
  month: "Mois",
  mineOnly: "Uniquement mon agenda",
  noItems: "Aucun rendez-vous ni tâche sur cette période.",
  task: "Tâche",
  appointment: "Rendez-vous",
  fields: {
    title: "Titre",
    client: "Client",
    case: "Dossier",
    start: "Début",
    end: "Fin",
    allDay: "Toute la journée",
    location: "Lieu",
    kind: "Type",
    status: "Statut",
    assignedTo: "Collaborateur",
    attendees: "Participants (e-mail)",
    attendeesHint: "Séparez plusieurs adresses par une virgule.",
    description: "Description",
  },
  kinds: {
    office: "Au bureau",
    video: "Visioconférence",
    phone: "Par téléphone",
    home_visit: "Visite à domicile",
    external: "Externe",
  },
  statuses: {
    scheduled: "Planifié",
    confirmed: "Confirmé",
    cancelled: "Annulé",
    completed: "Terminé",
  },
  sync: {
    title: "Connecter votre agenda professionnel",
    intro:
      "Chaque collaborateur dispose d'un lien d'abonnement personnel. Les rendez-vous et tâches apparaissent automatiquement dans l'agenda de votre messagerie professionnelle (Google, Outlook ou Apple).",
    copy: "Copier le lien d'abonnement",
    copied: "Lien copié",
    reset: "Remplacer le lien",
    resetDone: "Un nouveau lien a été créé",
    steps: [
      "Copiez votre lien personnel.",
      "Google Agenda → Autres agendas → À partir de l'URL → coller → Ajouter l'agenda.",
      "Outlook → Ajouter un calendrier → S'abonner à partir du web → coller le lien.",
    ],
    note:
      "Ce lien est privé : ne le partagez pas. S'il a été partagé, remplacez-le ici.",
  },
};

const en: AgendaDict = {
  ...nl,
  nav: "Calendar",
  title: "Calendar",
  intro: "Appointments and tasks with a due date in one view, connected to your work calendar.",
  newAppointment: "New appointment",
  editAppointment: "Edit appointment",
  today: "Today",
  prev: "Previous",
  next: "Next",
  week: "Week",
  month: "Month",
  mineOnly: "Only my calendar",
  noItems: "No appointments or tasks in this period.",
  task: "Task",
  appointment: "Appointment",
  fields: {
    title: "Title",
    client: "Client",
    case: "Case",
    start: "Start",
    end: "End",
    allDay: "All day",
    location: "Location",
    kind: "Type",
    status: "Status",
    assignedTo: "Team member",
    attendees: "Attendees (email)",
    attendeesHint: "Separate multiple addresses with a comma.",
    description: "Description",
  },
  kinds: {
    office: "At the office",
    video: "Video call",
    phone: "Phone call",
    home_visit: "Home visit",
    external: "External",
  },
  statuses: {
    scheduled: "Scheduled",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    completed: "Completed",
  },
  sync: {
    title: "Connect your work calendar",
    intro:
      "Every team member gets a personal subscription link. Appointments and tasks show up automatically in your work mail calendar (Google, Outlook or Apple).",
    copy: "Copy subscription link",
    copied: "Link copied",
    reset: "Replace link",
    resetDone: "A new link has been created",
    steps: [
      "Copy your personal link.",
      "Google Calendar → Other calendars → From URL → paste → Add calendar.",
      "Outlook → Add calendar → Subscribe from web → paste the link.",
    ],
    note: "This link is private: never share it. If it leaked, replace it here.",
  },
};

export const agendaDictionaries: Record<Locale, AgendaDict> = { nl, fr, en };
