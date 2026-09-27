import { rssFeed } from "@/components/site/blog/rss";

export const dynamic = "force-static";

export function GET() {
  return rssFeed("en");
}
