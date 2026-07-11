import { Gender, RSVPStatus } from "@prisma/client";
import { z } from "zod";

const nullableEmail = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().email().nullable().optional(),
);

const nullablePhone = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().min(5).nullable().optional(),
);

const nullableUrl = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().url().nullable().optional(),
);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const guestSchema = z.object({
  fullName: z.string().min(2),
  gender: z.nativeEnum(Gender),
  email: nullableEmail,
  phone: nullablePhone,
  rsvpCode: z.string().min(4),
  inviteToken: z.string().min(8),
  rsvpStatus: z.nativeEnum(RSVPStatus).optional(),
});

export const guestCreateSchema = z.object({
  fullName: z.string().min(2),
  gender: z.nativeEnum(Gender),
  email: nullableEmail,
  phone: nullablePhone,
  rsvpStatus: z.nativeEnum(RSVPStatus).optional(),
});

export const guestUpdateSchema = guestSchema.partial();

export const rsvpSchema = z.object({
  token: z.string().min(8),
  rsvpCode: z.string().min(4),
  status: z.nativeEnum(RSVPStatus),
  notes: z.string().max(500).optional().nullable(),
});

export const gallerySchema = z.object({
  title: z.string().min(2),
  imageUrl: z.string().url(),
  type: z.enum(["HERO", "GALLERY"]).default("GALLERY"),
  isHero: z.boolean().default(false),
});

export const eventSettingsSchema = z.object({
  eventName: z.string().min(2),
  eventDate: z.string().min(4),
  eventTime: z.string().min(2),
  venueName: z.string().min(2),
  venueAddress: z.string().min(2),
  dressCode: z.string().optional().nullable(),
  theme: z.string().optional().nullable(),
  heroImageUrl: nullableUrl,
  lightModeLogoUrl: nullableUrl,
  darkModeLogoUrl: nullableUrl,
});

export const checkInSchema = z.object({
  rsvpCode: z.string().min(4),
});
