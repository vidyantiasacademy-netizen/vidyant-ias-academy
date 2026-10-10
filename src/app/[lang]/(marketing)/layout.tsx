import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { organizationSchema, websiteSchema } from "@/lib/seo/structured-data";

/** The public marketing website: header, footer, conversion CTAs and site-wide JSON-LD. */
export default function MarketingLayout({ children }: LayoutProps<"/[lang]">) {
  return (
    <>
      <SiteChrome>{children}</SiteChrome>
      <script
        type="application/ld+json"
        // Static, first-party JSON-LD describing the institute.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationSchema(), websiteSchema()]),
        }}
      />
      <AnalyticsScripts />
    </>
  );
}
