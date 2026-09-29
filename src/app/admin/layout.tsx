import type { Metadata } from "next";
import { AppShell, type NavItem } from "@/components/portal/app-shell";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | CAP Studio admin" }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { supabase, profile, user } = await requireAdmin();
  const [{ count: unread }, { count: questions }, { count: deletions }] = await Promise.all([
    supabase.from("messages").select("id", { count: "exact", head: true }).is("read_at", null).neq("sender_id", user.id),
    supabase.from("quotes").select("id", { count: "exact", head: true }).eq("status", "vraag"),
    supabase.from("deletion_requests").select("id", { count: "exact", head: true }).eq("status", "open"),
  ]);

  const nav: NavItem[] = [
    { href: "/admin", label: "Overzicht", icon: "home", exact: true, badge: unread ?? 0 },
    { href: "/admin/klanten", label: "Klanten en projecten", icon: "users" },
    { href: "/admin/offertes", label: "Offertes", icon: "quote", badge: questions ?? 0 },
    { href: "/admin/agenda", label: "Agenda", icon: "calendar" },
    { href: "/admin/galerijen", label: "Galerijen", icon: "image" },
    { href: "/admin/sjablonen", label: "Offertesjablonen", icon: "template" },
    { href: "/admin/overeenkomst", label: "Overeenkomst", icon: "sign" },
    { href: "/admin/pakketten", label: "Pakketten", icon: "tag" },
    { href: "/admin/portfolio", label: "Portfolio", icon: "grid" },
    { href: "/admin/tips", label: "Tips", icon: "book" },
    { href: "/admin/emails", label: "E-mailsjablonen", icon: "mail" },
    { href: "/admin/instellingen", label: "Instellingen en AVG", icon: "settings", badge: deletions ?? 0 },
  ];

  return (
    <AppShell nav={nav} label="Admin" userName={profile?.full_name ?? "Cheryl"} userEmail={profile?.email ?? user.email ?? ""} switchLink={{ href: "/", label: "Naar website" }}>
      {children}
    </AppShell>
  );
}
