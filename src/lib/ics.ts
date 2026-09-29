import { site } from "@/lib/site";

function stamp(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function esc(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/** Maakt een .ics-agenda-uitnodiging (werkt in Google, Apple en Outlook). */
export function createIcs(opts: {
  uid: string;
  start: string;
  end: string;
  title: string;
  description?: string;
  location?: string | null;
  cancelled?: boolean;
  sequence?: number;
}) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CAP Studio//Portal//NL",
    "CALSCALE:GREGORIAN",
    `METHOD:${opts.cancelled ? "CANCEL" : "PUBLISH"}`,
    "BEGIN:VEVENT",
    `UID:${opts.uid}@capstudio`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(new Date(opts.start))}`,
    `DTEND:${stamp(new Date(opts.end))}`,
    `SEQUENCE:${opts.sequence ?? Math.floor(Date.now() / 1000)}`,
    `SUMMARY:${esc(opts.title)}`,
    opts.description ? `DESCRIPTION:${esc(opts.description)}` : "",
    opts.location ? `LOCATION:${esc(opts.location)}` : "",
    `ORGANIZER;CN=${esc(site.name)}:mailto:${site.email}`,
    `STATUS:${opts.cancelled ? "CANCELLED" : "CONFIRMED"}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT24H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(opts.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lines.join("\r\n");
}
