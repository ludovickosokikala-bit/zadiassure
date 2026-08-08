export type Locale = "nl" | "fr" | "en";

export const LOCALES: Locale[] = ["nl", "fr", "en"];

export interface Item {
  title: string;
  text: string;
}

export interface AudienceContent {
  slug: string;
  name: string;
  tagline: string;
  intro: string;
  needs: string[];
}

export interface ServiceContent {
  slug: string;
  name: string;
  short: string;
  intro: string;
  bullets: string[];
  seoTitle: string;
  seoDescription: string;
}

export interface ArticleContent {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  body: string[];
}

export interface Dict {
  meta: {
    langLabel: string;
    home: { title: string; description: string };
    audiences: { title: string; description: string };
    services: { title: string; description: string };
    about: { title: string; description: string };
    partners: { title: string; description: string };
    insights: { title: string; description: string };
    contact: { title: string; description: string };
    faq: { title: string; description: string };
  };
  brand: {
    tagline: string;
    promise: string;
    statement: string;
  };
  nav: {
    home: string;
    audiences: string;
    services: string;
    about: string;
    partners: string;
    insights: string;
    contact: string;
    faq: string;
    menu: string;
  };
  cta: {
    primary: string;
    secondary: string;
    contact: string;
    discover: string;
    partner: string;
    discuss: string;
    readMore: string;
    backTo: string;
  };
  hero: {
    badge: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    segIndividual: string;
    segBusiness: string;
    stats: Item[];
  };
  positioning: {
    eyebrow: string;
    title: string;
    text: string;
    chain: string[];
  };
  problem: {
    eyebrow: string;
    title: string;
    text: string;
    items: string[];
    answerTitle: string;
    answerText: string;
    answers: Item[];
    flow: string[];
  };
  audiencesSection: {
    eyebrow: string;
    title: string;
    text: string;
    items: AudienceContent[];
    needsLabel: string;
  };
  servicesSection: {
    eyebrow: string;
    title: string;
    text: string;
    items: ServiceContent[];
    note: string;
  };
  process: {
    eyebrow: string;
    title: string;
    text: string;
    steps: Item[];
  };
  why: {
    eyebrow: string;
    title: string;
    text: string;
    items: Item[];
  };
  promiseSection: {
    eyebrow: string;
    quote: string;
    words: string[];
    text: string;
  };
  testimonials: {
    eyebrow: string;
    title: string;
    text: string;
    placeholder: string;
  };
  partnersSection: {
    eyebrow: string;
    title: string;
    text: string;
    profiles: string[];
    values: Item[];
    logosPlaceholder: string;
  };
  insightsSection: {
    eyebrow: string;
    title: string;
    text: string;
    categories: string[];
    articles: ArticleContent[];
    all: string;
  };
  faqSection: {
    eyebrow: string;
    title: string;
    text: string;
    items: Item[];
  };
  ctaSection: {
    title: string;
    text: string;
    reassurance: string[];
  };
  about: {
    eyebrow: string;
    title: string;
    storyTitle: string;
    story: string[];
    founderQuote: string;
    founderName: string;
    founderRole: string;
    missionTitle: string;
    missionText: string;
    visionTitle: string;
    visionText: string;
    valuesTitle: string;
    values: Item[];
    roadmapTitle: string;
    roadmapText: string;
    roadmap: { year: string; title: string; text: string }[];
  };
  contact: {
    eyebrow: string;
    title: string;
    text: string;
    infoTitle: string;
    phoneLabel: string;
    emailLabel: string;
    hoursLabel: string;
    hoursValue: string;
    locationLabel: string;
    locationValue: string;
    socialLabel: string;
    form: {
      title: string;
      lastName: string;
      firstName: string;
      email: string;
      phone: string;
      city: string;
      profile: string;
      profileOptions: { value: string; label: string }[];
      topic: string;
      topicPlaceholder: string;
      message: string;
      messagePlaceholder: string;
      language: string;
      consent: string;
      privacyLink: string;
      submit: string;
      submitting: string;
      successTitle: string;
      successText: string;
      errorRequired: string;
      errorEmail: string;
      errorConsent: string;
      newRequest: string;
      required: string;
    };
  };
  legal: {
    privacyTitle: string;
    termsTitle: string;
    cookiesTitle: string;
    placeholder: string;
    sections: Item[];
  };
  footer: {
    about: string;
    navTitle: string;
    legalTitle: string;
    contactTitle: string;
    privacy: string;
    terms: string;
    cookies: string;
    rights: string;
    placeholderNote: string;
  };
}
