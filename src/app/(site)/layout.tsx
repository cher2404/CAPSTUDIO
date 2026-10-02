import { getTexts } from "@/lib/content";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { ConsentAnalytics } from "@/components/site/analytics";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const t = await getTexts();
  return (
    <>
      <SiteHeader availability={t["site.availability"]} />
      <main id="main">{children}</main>
      <SiteFooter availability={t["site.availability"]} />
      <ConsentAnalytics />
    </>
  );
}
