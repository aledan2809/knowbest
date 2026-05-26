const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Real clients imported from the legacy site knowbest.ro (logos hosted locally
// under public/logos/ so they don't depend on the old WordPress site).
const partners = [
  { name: "Affidea", logo: "/logos/affidea.jpg" },
  { name: "Regina Maria", logo: "/logos/regina-maria.jpg" },
  { name: "Regina Maria Dental Clinics", logo: "/logos/regina-maria-dental-clinics.jpg" },
  { name: "Monza ARES", logo: "/logos/monza-ares.jpg" },
  { name: "Amigo Intercost", logo: "/logos/amigo-intercost.jpg" },
  { name: "Sika", logo: "/logos/sika.jpg" },
  { name: "TeraSteel", logo: "/logos/terasteel.jpg" },
  { name: "TeraPlast", logo: "/logos/terraplast.jpg" },
  { name: "Wetterbest", logo: "/logos/wetterbest.jpg" }
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