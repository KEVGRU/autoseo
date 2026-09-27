import { blogIndexRoute } from "@/components/site/blog/routes";

const route = blogIndexRoute("en");

export const metadata = route.metadata;
export default route.Page;
