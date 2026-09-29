import type { AgreementStatus, PaymentStatus, ProjectStatus, QuoteStatus } from "./types";

const TZ = "Europe/Amsterdam";

export function euro(value: number | string | null | undefined) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(Number(value ?? 0));
}

export function formatDate(value: string | Date | null | undefined, opts: Intl.DateTimeFormatOptions = {}) {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric", timeZone: TZ, ...opts }).format(d);
}

export function formatDay(value: string | Date) {
  return formatDate(value, { weekday: "long", day: "numeric", month: "long", year: undefined });
}

export function formatTime(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("nl-NL", { hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(d);
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "";
  return `${formatDate(value, { weekday: "short" })}, ${formatTime(value)}`;
}

export function timeRange(start: string, end: string) {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

/** Datum als YYYY-MM-DD in Nederlandse tijd (voor groeperen per dag). */
export function dayKey(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
}

export const projectStatusLabel: Record<ProjectStatus, string> = {
  aanvraag: "Aanvraag",
  offerte: "Offerte",
  akkoord: "Akkoord",
  shoot_gepland: "Shoot gepland",
  bewerking: "Bewerking",
  opgeleverd: "Opgeleverd",
};

export const projectStatuses = Object.keys(projectStatusLabel) as ProjectStatus[];

export const quoteStatusLabel: Record<QuoteStatus, string> = {
  concept: "Concept",
  verstuurd: "Openstaand",
  vraag: "Vraag gesteld",
  geaccepteerd: "Geaccepteerd",
  afgewezen: "Afgewezen",
  verlopen: "Verlopen",
};

export const agreementStatusLabel: Record<AgreementStatus, string> = {
  te_ondertekenen: "Te ondertekenen",
  ondertekend: "Ondertekend",
  ingetrokken: "Ingetrokken",
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  open: "Nog niet betaald",
  deels: "Deels betaald",
  betaald: "Betaald",
};

export function initials(name: string | null | undefined, fallback = "?") {
  if (!name) return fallback;
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function firstName(name: string | null | undefined) {
  return name?.trim().split(/\s+/)[0] ?? "";
}
