import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Minimal inline markup for content strings: **bold**, *italic*, `code` and [label](href). No HTML is ever
 * interpreted, so content can't inject markup. Internal links (starting with "/") use next/link; external links
 * open in a new tab. Nesting is supported inside bold/italic/link labels (not inside code).
 */
const TOKEN = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)\s]+)\))/g;

export function Inline({ text }: { text: string }): ReactNode {
  return <>{renderInline(text, "i")}</>;
}

export function renderInline(text: string, keyPrefix = "i"): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let n = 0;
  for (const m of text.matchAll(TOKEN)) {
    const index = m.index ?? 0;
    if (index > last) out.push(text.slice(last, index));
    const key = `${keyPrefix}-${n++}`;
    if (m[2] !== undefined) out.push(<strong key={key}>{renderInline(m[2], key)}</strong>);
    else if (m[4] !== undefined) out.push(<em key={key}>{renderInline(m[4], key)}</em>);
    else if (m[6] !== undefined) out.push(<code key={key}>{m[6]}</code>);
    else if (m[8] !== undefined && m[9] !== undefined) out.push(<InlineLink key={key} href={m[9]} label={m[8]} k={key} />);
    last = index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function InlineLink({ href, label, k }: { href: string; label: string; k: string }) {
  const children = renderInline(label, k);
  if (href.startsWith("/") || href.startsWith("#")) return <Link href={href}>{children}</Link>;
  if (/^(https?:|mailto:)/.test(href)) {
    return (
      <a href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener">
        {children}
      </a>
    );
  }
  // Unknown scheme (e.g. javascript:): render the label only.
  return <>{children}</>;
}

/** Plain text of an inline-markup string (for metadata, JSON-LD and llms.txt). */
export function plainText(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, "$1");
}

/** Markdown of an inline-markup string with absolute links (for .md exports). */
export function markdownText(text: string, absolute: (path: string) => string): string {
  return text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, href: string) =>
    `[${label}](${href.startsWith("/") ? absolute(href) : href})`,
  );
}
