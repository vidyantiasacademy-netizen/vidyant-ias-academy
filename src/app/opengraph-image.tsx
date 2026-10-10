import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

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
        background: "#1d2470",
        padding: "72px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ width: "48px", height: "2px", background: "#f39a1e" }} />
        <div
          style={{
            display: "flex",
            color: "#f39a1e",
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
            color: "#f39a1e",
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
          <img src={mark} alt="" height={50} width={64} />
          <div style={{ display: "flex", fontSize: "40px", color: "#ffffff" }}>
            <span style={{ fontWeight: 700 }}>{BRAND.logotype.lead}</span>
            <span style={{ fontWeight: 300 }}>{BRAND.logotype.trail}</span>
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
