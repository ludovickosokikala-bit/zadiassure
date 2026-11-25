// @ts-expect-error bun provides this module at test time
import { describe, expect, test } from "bun:test";
import { hostRedirect, robotsTxtFor, crmOriginFor } from "../lib/host-routing";

describe("CRM domain", () => {
  test("/ goes to /crm", () => expect(hostRedirect("zadiassure.app", "/", "")).toBe("https://zadiassure.app/crm"));
  test("CRM paths stay", () => {
    for (const p of ["/crm", "/crm/cases", "/auth", "/uitnodiging", "/beheer", "/oauth/google/return"])
      expect(hostRedirect("www.zadiassure.app", p, "")).toBeNull();
  });
  test("public paths go to .com with query", () =>
    expect(hostRedirect("zadiassure.app", "/contact", "?a=1")).toBe("https://www.zadiassure.com/contact?a=1"));
  test("robots disallows all", () => expect(robotsTxtFor("zadiassure.app", "x")).toBe("User-agent: *\nDisallow: /\n"));
});

describe("public domain", () => {
  test("CRM paths go to .app", () => {
    expect(hostRedirect("zadiassure.com", "/crm/tasks", "?x=2")).toBe("https://zadiassure.app/crm/tasks?x=2");
    expect(hostRedirect("www.zadiassure.com", "/auth", "")).toBe("https://zadiassure.app/auth");
  });
  test("volmacht and public pages stay", () => {
    expect(hostRedirect("www.zadiassure.com", "/volmacht", "")).toBeNull();
    expect(hostRedirect("www.zadiassure.com", "/", "")).toBeNull();
  });
});

describe("never redirected", () => {
  test("neutral paths", () => {
    for (const p of ["/api/x", "/lovable/email/auth/webhook", "/sitemap.xml", "/oauth/google/return"]) {
      expect(hostRedirect("zadiassure.app", p, "")).toBeNull();
      expect(hostRedirect("zadiassure.com", p, "")).toBeNull();
    }
  });
  test("other hosts untouched", () => {
    for (const h of ["localhost:8080", "zadiassure.lovable.app", "id-preview--abc.lovable.app"]) {
      expect(hostRedirect(h, "/crm", "")).toBeNull();
      expect(hostRedirect(h, "/", "")).toBeNull();
    }
    expect(crmOriginFor("http://localhost:8080")).toBe("http://localhost:8080");
    expect(crmOriginFor("https://www.zadiassure.com")).toBe("https://zadiassure.app");
  });
});
