import "server-only";
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { euro, formatDate } from "@/lib/format";
import { site } from "@/lib/site";
import type { Agreement, Client, Project, Quote, QuoteItem, Signature } from "@/lib/types";

const c = { ink: "#141414", mist: "#6f6a63", line: "#e3ddd3", ember: "#b27d4f" };

const s = StyleSheet.create({
  page: { padding: 48, paddingBottom: 64, fontSize: 10, fontFamily: "Helvetica", color: c.ink, lineHeight: 1.5 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 36, paddingBottom: 16, borderBottom: `1 solid ${c.line}` },
  brand: { fontFamily: "Times-Roman", fontSize: 24 },
  brandItalic: { fontFamily: "Times-Italic", color: c.ember },
  tagline: { fontSize: 7, letterSpacing: 1.5, color: c.mist, textTransform: "uppercase", marginTop: 2 },
  meta: { fontSize: 8, color: c.mist, textAlign: "right" },
  h1: { fontFamily: "Times-Roman", fontSize: 22, marginBottom: 14 },
  h2: { fontFamily: "Times-Roman", fontSize: 14, marginTop: 14, marginBottom: 4 },
  p: { marginBottom: 6 },
  bold: { fontFamily: "Helvetica-Bold" },
  small: { fontSize: 8, color: c.mist },
  row: { flexDirection: "row", borderBottom: `1 solid ${c.line}`, paddingVertical: 6 },
  th: { fontSize: 8, color: c.mist, textTransform: "uppercase", letterSpacing: 1 },
  totals: { marginTop: 12, marginLeft: "auto", width: 220 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  box: { marginTop: 24, padding: 14, border: `1 solid ${c.line}`, borderRadius: 4 },
  footer: { position: "absolute", bottom: 28, left: 48, right: 48, fontSize: 7, color: c.mist, flexDirection: "row", justifyContent: "space-between" },
});

function Header({ right }: { right: string[] }) {
  return (
    <View style={s.header} fixed>
      <View>
        <Text style={s.brand}>
          CAP Media <Text style={s.brandItalic}>Studio</Text>
        </Text>
        <Text style={s.tagline}>{site.tagline}</Text>
      </View>
      <View>
        {right.map((r) => (
          <Text key={r} style={s.meta}>
            {r}
          </Text>
        ))}
      </View>
    </View>
  );
}

function Footer() {
  return (
    <View style={s.footer} fixed>
      <Text>
        {site.name} · {site.owner} · KvK {site.kvk}
        {site.btw ? ` · Btw ${site.btw}` : ""} · {site.email}
      </Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

/** Inline **vet** ondersteunen. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") ? (
          <Text key={i} style={s.bold}>
            {p.slice(2, -2)}
          </Text>
        ) : (
          <Text key={i}>{p.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")}</Text>
        ),
      )}
    </>
  );
}

/** Eenvoudige markdown (koppen, alinea's, lijsten, vet) naar PDF-blokken. */
function Markdown({ source }: { source: string }) {
  const blocks = source.replace(/\r/g, "").split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, i) => {
        const b = block.trim();
        if (!b) return null;
        if (b.startsWith("# ")) return <Text key={i} style={s.h1}>{b.slice(2)}</Text>;
        if (b.startsWith("## ")) return <Text key={i} style={s.h2}>{b.slice(3)}</Text>;
        if (b.startsWith("### ")) return <Text key={i} style={[s.h2, { fontSize: 12 }]}>{b.slice(4)}</Text>;
        const lines = b.split("\n");
        if (lines.every((l) => /^(\s*[-*]|\s*\d+\.)\s/.test(l))) {
          return (
            <View key={i} style={{ marginBottom: 6 }}>
              {lines.map((l, j) => (
                <View key={j} style={{ flexDirection: "row", marginBottom: 2 }}>
                  <Text style={{ width: 14 }}>{/^\s*\d+\./.test(l) ? l.match(/\d+/)![0] + "." : "–"}</Text>
                  <Text style={{ flex: 1 }}>
                    <Inline text={l.replace(/^(\s*[-*]|\s*\d+\.)\s/, "")} />
                  </Text>
                </View>
              ))}
            </View>
          );
        }
        return (
          <Text key={i} style={s.p}>
            <Inline text={lines.join("\n")} />
          </Text>
        );
      })}
    </>
  );
}

export async function renderQuotePdf(quote: Quote, items: QuoteItem[], project: Project, client: Client) {
  const doc = (
    <Document title={`Offerte ${quote.number}`} author={site.name}>
      <Page size="A4" style={s.page}>
        <Header right={[`Offerte ${quote.number}`, `Datum: ${formatDate(quote.sent_at ?? quote.created_at)}`, quote.valid_until ? `Geldig tot: ${formatDate(quote.valid_until)}` : ""]} />
        <Text style={s.small}>Voor</Text>
        <Text style={s.bold}>{client.full_name ?? client.email}</Text>
        {client.company && <Text>{client.company}</Text>}
        <Text style={{ marginBottom: 20 }}>{client.email}</Text>

        <Text style={s.h1}>{quote.title}</Text>
        {quote.intro && <Markdown source={quote.intro} />}
        <Text style={[s.small, { marginBottom: 12 }]}>Project: {project.title}</Text>

        <View style={[s.row, { borderBottom: `1 solid ${c.ink}` }]}>
          <Text style={[s.th, { flex: 1 }]}>Omschrijving</Text>
          <Text style={[s.th, { width: 50, textAlign: "right" }]}>Aantal</Text>
          <Text style={[s.th, { width: 80, textAlign: "right" }]}>Prijs</Text>
          <Text style={[s.th, { width: 80, textAlign: "right" }]}>Totaal</Text>
        </View>
        {items.map((it) => (
          <View key={it.id} style={s.row} wrap={false}>
            <Text style={{ flex: 1 }}>{it.description}</Text>
            <Text style={{ width: 50, textAlign: "right" }}>{Number(it.quantity).toLocaleString("nl-NL")}</Text>
            <Text style={{ width: 80, textAlign: "right" }}>{euro(it.unit_price)}</Text>
            <Text style={{ width: 80, textAlign: "right" }}>{euro(Number(it.quantity) * Number(it.unit_price))}</Text>
          </View>
        ))}
        <View style={s.totals}>
          <View style={s.totalRow}>
            <Text>Subtotaal</Text>
            <Text>{euro(quote.subtotal)}</Text>
          </View>
          <View style={s.totalRow}>
            <Text>Btw {Number(quote.vat_rate)}%</Text>
            <Text>{euro(quote.vat_amount)}</Text>
          </View>
          <View style={[s.totalRow, { borderTop: `1 solid ${c.ink}`, marginTop: 4, paddingTop: 6 }]}>
            <Text style={s.bold}>Totaal</Text>
            <Text style={s.bold}>{euro(quote.total)}</Text>
          </View>
        </View>

        <View style={s.box}>
          <Text style={s.bold}>Gebruiksrechten</Text>
          <Text style={s.p}>{quote.usage_rights || "Persoonlijk gebruik en eigen social media."}</Text>
          <Text style={s.bold}>Bewerkingsrondes</Text>
          <Text>{quote.revision_rounds}</Text>
        </View>
        <Text style={[s.small, { marginTop: 16 }]}>Op deze offerte zijn de algemene voorwaarden van {site.name} van toepassing. Accepteren doe je in je klantportaal.</Text>
        <Footer />
      </Page>
    </Document>
  );
  return renderToBuffer(doc);
}

export async function renderAgreementPdf(agreement: Agreement, signatures: Signature[]) {
  const doc = (
    <Document title={agreement.title} author={site.name}>
      <Page size="A4" style={s.page}>
        <Header right={[agreement.title, `Aangemaakt: ${formatDate(agreement.created_at)}`, agreement.signed_at ? `Ondertekend: ${formatDate(agreement.signed_at)}` : "Nog niet ondertekend"]} />
        <Markdown source={agreement.body} />

        <View style={s.box} wrap={false}>
          <Text style={[s.h2, { marginTop: 0 }]}>Digitale ondertekening</Text>
          {signatures.length === 0 && <Text style={s.small}>Deze overeenkomst is nog niet ondertekend.</Text>}
          {signatures.map((sig) => (
            <View key={sig.id} style={{ marginBottom: 8 }}>
              <Text>
                <Text style={s.bold}>{sig.signer_name}</Text> ({sig.signer_role === "admin" ? "fotograaf" : "opdrachtgever"}
                {sig.signer_email ? `, ${sig.signer_email}` : ""})
              </Text>
              <Text style={s.small}>
                Ondertekend op{" "}
                {new Intl.DateTimeFormat("nl-NL", { dateStyle: "long", timeStyle: "medium", timeZone: "Europe/Amsterdam" }).format(new Date(sig.signed_at))} · IP{" "}
                {sig.ip_address ?? "onbekend"}
              </Text>
              <Text style={s.small}>Document-hash (SHA-256): {sig.content_hash}</Text>
            </View>
          ))}
        </View>
        <Footer />
      </Page>
    </Document>
  );
  return renderToBuffer(doc);
}
