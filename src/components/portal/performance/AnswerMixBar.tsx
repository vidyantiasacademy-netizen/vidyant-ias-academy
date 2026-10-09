/**
 * Every question the student has faced, split by what happened to it.
 *
 * Correct and wrong are indigo and chilli — a pair that stays apart under every
 * colour-vision deficiency, where the obvious green/red does not. Unattempted is
 * deliberately neutral grey: it is the absence of an answer, not a third result.
 * Each segment is labelled in the legend with its count, so nothing rests on
 * colour alone.
 */
export function AnswerMixBar({
  correct,
  wrong,
  unattempted,
}: {
  correct: number;
  wrong: number;
  unattempted: number;
}) {
  const total = correct + wrong + unattempted;
  if (total === 0) return null;

  const segments = [
    { label: "Correct", value: correct, swatch: "bg-indigo-700" },
    { label: "Wrong", value: wrong, swatch: "bg-chilli" },
    { label: "Unattempted", value: unattempted, swatch: "bg-line-strong" },
  ];

  const share = (value: number) => Math.round((value / total) * 100);

  return (
    <div>
      <div className="flex h-4 gap-0.5" role="img" aria-label={segments.map((s) => `${s.label} ${s.value}`).join(", ")}>
        {segments
          .filter((segment) => segment.value > 0)
          .map((segment) => (
            <div
              key={segment.label}
              title={`${segment.label}: ${segment.value} (${share(segment.value)}%)`}
              className={segment.swatch}
              style={{ flexGrow: segment.value }}
            />
          ))}
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-3">
        {segments.map((segment) => (
          <div key={segment.label}>
            <dt className="flex items-center gap-2 text-small text-ink-secondary">
              <span aria-hidden className={`size-2.5 ${segment.swatch}`} />
              {segment.label}
            </dt>
            <dd className="mt-1 text-h4 font-semibold tabular-nums">
              {segment.value}
              <span className="ml-1 text-small font-normal text-ink-secondary">
                {share(segment.value)}%
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
