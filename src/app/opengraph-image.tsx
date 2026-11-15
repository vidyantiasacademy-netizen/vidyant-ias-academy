import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { LOGO_HEX, MARK_VIEWBOX } from "@/lib/brand/mark";
import { BRAND } from "@/lib/constants/site";

export const alt = `${BRAND.name} — UPSC preparation in ${BRAND.city}`;
export const size = { width: 1240, height: 630 };
export const contentType = "image/png";

async function markDataUri() {
  const file = await readFile(
    join(process.cwd(), "public/images/logo-mark-light.svg"),
  );
  return `data:image/svg+xml;base64,${file.toString("base64")}`;
}

/** Brand card used for link previews across the site. */
export default async function OpengraphImage() {
  const mark = await markDataUri();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: LOGO_HEX.navy,
        padding: "72px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ width: "48px", height: "2px", background: LOGO_HEX.saffron }} />
        <div
          style={{
            display: "flex",
            color: LOGO_HEX.saffron,
            fontSize: "24px",
            letterSpacing: "6px",
            textTransform: "uppercase",
          }}
        >
          UPSC Preparation • {BRAND.city}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: "62px",
            fontWeight: 700,
            color: "#ffffff",
          }}
        >
          Prepare with clarity.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "62px",
            fontWeight: 700,
            color: "#ffffff",
          }}
        >
          Practice with purpose.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "62px",
            fontWeight: 700,
            color: LOGO_HEX.saffron,
          }}
        >
          Improve with mentorship.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(255,255,255,0.15)",
          paddingTop: "28px",
        }}
      >
        {/* satori renders a plain <img>; next/image is not available here */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <img src={mark} alt="" height={64} width={Math.round((64 * MARK_VIEWBOX.width) / MARK_VIEWBOX.height)} />
          <div style={{ display: "flex", gap: "10px", fontSize: "44px", fontWeight: 800, letterSpacing: "-1px" }}>
            <span style={{ color: LOGO_HEX.cream }}>{BRAND.logotype.lead}</span>
            <span style={{ color: LOGO_HEX.saffron }}>{BRAND.logotype.trail}</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            color: "rgba(255,255,255,0.65)",
            fontSize: "24px",
          }}
        >
          Foundation • Prelims • Mains • Optional • Mentorship
        </div>
      </div>
    </div>,
    size,
  );
}
