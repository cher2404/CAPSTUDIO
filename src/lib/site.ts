/**
 * Vaste bedrijfsgegevens. Pas deze waarden aan (of zet ze in je .env).
 */
export const site = {
  name: "CAP Media Studio",
  tagline: "foto en video voor sport en lifestyle",
  owner: "Cheryl Aldessa Prijs",
  description:
    "Foto en video voor sport en lifestyle, met een donkere, filmische look die opvalt. CAP Media Studio shoot voor sporters, trainers en merken in heel Nederland.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://capmediastudio.nl",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hallo@capmediastudio.nl",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM ?? "capmediastudio",
  kvk: process.env.NEXT_PUBLIC_KVK ?? "00000000",
  btw: process.env.NEXT_PUBLIC_BTW ?? "",
  region: "Nederland",
  locale: "nl_NL",
} as const;

export const instagramUrl = `https://instagram.com/${site.instagram}`;

export function absoluteUrl(path = "/") {
  return new URL(path, site.url).toString();
}
