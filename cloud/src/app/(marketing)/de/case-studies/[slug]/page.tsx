import { notFound } from "next/navigation";
import { playbookPath } from "@/components/site/company/paths";
import { PlaybookView } from "@/components/site/company/playbook-view";
import { siteMetadata } from "@/components/site/metadata";
import playbooks from "@/content/company/playbooks.de";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return playbooks.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const playbook = playbooks.find((p) => p.slug === slug);
  if (!playbook) return {};
  return siteMetadata({ ...playbook.meta, enPath: playbookPath(slug), locale: "de", type: "article" });
}

export default async function GermanPlaybookPage({ params }: Props) {
  const { slug } = await params;
  const playbook = playbooks.find((p) => p.slug === slug);
  if (!playbook) notFound();
  return <PlaybookView playbook={playbook} others={playbooks} locale="de" />;
}
