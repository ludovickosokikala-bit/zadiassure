// @ts-expect-error bun provides this module at test time
import { describe, expect, test } from "bun:test";
import { budgetTotals, debtSummary, formatEUR, generateInstalments, instalmentStatus, outstandingSeries } from "@/lib/debtCore";

describe("budget", () => {
  test("available = income − expenses; room after instalments can be negative", () => {
    const t = budgetTotals([
      { kind: "income", amount: "1500.10" },
      { kind: "fixed", amount: 900 },
      { kind: "variable", amount: "400.05" },
    ], 250);
    expect(t.available).toBe(200.05);
    expect(t.room).toBe(-49.95);
  });
});
describe("instalments", () => {
  test("late only when due date passed and not paid", () => {
    expect(instalmentStatus({ due_date: "2026-11-01", paid_at: null }, "2026-11-25")).toBe("late");
    expect(instalmentStatus({ due_date: "2026-11-01", paid_at: "2026-11-02" }, "2026-11-25")).toBe("paid");
    expect(instalmentStatus({ due_date: "2026-11-25", paid_at: null }, "2026-11-25")).toBe("due");
  });
  test("generate amount × months, clamped to month end", () => {
    const r = generateInstalments(50, 3, "2026-01-31");
    expect(r.map((x) => x.due_date)).toEqual(["2026-01-31", "2026-02-28", "2026-03-31"]);
  });
});
describe("summary", () => {
  test("percentage paid off", () => {
    expect(debtSummary([{ id: "a", original_amount: 1000, outstanding_amount: 750, created_at: "2026-01-01", status: "agreed" }]).paidPct).toBe(25);
  });
  test("series replays payments", () => {
    const s = outstandingSeries(
      [{ id: "a", original_amount: 300, outstanding_amount: 200, created_at: "2026-01-05", status: "agreed" }],
      [{ debt_id: "a", due_date: "2026-02-01", amount: 100, paid_at: "2026-02-03" }],
      "2026-03-10",
    );
    expect(s.map((p) => p.value)).toEqual([300, 200, 200]);
  });
  test("Belgian money format", () => {
    expect(formatEUR(1234.56)).toBe("1.234,56 €");
    expect(formatEUR(-49.95)).toBe("-49,95 €");
  });
});
