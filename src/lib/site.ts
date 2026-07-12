const DEFAULT_SITE_URL = "https://robokorda-invitation-one.vercel.app";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim()
  || DEFAULT_SITE_URL;

export function getSiteUrl() {
  return SITE_URL.startsWith("http") ? SITE_URL.replace(/\/$/, "") : `https://${SITE_URL}`.replace(/\/$/, "");
}

export function buildInviteUrl(token: string) {
  return `${getSiteUrl()}/invite/${token}`;
}
