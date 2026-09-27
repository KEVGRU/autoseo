import { blogPostOgImage } from "@/components/site/blog/og";

const image = blogPostOgImage("de");

export const alt = image.alt;
export const size = image.size;
export const contentType = image.contentType;
export const generateStaticParams = image.generateStaticParams;
export default image.Image;
