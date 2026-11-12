import { Link } from "@tanstack/react-router";
import { CalendarDays, ExternalLink } from "lucide-react";
import { useLanguage } from "@/i18n";

type Article = { category: string; title: string; body: string[]; sources: string[]; sourceLabel?: string };

type DigestDict = {
  badge: string;
  heading: string;
  period: string;
  intro: string;
  readMore: string;
  contactLead: string;
  contactLink: string;
  disclaimer: string;
  articles: Article[];
};

const NL: DigestDict = {
  badge: "Nieuwste",
  heading: "Weekoverzicht",
  period: "31 oktober – 7 november 2026",
  intro:
    "Elke week volgt ZADIASSURE de belangrijkste ontwikkelingen rond krediet en schulden, werk, verblijf en inburgering in België.",
  readMore: "Lees meer bij de bron",
  contactLead: "Vragen over je eigen situatie?",
  contactLink: "Neem contact met ons op.",
  disclaimer:
    "Dit overzicht is een feitelijke samenvatting van publieke bronnen en is geen juridisch of financieel advies. Controleer steeds de officiële teksten.",
  articles: [
    {
      category: "Krediet en schulden",
      title: "Nieuwe regels voor consumentenkrediet vanaf 20 november 2026",
      body: [
        "Vanaf 20 november 2026 gelden strengere regels voor leningen:",
        "• \"Nu kopen, later betalen\"-formules vallen voortaan ook onder de kredietregels.",
        "• Kredietgevers moeten altijd eerst de Centrale voor Kredieten aan Particulieren raadplegen. Wie meer dan 1.000 euro geregistreerde achterstallen heeft, krijgt geen nieuw krediet.",
        "• Neemt een computer de kredietbeslissing? Dan heb je recht op uitleg en kan je een menselijke herbeoordeling vragen.",
        "• Reclame die mensen in financiële moeilijkheden aanzet om te lenen, wordt verboden.",
        "• Je kan een krediet makkelijker vroegtijdig terugbetalen.",
        "• Een bank moet minstens 30 dagen op voorhand verwittigen voor ze een kredietlijn stopzet.",
      ],
      sources: [
        "https://cms.law/nl/bel/legal-updates/nieuwe-europese-regels-voor-consumentenkrediet-omgezet-in-belgische-wetgeving",
        "https://juriup.be/actualite-juridique/reforme-credit-consommation-2026/",
      ],
    },
    {
      category: "Krediet en schulden",
      title: "Studietoelage blijft beschermd bij schuldenregeling",
      body: [
        "Het Grondwettelijk Hof bevestigde op 22 oktober 2026 dat een studietoelage bedoeld blijft voor de student, ook in een collectieve schuldenregeling. Ze mag niet zomaar gebruikt worden om andere schulden af te betalen. Het arrest gaat over de Franse Gemeenschap.",
      ],
      sources: ["https://www.schuldbemiddeling.be/studietoelage-collectieve-schuldenregeling/"],
    },
    {
      category: "Krediet en schulden",
      title: "Noord-Limburg: OCMW Pelt neemt schuldenregeling over",
      body: ["Vanaf 1 januari 2027 neemt OCMW Pelt de collectieve schuldenregeling in de regio Noord-Limburg over."],
      sources: ["https://www.schuldbemiddeling.be/noordkracht-collectieve-schuldenregeling-2027/"],
    },
    {
      category: "Werk en buitenlandse werknemers",
      title: "Loondrempel voor buitenlandse werknemers wordt automatisch geïndexeerd",
      body: [
        "De Vlaamse Regering keurde op 30 oktober 2026 in principe goed dat de loondrempel voor de gecombineerde vergunning en de arbeidskaart elk jaar op 1 januari automatisch wordt aangepast. Dit is nog niet definitief: eerst volgt nog advies van de SERV en de Raad van State. De lijsten met knelpuntberoepen van VDAB, Actiris en FOREM zijn deze week niet veranderd.",
      ],
      sources: [
        "https://www.ewi-vlaanderen.be/nieuws/beslissingen-vlaamse-regering-werk-economie-wetenschap-innovatie-en-sociale-economie-30-2",
      ],
    },
    {
      category: "Verblijf en immigratie",
      title: "Kamer keurt wet op woonstbetredingen goed",
      body: [
        "De Kamer keurde op 5 november 2026 een wet goed die de politie onder strikte voorwaarden toelaat om woningen te betreden om mensen zonder verblijfsrecht aan te houden. Een onderzoeksrechter moet dit telkens vooraf goedkeuren. De wet is nog niet gepubliceerd in het Belgisch Staatsblad en dus nog niet van kracht. Voor arbeidskaarten, beroepskaarten, gezinshereniging en nationaliteitsaanvragen waren er deze week geen nieuwe wijzigingen.",
      ],
      sources: [
        "https://www.vrt.be/vrtnws/nl/2026/11/05/woonstbetredingen-bossuyt-parlement-ice/",
        "https://www.bruzz.be/actua/politiek/kamer-keurt-woonstbetredingen-goed-2026-11-06",
      ],
    },
    {
      category: "Inburgering",
      title: "Nieuwe inburgeringsregels in Vlaanderen in voorbereiding",
      body: [
        "Deze week waren er geen nieuwe wijzigingen. Vlaanderen werkt wel aan nieuwe regels, waaronder een verplicht voortraject voor arbeidsmigranten van buiten de EU en hun meerderjarige familieleden, en een hoger taalniveau (mondeling B1). Er is nog geen startdatum. Sinds februari 2026 moet je al 70% halen voor de cursus Maatschappelijke Oriëntatie.",
      ],
      sources: [
        "https://www.integratie-inburgering.be/nl/principiele-goedkeuring-wijzigingsdecreet-integratie-en-inburgeringsbeleid",
      ],
    },
    {
      category: "Rechtspraak",
      title: "Geen nieuwe uitspraken gepubliceerd",
      body: [
        "Deze week werden geen nieuwe gepubliceerde uitspraken gevonden over verblijf, werk of gezinshereniging. De officiële databanken lopen vaak achter.",
      ],
      sources: ["https://www.rvv-cce.be"],
      sourceLabel: "Zelf opzoeken",
    },
  ],
};

const FR: DigestDict = {
  badge: "Nouveau",
  heading: "Aperçu de la semaine",
  period: "31 octobre – 7 novembre 2026",
  intro:
    "Chaque semaine, ZADIASSURE suit les évolutions les plus importantes en matière de crédit et de dettes, de travail, de séjour et d'intégration en Belgique.",
  readMore: "Lire la source",
  contactLead: "Des questions sur votre situation ?",
  contactLink: "Contactez-nous.",
  disclaimer:
    "Cet aperçu est un résumé factuel de sources publiques et ne constitue pas un avis juridique ou financier. Vérifiez toujours les textes officiels.",
  articles: [
    {
      category: "Crédit et dettes",
      title: "Nouvelles règles pour le crédit à la consommation dès le 20 novembre 2026",
      body: [
        "À partir du 20 novembre 2026, des règles plus strictes s'appliquent aux crédits :",
        "• Les formules « achetez maintenant, payez plus tard » relèvent désormais aussi des règles sur le crédit.",
        "• Les prêteurs doivent toujours consulter d'abord la Centrale des crédits aux particuliers. Qui a plus de 1.000 euros d'arriérés enregistrés n'obtient pas de nouveau crédit.",
        "• Un ordinateur prend la décision de crédit ? Vous avez droit à une explication et pouvez demander une réévaluation humaine.",
        "• La publicité qui incite les personnes en difficulté financière à emprunter sera interdite.",
        "• Vous pouvez rembourser un crédit par anticipation plus facilement.",
        "• Une banque doit avertir au moins 30 jours à l'avance avant de clôturer une ligne de crédit.",
      ],
      sources: [
        "https://cms.law/nl/bel/legal-updates/nieuwe-europese-regels-voor-consumentenkrediet-omgezet-in-belgische-wetgeving",
        "https://juriup.be/actualite-juridique/reforme-credit-consommation-2026/",
      ],
    },
    {
      category: "Crédit et dettes",
      title: "L'allocation d'études reste protégée en cas de règlement de dettes",
      body: [
        "La Cour constitutionnelle a confirmé le 22 octobre 2026 qu'une allocation d'études reste destinée à l'étudiant, même dans un règlement collectif de dettes. Elle ne peut pas simplement être utilisée pour rembourser d'autres dettes. L'arrêt concerne la Communauté française.",
      ],
      sources: ["https://www.schuldbemiddeling.be/studietoelage-collectieve-schuldenregeling/"],
    },
    {
      category: "Crédit et dettes",
      title: "Limbourg du Nord : le CPAS de Pelt reprend le règlement de dettes",
      body: ["À partir du 1er janvier 2027, le CPAS de Pelt reprend le règlement collectif de dettes dans la région du Limbourg du Nord."],
      sources: ["https://www.schuldbemiddeling.be/noordkracht-collectieve-schuldenregeling-2027/"],
    },
    {
      category: "Travail et travailleurs étrangers",
      title: "Le seuil salarial pour les travailleurs étrangers sera indexé automatiquement",
      body: [
        "Le Gouvernement flamand a approuvé en principe le 30 octobre 2026 que le seuil salarial pour le permis unique et la carte de travail soit adapté automatiquement chaque année au 1er janvier. Ce n'est pas encore définitif : un avis du SERV et du Conseil d'État doit encore suivre. Les listes des métiers en pénurie du VDAB, d'Actiris et du FOREM n'ont pas changé cette semaine.",
      ],
      sources: [
        "https://www.ewi-vlaanderen.be/nieuws/beslissingen-vlaamse-regering-werk-economie-wetenschap-innovatie-en-sociale-economie-30-2",
      ],
    },
    {
      category: "Séjour et immigration",
      title: "La Chambre approuve la loi sur les visites domiciliaires",
      body: [
        "La Chambre a approuvé le 5 novembre 2026 une loi qui permet à la police, sous des conditions strictes, d'entrer dans des habitations pour arrêter des personnes sans droit de séjour. Un juge d'instruction doit l'approuver au préalable à chaque fois. La loi n'est pas encore publiée au Moniteur belge et donc pas encore en vigueur. Pour les cartes de travail, les cartes professionnelles, le regroupement familial et les demandes de nationalité, il n'y a eu aucune nouvelle modification cette semaine.",
      ],
      sources: [
        "https://www.vrt.be/vrtnws/nl/2026/11/05/woonstbetredingen-bossuyt-parlement-ice/",
        "https://www.bruzz.be/actua/politiek/kamer-keurt-woonstbetredingen-goed-2026-11-06",
      ],
    },
    {
      category: "Intégration",
      title: "Nouvelles règles d'intégration en préparation en Flandre",
      body: [
        "Cette semaine, il n'y a eu aucune nouvelle modification. La Flandre travaille toutefois à de nouvelles règles, dont un parcours préliminaire obligatoire pour les travailleurs migrants hors UE et leurs membres de famille majeurs, et un niveau de langue plus élevé (B1 à l'oral). Il n'y a pas encore de date de début. Depuis février 2026, vous devez déjà obtenir 70 % pour le cours d'Orientation sociale.",
      ],
      sources: [
        "https://www.integratie-inburgering.be/nl/principiele-goedkeuring-wijzigingsdecreet-integratie-en-inburgeringsbeleid",
      ],
    },
    {
      category: "Jurisprudence",
      title: "Aucune nouvelle décision publiée",
      body: [
        "Cette semaine, aucune nouvelle décision publiée n'a été trouvée concernant le séjour, le travail ou le regroupement familial. Les bases de données officielles accusent souvent du retard.",
      ],
      sources: ["https://www.rvv-cce.be"],
      sourceLabel: "Rechercher soi-même",
    },
  ],
};

const EN: DigestDict = {
  badge: "Latest",
  heading: "Weekly overview",
  period: "31 October – 7 November 2026",
  intro:
    "Every week ZADIASSURE tracks the most important developments around credit and debt, work, residence and integration in Belgium.",
  readMore: "Read more at the source",
  contactLead: "Questions about your own situation?",
  contactLink: "Get in touch with us.",
  disclaimer:
    "This overview is a factual summary of public sources and is not legal or financial advice. Always check the official texts.",
  articles: [
    {
      category: "Credit and debt",
      title: "New consumer credit rules from 20 November 2026",
      body: [
        "From 20 November 2026, stricter rules apply to loans:",
        "• \"Buy now, pay later\" schemes now also fall under the credit rules.",
        "• Lenders must always consult the Central Credit Register first. Anyone with more than 1,000 euros in registered arrears will not get new credit.",
        "• Does a computer make the credit decision? You have the right to an explanation and can request a human review.",
        "• Advertising that encourages people in financial difficulty to borrow will be banned.",
        "• You can repay a loan early more easily.",
        "• A bank must give at least 30 days' notice before closing a credit line.",
      ],
      sources: [
        "https://cms.law/nl/bel/legal-updates/nieuwe-europese-regels-voor-consumentenkrediet-omgezet-in-belgische-wetgeving",
        "https://juriup.be/actualite-juridique/reforme-credit-consommation-2026/",
      ],
    },
    {
      category: "Credit and debt",
      title: "Study grant remains protected in debt settlement",
      body: [
        "On 22 October 2026 the Constitutional Court confirmed that a study grant remains intended for the student, even in a collective debt settlement. It cannot simply be used to pay off other debts. The ruling concerns the French Community.",
      ],
      sources: ["https://www.schuldbemiddeling.be/studietoelage-collectieve-schuldenregeling/"],
    },
    {
      category: "Credit and debt",
      title: "North Limburg: OCMW Pelt takes over debt settlement",
      body: ["From 1 January 2027, OCMW Pelt takes over collective debt settlement in the North Limburg region."],
      sources: ["https://www.schuldbemiddeling.be/noordkracht-collectieve-schuldenregeling-2027/"],
    },
    {
      category: "Work and foreign workers",
      title: "Salary threshold for foreign workers to be indexed automatically",
      body: [
        "On 30 October 2026 the Flemish Government approved in principle that the salary threshold for the single permit and the work card will be adjusted automatically every year on 1 January. This is not final yet: advice from the SERV and the Council of State must follow first. The shortage occupation lists of VDAB, Actiris and FOREM did not change this week.",
      ],
      sources: [
        "https://www.ewi-vlaanderen.be/nieuws/beslissingen-vlaamse-regering-werk-economie-wetenschap-innovatie-en-sociale-economie-30-2",
      ],
    },
    {
      category: "Residence and immigration",
      title: "Chamber approves law on home visits",
      body: [
        "On 5 November 2026 the Chamber approved a law allowing the police, under strict conditions, to enter homes to arrest people without residence rights. An investigating judge must approve this in advance each time. The law has not yet been published in the Belgian Official Gazette and is therefore not yet in force. For work cards, professional cards, family reunification and nationality applications there were no new changes this week.",
      ],
      sources: [
        "https://www.vrt.be/vrtnws/nl/2026/11/05/woonstbetredingen-bossuyt-parlement-ice/",
        "https://www.bruzz.be/actua/politiek/kamer-keurt-woonstbetredingen-goed-2026-11-06",
      ],
    },
    {
      category: "Integration",
      title: "New integration rules in preparation in Flanders",
      body: [
        "There were no new changes this week. Flanders is working on new rules, including a mandatory preliminary programme for labour migrants from outside the EU and their adult family members, and a higher language level (B1 spoken). There is no start date yet. Since February 2026 you already need 70% for the Social Orientation course.",
      ],
      sources: [
        "https://www.integratie-inburgering.be/nl/principiele-goedkeuring-wijzigingsdecreet-integratie-en-inburgeringsbeleid",
      ],
    },
    {
      category: "Case law",
      title: "No new rulings published",
      body: [
        "No newly published rulings on residence, work or family reunification were found this week. The official databases often lag behind.",
      ],
      sources: ["https://www.rvv-cce.be"],
      sourceLabel: "Look it up yourself",
    },
  ],
};

const DICTS = { nl: NL, fr: FR, en: EN } as const;

export function WeeklyDigest() {
  const { locale } = useLanguage();
  const d = DICTS[locale as keyof typeof DICTS] ?? NL;

  return (
    <div className="mb-14">
      <span className="w-fit rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">{d.badge}</span>
      <h2 className="mt-4 text-2xl font-bold leading-snug text-primary">
        {d.heading}: {d.period}
      </h2>
      <p className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <CalendarDays className="size-4" aria-hidden />
        {d.period}
      </p>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{d.intro}</p>

      <ul className="mt-8 grid gap-6 md:grid-cols-2">
        {d.articles.map((a) => (
          <li key={a.title} className="flex flex-col rounded-3xl border border-border bg-card p-7 shadow-soft transition-shadow hover:shadow-lift">
            <span className="w-fit rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">{a.category}</span>
            <h3 className="mt-4 text-xl font-bold leading-snug text-primary">{a.title}</h3>
            <div className="mt-3 flex-1 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
              {a.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <div className="mt-5 flex flex-col gap-1.5">
              {a.sources.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  {a.sourceLabel ?? d.readMore}
                  {a.sources.length > 1 && <span className="font-normal text-muted-foreground">({new URL(url).hostname.replace("www.", "")})</span>}
                  <ExternalLink className="size-4" aria-hidden />
                </a>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-sm text-foreground">
        {d.contactLead}{" "}
        <Link to="/contact" className="font-semibold text-primary underline">
          {d.contactLink}
        </Link>
      </p>
      <p className="mt-3 max-w-3xl text-xs leading-relaxed text-muted-foreground">{d.disclaimer}</p>
    </div>
  );
}
