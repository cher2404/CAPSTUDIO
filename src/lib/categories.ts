import type { Discipline, PortfolioCategory } from "./types";

export const portfolioCategories: { value: PortfolioCategory; label: string }[] = [
  { value: "sport", label: "Sport" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "video", label: "Video" },
  { value: "apps", label: "Apps en web" },
  { value: "games", label: "Games" },
];

export const portfolioCategoryLabel = Object.fromEntries(portfolioCategories.map((c) => [c.value, c.label])) as Record<PortfolioCategory, string>;

export const disciplines: { value: Discipline; label: string }[] = [
  { value: "beeld", label: "Foto en video" },
  { value: "digitaal", label: "Apps en websites" },
  { value: "games", label: "Games" },
];

export const disciplineLabel = Object.fromEntries(disciplines.map((d) => [d.value, d.label])) as Record<Discipline, string>;
