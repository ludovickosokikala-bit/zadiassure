import { Link } from "@tanstack/react-router";
import { CalendarDays, ExternalLink } from "lucide-react";

type Article = { category: string; title: string; body: string[]; sources: string[]; sourceLabel?: string };

const PERIOD = "31 oktober – 7 november 2026";

const ARTICLES: Article[] = [
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
];

export function WeeklyDigest() {
  return (
    <div className="mb-14">
      <span className="w-fit rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">Nieuwste</span>
      <h2 className="mt-4 text-2xl font-bold leading-snug text-primary">Weekoverzicht: {PERIOD}</h2>
      <p className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <CalendarDays className="size-4" aria-hidden />
        {PERIOD}
      </p>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Elke week volgt ZADIASSURE de belangrijkste ontwikkelingen rond krediet en schulden, werk, verblijf en inburgering in België.
      </p>

      <ul className="mt-8 grid gap-6 md:grid-cols-2">
        {ARTICLES.map((a) => (
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
                  {a.sourceLabel ?? "Lees meer bij de bron"}
                  {a.sources.length > 1 && <span className="font-normal text-muted-foreground">({new URL(url).hostname.replace("www.", "")})</span>}
                  <ExternalLink className="size-4" aria-hidden />
                </a>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-sm text-foreground">
        Vragen over je eigen situatie?{" "}
        <Link to="/contact" className="font-semibold text-primary underline">
          Neem contact met ons op.
        </Link>
      </p>
      <p className="mt-3 max-w-3xl text-xs leading-relaxed text-muted-foreground">
        Dit overzicht is een feitelijke samenvatting van publieke bronnen en is geen juridisch of financieel advies. Controleer steeds de officiële teksten.
      </p>
    </div>
  );
}
