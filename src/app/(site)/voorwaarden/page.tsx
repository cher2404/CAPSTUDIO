import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { privacyUpdated, terms } from "@/content/legal";

export const metadata: Metadata = { title: "Algemene voorwaarden", alternates: { canonical: "/voorwaarden" } };

export default function VoorwaardenPage() {
  return <LegalPage title="Algemene voorwaarden" updated={privacyUpdated} body={terms} />;
}
