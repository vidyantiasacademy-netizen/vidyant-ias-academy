import Script from "next/script";

import { CLARITY_PROJECT_ID, GA_MEASUREMENT_ID } from "@/lib/analytics/config";

/**
 * Loads GA4 and Microsoft Clarity on the public website.
 *
 * Mounted in the marketing layout only. The portals and the exam runner never
 * load a third-party script: a student's scores and a live paper are not
 * something to hand a session recorder.
 *
 * GA4 page views need no code here — `config` sends the first one and
 * enhanced measurement picks up client-side navigations from history changes.
 * Every other event goes through `track()` in `lib/analytics`, which queues on
 * the same `gtag` before this script has even arrived.
 */
export function AnalyticsScripts() {
  return (
    <>
      {GA_MEASUREMENT_ID ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`}
          </Script>
        </>
      ) : null}

      {CLARITY_PROJECT_ID ? (
        // Clarity masks form inputs by default, so phone numbers typed into
        // the lead forms never reach a recording.
        <Script id="clarity-init" strategy="lazyOnload">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_PROJECT_ID}");`}
        </Script>
      ) : null}
    </>
  );
}
