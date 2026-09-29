import type { Metadata } from "next";
import { AppShell, type NavItem } from "@/components/portal/app-shell";
import { getPortalCounts } from "@/lib/portal";
import { requireClient } from "@/lib/auth";

export const metadata: Metadata = { title: { default: "Klantportaal", template: "%s | CAP Studio portaal" }, robots: { index: false } };

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const { client, profile } = await requireClient();
  const counts = await getPortalCounts();

  const nav: NavItem[] = [
    { href: "/portal", label: "Dashboard", icon: "home", exact: true },
    { href: "/portal/afspraken", label: "Afspraken", icon: "calendar" },
    { href: "/portal/offertes", label: "Offertes", icon: "quote", badge: counts.openQuotes },
    { href: "/portal/overeenkomsten", label: "Overeenkomsten", icon: "sign", badge: counts.toSign },
    { href: "/portal/berichten", label: "Berichten", icon: "chat", badge: counts.unread },
    { href: "/portal/galerijen", label: "Mijn foto's", icon: "image" },
    { href: "/portal/documenten", label: "Documenten", icon: "folder" },
    { href: "/portal/tips", label: "Tips", icon: "book" },
    { href: "/portal/account", label: "Account", icon: "user" },
  ];

  return (
    <AppShell
      nav={nav}
      label="Klantportaal"
      userName={client.full_name}
      userEmail={client.email}
      switchLink={profile?.role === "admin" ? { href: "/admin", label: "Naar admin" } : undefined}
    >
      {children}
    </AppShell>
  );
}
