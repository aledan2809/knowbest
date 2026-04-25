import { prisma } from "@/lib/db";
import roMessages from "@/messages/ro.json";
import enMessages from "@/messages/en.json";

type Messages = typeof roMessages;

/**
 * Get page content from database with fallback to JSON files
 * @param page - Page name (home, about, useCases, contact, products)
 * @param locale - Locale (ro or en)
 * @returns Content object for the page
 */
export async function getPageContent(page: string, locale: string = "ro") {
  try {
    // Try to fetch from database
    const content = await prisma.pageContent.findMany({
      where: { page },
      orderBy: [{ section: "asc" }, { sortOrder: "asc" }],
    });

    if (content.length === 0) {
      // Fallback to JSON files
      return getFallbackContent(page, locale);
    }

    // Build content object from database
    const result: any = {};

    content.forEach((item) => {
      const value = locale === "en" ? item.valueEn || item.valueRo : item.valueRo;

      if (item.section === "main") {
        // Top-level keys
        result[item.key] = value;
      } else {
        // Nested sections
        if (!result[item.section]) {
          result[item.section] = {};
        }
        result[item.section][item.key] = value;
      }
    });

    return result;
  } catch (error) {
    console.error("Error fetching page content:", error);
    return getFallbackContent(page, locale);
  }
}

/**
 * Fallback to JSON files when database is unavailable
 */
function getFallbackContent(page: string, locale: string) {
  const messages = locale === "en" ? enMessages : roMessages;
  return (messages as any)[page] || {};
}

/**
 * Get a specific field from page content
 * @param page - Page name
 * @param section - Section name
 * @param key - Field key
 * @param locale - Locale (ro or en)
 * @returns The content value or empty string
 */
export async function getPageField(
  page: string,
  section: string,
  key: string,
  locale: string = "ro"
): Promise<string> {
  try {
    const item = await prisma.pageContent.findUnique({
      where: {
        page_section_key: { page, section, key },
      },
    });

    if (!item) {
      // Fallback to JSON
      const messages = locale === "en" ? enMessages : roMessages;
      const pageData = (messages as any)[page];
      if (section === "main") {
        return pageData?.[key] || "";
      }
      return pageData?.[section]?.[key] || "";
    }

    return locale === "en" ? item.valueEn || item.valueRo : item.valueRo;
  } catch (error) {
    console.error("Error fetching page field:", error);
    return "";
  }
}
