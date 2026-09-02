import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { UmamiScript } from "@aledan/analytics/react";
import "./globals.css";

// Central Umami instance (cookieless — no consent needed), knowbest.ro website.
const UMAMI_WEBSITE_ID = "1e7f71f3-0425-4a9d-837e-70f7b7155f9b";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "KnowBest",
  description: "Knowledge base platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UmamiScript websiteId={UMAMI_WEBSITE_ID} />
        {children}
      </body>
    </html>
  );
}
