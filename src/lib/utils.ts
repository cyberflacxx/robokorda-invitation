import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getBaseUrl() {
  const configured = process.env.INVITATION_PUBLIC_URL?.trim();
  if (configured) return configured;

  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionUrl) return productionUrl.startsWith("http") ? productionUrl : `https://${productionUrl}`;

  return "https://robokorda-invitation.vercel.app";
}
