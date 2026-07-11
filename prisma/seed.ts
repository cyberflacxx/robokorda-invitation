import bcrypt from "bcryptjs";
import { PrismaClient, RSVPStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin@12345", 12);

  const admin = await prisma.adminUser.upsert({
    where: { email: "admin@robokorda.com" },
    update: { passwordHash, name: "Robokorda Host" },
    create: {
      name: "Robokorda Host",
      email: "admin@robokorda.com",
      passwordHash,
    },
  });

  await prisma.eventSetting.upsert({
    where: { id: 1 },
    update: {
      eventName: "Robokorda 10th Anniversary",
      eventDate: new Date("2026-09-13T00:00:00.000Z"),
      eventTime: "18:00",
      venueName: "Manna Safari Lodge",
      venueAddress: "Harare Zimbabwe",
      dressCode: "Formal / Corporate Elegant",
      theme: "Celebrating 10 Years of Innovation",
      heroImageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1500&q=80",
      lightModeLogoUrl: "",
      darkModeLogoUrl: "",
    },
    create: {
      eventName: "Robokorda 10th Anniversary",
      eventDate: new Date("2026-09-13T00:00:00.000Z"),
      eventTime: "18:00",
      venueName: "Manna Safari Lodge",
      venueAddress: "Harare Zimbabwe",
      dressCode: "Formal / Corporate Elegant",
      theme: "Celebrating 10 Years of Innovation",
      heroImageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1500&q=80",
      lightModeLogoUrl: "",
      darkModeLogoUrl: "",
    },
  });

  await prisma.guest.upsert({
    where: { inviteToken: "sample-dambu-token" },
    update: {
      fullName: "Dambu",
      email: "dambu@example.com",
      phone: "+263771000111",
      rsvpCode: "RBK10-1001",
      rsvpStatus: RSVPStatus.PENDING,
    },
    create: {
      fullName: "Dambu",
      email: "dambu@example.com",
      phone: "+263771000111",
      inviteToken: "sample-dambu-token",
      rsvpCode: "RBK10-1001",
      rsvpStatus: RSVPStatus.PENDING,
    },
  });

  await prisma.galleryImage.createMany({
    data: [
      {
        title: "Innovation Stage",
        imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80",
        type: "HERO",
        isHero: true,
      },
      {
        title: "Team Celebration",
        imageUrl: "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80",
        type: "GALLERY",
      },
      {
        title: "Networking",
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
        type: "GALLERY",
      },
    ],
    skipDuplicates: true,
  });

  console.log(`Seed complete. Admin: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
