import createImageUrlBuilder, { type SanityImageSource } from "@sanity/image-url";

import { SANITY_DATASET, SANITY_PROJECT_ID } from "./env";

/**
 * Sanity image URLs.
 *
 * Always go through this builder rather than using `asset.url` directly: the
 * raw asset URL is the original upload, so a 4 MB editorial photograph would be
 * served untouched to a phone. The builder appends the transform parameters
 * Sanity's CDN needs to resize, crop and convert to WebP.
 */

const builder = createImageUrlBuilder({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
});

export interface ImageOptions {
  width?: number;
  height?: number;
  /** Defaults to 80 — visually lossless for photographs at these sizes. */
  quality?: number;
}

export function imageUrl(
  source: SanityImageSource,
  { width, height, quality = 80 }: ImageOptions = {},
): string {
  let image = builder.image(source).auto("format").quality(quality);

  if (width) image = image.width(width);
  if (height) image = image.height(height);

  // Respects the editor's chosen crop/hotspot instead of centre-cropping.
  if (width && height) image = image.fit("crop");

  return image.url();
}

/** `srcSet` widths for a responsive `<Image>`. Matches the site's breakpoints. */
export function imageSrcSet(source: SanityImageSource): string {
  return [400, 640, 828, 1080, 1440, 1920]
    .map((width) => `${imageUrl(source, { width })} ${width}w`)
    .join(", ");
}

/**
 * The low-quality placeholder Sanity generates with every upload, for
 * `next/image`'s `blurDataURL`. Present only when the image was queried with
 * `asset->metadata{lqip}` — see `queries.ts`.
 */
export function blurDataUrl(lqip: string | null | undefined): string | undefined {
  return lqip ?? undefined;
}

/**
 * URL for an image that came back from one of the projections in `queries.ts`.
 *
 * Those projections flatten the asset to `{ url, ref, ... }`, so the builder
 * cannot be handed the document field directly. The reference is preferred —
 * it is what lets the CDN resize — and `url` (the untransformed original) is
 * only the fallback for an asset queried before `ref` was projected.
 */
export function projectedImageUrl(
  image: { url: string; ref: string | null } | null | undefined,
  options: ImageOptions = {},
): string {
  if (!image) return "";

  if (image.ref) {
    return imageUrl(
      { _type: "image", asset: { _type: "reference", _ref: image.ref } },
      options,
    );
  }

  return image.url;
}
