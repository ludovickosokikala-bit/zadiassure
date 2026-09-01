/**
 * Central site configuration.
 * Contact details are taken from the existing ZADIASSURE communication channels.
 * Values marked PLACEHOLDER must be confirmed before go-live.
 */
export const site = {
  name: "ZADIASSURE",
  phone: "+32 471 98 67 64",
  phoneHref: "tel:+32471986764",
  email: "info@zadiassure.be",
  emailHref: "mailto:info@zadiassure.be",
  /** International format without + or spaces, used for wa.me links. */
  whatsapp: "32471986764",

  social: {
    facebook: "https://www.facebook.com/Zadiassure",
    instagram: "https://www.instagram.com/zadiassure/",
    linkedin: "https://www.linkedin.com/", // PLACEHOLDER: official LinkedIn page
  },
} as const;

export const routes = {
  home: "/",
  audiences: "/voor-wie",
  services: "/begeleiding",
  about: "/over-zadiassure",
  partners: "/partners",
  insights: "/kenniscentrum",
  legislation: "/wetgeving",
  documents: "/documenten",
  budgetCoaching: "/accompagnement-budgetaire-suivi-dettes",
  contact: "/contact",

  faq: "/faq",
  privacy: "/privacybeleid",
  terms: "/algemene-voorwaarden",
  cookies: "/cookiebeleid",
} as const;
