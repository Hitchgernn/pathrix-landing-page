import type { SectionId } from "./site";

export type Locale = "id" | "en";

export const DEFAULT_LOCALE: Locale = "id";
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
  };
  caraKerja: {
    eyebrow: string;
    heading: string;
    steps: [Step, Step, Step];
  };
  fitur: {
    eyebrow: string;
    heading: string;
    ctaLabel: string;
    items: [FiturItem, FiturItem, FiturItem, FiturItem, FiturItem, FiturItem];
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
  footer: {
    competition: string;
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
