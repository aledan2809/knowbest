import { PrismaClient } from '@prisma/client';
import roMessages from '../src/messages/ro.json';
import enMessages from '../src/messages/en.json';

const prisma = new PrismaClient();

interface Message {
  [key: string]: string | Message;
}

async function seedPageContent() {
  console.log('Starting page content seed...');

  const pageContentData: Array<{
    page: string;
    section: string;
    key: string;
    valueRo: string;
    valueEn: string | null;
    type: string;
    sortOrder: number;
  }> = [];

  // Helper to extract nested values and flatten them
  const extractContent = (
    obj: Message,
    page: string,
    section: string = '',
    sortOrder: number = 0
  ) => {
    Object.entries(obj).forEach(([key, value], index) => {
      if (typeof value === 'string') {
        const roValue = value;
        const enValue = section
          ? (enMessages as any)[page]?.[section]?.[key] || null
          : (enMessages as any)[page]?.[key] || null;

        const type = roValue.length > 100 ? 'textarea' : 'text';

        pageContentData.push({
          page,
          section: section || 'main',
          key,
          valueRo: roValue,
          valueEn: enValue,
          type,
          sortOrder: sortOrder + index,
        });
      } else if (typeof value === 'object' && value !== null) {
        // Nested section
        extractContent(value, page, key, sortOrder + index * 100);
      }
    });
  };

  // Process pages from ro.json
  const pagesToProcess = ['home', 'about', 'useCases', 'contact', 'products', 'hero'];

  pagesToProcess.forEach((page) => {
    if ((roMessages as any)[page]) {
      extractContent((roMessages as any)[page], page);
    }
  });

  // Also process nav and footer as separate pages
  if (roMessages.nav) {
    extractContent(roMessages.nav, 'nav');
  }
  if (roMessages.footer) {
    extractContent(roMessages.footer, 'footer');
  }

  console.log(`Extracted ${pageContentData.length} content entries`);

  // Upsert all content
  let created = 0;
  let updated = 0;

  for (const data of pageContentData) {
    const result = await prisma.pageContent.upsert({
      where: {
        page_section_key: {
          page: data.page,
          section: data.section,
          key: data.key,
        },
      },
      update: {
        valueRo: data.valueRo,
        valueEn: data.valueEn,
        type: data.type,
        sortOrder: data.sortOrder,
      },
      create: data,
    });

    if (result.updatedAt.getTime() === new Date().getTime()) {
      updated++;
    } else {
      created++;
    }
  }

  console.log(`Seed completed: ${created} created, ${updated} updated`);
}

seedPageContent()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
