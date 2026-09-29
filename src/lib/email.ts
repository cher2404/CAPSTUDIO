import "server-only";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { escapeHtml, fill, md } from "@/lib/markdown";
import { absoluteUrl, site } from "@/lib/site";
import type { EmailTemplate } from "@/lib/types";

type Vars = Record<string, string | number | null | undefined>;

export interface SendOptions {
  to: string | string[];
  template: string;
  vars?: Vars;
  /** Variabelen die al veilige HTML/markdown zijn (bijv. links) en niet ge-escaped moeten worden. */
  rawVars?: Vars;
  replyTo?: string;
  attachments?: { filename: string; content: string | Buffer; contentType?: string }[];
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.EMAIL_FROM ?? `${site.name} <${site.email}>`;

export const adminEmail = process.env.ADMIN_EMAIL ?? site.email;

export async function loadTemplate(key: string) {
  const { data } = await createAdminClient().from("email_templates").select("*").eq("key", key).maybeSingle<EmailTemplate>();
  return data;
}

export function renderEmail(tpl: Pick<EmailTemplate, "subject" | "body">, vars: Vars = {}, rawVars: Vars = {}) {
  const safe: Vars = { site: site.name };
  for (const [k, v] of Object.entries(vars)) safe[k] = v == null ? "" : escapeHtml(String(v));
  Object.assign(safe, rawVars);

  const subject = fill(tpl.subject, { ...vars, ...rawVars });
  const content = md(fill(tpl.body, safe))
    // Een link die alleen op een regel staat wordt een knop.
    .replace(/<p><a href="([^"]+)">([^<]+)<\/a><\/p>/g, (_, href, label) => button(href, label));
  return { subject, html: layout(subject, content) };
}

function button(href: string, label: string) {
  return `<p style="margin:28px 0"><a href="${href}" style="display:inline-block;background:#e9e2d6;color:#0b0b0c;text-decoration:none;padding:13px 26px;border-radius:999px;font-weight:600;font-size:14px;letter-spacing:.02em">${label}</a></p>`;
}

function layout(title: string, content: string) {
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;background:#0b0b0c;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif;color:#d9d3c8">
<div style="max-width:560px;margin:0 auto">
  <div style="padding:0 4px 24px;border-bottom:1px solid #26262a">
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;color:#f1ebe1;letter-spacing:.01em">CAP Studio</div>
    <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#8d877e;margin-top:4px">${site.tagline}</div>
  </div>
  <div style="padding:28px 4px;font-size:15px;line-height:1.65">
    <style>a{color:#d7a878} blockquote{margin:0;padding:12px 16px;border-left:2px solid #c9976b;background:#141416;color:#e9e2d6} h1,h2{font-family:Georgia,serif;color:#f1ebe1;font-weight:400}</style>
    ${content}
  </div>
  <div style="padding:20px 4px 0;border-top:1px solid #26262a;font-size:12px;color:#77726a;line-height:1.6">
    ${site.name} · ${site.owner} · KvK ${site.kvk}<br>
    <a href="${absoluteUrl("/")}" style="color:#8d877e">${site.url.replace(/^https?:\/\//, "")}</a> ·
    <a href="${absoluteUrl("/privacy")}" style="color:#8d877e">Privacyverklaring</a>
  </div>
</div></body></html>`;
}

/**
 * Verstuurt een e-mail op basis van een sjabloon uit de database.
 * Faalt nooit hard: een mislukte mail mag een actie van de klant niet blokkeren.
 */
export async function sendEmail(opts: SendOptions) {
  try {
    const tpl = await loadTemplate(opts.template);
    if (!tpl) {
      console.warn(`[email] sjabloon "${opts.template}" niet gevonden`);
      return { ok: false as const };
    }
    const { subject, html } = renderEmail(tpl, opts.vars, opts.rawVars);

    if (!resend) {
      console.info(`[email] (RESEND_API_KEY ontbreekt) → ${opts.to}: ${subject}`);
      await log(opts.to, opts.template, subject, "skipped");
      return { ok: true as const, skipped: true };
    }
    const { error } = await resend.emails.send({
      from,
      to: opts.to,
      subject,
      html,
      replyTo: opts.replyTo ?? adminEmail,
      attachments: opts.attachments?.map((a) => ({
        filename: a.filename,
        content: typeof a.content === "string" ? Buffer.from(a.content) : a.content,
        contentType: a.contentType,
      })),
    });
    if (error) {
      console.error("[email] versturen mislukt", error);
      await log(opts.to, opts.template, subject, "failed");
      return { ok: false as const };
    }
    await log(opts.to, opts.template, subject, "sent");
    return { ok: true as const };
  } catch (err) {
    console.error("[email] fout", err);
    return { ok: false as const };
  }
}

async function log(to: string | string[], template: string, subject: string, status: "sent" | "skipped" | "failed") {
  const rows = (Array.isArray(to) ? to : [to]).map((recipient) => ({ recipient: recipient.toLowerCase(), template, subject, status }));
  await createAdminClient().from("email_log").insert(rows).then(({ error }) => error && console.error("[email] log", error));
}

/** Aantal mails van een sjabloon naar een ontvanger in de laatste X minuten. */
export async function recentEmailCount(recipient: string, template: string, minutes: number) {
  const since = new Date(Date.now() - minutes * 60_000).toISOString();
  const { count } = await createAdminClient()
    .from("email_log")
    .select("id", { count: "exact", head: true })
    .eq("recipient", recipient.toLowerCase())
    .eq("template", template)
    .gte("created_at", since);
  return count ?? 0;
}
