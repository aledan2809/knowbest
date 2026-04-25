const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const partners = [
  { name: "Affidea", logo: "/logos/affidea.svg" },
  { name: "Amigo Intercoast", logo: "/logos/amigo.svg" },
  { name: "BASF", logo: "/logos/basf.svg" },
  { name: "Bioeuro", logo: "/logos/bioeuro.svg" },
  { name: "CNAS", logo: "/logos/cnas.png" },
  { name: "Euphoric Trips & Travel", logo: "/logos/euphoric.svg" },
  { name: "Holisun", logo: "/logos/holisun.svg" },
  { name: "Hotel Alpin", logo: "/logos/hotel-alpin.png" },
  { name: "Knowingo", logo: "/logos/knowingo.svg" },
  { name: "Monza Ares", logo: "/logos/monza-ares.png" },
  { name: "Process IT&C", logo: "/logos/processit.svg" },
  { name: "Qwerty Solutions", logo: "/logos/qwerty.svg" },
  { name: "Regina Maria", logo: "/logos/regina-maria.svg" },
  { name: "Scandia Food", logo: "/logos/scandia-food.svg" },
  { name: "Sika", logo: "/logos/sika.png" },
  { name: "Teraplast", logo: "/logos/teraplast.svg" }
];

async function seedPartners() {
  console.log('Seeding partners...');

  // Delete existing partners
  await prisma.partner.deleteMany();

  // Create new partners
  for (let i = 0; i < partners.length; i++) {
    const partner = partners[i];
    await prisma.partner.create({
      data: {
        name: partner.name,
        logo: partner.logo,
        active: true,
        sortOrder: i
      }
    });
  }

  console.log(`Successfully seeded ${partners.length} partners`);
}

seedPartners()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });