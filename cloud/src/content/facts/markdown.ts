/**
 * Markdown export of the fact sheet (served as /ai-agent-instructions.md and /de/ai-agent-instructions.md). Built
 * from the same data as the HTML page; site-relative links become absolute, in-page anchors point to the HTML page.
 */
import { localizePath } from "@/components/site/metadata";
import type { Block, Locale } from "@/components/site/types";
import { absoluteUrl } from "@/lib/site";
import type { FactSheet } from "./types";

function linkify(text: string, pageUrl: string): string {
  return text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, href: string) => {
    if (href.startsWith("#")) return `[${label}](${pageUrl}${href})`;
    if (href.startsWith("/")) return `[${label}](${absoluteUrl(href)})`;
    return `[${label}](${href})`;
  });
}

const cell = (text: string, pageUrl: string) => linkify(text, pageUrl).replace(/\|/g, "\\|").replace(/\n+/g, " ");

export function blocksToMarkdown(blocks: Block[], pageUrl: string): string {
  const out: string[] = [];
  for (const block of blocks) {
    switch (block.type) {
      case "p":
        out.push(linkify(block.text, pageUrl));
        break;
      case "h2":
        out.push(`## ${block.text}`);
        break;
      case "h3":
        out.push(`### ${block.text}`);
        break;
      case "ul":
        out.push(block.items.map((item) => `- ${linkify(item, pageUrl)}`).join("\n"));
        break;
      case "ol":
        out.push(block.items.map((item, i) => `${i + 1}. ${linkify(item, pageUrl)}`).join("\n"));
        break;
      case "table": {
        const head = `| ${block.head.map((h) => cell(h, pageUrl) || " ").join(" | ")} |`;
        const rule = `|${block.head.map(() => "---").join("|")}|`;
        const rows = block.rows.map((row) => `| ${row.map((c) => cell(c, pageUrl)).join(" | ")} |`);
        out.push([head, rule, ...rows].join("\n"));
        break;
      }
      case "callout":
        out.push(`> ${block.title ? `**${block.title}** ` : ""}${linkify(block.text, pageUrl)}`);
        break;
      case "code":
        out.push(`\`\`\`${block.lang ?? ""}\n${block.code}\n\`\`\``);
        break;
      case "quote":
        out.push(`> ${linkify(block.text, pageUrl)}${block.cite ? `\n>\n> — ${block.cite}` : ""}`);
        break;
      case "image":
        out.push(`![${block.alt}](${block.src.startsWith("/") ? absoluteUrl(block.src) : block.src})`);
        break;
    }
  }
  return out.join("\n\n");
}

export function factSheetMarkdown(sheet: FactSheet, locale: Locale): string {
  const pageUrl = absoluteUrl(localizePath(sheet.path, locale));
  const entityUrl = absoluteUrl(localizePath("/entity-connections", locale));
  const parts: string[] = [
    `# ${sheet.hero.title}`,
    ...sheet.intro.map((p) => linkify(p, pageUrl)),
    `**${sheet.labels.updated}:** ${sheet.updated} · **HTML:** ${pageUrl} · **${sheet.labels.entityMap}:** ${entityUrl}`,
    "---",
  ];
  for (const section of sheet.sections) {
    parts.push(`## ${section.title}`, blocksToMarkdown(section.blocks, pageUrl));
  }
  parts.push(`## ${sheet.faqTitle}`);
  for (const f of sheet.faq) parts.push(`**${f.q}**`, linkify(f.a, pageUrl));
  parts.push("---", `*${sheet.footer}*`);
  return `${parts.join("\n\n")}\n`;
}
