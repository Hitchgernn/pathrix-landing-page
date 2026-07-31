import styles from "./ImageSlot.module.css";

type Props = {
  /** Base path without extension, e.g. "/img/webgis". AVIF/WebP/fallback are derived. */
  src: string | null;
  alt: string;
  /** Shown when `src` is null. */
  caption: string;
  width: number;
  height: number;
  loading?: "lazy" | "eager";
};

/**
 * Real image when the asset exists, flat captioned block when it does not.
 * width/height are always passed so layout is reserved either way.
 */
export function ImageSlot({ src, alt, caption, width, height, loading = "lazy" }: Props) {
  if (!src) {
    return (
      <div className={`${styles.slot} ${styles.placeholder}`} role="img" aria-label={caption}>
        <span className={styles.caption}>{caption}</span>
      </div>
    );
  }

  return (
    <picture className={styles.slot}>
      {/*
        WebP + JPEG only. AVIF is not emitted because the available encoder
        cannot produce it (see scripts/encode-images.sh); listing a <source> for
        a file that fails to decode costs a wasted download. Add it back here
        together with the encoder, not before.
      */}
      <source srcSet={`${src}.webp`} type="image/webp" />
      <img
        className={`${styles.slot} ${styles.image}`}
        src={`${src}.jpg`}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        // Above-the-fold images should not be deprioritised; below-the-fold ones
        // should stay out of the way of the hero.
        fetchPriority={loading === "eager" ? "high" : "low"}
      />
    </picture>
  );
}
