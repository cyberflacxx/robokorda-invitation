import clsx, { type ClassValue } from "clsx";
import { getSiteUrl } from "@/lib/site";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getBaseUrl() {
  return getSiteUrl();
}
