import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const langSchema = z.enum(["nl", "fr", "en"]).default("nl");

/** Dossier-assistent: antwoordt op vragen over één dossier. Alleen voorstellen, geen wijzigingen. */
export const caseAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        caseId: z.string().uuid(),
        question: z.string().trim().min(2).max(2000),
        language: langSchema,
        history: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string().max(4000),
            }),
          )
          .max(20)
          .default([]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./crm.server");
    const { buildCaseContext, runCrmAi, LANGUAGE_LABEL } = await import("./crmAi.server");
    const member = await requireStaff(context.supabase, context.userId);
    const contextText = await buildCaseContext(
      context.supabase,
      member.organization_id,
      data.caseId,
    );
    const answer = await runCrmAi({
      system: `Je bent de dossier-assistent van ZADIASSURE, een kantoor voor administratieve en budgettaire begeleiding in België.
Antwoord uitsluitend in ${LANGUAGE_LABEL[data.language]}.
Gebruik alleen de dossiergegevens hieronder; verzin nooit feiten, namen of bedragen.
Je voert nooit zelf wijzigingen uit: je stelt voor. Sluit af met een korte lijst "Voorstellen" met concrete acties (taak, deadline, ontbrekend document) wanneer dat nuttig is.
Wees kort, zakelijk en menselijk. Geen juridisch advies, wel praktische begeleiding.

DOSSIERGEGEVENS:
${contextText}`,
      messages: [...data.history, { role: "user" as const, content: data.question }],
    });
    return { answer };
  });

/** Inbox-triage: samenvatting, categorie, urgentie en voorgestelde volgende stap. */
export const triageSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), language: langSchema }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./crm.server");
    const { runCrmAi, LANGUAGE_LABEL } = await import("./crmAi.server");
    await requireStaff(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: sub, error } = await supabaseAdmin
      .from("form_submissions")
      .select(
        "id, template_slug, full_name, email, phone, language, audience, message, answers, created_at",
      )
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!sub) throw new Error("NOT_FOUND");

    const answer = await runCrmAi({
      system: `Je triageert inkomende aanvragen voor ZADIASSURE (administratieve en budgettaire begeleiding, België).
Antwoord uitsluitend in ${LANGUAGE_LABEL[data.language]} en in deze structuur, zonder inleiding:

**Samenvatting** — 1 tot 2 zinnen.
**Doelgroep** — particulier | gezin | zelfstandige | onderneming | onduidelijk.
**Onderwerp** — bv. budgetbegeleiding, sociale rechten, fiscaliteit, verzekeringen, administratie.
**Urgentie** — laag | gemiddeld | hoog, met korte reden (deadline, betalingsachterstand, dreigende maatregel).
**Volgende stap** — één concreet voorstel voor de medewerker.
**Ontbrekende info** — wat je nog moet opvragen bij de klant.

Verzin niets. Wat niet in de aanvraag staat, benoem je als ontbrekend.`,
      messages: [
        {
          role: "user" as const,
          content: `Aanvraag:\n${JSON.stringify(sub, null, 2)}`,
        },
      ],
    });
    return { triage: answer };
  });

/** Briefhulp: legt een brief of document uit en stelt een antwoord voor. */
export const explainDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        text: z.string().trim().min(20).max(20000),
        language: langSchema,
        withReply: z.boolean().default(true),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./crm.server");
    const { runCrmAi, LANGUAGE_LABEL } = await import("./crmAi.server");
    await requireStaff(context.supabase, context.userId);

    const answer = await runCrmAi({
      system: `Je helpt medewerkers van ZADIASSURE bij het lezen van officiële brieven en documenten (België).
Antwoord uitsluitend in ${LANGUAGE_LABEL[data.language]} en in deze structuur:

**Wie stuurt dit** — afzender en type document.
**Wat wordt gevraagd** — in eenvoudige taal, puntjes.
**Termijn** — elke datum of deadline die in de tekst staat (of "geen datum vermeld").
**Gevolgen bij niets doen** — kort, alleen wat uit de tekst blijkt.
**Wat de klant moet meebrengen** — documenten of gegevens.
**Voorstel volgende stappen** — concrete acties voor het dossier.
${data.withReply ? "**Voorbeeldantwoord** — korte, hoffelijke antwoordbrief die de medewerker kan aanpassen." : ""}

Verzin geen bedragen, dossiernummers of data die er niet staan. Geen juridisch advies; verwijs bij twijfel naar een advocaat of de bevoegde dienst.`,
      messages: [{ role: "user" as const, content: `Tekst van het document:\n${data.text}` }],
    });
    return { explanation: answer };
  });

/** Dagelijkse briefing over dossiers, taken en deadlines. */
export const dailyBriefing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ language: langSchema }).parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./crm.server");
    const { buildBriefingContext, runCrmAi, LANGUAGE_LABEL } = await import("./crmAi.server");
    const member = await requireStaff(context.supabase, context.userId);
    const snapshot = await buildBriefingContext(
      context.supabase,
      member.organization_id,
      context.userId,
    );

    const answer = await runCrmAi({
      system: `Je maakt de dagelijkse briefing voor een medewerker van ZADIASSURE.
Antwoord uitsluitend in ${LANGUAGE_LABEL[data.language]}, maximaal 200 woorden, in deze structuur:

**Vandaag eerst** — 1 tot 3 prioriteiten met dossiernummer.
**Deadlines** — wat deze week vervalt.
**Stilgevallen dossiers** — dossiers zonder opvolging.
**Inbox** — nieuwe aanvragen die wachten.

Gebruik alleen de gegevens hieronder. Geen data of dossiers verzinnen. Als er niets is, zeg dat gewoon.`,
      messages: [{ role: "user" as const, content: JSON.stringify(snapshot, null, 2) }],
    });
    return { briefing: answer, snapshot };
  });
