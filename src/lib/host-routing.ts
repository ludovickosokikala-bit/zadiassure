/**
 * Host-based split between the public website and the staff CRM.
 * Only applies on the production domains below; every other host
 * (localhost, *.lovable.app, previews) is left untouched.
 */
export const PUBLIC_ORIGIN = "https://www.zadiassure.com";
export const CRM_ORIGIN = "https://zadiassure.app";

const PUBLIC_HOSTS = new Set(["zadiassure.com", "www.zadiassure.com"]);
const CRM_HOSTS = new Set(["zadiassure.app", "www.zadiassure.app"]);

export type HostKind = "public" | "crm" | "other";

export function hostKind(host: string): HostKind {
  const h = host.toLowerCase().split(":")[0] ?? "";
  if (PUBLIC_HOSTS.has(h)) return "public";
  if (CRM_HOSTS.has(h)) return "crm";
  return "other";
}

function under(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

/** Paths that are never redirected on any domain. */
export function isNeutralPath(pathname: string) {
  return (
    under(pathname, "/api") ||
    under(pathname, "/lovable") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    under(pathname, "/oauth/google/return") ||
    under(pathname, "/assets") ||
    under(pathname, "/_serverFn") ||
    under(pathname, "/__l5e") ||
    /\.[a-z0-9]+$/i.test(pathname)
  );
}

/** Paths that belong to the staff CRM domain. */
export function isCrmPath(pathname: string) {
  return ["/crm", "/auth", "/uitnodiging", "/beheer"].some((p) => under(pathname, p));
}

/** Returns the absolute URL to redirect to, or null to serve the request as-is. */
export function hostRedirect(host: string, pathname: string, search: string): string | null {
  const kind = hostKind(host);
  if (kind === "other" || isNeutralPath(pathname)) return null;
  if (kind === "crm") {
    if (pathname === "/" || pathname === "") return `${CRM_ORIGIN}/crm${search}`;
    if (isCrmPath(pathname)) return null;
    return `${PUBLIC_ORIGIN}${pathname}${search}`;
  }
  if (isCrmPath(pathname)) return `${CRM_ORIGIN}${pathname}${search}`;
  return null;
}

/** Origin that auth emails and OAuth callbacks should return to. */
export function crmOriginFor(currentOrigin: string): string {
  try {
    return hostKind(new URL(currentOrigin).host) === "other" ? currentOrigin : CRM_ORIGIN;
  } catch {
    return currentOrigin;
  }
}

export function robotsTxtFor(host: string, sitemapUrl: string): string {
  if (hostKind(host) === "crm") return "User-agent: *\nDisallow: /\n";
  return [
    "User-agent: Googlebot", "Allow: /", "",
    "User-agent: Bingbot", "Allow: /", "",
    "User-agent: Twitterbot", "Allow: /", "",
    "User-agent: facebookexternalhit", "Allow: /", "",
    "User-agent: *", "Allow: /", "",
    `Sitemap: ${sitemapUrl}`, "",
  ].join("\n");
}
