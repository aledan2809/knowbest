// The text of a LinkedIn post as an article: blank lines start a paragraph, single line breaks are kept,
// and web addresses become links that open in a new tab. React escapes everything else.
const URL_RE = /(https?:\/\/[^\s)]+)/g;

function withLinks(line: string, key: string) {
  return line.split(URL_RE).map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={`${key}-${i}`}
        href={part}
        target="_blank"
        rel="nofollow noopener noreferrer"
        className="text-indigo-300 underline underline-offset-2 break-all hover:text-indigo-200"
      >
        {part}
      </a>
    ) : (
      part
    ),
  );
}

export function PostBody({ text }: { text: string }) {
  const paragraphs = text.trim().split(/\n\s*\n/);
  return (
    <div className="space-y-5 text-[17px] leading-relaxed text-slate-300">
      {paragraphs.map((p, i) => {
        const lines = p.split("\n");
        return (
          <p key={i}>
            {lines.map((line, j) => (
              <span key={j}>
                {withLinks(line, `${i}-${j}`)}
                {j < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
