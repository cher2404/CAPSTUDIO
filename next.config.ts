import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : "*.supabase.co";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 85],
    remotePatterns: [
      { protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
  // capmediastudio.com verwijst permanent door naar https://capmediastudio.nl.
  // De keuze tussen www en zonder www maak je in Vercel (Settings → Domains), niet hier:
  // anders sturen Vercel en de site elkaar in een rondje door.
  async redirects() {
    return ["capmediastudio.com", "www.capmediastudio.com"].map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: "https://capmediastudio.nl/:path*",
      permanent: true,
    }));
  },
  // Klikbare ontwerpconcepten staan als losse HTML-pagina in public/werk.
  async rewrites() {
    return [
      { source: "/werk/tennisapp", destination: "/werk/tennisapp/index.html" },
      { source: "/werk/rally", destination: "/werk/rally/index.html" },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
