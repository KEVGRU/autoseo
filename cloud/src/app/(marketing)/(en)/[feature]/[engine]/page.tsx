import { platformRoute } from "@/components/marketing/landing/routes";

const route = platformRoute("en");

export const dynamicParams = false;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
