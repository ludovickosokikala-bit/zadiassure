// @ts-expect-error bun provides this module at test time
import { describe, expect, test } from "bun:test";
import { appealLevel, checklistProgress, defaultTemplate, expiryLevel, immAlerts } from "@/lib/immCore";

const today = "2026-11-25";
describe("residence card expiry", () => {
  test("warns at 90, 60 and 30 days and when expired", () => {
    expect(expiryLevel("2027-02-24", today)).toBe(null); // 91 days
    expect(expiryLevel("2027-02-23", today)).toBe(90);
    expect(expiryLevel("2027-01-24", today)).toBe(60);
    expect(expiryLevel("2026-12-25", today)).toBe(30);
    expect(expiryLevel("2026-11-24", today)).toBe("expired");
  });
});
describe("appeal date", () => {
  test("warns at 14 and 7 days, nothing after the date passed", () => {
    expect(appealLevel("2026-12-10", today)).toBe(null); // 15 days
    expect(appealLevel("2026-12-09", today)).toBe(14);
    expect(appealLevel("2026-12-02", today)).toBe(7);
    expect(appealLevel("2026-11-24", today)).toBe(null);
  });
});
describe("alerts", () => {
  test("only open IMM dossiers", () => {
    const a = immAlerts([{ dossier_id: "a", appeal_until: "2026-12-01" }, { dossier_id: "b", appeal_until: "2026-12-01" }], [], new Set(["a"]), today);
    expect(a.map((x) => x.dossierId)).toEqual(["a"]);
  });
});
describe("checklist", () => {
  test("received + checked count, not-applicable excluded", () => {
    expect(checklistProgress([{ status: "received" }, { status: "checked" }, { status: "missing" }, { status: "na" }])).toEqual({ done: 2, total: 3 });
  });
  test("default templates exist for both languages", () => {
    expect(defaultTemplate("family", "fr").steps[0]).toBe("Intake");
    expect(defaultTemplate("residence", "nl").documents).toContain("Pasfoto");
  });
});
