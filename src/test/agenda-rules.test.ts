// @ts-expect-error bun provides this module at test time
import { describe, expect, test } from "bun:test";
import { addMonths, filterForeignGoogleEvents, followUpProposal } from "@/lib/agendaCore";

const bud = { id: "d1", service: "BUD", status: "ongoing", start_date: "2026-01-15" };

describe("BUD follow-up proposals", () => {
  test("first follow-up is proposed 3 months after the dossier starts", () => {
    const p = followUpProposal(bud, []);
    expect(p?.months).toBe(3);
    expect(p?.start.getMonth()).toBe(3); // April
    expect(p?.start.getDate()).toBe(15);
  });
  test("after a completed follow-up the next is 6 months later", () => {
    const p = followUpProposal(bud, [
      { dossier_id: "d1", kind: "bud_followup", status: "completed", start_at: "2026-04-15T08:00:00.000Z" },
    ]);
    expect(p?.months).toBe(6);
    expect(p?.start.getMonth()).toBe(9); // October
  });
  test("no proposal while a follow-up is still planned", () => {
    expect(
      followUpProposal(bud, [
        { dossier_id: "d1", kind: "bud_followup", status: "planned", start_at: "2026-04-15T08:00:00.000Z" },
      ]),
    ).toBeNull();
  });
  test("no proposal for other services or closed dossiers", () => {
    expect(followUpProposal({ ...bud, service: "IMM" }, [])).toBeNull();
    expect(followUpProposal({ ...bud, status: "completed" }, [])).toBeNull();
  });
  test("month arithmetic clamps to month end", () => {
    expect(addMonths(new Date(2026, 10, 30), 3).getDate()).toBe(28);
  });
});

describe("Google duplicates", () => {
  test("events created by the CRM are hidden from the Google layer", () => {
    const events = [
      { id: "g1", crmId: "a1" },
      { id: "g2", crmId: null },
      { id: "g3", crmId: null },
    ];
    expect(filterForeignGoogleEvents(events, new Set(["g3"])).map((e) => e.id)).toEqual(["g2"]);
  });
});
