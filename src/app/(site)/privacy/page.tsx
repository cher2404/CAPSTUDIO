import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { privacy, privacyUpdated } from "@/content/legal";

export const metadata: Metadata = { title: "Privacyverklaring", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return <LegalPage title="Privacyverklaring" updated={privacyUpdated} body={privacy} cookies />;
}
