import { blogPostRoute } from "@/components/site/blog/routes";

const route = blogPostRoute("en");

export const dynamicParams = false;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
