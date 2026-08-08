-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$fn$;

CREATE POLICY "Users can read their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $fn$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$fn$;

-- Themes
CREATE TYPE public.content_theme AS ENUM ('immigration', 'budget', 'business', 'social');

-- Legislation updates
CREATE TABLE public.legislation_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  theme public.content_theme NOT NULL,
  audiences text[] NOT NULL DEFAULT '{}',
  effective_date date,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  source_url text,
  source_label text,
  title_nl text NOT NULL, title_fr text NOT NULL, title_en text NOT NULL,
  summary_nl text NOT NULL, summary_fr text NOT NULL, summary_en text NOT NULL,
  changes_nl text NOT NULL DEFAULT '', changes_fr text NOT NULL DEFAULT '', changes_en text NOT NULL DEFAULT '',
  action_nl text NOT NULL DEFAULT '', action_fr text NOT NULL DEFAULT '', action_en text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.legislation_updates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.legislation_updates TO authenticated;
GRANT ALL ON public.legislation_updates TO service_role;
ALTER TABLE public.legislation_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published legislation is public"
ON public.legislation_updates FOR SELECT TO anon, authenticated
USING (published = true);

CREATE POLICY "Admins can read all legislation"
ON public.legislation_updates FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert legislation"
ON public.legislation_updates FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update legislation"
ON public.legislation_updates FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete legislation"
ON public.legislation_updates FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_legislation_updated_at
BEFORE UPDATE ON public.legislation_updates
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Form templates
CREATE TABLE public.form_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  theme public.content_theme NOT NULL,
  authority text NOT NULL DEFAULT '',
  audiences text[] NOT NULL DEFAULT '{}',
  published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  official_url text,
  official_label text,
  title_nl text NOT NULL, title_fr text NOT NULL, title_en text NOT NULL,
  description_nl text NOT NULL, description_fr text NOT NULL, description_en text NOT NULL,
  who_nl text NOT NULL DEFAULT '', who_fr text NOT NULL DEFAULT '', who_en text NOT NULL DEFAULT '',
  checklist jsonb NOT NULL DEFAULT '{"nl":[],"fr":[],"en":[]}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.form_templates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.form_templates TO authenticated;
GRANT ALL ON public.form_templates TO service_role;
ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published forms are public"
ON public.form_templates FOR SELECT TO anon, authenticated
USING (published = true);

CREATE POLICY "Admins can read all forms"
ON public.form_templates FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert forms"
ON public.form_templates FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update forms"
ON public.form_templates FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete forms"
ON public.form_templates FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_form_templates_updated_at
BEFORE UPDATE ON public.form_templates
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Submissions
CREATE TABLE public.form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES public.form_templates(id) ON DELETE SET NULL,
  template_slug text NOT NULL DEFAULT '',
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  language text NOT NULL DEFAULT 'nl',
  audience text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.form_submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.form_submissions TO authenticated;
GRANT ALL ON public.form_submissions TO service_role;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a request"
ON public.form_submissions FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can read submissions"
ON public.form_submissions FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update submissions"
ON public.form_submissions FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete submissions"
ON public.form_submissions FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_form_submissions_updated_at
BEFORE UPDATE ON public.form_submissions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed legislation updates
INSERT INTO public.legislation_updates
(slug, theme, audiences, effective_date, published, published_at, source_url, source_label,
 title_nl, title_fr, title_en, summary_nl, summary_fr, summary_en,
 changes_nl, changes_fr, changes_en, action_nl, action_fr, action_en)
VALUES
('verblijfsaanvraag-digitalisering', 'immigration', ARRAY['particulieren','gezinnen'], '2026-01-01', true, now(),
 'https://dofi.ibz.be', $t$Dienst Vreemdelingenzaken$t$,
 $t$Verblijfsaanvragen verlopen steeds meer digitaal$t$,
 $t$Les demandes de séjour se numérisent$t$,
 $t$Residence applications are moving online$t$,
 $t$Steeds meer verblijfsprocedures worden via digitale loketten en e-mailadressen van de gemeente en DVZ behandeld. Papieren dossiers blijven mogelijk, maar de doorlooptijd verschilt.$t$,
 $t$De plus en plus de procédures de séjour passent par des guichets numériques de la commune et de l'Office des étrangers. Les dossiers papier restent possibles, mais les délais diffèrent.$t$,
 $t$More residence procedures are handled through digital counters at the municipality and the Immigration Office. Paper files remain possible, but processing times differ.$t$,
 $t$Bijlagen en bewijsstukken moeten vaak als PDF worden aangeleverd, met duidelijke naamgeving en volledige vertaling of legalisatie waar nodig.$t$,
 $t$Les annexes et pièces justificatives doivent souvent être fournies en PDF, avec une dénomination claire et une traduction ou légalisation complète si nécessaire.$t$,
 $t$Annexes and supporting documents often need to be supplied as PDFs, clearly named and fully translated or legalised where required.$t$,
 $t$Scan al uw documenten in goede kwaliteit, houd een kopie bij en laat uw dossier nakijken vóór indiening.$t$,
 $t$Scannez tous vos documents en bonne qualité, gardez une copie et faites vérifier votre dossier avant de l'introduire.$t$,
 $t$Scan all your documents in good quality, keep a copy, and have your file reviewed before submission.$t$),
('huurindexatie-2026', 'budget', ARRAY['particulieren','gezinnen'], '2026-01-01', true, now(),
 'https://statbel.fgov.be', $t$Statbel$t$,
 $t$Huurindexatie: hoe u de juiste berekening controleert$t$,
 $t$Indexation du loyer : vérifier le bon calcul$t$,
 $t$Rent indexation: how to check the correct calculation$t$,
 $t$Verhuurders mogen de huur één keer per jaar indexeren op basis van de gezondheidsindex, en enkel vanaf de verjaardag van het contract.$t$,
 $t$Le bailleur peut indexer le loyer une fois par an sur base de l'indice santé, et seulement à la date anniversaire du bail.$t$,
 $t$Landlords may index the rent once a year based on the health index, and only from the anniversary date of the lease.$t$,
 $t$Een verkeerd toegepaste index leidt tot een te hoge huur. De berekening vertrekt van de aanvangsindex bij de start van het contract.$t$,
 $t$Un index mal appliqué mène à un loyer trop élevé. Le calcul part de l'indice de départ à la signature du bail.$t$,
 $t$An incorrectly applied index leads to rent that is too high. The calculation starts from the base index at the start of the lease.$t$,
 $t$Vraag de schriftelijke berekening op en laat ze nakijken. Betaal nooit een verhoging zonder onderbouwing.$t$,
 $t$Demandez le calcul écrit et faites-le vérifier. Ne payez jamais une augmentation sans justification.$t$,
 $t$Ask for the written calculation and have it checked. Never pay an increase without justification.$t$),
('sociaal-tarief-energie', 'budget', ARRAY['particulieren','gezinnen'], '2026-01-01', true, now(),
 'https://economie.fgov.be', $t$FOD Economie$t$,
 $t$Sociaal tarief energie: wie heeft er recht op$t$,
 $t$Tarif social énergie : qui y a droit$t$,
 $t$Social energy tariff: who is entitled$t$,
 $t$Het sociaal tarief voor elektriciteit en gas geldt voor bepaalde categorieën, waaronder mensen met een verhoogde tegemoetkoming of een leefloon.$t$,
 $t$Le tarif social pour l'électricité et le gaz s'applique à certaines catégories, dont les bénéficiaires de l'intervention majorée ou du revenu d'intégration.$t$,
 $t$The social tariff for electricity and gas applies to certain categories, including people with increased allowance or a living wage.$t$,
 $t$Toekenning gebeurt meestal automatisch, maar niet altijd. Bij verhuis, contractwissel of gezinswijziging kan het recht verloren gaan.$t$,
 $t$L'octroi est souvent automatique, mais pas toujours. Un déménagement, un changement de contrat ou de composition de ménage peut faire perdre le droit.$t$,
 $t$It is usually granted automatically, but not always. Moving, switching contracts or a change in household can cause the right to lapse.$t$,
 $t$Controleer uw factuur op de vermelding van het sociaal tarief en vraag een rechtzetting met terugwerkende kracht als het ontbreekt.$t$,
 $t$Vérifiez la mention du tarif social sur votre facture et demandez une régularisation rétroactive si elle manque.$t$,
 $t$Check your invoice for the social tariff mention and request a retroactive correction if it is missing.$t$),
('schuldbemiddeling-toegang', 'budget', ARRAY['particulieren','gezinnen'], '2026-01-01', true, now(),
 'https://www.ombudsman.be', $t$Ombudsdienst$t$,
 $t$Schulden en invordering: uw rechten bij een deurwaarder$t$,
 $t$Dettes et recouvrement : vos droits face à un huissier$t$,
 $t$Debt and collection: your rights with a bailiff$t$,
 $t$Bij minnelijke invordering gelden strikte regels over kosten, betalingsplannen en de informatie die u moet krijgen.$t$,
 $t$Le recouvrement amiable est encadré par des règles strictes sur les frais, les plans de paiement et l'information à fournir.$t$,
 $t$Amicable debt collection is governed by strict rules on fees, payment plans and the information you must receive.$t$,
 $t$Onterechte kosten en dwangtoon komen nog vaak voor. U hebt recht op een duidelijk overzicht van hoofdsom, intresten en kosten.$t$,
 $t$Des frais injustifiés et un ton comminatoire restent fréquents. Vous avez droit à un décompte clair du principal, des intérêts et des frais.$t$,
 $t$Unjustified fees and intimidating tone are still common. You are entitled to a clear breakdown of principal, interest and costs.$t$,
 $t$Reageer altijd schriftelijk, betaal niets zonder afrekening en vraag een haalbaar afbetalingsplan aan.$t$,
 $t$Répondez toujours par écrit, ne payez rien sans décompte et demandez un plan de paiement réaliste.$t$,
 $t$Always respond in writing, pay nothing without a breakdown, and request a realistic payment plan.$t$),
('zelfstandigen-btw-deadlines', 'business', ARRAY['zelfstandigen','ondernemingen'], '2026-01-01', true, now(),
 'https://finances.belgium.be', $t$FOD Financiën$t$,
 $t$Zelfstandigen: btw-aangifte en boekhoudverplichtingen$t$,
 $t$Indépendants : déclaration TVA et obligations comptables$t$,
 $t$Self-employed: VAT returns and bookkeeping duties$t$,
 $t$Btw-plichtigen dienen periodiek aangifte in en moeten hun facturatie en boekhouding op orde houden, ook bij een kleine omzet.$t$,
 $t$Les assujettis déposent des déclarations périodiques et doivent tenir leur facturation et leur comptabilité en ordre, même avec un petit chiffre d'affaires.$t$,
 $t$VAT-registered businesses file periodic returns and must keep invoicing and accounts in order, even with small turnover.$t$,
 $t$Elektronische facturatie wint terrein en laattijdige aangiftes leiden snel tot boetes en nalatigheidsintresten.$t$,
 $t$La facturation électronique se généralise et les déclarations tardives entraînent vite des amendes et intérêts de retard.$t$,
 $t$Electronic invoicing is expanding and late returns quickly lead to fines and late-payment interest.$t$,
 $t$Zet een vast maand- of kwartaalritme op voor uw documenten en laat uw aangifteplanning nakijken.$t$,
 $t$Mettez en place un rythme mensuel ou trimestriel fixe pour vos documents et faites vérifier votre calendrier de déclarations.$t$,
 $t$Set a fixed monthly or quarterly rhythm for your documents and have your filing calendar reviewed.$t$),
('groeipakket-en-mutualiteit', 'social', ARRAY['gezinnen','particulieren'], '2026-01-01', true, now(),
 'https://www.groeipakket.be', $t$Groeipakket$t$,
 $t$Gezinsbijslag en mutualiteit: veelvoorkomende fouten$t$,
 $t$Allocations familiales et mutualité : erreurs fréquentes$t$,
 $t$Family benefits and health insurance: common mistakes$t$,
 $t$Groeipakket, kinderbijslag en tussenkomsten van de mutualiteit hangen af van gezinssamenstelling, domicilie en inkomen.$t$,
 $t$Le Groeipakket, les allocations familiales et les interventions de la mutualité dépendent de la composition du ménage, du domicile et des revenus.$t$,
 $t$Family benefits and health insurance contributions depend on household composition, domicile and income.$t$,
 $t$Een verhuis, scheiding of wijziging in verblijfsstatuut moet snel gemeld worden, anders volgen terugvorderingen.$t$,
 $t$Un déménagement, une séparation ou un changement de statut de séjour doit être signalé rapidement, sinon des récupérations suivent.$t$,
 $t$A move, separation or change in residence status must be reported quickly, otherwise repayment claims follow.$t$,
 $t$Meld elke wijziging binnen de maand en bewaar de bevestiging. Laat uw dossier nakijken bij twijfel.$t$,
 $t$Signalez tout changement dans le mois et conservez la confirmation. Faites vérifier votre dossier en cas de doute.$t$,
 $t$Report any change within the month and keep the confirmation. Have your file reviewed if in doubt.$t$);

-- Seed form templates
INSERT INTO public.form_templates
(slug, theme, authority, audiences, published, sort_order, official_url, official_label,
 title_nl, title_fr, title_en, description_nl, description_fr, description_en,
 who_nl, who_fr, who_en, checklist)
VALUES
('verblijfsaanvraag-voorbereiding', 'immigration', $t$Gemeente / Dienst Vreemdelingenzaken$t$, ARRAY['particulieren','gezinnen'], true, 10,
 'https://dofi.ibz.be', $t$Dienst Vreemdelingenzaken$t$,
 $t$Voorbereiding verblijfsaanvraag$t$, $t$Préparation d'une demande de séjour$t$, $t$Residence application preparation$t$,
 $t$Wij verzamelen samen met u alle stukken voor uw verblijfsaanvraag en controleren de volledigheid vóór u naar de gemeente of DVZ gaat.$t$,
 $t$Nous rassemblons avec vous toutes les pièces de votre demande de séjour et vérifions leur exhaustivité avant votre passage à la commune ou à l'Office des étrangers.$t$,
 $t$We gather all documents for your residence application with you and check completeness before you go to the municipality or Immigration Office.$t$,
 $t$Voor iedereen die een eerste aanvraag, verlenging of gezinshereniging voorbereidt.$t$,
 $t$Pour toute personne préparant une première demande, un renouvellement ou un regroupement familial.$t$,
 $t$For anyone preparing a first application, renewal or family reunification.$t$,
 $t${"nl":["Geldig paspoort of identiteitsdocument","Bewijs van verblijfplaats / huurcontract","Recente samenstelling van het gezin","Bewijs van inkomsten of bestaansmiddelen","Geboorte- of huwelijksakte (vertaald en gelegaliseerd)","Bewijs van ziekteverzekering"],"fr":["Passeport ou document d'identité valable","Preuve de résidence / contrat de bail","Composition de ménage récente","Preuve de revenus ou de moyens de subsistance","Acte de naissance ou de mariage (traduit et légalisé)","Preuve d'assurance maladie"],"en":["Valid passport or identity document","Proof of residence / lease agreement","Recent household composition certificate","Proof of income or means of subsistence","Birth or marriage certificate (translated and legalised)","Proof of health insurance"]}$t$::jsonb),
('budgetbegeleiding-intake', 'budget', $t$ZADIASSURE$t$, ARRAY['particulieren','gezinnen'], true, 20,
 NULL, NULL,
 $t$Intake budgetbegeleiding$t$, $t$Intake accompagnement budgétaire$t$, $t$Budget guidance intake$t$,
 $t$Een overzicht van uw inkomsten, vaste kosten en schulden zodat wij een realistisch plan kunnen opstellen.$t$,
 $t$Un aperçu de vos revenus, charges fixes et dettes afin d'établir un plan réaliste.$t$,
 $t$An overview of your income, fixed costs and debts so we can build a realistic plan.$t$,
 $t$Voor particulieren en gezinnen die het overzicht kwijt zijn of achterstand hebben.$t$,
 $t$Pour les particuliers et familles qui ont perdu la vue d'ensemble ou accumulent du retard.$t$,
 $t$For individuals and families who have lost track or fallen behind.$t$,
 $t${"nl":["Laatste 3 loonbrieven of uitkeringsbewijzen","Overzicht van huur of hypotheek","Recente energie- en waterfacturen","Alle openstaande brieven en aanmaningen","Bankuittreksels van de laatste 3 maanden"],"fr":["3 dernières fiches de paie ou attestations d'allocation","Aperçu du loyer ou du prêt hypothécaire","Factures récentes d'énergie et d'eau","Tous les courriers et rappels en cours","Extraits bancaires des 3 derniers mois"],"en":["Last 3 payslips or benefit statements","Overview of rent or mortgage","Recent energy and water bills","All outstanding letters and reminders","Bank statements for the last 3 months"]}$t$::jsonb),
('sociaal-tarief-aanvraag', 'budget', $t$FOD Economie / energieleverancier$t$, ARRAY['particulieren','gezinnen'], true, 30,
 'https://economie.fgov.be', $t$FOD Economie$t$,
 $t$Aanvraag sociaal tarief energie$t$, $t$Demande de tarif social énergie$t$, $t$Social energy tariff request$t$,
 $t$Wij controleren of u recht hebt op het sociaal tarief en stellen de aanvraag of rechtzetting bij uw leverancier op.$t$,
 $t$Nous vérifions votre droit au tarif social et préparons la demande ou la régularisation auprès de votre fournisseur.$t$,
 $t$We check your entitlement to the social tariff and prepare the request or correction with your supplier.$t$,
 $t$Voor wie een verhoogde tegemoetkoming, leefloon of bepaalde uitkering ontvangt.$t$,
 $t$Pour les bénéficiaires de l'intervention majorée, du revenu d'intégration ou de certaines allocations.$t$,
 $t$For people receiving increased allowance, a living wage or certain benefits.$t$,
 $t${"nl":["Attest van uw mutualiteit of OCMW","Laatste energiefactuur","EAN-nummer van uw meter","Identiteitskaart","Bewijs van gezinssamenstelling"],"fr":["Attestation de votre mutualité ou du CPAS","Dernière facture d'énergie","Numéro EAN de votre compteur","Carte d'identité","Composition de ménage"],"en":["Certificate from your health fund or social welfare office","Latest energy bill","EAN number of your meter","Identity card","Household composition certificate"]}$t$::jsonb),
('betwisting-factuur', 'budget', $t$ZADIASSURE$t$, ARRAY['particulieren','gezinnen','zelfstandigen'], true, 40,
 NULL, NULL,
 $t$Betwisting van een factuur of aanmaning$t$, $t$Contestation d'une facture ou d'un rappel$t$, $t$Disputing an invoice or reminder$t$,
 $t$Wij stellen een onderbouwde en correcte betwistingsbrief op en volgen de reactie van de tegenpartij op.$t$,
 $t$Nous rédigeons une lettre de contestation motivée et suivons la réponse de la partie adverse.$t$,
 $t$We draft a well-founded dispute letter and follow up on the other party's response.$t$,
 $t$Voor iedereen die een onduidelijke, foutieve of overdreven factuur ontvangt.$t$,
 $t$Pour toute personne recevant une facture confuse, erronée ou excessive.$t$,
 $t$For anyone receiving an unclear, incorrect or excessive invoice.$t$,
 $t${"nl":["De betwiste factuur of aanmaning","Het contract of de algemene voorwaarden","Eerdere briefwisseling of e-mails","Betaalbewijzen"],"fr":["La facture ou le rappel contesté","Le contrat ou les conditions générales","La correspondance ou les e-mails antérieurs","Les preuves de paiement"],"en":["The disputed invoice or reminder","The contract or general terms","Previous correspondence or e-mails","Proof of payments"]}$t$::jsonb),
('zelfstandige-opstart', 'business', $t$Ondernemingsloket / FOD Financiën$t$, ARRAY['zelfstandigen','ondernemingen'], true, 50,
 'https://finances.belgium.be', $t$FOD Financiën$t$,
 $t$Opstart als zelfstandige: administratieve checklist$t$, $t$Lancement en indépendant : checklist administrative$t$, $t$Starting as self-employed: administrative checklist$t$,
 $t$Wij zetten uw opstartdossier op: ondernemingsnummer, btw, sociale bijdragen en uw administratieve routine.$t$,
 $t$Nous préparons votre dossier de lancement : numéro d'entreprise, TVA, cotisations sociales et routine administrative.$t$,
 $t$We prepare your start-up file: company number, VAT, social contributions and your administrative routine.$t$,
 $t$Voor starters in hoofd- of bijberoep en kleine ondernemingen.$t$,
 $t$Pour les starters à titre principal ou complémentaire et les petites entreprises.$t$,
 $t$For starters in main or secondary occupation and small businesses.$t$,
 $t${"nl":["Identiteitskaart","Beschrijving van uw activiteit","Bankrekeningnummer voor de zaak","Diploma of bewijs van beroepsbekwaamheid (indien vereist)","Adres van de maatschappelijke zetel"],"fr":["Carte d'identité","Description de votre activité","Numéro de compte bancaire professionnel","Diplôme ou preuve de compétence professionnelle (si requis)","Adresse du siège social"],"en":["Identity card","Description of your activity","Business bank account number","Diploma or proof of professional competence (if required)","Registered office address"]}$t$::jsonb);