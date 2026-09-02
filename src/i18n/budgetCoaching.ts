import type { Locale } from "./types";

/**
 * Copy for the dedicated page "Accompagnement budgétaire & suivi administratif
 * des dettes" (/accompagnement-budgetaire-suivi-dettes).
 *
 * Compliance note: ZADIASSURE does NOT perform regulated debt mediation
 * ("médiation de dettes"), debt collection, or hold client funds. The wording
 * in this file follows the internal marketing brief of 31 August 2026 and must
 * stay free of any of those claims.
 */
export interface BudgetCoachingDict {
  meta: { title: string; description: string };
  hero: {
    eyebrow: string;
    title: string;
    text: string;
    primaryCta: string;
    secondaryCta: string;
  };
  intro: { title: string; paragraphs: string[] };
  includes: { title: string; items: string[] };
  limits: { label: string; title: string; paragraphs: string[] };
  journey: { eyebrow: string; title: string; steps: { title: string; text: string }[] };
  faq: { eyebrow: string; title: string; items: { title: string; text: string }[] };
  legalLinksTitle: string;
}

const nl: BudgetCoachingDict = {
  meta: {
    title: "Budgetbegeleiding en administratieve opvolging van schulden | ZADIASSURE",
    description:
      "Maak de balans van uw budget, breng uw schulden in kaart en volg uw betalingen op met ZADIASSURE. U houdt uw geld zelf en betaalt uw schuldeisers direct.",
  },
  hero: {
    eyebrow: "Budgetbegeleiding & administratieve opvolging van schulden",
    title: "Neem opnieuw controle over uw budget en volg uw schulden met een duidelijke methode.",
    text: "ZADIASSURE helpt u uw situatie in kaart te brengen, uw documenten te ordenen, prioriteiten te bepalen en een realistisch betalingskalender op te stellen. U behoudt op elk moment de controle over uw geld en voert de betalingen zelf uit vanaf uw eigen bankrekening.",
    primaryCta: "Een eerste balans aanvragen",
    secondaryCta: "Een afspraak maken",
  },
  intro: {
    title: "Wat de begeleiding inhoudt",
    paragraphs: [
      "Wanneer facturen, herinneringen en vervaldagen zich opstapelen, is het moeilijk te weten waar te beginnen. Onze begeleiding geeft u een totaaloverzicht en een kader voor opvolging. Samen analyseren we inkomsten, lasten, schulden en dringende zaken om een organisatie op te bouwen die bij uw situatie past.",
      "We kunnen u ook helpen bij het voorbereiden van geïndividualiseerde administratieve aanvragen, het opvragen van geactualiseerde afrekeningen en het opvolgen van de ontvangen antwoorden. Elke bijkomende tussenkomst wordt uitgelegd en getarifeerd vóór ze wordt uitgevoerd.",
    ],
  },
  includes: {
    title: "Dit is inbegrepen",
    items: [
      "Inventaris van schuldeisers, facturen en dossierreferenties",
      "Analyse van inkomsten, lasten en beschikbare maandelijkse capaciteit",
      "Identificatie van dringende zaken en prioritaire vervaldagen",
      "Opmaak van een budget en een betalingskalender",
      "Controle van betalingsbewijzen en beschikbare afrekeningen",
      "Opvolgingsgesprek per kwartaal, daarna halfjaarlijks bij een stabiele situatie",
      "Voorbereiding van administratieve stappen met uw akkoord",
      "Doorverwijzing naar een erkende dienst wanneer de situatie dat vraagt",
    ],
  },
  limits: {
    label: "Verplichte vermelding",
    title: "Duidelijke grenzen van onze tussenkomst",
    paragraphs: [
      "ZADIASSURE ontvangt geen bedragen bestemd voor schuldeisers en betaalt de schuldeisers niet in de plaats van de klant. De klant blijft verantwoordelijk voor zijn beslissingen en voert zijn betalingen zelf direct uit.",
      "ZADIASSURE oefent geen gereglementeerde schuldbemiddeling uit en biedt geen collectieve schuldenregeling aan. Wanneer de situatie een gereglementeerde, gerechtelijke of juridische tussenkomst vraagt, wordt de klant doorverwezen naar een bevoegde instantie of professional (OCMW, erkende dienst voor schuldbemiddeling, advocaat of andere professional).",
    ],
  },
  journey: {
    eyebrow: "Klantentraject",
    title: "Vier stappen, van eerste balans tot stabilisatie",
    steps: [
      {
        title: "Eerste balans",
        text: "Ontvangst en analyse van de documenten, het budget, de dringende zaken en de schuldeisers.",
      },
      {
        title: "Organisatieplan",
        text: "U ontvangt een budgetkalender en plant uw betalingen zelf in.",
      },
      {
        title: "Opvolging na drie maanden",
        text: "Nazicht van betalingen, afrekeningen, incidenten en de evolutie van het budget.",
      },
      {
        title: "Stabilisatie",
        text: "Mogelijke overgang naar een halfjaarlijkse opvolging of doorverwijzing naar een erkende dienst.",
      },
    ],
  },
  faq: {
    eyebrow: "Veelgestelde vragen",
    title: "Uw vragen over budgetbegeleiding",
    items: [
      {
        title: "Betaalt ZADIASSURE mijn schuldeisers in mijn plaats?",
        text: "Nee. Uw geld blijft op uw rekening en u voert elke betaling zelf uit. Wij helpen u uw kalender te organiseren, te controleren en op te volgen.",
      },
      {
        title: "Is dit schuldbemiddeling?",
        text: "Nee. ZADIASSURE biedt budgetbegeleiding en administratieve opvolging. Wij oefenen geen gereglementeerde schuldbemiddeling uit en geen collectieve schuldenregeling.",
      },
      {
        title: "Kunt u garanderen dat een schuldeiser een voorstel aanvaardt?",
        text: "Nee. Elke beslissing behoort toe aan de schuldeiser. Wij kunnen u helpen een aanvraag voor te bereiden, de nuttige informatie te bezorgen en het antwoord op te volgen.",
      },
      {
        title: "Hoe vaak maken we de balans op?",
        text: "De eerste opvolging is doorgaans na drie maanden voorzien. Is de situatie gestabiliseerd, dan kunnen de gesprekken daarna elke zes maanden plaatsvinden.",
      },
      {
        title: "Wat als mijn situatie te complex is?",
        text: "Dan leggen we de grenzen van onze tussenkomst uit en verwijzen we u door naar een OCMW, een erkende dienst voor schuldbemiddeling, een advocaat of een andere bevoegde professional.",
      },
    ],
  },
  legalLinksTitle: "Juridische informatie",
};

const fr: BudgetCoachingDict = {
  meta: {
    title: "Accompagnement budgétaire et suivi des dettes | ZADIASSURE",
    description:
      "Faites le point sur votre budget, organisez vos dettes et suivez vos paiements avec ZADIASSURE. Le client conserve son argent et paie directement ses créanciers.",
  },
  hero: {
    eyebrow: "Accompagnement budgétaire & suivi administratif des dettes",
    title: "Reprenez le contrôle de votre budget et suivez vos dettes avec une méthode claire.",
    text: "ZADIASSURE vous aide à faire le point sur votre situation, à classer vos documents, à identifier les priorités et à mettre en place un calendrier de paiement réaliste. Vous conservez à tout moment le contrôle de votre argent et effectuez vous-même les paiements depuis votre compte bancaire.",
    primaryCta: "Demander un bilan initial",
    secondaryCta: "Prendre rendez-vous",
  },
  intro: {
    title: "Présentation du service",
    paragraphs: [
      "Lorsque les factures, rappels et échéances s'accumulent, il peut devenir difficile de savoir par où commencer. Notre accompagnement vous apporte une vue d'ensemble et un cadre de suivi. Nous analysons avec vous les revenus, les charges, les dettes et les urgences afin de construire une organisation adaptée à votre situation.",
      "Nous pouvons également vous aider à préparer des demandes administratives individualisées, à demander des décomptes actualisés et à suivre les réponses reçues. Chaque intervention supplémentaire est expliquée et tarifée avant son exécution.",
    ],
  },
  includes: {
    title: "Ce que comprend l'accompagnement",
    items: [
      "Inventaire des créanciers, factures et références de dossier",
      "Analyse des revenus, charges et capacité mensuelle disponible",
      "Identification des urgences et des échéances prioritaires",
      "Création d'un budget et d'un calendrier de paiement",
      "Contrôle des preuves de paiement et des décomptes disponibles",
      "Rendez-vous de suivi trimestriel, puis semestriel si la situation est stabilisée",
      "Préparation de démarches administratives avec l'accord du client",
      "Orientation vers un service habilité lorsque la situation l'exige",
    ],
  },
  limits: {
    label: "Mention obligatoire",
    title: "Limites claires de notre intervention",
    paragraphs: [
      "ZADIASSURE ne reçoit pas les sommes destinées aux créanciers et ne paie pas les créanciers à la place du client. Le client reste responsable de ses décisions et effectue directement ses paiements.",
      "ZADIASSURE n'exerce pas la médiation de dettes réglementée et ne propose pas de règlement collectif de dettes. Lorsque la situation nécessite une intervention réglementée, judiciaire ou juridique, le client est orienté vers un organisme ou un professionnel compétent (CPAS, service de médiation de dettes habilité, avocat ou autre professionnel).",
    ],
  },
  journey: {
    eyebrow: "Parcours client",
    title: "Quatre étapes, du bilan initial à la stabilisation",
    steps: [
      {
        title: "Bilan initial",
        text: "Réception et analyse des documents, du budget, des urgences et des créanciers.",
      },
      {
        title: "Plan d'organisation",
        text: "Le client reçoit un calendrier budgétaire et programme lui-même ses paiements.",
      },
      {
        title: "Suivi à trois mois",
        text: "Vérification des paiements, des décomptes, des incidents et de l'évolution du budget.",
      },
      {
        title: "Stabilisation",
        text: "Passage possible à un suivi semestriel ou orientation vers un service habilité.",
      },
    ],
  },
  faq: {
    eyebrow: "Questions fréquentes",
    title: "Vos questions sur l'accompagnement budgétaire",
    items: [
      {
        title: "Est-ce que ZADIASSURE paie mes créanciers à ma place ?",
        text: "Non. Vous conservez votre argent sur votre compte et vous effectuez directement chaque paiement. Nous vous aidons à organiser, vérifier et suivre votre calendrier.",
      },
      {
        title: "Est-ce une médiation de dettes ?",
        text: "Non. ZADIASSURE propose un accompagnement budgétaire et un suivi administratif. Nous n'exerçons pas la médiation de dettes réglementée ni le règlement collectif de dettes.",
      },
      {
        title: "Pouvez-vous garantir qu'un créancier acceptera une proposition ?",
        text: "Non. Toute décision appartient au créancier. Nous pouvons vous aider à préparer une demande, à transmettre les informations utiles et à suivre la réponse.",
      },
      {
        title: "À quelle fréquence faisons-nous le point ?",
        text: "Le premier suivi est généralement prévu après trois mois. Si la situation est stabilisée, les rendez-vous peuvent ensuite avoir lieu tous les six mois.",
      },
      {
        title: "Que se passe-t-il si ma situation est trop complexe ?",
        text: "Nous vous expliquons les limites de notre intervention et pouvons vous orienter vers un CPAS, un service de médiation de dettes habilité, un avocat ou un autre professionnel compétent.",
      },
    ],
  },
  legalLinksTitle: "Informations juridiques",
};

const en: BudgetCoachingDict = {
  meta: {
    title: "Budget coaching and administrative debt follow-up | ZADIASSURE",
    description:
      "Review your budget, organise your debts and follow up your payments with ZADIASSURE. You keep your money and pay your creditors directly.",
  },
  hero: {
    eyebrow: "Budget coaching & administrative debt follow-up",
    title: "Take back control of your budget and follow your debts with a clear method.",
    text: "ZADIASSURE helps you review your situation, organise your documents, identify priorities and set up a realistic payment schedule. You keep control of your money at all times and make the payments yourself from your own bank account.",
    primaryCta: "Request an initial review",
    secondaryCta: "Book an appointment",
  },
  intro: {
    title: "About this service",
    paragraphs: [
      "When invoices, reminders and deadlines pile up, it can be hard to know where to start. Our support gives you an overview and a follow-up framework. Together we analyse income, expenses, debts and urgent matters in order to build an organisation that fits your situation.",
      "We can also help you prepare individual administrative requests, ask for updated statements of account and follow up on the answers received. Every additional intervention is explained and priced before it is carried out.",
    ],
  },
  includes: {
    title: "What the support includes",
    items: [
      "Inventory of creditors, invoices and file references",
      "Analysis of income, expenses and available monthly capacity",
      "Identification of urgent matters and priority deadlines",
      "Creation of a budget and a payment schedule",
      "Checking payment proofs and available statements of account",
      "Quarterly follow-up meeting, then every six months once the situation is stable",
      "Preparation of administrative steps with the client's agreement",
      "Referral to an authorised service when the situation requires it",
    ],
  },
  limits: {
    label: "Mandatory notice",
    title: "Clear limits of our intervention",
    paragraphs: [
      "ZADIASSURE does not receive amounts intended for creditors and does not pay creditors on behalf of the client. The client remains responsible for their decisions and makes their payments directly.",
      "ZADIASSURE does not carry out regulated debt mediation and does not offer collective debt settlement. When a situation requires regulated, judicial or legal intervention, the client is referred to a competent organisation or professional (public social welfare centre, authorised debt mediation service, lawyer or other professional).",
    ],
  },
  journey: {
    eyebrow: "Client journey",
    title: "Four steps, from initial review to stabilisation",
    steps: [
      {
        title: "Initial review",
        text: "Receiving and analysing the documents, the budget, urgent matters and creditors.",
      },
      {
        title: "Organisation plan",
        text: "The client receives a budget schedule and programmes the payments themselves.",
      },
      {
        title: "Follow-up after three months",
        text: "Checking payments, statements of account, incidents and how the budget evolves.",
      },
      {
        title: "Stabilisation",
        text: "Possible move to six-monthly follow-up or referral to an authorised service.",
      },
    ],
  },
  faq: {
    eyebrow: "Frequently asked questions",
    title: "Your questions about budget coaching",
    items: [
      {
        title: "Does ZADIASSURE pay my creditors for me?",
        text: "No. Your money stays in your account and you make every payment yourself. We help you organise, check and follow up your schedule.",
      },
      {
        title: "Is this debt mediation?",
        text: "No. ZADIASSURE offers budget coaching and administrative follow-up. We do not carry out regulated debt mediation or collective debt settlement.",
      },
      {
        title: "Can you guarantee that a creditor will accept a proposal?",
        text: "No. Every decision belongs to the creditor. We can help you prepare a request, provide the useful information and follow up the answer.",
      },
      {
        title: "How often do we review the situation?",
        text: "The first follow-up is usually planned after three months. If the situation is stable, meetings can then take place every six months.",
      },
      {
        title: "What if my situation is too complex?",
        text: "We explain the limits of our intervention and can refer you to a public social welfare centre, an authorised debt mediation service, a lawyer or another competent professional.",
      },
    ],
  },
  legalLinksTitle: "Legal information",
};

export const budgetCoachingDictionaries: Record<Locale, BudgetCoachingDict> = { nl, fr, en };
