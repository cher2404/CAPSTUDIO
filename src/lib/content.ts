import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import type { Package, PortfolioItem } from "@/lib/types";

/**
 * Voorbeeldbeelden zolang er nog geen eigen portfolio in de database staat.
 * Vervang ze via /admin/portfolio door je eigen werk.
 */
const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=75`;
export const demoPortfolio: PortfolioItem[] = [
  ["photo-1517836357463-d25dfeac3438", "gym", 1600, 1067, "Krachttraining in een donkere gym"],
  ["photo-1571019613454-1cb2f99b2d8b", "training", 1600, 1067, "Sporter tijdens een training"],
  ["photo-1534438327276-14e5300c3a48", "gym", 1600, 1067, "Gym met gewichten"],
  ["photo-1518611012118-696072aa579a", "lifestyle", 1600, 1067, "Rustig moment na de training"],
  ["photo-1541534741688-6078c6bfb5c5", "gym", 1600, 2400, "Vrouw traint met dumbbells"],
  ["photo-1549060279-7e168fcee0c2", "training", 1600, 1067, "Bokstraining"],
  ["photo-1476480862126-209bfaa8edc8", "training", 1600, 1067, "Hardlopen bij zonsopkomst"],
  ["photo-1506126613408-eca07ce68773", "lifestyle", 1600, 1067, "Lifestyle portret buiten"],
  ["photo-1583454110551-21f2fa2afe61", "gym", 1600, 1067, "Focus in de gym"],
  ["photo-1552674605-db6ffd4facb5", "training", 1600, 1067, "Runner in beweging"],
].map(([id, category, width, height, alt], i) => ({
  id: `demo-${i}`,
  title: null,
  category: category as PortfolioItem["category"],
  image_url: u(id as string),
  storage_path: null,
  video_url: null,
  width: width as number,
  height: height as number,
  alt: alt as string,
  featured: i === 0,
  published: true,
  sort: i,
}));

export const demoPackages: Package[] = [
  {
    id: "kennismaking", slug: "kennismaking", name: "Kennismakingsshoot", tagline: "Even aftasten, zonder gedoe",
    price_from: 95, price_label: "vanaf", duration: "30 minuten", highlighted: false, sort: 1, active: true,
    features: ["Korte intake vooraf", "1 locatie", "10 bewerkte foto's", "Online galerij", "Levering binnen 7 dagen"],
  },
  {
    id: "mini", slug: "mini", name: "Mini shoot", tagline: "Snel, strak en to the point",
    price_from: 195, price_label: "vanaf", duration: "1 uur", highlighted: false, sort: 2, active: true,
    features: ["Intake en moodboard", "1 locatie, 1 outfitwissel", "25 bewerkte foto's", "1 bewerkingsronde", "Online galerij met favorieten"],
  },
  {
    id: "halve-dag", slug: "halve-dag", name: "Halve dag", tagline: "Voor merken, coaches en campagnes",
    price_from: 495, price_label: "vanaf", duration: "4 uur", highlighted: true, sort: 3, active: true,
    features: ["Uitgebreide briefing en shotlist", "Tot 2 locaties", "60+ bewerkte foto's", "2 bewerkingsrondes", "Gebruiksrechten voor online en social"],
  },
  {
    id: "foto-video", slug: "foto-video", name: "Foto plus video", tagline: "Beeld dat beweegt én blijft hangen",
    price_from: 895, price_label: "vanaf", duration: "4 tot 6 uur", highlighted: false, sort: 4, active: true,
    features: ["Foto en video in één dag", "60+ bewerkte foto's", "1 reel van 30 tot 60 seconden", "3 korte clips voor social", "2 bewerkingsrondes"],
  },
];

export async function getPackages(): Promise<Package[]> {
  const supabase = createPublicClient();
  if (!supabase) return demoPackages;
  const { data } = await supabase.from("packages").select("*").eq("active", true).order("sort");
  return data?.length ? (data as Package[]) : demoPackages;
}

export async function getPortfolio(): Promise<PortfolioItem[]> {
  const supabase = createPublicClient();
  if (!supabase) return demoPortfolio;
  const { data } = await supabase.from("portfolio_items").select("*").eq("published", true).order("sort").order("created_at", { ascending: false });
  return data?.length ? (data as PortfolioItem[]) : demoPortfolio;
}

export async function getSetting<T = string>(key: string, fallback: T): Promise<T> {
  const supabase = createPublicClient();
  if (!supabase) return fallback;
  const { data } = await supabase.from("settings").select("value").eq("key", key).maybeSingle();
  const v = data?.value as T | undefined;
  return v === undefined || v === null || v === "" ? fallback : v;
}

export async function getHero() {
  const [hero, portfolio] = await Promise.all([getSetting("hero_image", ""), getPortfolio()]);
  const featured = portfolio.find((p) => p.featured && p.category !== "video") ?? portfolio.find((p) => p.category !== "video");
  return { src: hero || featured?.image_url || demoPortfolio[0]!.image_url, alt: featured?.alt ?? "Filmische sportfoto door CAP Studio" };
}

/** Zet een YouTube/Vimeo-link om naar een embed-URL. */
export function toEmbedUrl(url: string) {
  if (!url) return "";
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0&modestbranding=1`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?dnt=1&title=0&byline=0&portrait=0`;
  return url;
}
