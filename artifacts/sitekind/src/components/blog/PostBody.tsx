import React from "react";

// Minimal renderer for the post content format: ## / ### headings,
// "- " bullet lists, and paragraphs. **bold** inline is supported.
function inline(text: string, keyBase: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return <strong key={`${keyBase}-${i}`}>{p.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={`${keyBase}-${i}`}>{p}</React.Fragment>;
  });
}

export function PostBody({ content }: { content: string }) {
  const blocks = content.trim().split(/\n\n+/);
  const out: React.ReactNode[] = [];

  blocks.forEach((block, i) => {
    const lines = block.split("\n");
    if (lines.every((l) => l.startsWith("- "))) {
      out.push(
        <ul key={i}>
          {lines.map((l, j) => (
            <li key={j}>{inline(l.slice(2), `${i}-${j}`)}</li>
          ))}
        </ul>,
      );
      return;
    }
    const line = block.trim();
    if (line.startsWith("### ")) {
      out.push(<h3 key={i}>{inline(line.slice(4), `${i}`)}</h3>);
    } else if (line.startsWith("## ")) {
      out.push(<h2 key={i}>{inline(line.slice(3), `${i}`)}</h2>);
    } else {
      out.push(<p key={i}>{inline(line, `${i}`)}</p>);
    }
  });

  return <div className="prose-site">{out}</div>;
}
