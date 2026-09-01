import type { Locale } from "./types";

/**
 * Copy for the three "aanpak" pages behind the positioning chain on the
 * homepage: Complexity -> Solution -> Autonomy.
 */
export type ApproachSlug = "complexiteit" | "oplossing" | "autonomie";

export const approachSlugs: ApproachSlug[] = ["complexiteit", "oplossing", "autonomie"];

export interface ApproachStep {
  slug: ApproachSlug;
  label: string;
  eyebrow: string;
  title: string;
  intro: string;
  metaTitle: string;
  metaDescription: string;
  imageAlt: string;
  blocks: { title: string; text: string }[];
  listTitle: string;
  list: string[];
}

export interface ApproachDict {
  chainHint: string;
  back: string;
  nextLabel: string;
  steps: Record<ApproachSlug, ApproachStep>;
}

const nl: ApproachDict = {
  chainHint: "Klik op een stap voor meer uitleg",
  back: "Terug naar de homepage",
  nextLabel: "Volgende stap",
  steps: {
    complexiteit: {
      slug: "complexiteit",
      label: "Complexiteit",
      eyebrow: "Stap 1",
      title: "Complexiteit: we brengen uw situatie in kaart",
      intro:
        "Brieven, termijnen, formulieren en instanties die elkaar tegenspreken. Wij beginnen altijd met rust en overzicht: wat is er precies aan de hand, wat is dringend en wat kan wachten?",
      metaTitle: "Complexiteit begrijpen | ZADIASSURE",
      metaDescription:
        "Hoe ZADIASSURE administratieve, financiële en taalgerelateerde complexiteit in kaart brengt: intake, dossieranalyse en een duidelijk overzicht.",
      imageAlt: "Vrouw bekijkt haar administratie en brieven aan de keukentafel",
      blocks: [
        { title: "Vrij eerste gesprek", text: "We luisteren naar uw verhaal, in het Nederlands, Frans of Engels." },
        { title: "Dossier doornemen", text: "We nemen uw brieven, contracten en beslissingen samen door." },
        { title: "Termijnen eerst", text: "Wat een deadline heeft, behandelen we onmiddellijk." },
        { title: "Eerlijk beeld", text: "U krijgt te horen wat wel en wat niet mogelijk is." },
      ],
      listTitle: "Situaties die wij vaak zien",
      list: [
        "Complexe procedures bij overheid of instanties",
        "Onduidelijke documenten of beslissingen",
        "Administratieve achterstand en aanmaningen",
        "Taalbarrière bij formulieren en briefwisseling",
        "Betalingsproblemen of schulden die aangroeien",
      ],
    },
    oplossing: {
      slug: "oplossing",
      label: "Oplossing",
      eyebrow: "Stap 2",
      title: "Oplossing: een concreet plan en opvolging",
      intro:
        "Van overzicht naar actie. U krijgt een plan met duidelijke stappen, wie wat doet en wanneer. Wij nemen de briefwisseling en contacten op ons waar dat nodig is.",
      metaTitle: "Uw oplossing en actieplan | ZADIASSURE",
      metaDescription:
        "Van analyse naar actie: een concreet plan, correcte documenten, contact met instanties en administratieve opvolging bij ZADIASSURE.",
      imageAlt: "Adviseur legt documenten uit aan een klant",
      blocks: [
        { title: "Duidelijk plan", text: "Stap per stap, met prioriteiten en realistische timing." },
        { title: "Correcte documenten", text: "Formulieren en aanvragen volledig en correct ingediend." },
        { title: "Wij nemen contact op", text: "Instanties, schuldeisers of diensten: wij spreken de juiste taal." },
        { title: "Minnelijke oplossing", text: "Waar mogelijk kiezen we voor overleg in plaats van conflict." },
      ],
      listTitle: "Wat u van ons mag verwachten",
      list: [
        "Één aanspreekpunt tot de afronding",
        "Heldere afspraken over prijs en aanpak",
        "Vertrouwelijke behandeling van uw gegevens",
        "Uitleg in begrijpelijke taal, zonder jargon",
        "Doorverwijzing naar een partner als dat beter is voor u",
      ],
    },
    autonomie: {
      slug: "autonomie",
      label: "Autonomie",
      eyebrow: "Stap 3",
      title: "Autonomie: u houdt zelf de controle",
      intro:
        "Ons doel is niet dat u ons blijft nodig hebben. Wij leren u hoe uw administratie in orde blijft, zodat u met vertrouwen, stabiliteit en rust verder kunt.",
      metaTitle: "Autonomie en rust op lange termijn | ZADIASSURE",
      metaDescription:
        "ZADIASSURE begeleidt u naar autonomie: structuur in uw administratie, budgetinzicht en preventie zodat problemen niet terugkomen.",
      imageAlt: "Klant met overzicht en vertrouwen na begeleiding",
      blocks: [
        { title: "Structuur die blijft", text: "Een eenvoudig systeem voor uw brieven en documenten." },
        { title: "Budget in beeld", text: "Inkomsten, vaste kosten en marge, zonder verrassingen." },
        { title: "Preventie", text: "U weet welke signalen u niet mag negeren." },
        { title: "Deur blijft open", text: "Bij een nieuwe vraag bent u altijd opnieuw welkom." },
      ],
      listTitle: "Het resultaat",
      list: [
        "Rust in plaats van stress bij de post",
        "Zicht op uw rechten en verplichtingen",
        "Minder kosten door achterstand of boetes",
        "Vertrouwen om zelf stappen te zetten",
        "Een stabiele basis voor uw gezin of onderneming",
      ],
    },
  },
};

const fr: ApproachDict = {
  chainHint: "Cliquez sur une étape pour en savoir plus",
  back: "Retour à l'accueil",
  nextLabel: "Étape suivante",
  steps: {
    complexiteit: {
      slug: "complexiteit",
      label: "Complexité",
      eyebrow: "Étape 1",
      title: "Complexité : nous clarifions votre situation",
      intro:
        "Courriers, délais, formulaires et administrations qui se contredisent. Nous commençons toujours par le calme et la vue d'ensemble : que se passe-t-il exactement, qu'est-ce qui est urgent, qu'est-ce qui peut attendre ?",
      metaTitle: "Comprendre la complexité | ZADIASSURE",
      metaDescription:
        "Comment ZADIASSURE analyse la complexité administrative, financière et linguistique : entretien, analyse du dossier et vue d'ensemble claire.",
      imageAlt: "Femme examinant ses courriers administratifs à la table de cuisine",
      blocks: [
        { title: "Premier entretien libre", text: "Nous écoutons votre histoire, en français, néerlandais ou anglais." },
        { title: "Analyse du dossier", text: "Nous parcourons ensemble vos courriers, contrats et décisions." },
        { title: "Les délais d'abord", text: "Tout ce qui a une échéance est traité immédiatement." },
        { title: "Un regard honnête", text: "Nous vous disons ce qui est possible et ce qui ne l'est pas." },
      ],
      listTitle: "Les situations que nous rencontrons souvent",
      list: [
        "Procédures complexes auprès des administrations",
        "Documents ou décisions incompréhensibles",
        "Retard administratif et rappels de paiement",
        "Barrière linguistique dans les formulaires et courriers",
        "Difficultés de paiement ou dettes qui s'accumulent",
      ],
    },
    oplossing: {
      slug: "oplossing",
      label: "Solution",
      eyebrow: "Étape 2",
      title: "Solution : un plan concret et un suivi",
      intro:
        "De la vue d'ensemble à l'action. Vous recevez un plan avec des étapes claires, qui fait quoi et quand. Nous prenons en charge la correspondance et les contacts lorsque c'est nécessaire.",
      metaTitle: "Votre solution et plan d'action | ZADIASSURE",
      metaDescription:
        "De l'analyse à l'action : un plan concret, des documents corrects, le contact avec les administrations et le suivi administratif chez ZADIASSURE.",
      imageAlt: "Conseiller expliquant des documents à un client",
      blocks: [
        { title: "Un plan clair", text: "Étape par étape, avec des priorités et un calendrier réaliste." },
        { title: "Documents corrects", text: "Formulaires et demandes complets et introduits correctement." },
        { title: "Nous prenons contact", text: "Administrations, créanciers ou services : nous parlons leur langue." },
        { title: "Suivi structuré", text: "Un cadre clair de suivi, sans jamais gérer votre argent à votre place." },
      ],
      listTitle: "Ce que vous pouvez attendre de nous",
      list: [
        "Un seul interlocuteur jusqu'à la clôture",
        "Des accords clairs sur le prix et la méthode",
        "Un traitement confidentiel de vos données",
        "Des explications compréhensibles, sans jargon",
        "Une orientation vers un partenaire si c'est mieux pour vous",
      ],
    },
    autonomie: {
      slug: "autonomie",
      label: "Autonomie",
      eyebrow: "Étape 3",
      title: "Autonomie : vous gardez la maîtrise",
      intro:
        "Notre objectif n'est pas que vous dépendiez de nous. Nous vous apprenons à garder votre administration en ordre, pour avancer avec confiance, stabilité et sérénité.",
      metaTitle: "Autonomie et sérénité durable | ZADIASSURE",
      metaDescription:
        "ZADIASSURE vous accompagne vers l'autonomie : structure administrative, maîtrise du budget et prévention pour éviter la rechute.",
      imageAlt: "Cliente sereine après un accompagnement réussi",
      blocks: [
        { title: "Une structure durable", text: "Un système simple pour vos courriers et documents." },
        { title: "Budget maîtrisé", text: "Revenus, charges fixes et marge, sans surprises." },
        { title: "Prévention", text: "Vous savez quels signaux ne jamais ignorer." },
        { title: "La porte reste ouverte", text: "Pour une nouvelle question, vous êtes toujours bienvenu." },
      ],
      listTitle: "Le résultat",
      list: [
        "De la sérénité au lieu du stress à l'ouverture du courrier",
        "Une vision claire de vos droits et obligations",
        "Moins de frais liés aux retards ou amendes",
        "La confiance d'agir par vous-même",
        "Une base stable pour votre famille ou votre entreprise",
      ],
    },
  },
};

const en: ApproachDict = {
  chainHint: "Click a step to learn more",
  back: "Back to the homepage",
  nextLabel: "Next step",
  steps: {
    complexiteit: {
      slug: "complexiteit",
      label: "Complexity",
      eyebrow: "Step 1",
      title: "Complexity: we map out your situation",
      intro:
        "Letters, deadlines, forms and authorities that contradict each other. We always start with calm and clarity: what is really going on, what is urgent and what can wait?",
      metaTitle: "Understanding complexity | ZADIASSURE",
      metaDescription:
        "How ZADIASSURE maps administrative, financial and language-related complexity: intake, file analysis and a clear overview.",
      imageAlt: "Woman reviewing administrative letters at her kitchen table",
      blocks: [
        { title: "Free first conversation", text: "We listen to your story in Dutch, French or English." },
        { title: "File review", text: "We go through your letters, contracts and decisions together." },
        { title: "Deadlines first", text: "Anything with a deadline is handled immediately." },
        { title: "An honest picture", text: "You hear what is possible and what is not." },
      ],
      listTitle: "Situations we often see",
      list: [
        "Complex procedures with public authorities",
        "Unclear documents or decisions",
        "Administrative backlog and payment reminders",
        "Language barriers in forms and correspondence",
        "Payment problems or growing debt",
      ],
    },
    oplossing: {
      slug: "oplossing",
      label: "Solution",
      eyebrow: "Step 2",
      title: "Solution: a concrete plan with follow-up",
      intro:
        "From overview to action. You get a plan with clear steps, who does what and when. We take over correspondence and contacts wherever needed.",
      metaTitle: "Your solution and action plan | ZADIASSURE",
      metaDescription:
        "From analysis to action: a concrete plan, correct documents, contact with authorities and amicable solutions at ZADIASSURE.",
      imageAlt: "Adviser explaining documents to a client",
      blocks: [
        { title: "A clear plan", text: "Step by step, with priorities and realistic timing." },
        { title: "Correct documents", text: "Forms and applications complete and properly submitted." },
        { title: "We make the calls", text: "Authorities, creditors or services: we speak their language." },
        { title: "Amicable solution", text: "Where possible we choose dialogue over conflict." },
      ],
      listTitle: "What you can expect from us",
      list: [
        "One point of contact until the case is closed",
        "Clear agreements on price and approach",
        "Confidential handling of your data",
        "Explanations in plain language, no jargon",
        "A referral to a partner when that serves you better",
      ],
    },
    autonomie: {
      slug: "autonomie",
      label: "Autonomy",
      eyebrow: "Step 3",
      title: "Autonomy: you stay in control",
      intro:
        "Our goal is not for you to keep needing us. We teach you how to keep your administration in order, so you can move on with confidence, stability and peace of mind.",
      metaTitle: "Long-term autonomy and calm | ZADIASSURE",
      metaDescription:
        "ZADIASSURE guides you towards autonomy: administrative structure, budget insight and prevention so problems do not return.",
      imageAlt: "Client feeling confident after guidance",
      blocks: [
        { title: "Structure that lasts", text: "A simple system for your letters and documents." },
        { title: "Budget in view", text: "Income, fixed costs and margin, without surprises." },
        { title: "Prevention", text: "You know which signals you must never ignore." },
        { title: "The door stays open", text: "For a new question you are always welcome again." },
      ],
      listTitle: "The result",
      list: [
        "Calm instead of stress when the post arrives",
        "Clear insight into your rights and obligations",
        "Fewer costs from delays or fines",
        "The confidence to take steps yourself",
        "A stable base for your family or business",
      ],
    },
  },
};

export const approachDictionaries: Record<Locale, ApproachDict> = { nl, fr, en };
