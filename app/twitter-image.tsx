import {
  DEFAULT_OG_ALT,
  DEFAULT_OG_CONTENT,
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/components/seo/OgImage";

export const alt = DEFAULT_OG_ALT;
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

/** Default X/Twitter large-card image, identical to the Open Graph image. */
export default function Image() {
  return renderOgImage(DEFAULT_OG_CONTENT);
}
