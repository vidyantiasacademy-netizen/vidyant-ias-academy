import { layoutStatement } from "@/lib/exam/statement-layout";

/**
 * A question statement as students and faculty read it.
 *
 * Plain lines keep their own breaks (a four-statement "Which of the above are
 * correct" question is unreadable as one paragraph). Lines whose columns are
 * separated by a tab, `|` or a run of spaces — "List 1 | List 2" match
 * questions — are laid out as a table so the columns stay apart.
 */
export function QuestionStatement({
  statement,
  className = "text-body",
}: {
  statement: string;
  className?: string;
}) {
  const blocks = layoutStatement(statement);

  return (
    <div className={`space-y-3 ${className}`}>
      {blocks.map((block, index) =>
        block.kind === "text" ? (
          <p key={index} className="whitespace-pre-line">
            {block.text}
          </p>
        ) : (
          <div key={index} className="overflow-x-auto">
            <table className="w-full border-collapse text-left align-top">
              {block.header.length > 0 ? (
                <thead>
                  {block.header.map((row, r) => (
                    <tr key={r} className={r === block.header.length - 1 ? "border-b border-line" : undefined}>
                      {row.map((cell, c) => (
                        <th key={c} scope="col" className="py-1.5 pr-6 align-top font-semibold">
                          {cell}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
              ) : null}
              <tbody>
                {block.body.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td key={c} className="py-1.5 pr-6 align-top">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ),
      )}
    </div>
  );
}
