import { integrationRoute } from "@/components/marketing/landing/routes";

const route = integrationRoute("en");

export const dynamicParams = false;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
