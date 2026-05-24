export const GENDERS = ["MALE", "FEMALE", "PREFER_NOT_TO_SAY"] as const;
export type GenderType = (typeof GENDERS)[number];

export const RSVP_STATUSES = ["PENDING", "ACCEPT", "DECLINE", "MAYBE"] as const;
export type RSVPStatusType = (typeof RSVP_STATUSES)[number];
