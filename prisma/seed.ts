import bcrypt from "bcryptjs";
import { MealCourse, PrismaClient, RSVPStatus } from "@prisma/client";

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

  const meals = [
    {
      name: "Garden Fresh Salad",
      description: "Crisp seasonal greens with citrus vinaigrette",
      category: "Starter",
      course: MealCourse.STARTER,
      imageUrl: "/images/meals/garden-fresh-salad.png",
      availableQuantity: 100,
    },
    {
      name: "Soup of the Day",
      description: "Chef-curated warm starter served with bread roll",
      category: "Starter",
      course: MealCourse.STARTER,
      imageUrl: "/images/meals/soup-of-the-day.png",
      availableQuantity: 100,
    },
    {
      name: "Beef Dinner",
      description: "Premium beef plate with sides",
      category: "Main",
      course: MealCourse.MAIN,
      imageUrl: "/images/meals/beef-dinner.png",
      availableQuantity: 80,
    },
    {
      name: "Chicken Dinner",
      description: "Grilled chicken with vegetables",
      category: "Main",
      course: MealCourse.MAIN,
      imageUrl: "/images/meals/chicken-dinner.png",
      availableQuantity: 90,
    },
    {
      name: "Vegetarian Plate",
      description: "Fresh seasonal vegetarian platter",
      category: "Main",
      course: MealCourse.MAIN,
      imageUrl: "/images/meals/vegetarian-plate.png",
      availableQuantity: 40,
    },
    {
      name: "Chocolate Mousse",
      description: "Rich chocolate dessert with cream topping",
      category: "Dessert",
      course: MealCourse.DESSERT,
      imageUrl: "/images/meals/chocolate-mousse.png",
      availableQuantity: 100,
    },
    {
      name: "Fruit Platter",
      description: "Freshly sliced seasonal fruits",
      category: "Dessert",
      course: MealCourse.DESSERT,
      imageUrl: "/images/meals/fruit-platter.png",
      availableQuantity: 100,
    },
  ];

  for (const meal of meals) {
    await prisma.meal.upsert({
      where: { id: meals.indexOf(meal) + 1 },
      update: meal,
      create: meal,
    });
  }

  const tables = [
    { tableName: "Table 1", capacity: 10, locationNote: "Main hall - left" },
    { tableName: "Table 2", capacity: 10, locationNote: "Main hall - center" },
    { tableName: "Table 3", capacity: 10, locationNote: "Main hall - right" },
    { tableName: "VIP Table", capacity: 8, locationNote: "Front row" },
    { tableName: "Sponsors Table", capacity: 12, locationNote: "Near stage" },
  ];

  for (const table of tables) {
    await prisma.eventTable.upsert({
      where: { tableName: table.tableName },
      update: table,
      create: table,
    });
  }

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
