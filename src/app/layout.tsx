import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { CookieBanner } from "@/components/site/cookie-banner";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const interTight = Inter_Tight({ variable: "--font-inter-tight", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });
const instrument = Instrument_Serif({ variable: "--font-instrument", subsets: ["latin"], weight: "400", style: ["normal", "italic"], display: "swap" });
const mono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Foto, video, apps en games`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.owner }],
  keywords: ["creatieve studio", "fotograaf", "videomaker", "sportfotografie", "lifestyle fotografie", "website laten maken", "app laten maken", "webapp", "games", "Nederland"],
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    url: site.url,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${inter.variable} ${interTight.variable} ${instrument.variable} ${mono.variable}`}>
      <body className="grain min-h-dvh">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
