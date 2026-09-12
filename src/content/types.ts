import type { SectionId } from "./site";

export type Locale = "id" | "en";

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALES: readonly Locale[] = ["id", "en"];

type Accent = "lift" | "warm";

type Step = {
  index: string;
  title: string;
  body: string;
  accent: Accent;
};

type FiturItem = {
  index: string;
  title: string;
  body: string;
  accent: Accent;
};

type Stat = {
  value: string;
  label: string;
  source: string;
};

type AudiensGroup = {
  label: string;
  body: string;
  accent: Accent;
};

/**
 * All per-locale page copy. Written out explicitly rather than derived with
 * `typeof` from the Indonesian copy — deriving from an `as const` object
 * would force English to repeat the Indonesian strings' literal types.
 * Tuple lengths on `steps`/`items` and `Record<SectionId, string>` on
 * `navLabels` make a locale with the wrong number of cards or nav entries a
 * type error instead of a review miss.
 */
export type Copy = {
  meta: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
  };
  tagline: string;
  navLabels: Record<SectionId, string>;
  masalah: {
    eyebrow: string;
    heading: string;
    paraOne: string;
    paraTwo: {
      before: string;
      emphasis: string;
      after: string;
    };
    /** Two cited figures from the proposal's Latar Belakang, not invented numbers. */
    stats: [Stat, Stat];
  };
  caraKerja: {
    eyebrow: string;
    heading: string;
    steps: [Step, Step, Step];
    /** One line naming the two spatial methods behind step 02 — not a fourth step. */
    methodNote: string;
  };
  audiens: {
    eyebrow: string;
    heading: string;
    groups: [AudiensGroup, AudiensGroup, AudiensGroup, AudiensGroup, AudiensGroup];
  };
  fitur: {
    eyebrow: string;
    heading: string;
    ctaLabel: string;
    items: [FiturItem, FiturItem, FiturItem, FiturItem, FiturItem, FiturItem];
    /**
     * Two static UI field labels shown on the bento grid's cell-1 screenshot
     * overlay chip (e.g. "Waktu tempuh" / "Moda transportasi") — descriptive
     * field names, not live-looking values, so they carry no numeric claim.
     */
    shotOverlay: { labelOne: string; labelTwo: string };
  };
  productShot: {
    caption: string;
    note: string;
    alt: string;
  };
  kontak: {
    eyebrow: string;
    heading: string;
    body: string;
    emailLabel: string;
    fields: {
      nama: { label: string; placeholder: string };
      kontak: { label: string; placeholder: string };
      pesan: { label: string; placeholder: string };
    };
    submitLabel: string;
    submitSentLabel: string;
    notes: {
      sent: string;
      error: { before: string; after: string };
      handoff: { before: string; after: string };
    };
    /** Composes the mailto: fallback handed to the visitor's own mail client. */
    mailto: {
      subjectPrefix: string;
      nameLabel: string;
      contactLabel: string;
    };
  };
  penutup: {
    eyebrow: string;
    heading: string;
    body: string;
    /** Links to the Kontak section. */
    ctaLabel: string;
  };
  footer: {
    /** "MAPS THAT THINK!" — the competition's own tagline, same literal string both locales. */
    giantText: string;
    /** "Tim Pathrix" (id) / "Pathrix Team" (en). */
    creditLabel: string;
    /** "Muhammad Zakiyyuddin Abdul Adhiim" — proper noun, same both locales. */
    creditName: string;
    /** "Universitas Gadjah Mada" — proper noun, same both locales. */
    university: string;
    /** "Hubungi Kami" (id) / "Contact Us" (en); component appends ": halo@pathrix.id" itself. */
    ctaLabel: string;
    /** Attribution required by the Tugu model's CC BY-NC-ND licence. */
    modelCredit: string;
  };
  ui: {
    skipLink: string;
    exploreMap: string;
    navAriaLabel: string;
    markAriaLabel: string;
    menuOpenLabel: string;
    menuCloseLabel: string;
    menuAriaLabel: string;
    menuCloseButton: string;
    footerNavAriaLabel: string;
    sending: string;
    dioramaFallbackAlt: string;
    langSwitchAriaLabel: string;
  };
};
