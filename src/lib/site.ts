/**
 * Vaste bedrijfsgegevens. Pas deze waarden aan (of zet ze in je .env).
 */
export const site = {
  name: "CAP Studio",
  tagline: "foto en video voor sport en lifestyle",
  owner: "Cheryl Aldessa Prijs",
  description:
    "CAP Studio maakt filmische foto's en video's voor sport en lifestyle. Gym, training en lifestyle shoots in heel Nederland.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hallo@capstudio.nl",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM ?? "capstudio",
  kvk: process.env.NEXT_PUBLIC_KVK ?? "00000000",
  btw: process.env.NEXT_PUBLIC_BTW ?? "",
  region: "Nederland",
  locale: "nl_NL",
} as const;

export const instagramUrl = `https://instagram.com/${site.instagram}`;

export function absoluteUrl(path = "/") {
  return new URL(path, site.url).toString();
}
