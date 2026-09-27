/**
 * English paths of the company and resources pages. Every path also exists in German under /de + path, so the
 * sitemap, llms.txt and the language switch can list both languages from here.
 */
import { playbookPath } from "@/components/site/company/paths";
import playbooks from "./playbooks.en";

export const companyPagePaths = [
  "/enterprise",
  "/customers",
  "/case-studies",
  "/press",
  "/careers",
  "/webinars",
  "/exhibitions",
  "/partner-program",
  "/affiliate-program",
  "/affiliate-terms",
] as const;

/** Detail pages of the playbooks (/case-studies/[slug]). */
export const playbookPaths: string[] = playbooks.map((p) => playbookPath(p.slug));

export const allCompanyPaths: string[] = [...companyPagePaths, ...playbookPaths];
