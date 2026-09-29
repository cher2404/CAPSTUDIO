import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: true });

/** Markdown → HTML. Alleen voor content van de admin (vertrouwd). */
export function md(input: string | null | undefined) {
  return marked.parse(input ?? "", { async: false }) as string;
}

/** Vervangt {{variabelen}} in een sjabloon. */
export function fill(template: string, vars: Record<string, string | number | null | undefined>) {
  return template.replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (_, k: string) => String(vars[k] ?? ""));
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
