import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import { cache } from "react";
import { textDefs, type TextKey } from "@/content/texts";
import type { Package, PortfolioItem } from "@/lib/types";

/**
 * Voorbeeldbeelden zolang er nog geen eigen portfolio in de database staat.
 * Vervang ze via /admin/portfolio door je eigen werk.
 */
const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=75`;
export const demoPortfolio: PortfolioItem[] = [
  ["photo-1517836357463-d25dfeac3438", "sport", 1600, 1067, "Krachttraining in een donkere gym"],
  ["photo-1571019613454-1cb2f99b2d8b", "sport", 1600, 1067, "Sporter tijdens een training"],
  ["photo-1534438327276-14e5300c3a48", "sport", 1600, 1067, "Gym met gewichten"],
  ["photo-1518611012118-696072aa579a", "lifestyle", 1600, 1067, "Rustig moment na de training"],
  ["photo-1541534741688-6078c6bfb5c5", "sport", 1600, 2400, "Vrouw traint met dumbbells"],
  ["photo-1549060279-7e168fcee0c2", "sport", 1600, 1067, "Bokstraining"],
  ["photo-1476480862126-209bfaa8edc8", "sport", 1600, 1067, "Hardlopen bij zonsopkomst"],
  ["photo-1506126613408-eca07ce68773", "lifestyle", 1600, 1067, "Lifestyle portret buiten"],
  ["photo-1583454110551-21f2fa2afe61", "sport", 1600, 1067, "Focus in de gym"],
  ["photo-1552674605-db6ffd4facb5", "sport", 1600, 1067, "Runner in beweging"],
].map(([id, category, width, height, alt], i) => ({
  id: `demo-${i}`,
  title: null,
  category: category as PortfolioItem["category"],
  image_url: u(id as string),
  storage_path: null,
  video_url: null,
  description: null,
  link_url: null,
  width: width as number,
  height: height as number,
  alt: alt as string,
  featured: i === 0,
  published: true,
  sort: i,
}));

const excl = (incl: number) => Math.round((incl / 1.21) * 10000) / 10000;

export const demoPackages: Package[] = [
  {
    id: "mini", slug: "mini", name: "Mini shoot", tagline: "Ideaal voor een nieuwe profielset of snelle content.",
    price: excl(175), price_label: "", duration: "1 uur", category: "beeld", highlighted: false, sort: 1, active: true,
    features: ["1 uur shoot", "12 bewerkte foto's", "Online galerij"],
  },
  {
    id: "halve-dag", slug: "halve-dag", name: "Halve dag", tagline: "Voor trainers, coaches en kleine merken.",
    price: excl(395), price_label: "", duration: "3 uur", category: "beeld", highlighted: true, sort: 2, active: true,
    features: ["3 uur shoot", "25 bewerkte foto's", "Verschillende looks of locaties"],
  },
  {
    id: "foto-video", slug: "foto-video", name: "Foto en video", tagline: "Compleet contentpakket.",
    price: excl(595), price_label: "vanaf", duration: "Halve dag", category: "beeld", highlighted: false, sort: 3, active: true,
    features: ["Halve dag shoot", "25 bewerkte foto's", "Een korte reel voor social media"],
  },
  {
    id: "op-maat", slug: "op-maat", name: "Op maat", tagline: "Voor je sportschool of merk.",
    price: null, price_label: "", duration: "In overleg", category: "beeld", highlighted: false, sort: 4, active: true,
    features: ["Meerdere shoots", "Een maandpakket", "Of een grotere productie"],
  },
  {
    id: "website", slug: "website", name: "Website", tagline: "Een snelle, strakke site die past bij je merk, met beelden die kloppen.",
    price: null, price_label: "", duration: "Ontwerp en bouw", category: "digitaal", highlighted: false, sort: 10, active: true,
    features: ["Ontwerp in je eigen stijl", "Gebouwd voor mobiel en snelheid", "Zelf teksten en beelden beheren"],
  },
  {
    id: "app", slug: "app", name: "App of webapp", tagline: "Van idee tot werkende app: een klantportaal, boekingssysteem of je eigen tool.",
    price: null, price_label: "", duration: "Op maat", category: "digitaal", highlighted: false, sort: 11, active: true,
    features: ["Concept en ontwerp", "Web of mobiel", "Doorontwikkeling mogelijk"],
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
  return { src: hero || featured?.image_url || demoPortfolio[0]!.image_url, alt: featured?.alt ?? "Filmische sportfoto door CAP Media Studio" };
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

/** Websiteteksten: standaardtekst uit de code, overschreven door wat je in de admin aanpast. */
export const getTexts = cache(async (): Promise<Record<TextKey, string>> => {
  const texts = Object.fromEntries(Object.entries(textDefs).map(([k, d]) => [k, d.default])) as Record<TextKey, string>;
  const supabase = createPublicClient();
  if (!supabase) return texts;
  const { data } = await supabase.from("site_texts").select("key, value");
  for (const row of data ?? []) if (row.key in texts) texts[row.key as TextKey] = row.value;
  return texts;
});

export type Pricing = { vatRate: number; display: "incl" | "excl" };

export const getPricing = cache(async (): Promise<Pricing> => {
  const supabase = createPublicClient();
  if (!supabase) return { vatRate: 21, display: "incl" };
  const { data } = await supabase.from("settings").select("key, value").in("key", ["vat_rate", "price_display"]);
  const get = (k: string) => data?.find((r) => r.key === k)?.value;
  return { vatRate: Number(get("vat_rate") ?? 21), display: get("price_display") === "excl" ? "excl" : "incl" };
});

/** Prijs zoals hij op de website staat, volgens de btw-instelling. */
export function displayPrice(pkg: Pick<Package, "price">, pricing: Pricing) {
  if (pkg.price == null) return null;
  const value = pricing.display === "incl" ? Number(pkg.price) * (1 + pricing.vatRate / 100) : Number(pkg.price);
  const rounded = Math.round(value * 100) / 100;
  const whole = Math.abs(rounded - Math.round(rounded)) < 0.005;
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(rounded);
}

export function vatNote(pricing: Pricing) {
  if (pricing.vatRate === 0) return "geen btw";
  return pricing.display === "incl" ? "incl. btw" : "excl. btw";
}
