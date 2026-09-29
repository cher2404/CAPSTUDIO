import "server-only";

/**
 * Optionele koppeling met Google Calendar.
 * Zet GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET en GOOGLE_REFRESH_TOKEN (scope: calendar.events)
 * en eventueel GOOGLE_CALENDAR_ID (standaard "primary"). Zonder deze variabelen doet dit niets.
 */
const cfg = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  calendarId: process.env.GOOGLE_CALENDAR_ID ?? "primary",
};

export const googleCalendarEnabled = Boolean(cfg.clientId && cfg.clientSecret && cfg.refreshToken);

async function accessToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: cfg.clientId!,
      client_secret: cfg.clientSecret!,
      refresh_token: cfg.refreshToken!,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Google token: ${res.status}`);
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

const base = () => `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cfg.calendarId)}/events`;

interface EventInput {
  title: string;
  description?: string;
  location?: string | null;
  start: string;
  end: string;
  attendeeEmail?: string;
}

function body(e: EventInput) {
  return JSON.stringify({
    summary: e.title,
    description: e.description,
    location: e.location ?? undefined,
    start: { dateTime: e.start, timeZone: "Europe/Amsterdam" },
    end: { dateTime: e.end, timeZone: "Europe/Amsterdam" },
    attendees: e.attendeeEmail ? [{ email: e.attendeeEmail }] : undefined,
    reminders: { useDefault: true },
  });
}

/** Maakt of werkt een event bij. Geeft het event-id terug, of null als het niet lukt. */
export async function upsertCalendarEvent(eventId: string | null, e: EventInput): Promise<string | null> {
  if (!googleCalendarEnabled) return null;
  try {
    const token = await accessToken();
    const res = await fetch(eventId ? `${base()}/${eventId}` : base(), {
      method: eventId ? "PATCH" : "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: body(e),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Google event: ${res.status} ${await res.text()}`);
    const json = (await res.json()) as { id: string };
    return json.id;
  } catch (err) {
    console.error("[google-calendar]", err);
    return eventId;
  }
}

export async function deleteCalendarEvent(eventId: string | null) {
  if (!googleCalendarEnabled || !eventId) return;
  try {
    const token = await accessToken();
    await fetch(`${base()}/${eventId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch (err) {
    console.error("[google-calendar]", err);
  }
}
