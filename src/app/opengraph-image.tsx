import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name}, ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "radial-gradient(circle at 15% 10%, rgba(201,151,107,.35), transparent 55%), radial-gradient(circle at 90% 80%, rgba(127,155,176,.28), transparent 50%), #0a0a0b",
          color: "#ece6dc",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: 8, textTransform: "uppercase", color: "#9a948b", fontFamily: "sans-serif" }}>
          {site.tagline}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 120, lineHeight: 1 }}>
            CAP Media <span style={{ fontStyle: "italic", color: "#d7a878", marginLeft: 28 }}>Studio</span>
          </div>
          <div style={{ fontSize: 40, marginTop: 24, color: "#cfc8bc" }}>Sterke beelden voor sportief Nederland</div>
        </div>
        <div style={{ display: "flex", fontSize: 22, color: "#9a948b", fontFamily: "sans-serif" }}>{`${site.owner} · Nederland`}</div>
      </div>
    ),
    size,
  );
}
