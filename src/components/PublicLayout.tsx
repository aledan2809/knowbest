import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

/**
 * PublicLayout — consolidates Navbar + Footer for public marketing pages.
 *
 * Use by wrapping the page content:
 * ```tsx
 * export default function MyPage() {
 *   return (
 *     <PublicLayout>
 *       <main>...content...</main>
 *     </PublicLayout>
 *   );
 * }
 * ```
 *
 * Introduced by AUDIT-010 fix — removes Navbar/Footer duplication across
 * about, case-studies, contact, pricing, products, use-cases, home.
 *
 * Admin and auth pages should NOT use this wrapper.
 */
export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
