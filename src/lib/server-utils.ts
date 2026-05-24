import { randomBytes } from "crypto";

export function makeInviteToken() {
  return randomBytes(18).toString("hex");
}

export function makeRsvpCode() {
  const seed = randomBytes(3).toString("hex").toUpperCase();
  return `RBK10-${seed}`;
}
