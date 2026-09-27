import { solutionRoute } from "@/components/marketing/landing/routes";

const route = solutionRoute("en");

export const dynamicParams = false;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
