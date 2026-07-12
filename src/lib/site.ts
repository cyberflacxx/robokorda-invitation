const DEFAULT_SITE_URL = "https://robokorda-invitation.vercel.app";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim()
  || process.env.NEXT_PUBLIC_APP_URL?.trim()
  || process.env.INVITATION_PUBLIC_URL?.trim()
  || process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  || DEFAULT_SITE_URL;

export function getSiteUrl() {
  return SITE_URL.startsWith("http") ? SITE_URL.replace(/\/$/, "") : `https://${SITE_URL}`.replace(/\/$/, "");
}

export function buildInviteUrl(token: string) {
  return `${getSiteUrl()}/invite/${token}`;
}
