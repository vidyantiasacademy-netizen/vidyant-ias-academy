import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";

import { getCurrentStudent, getCurrentUserProfile, requireAuth } from "@/lib/auth/server";
import { BRAND } from "@/lib/constants/site";
import { AppError, ERROR_CODES, toAppError } from "@/lib/errors";
import { courseService } from "@/services/courses/course.service";
import { storageService } from "@/services/storage/storage.service";

/**
 * The I Card as a downloadable PNG.
 *
 * Rendered server-side with `next/og` rather than screenshotted in the browser:
 * a canvas library would ship ~200KB to every student for a button most press
 * once, and it cannot read the photo, which is behind a signed URL.
 *
 * Sized at 1012 × 638 — a CR80 card (85.6 × 54 mm) at 300dpi, so it prints at
 * the real thing's size instead of pixelating on an A4 sheet.
 *
 * Satori supports flexbox and inline styles only: no grid, no Tailwind classes,
 * and every colour is a literal because the design tokens live in CSS the
 * renderer never loads.
 */

const WIDTH = 1012;
const HEIGHT = 638;

// The brand palette, duplicated as hex because Satori resolves no CSS variables.
const INK_INDIGO = "#1d2470";
const INDIGO_DEEP = "#141a50";
const KESAR = "#f39a1e";
const WHITE_80 = "rgba(255,255,255,0.8)";
const WHITE_25 = "rgba(255,255,255,0.25)";

interface CardData {
  fullName: string;
  rollNumber: string | null;
  programme: string;
  targetExamYear: string | null;
  phone: string;
  /** Signed URL, or null when there is no photo on record. */
  photo: string | null;
}

/** Everything the card prints. Throws `AppError` when the caller may not have it. */
async function loadCard(): Promise<CardData> {
  await requireAuth();

  const [student, profile, enrolled] = await Promise.all([
    getCurrentStudent(),
    getCurrentUserProfile(),
    courseService.getEnrolledCourses(),
  ]);

  if (!student) {
    throw new AppError(ERROR_CODES.NOT_FOUND, {
      message: "Your student record is not ready yet.",
    });
  }

  // A photo that cannot be signed is not worth failing the download over.
  const photo = profile?.photoPath
    ? await storageService.getSignedUrl(profile.photoPath, 5).catch(() => null)
    : null;

  return {
    fullName: student.fullName,
    rollNumber: student.rollNumber,
    programme:
      enrolled.length > 0 ? enrolled.map(({ course }) => course.title).join(" · ") : "—",
    targetExamYear: student.targetExamYear,
    phone: student.phone,
    photo,
  };
}

/** The artwork. Flexbox and inline styles only — Satori supports nothing else. */
function CardArt({ card }: { card: CardData }) {
  return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: INK_INDIGO,
          color: "#ffffff",
          fontFamily: "sans-serif",
          padding: 56,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 40, fontWeight: 700 }}>{BRAND.name}</span>
          <span
            style={{
              fontSize: 22,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: WHITE_80,
            }}
          >
            Student Identity
          </span>
        </div>

        <div
          style={{
            display: "flex",
            height: 2,
            backgroundColor: KESAR,
            marginTop: 24,
          }}
        />

        <div style={{ display: "flex", marginTop: 40 }}>
          {card.photo ? (
            <img
              src={card.photo}
              alt=""
              width={200}
              height={200}
              style={{
                width: 200,
                height: 200,
                objectFit: "cover",
                borderRadius: 0,
                border: `2px solid ${WHITE_25}`,
              }}
            />
          ) : (
            <div
              style={{
                width: 200,
                height: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 0,
                backgroundColor: INDIGO_DEEP,
                border: `2px solid ${WHITE_25}`,
                fontSize: 84,
                fontWeight: 700,
                color: WHITE_80,
              }}
            >
              {card.fullName.trim().charAt(0).toUpperCase() || "?"}
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: 36,
              flex: 1,
            }}
          >
            <span style={{ fontSize: 46, fontWeight: 700 }}>{card.fullName}</span>

            <span style={{ fontSize: 22, color: WHITE_80, marginTop: 14 }}>
              Roll number
            </span>
            <span
              style={{
                fontSize: 38,
                fontWeight: 700,
                color: KESAR,
                letterSpacing: 1,
              }}
            >
              {card.rollNumber ?? "Pending allotment"}
            </span>

            <span style={{ fontSize: 22, color: WHITE_80, marginTop: 22 }}>
              Programme
            </span>
            <span style={{ fontSize: 26, fontWeight: 600 }}>{card.programme}</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "auto",
            paddingTop: 28,
            borderTop: `1px solid ${WHITE_25}`,
            justifyContent: "space-between",
            fontSize: 22,
          }}
        >
          <span style={{ display: "flex", color: WHITE_80 }}>
            Target year{" "}
            <span style={{ color: "#ffffff", fontWeight: 600, marginLeft: 8 }}>
              {card.targetExamYear ?? "—"}
            </span>
          </span>

          <span style={{ display: "flex", color: WHITE_80 }}>
            Mobile{" "}
            <span style={{ color: "#ffffff", fontWeight: 600, marginLeft: 8 }}>
              {card.phone || "—"}
            </span>
          </span>
        </div>
      </div>
  );
}

export async function GET() {
  let card: CardData;

  try {
    card = await loadCard();
  } catch (error) {
    const appError = toAppError(error);
    return NextResponse.json(appError.toJSON(), { status: appError.status });
  }

  return new ImageResponse(<CardArt card={card} />, {
    width: WIDTH,
    height: HEIGHT,
    headers: {
      "Content-Disposition": `attachment; filename="vidyantias-icard-${
        card.rollNumber ?? "student"
      }.png"`,
      // One student's card must never be served to the next visitor.
      "Cache-Control": "no-store, private",
    },
  });
}
