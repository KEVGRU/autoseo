import { blogAuthorRoute } from "@/components/site/blog/routes";

const route = blogAuthorRoute("de");

export const dynamicParams = false;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
