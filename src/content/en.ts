import type { Copy } from "./types";

/**
 * English copy. Editorial translation, not mechanical: `andong` and `becak`
 * keep their Indonesian names (glossed once on first use, bare after) because
 * they are the product's differentiator, not vocabulary to flatten. Proper
 * nouns — TransJogja, KRL, KA Bandara YIA, Dishub DIY, KAI Commuter, MAPID
 * WebGIS Competition 2026 — stay untranslated in both locales.
 */
export const en: Copy = {
  meta: {
    title: "Pathrix — AI Agent WebGIS for Multimodal Navigation in Yogyakarta",
    description:
      "Pathrix is a WebGIS-based AI agent that builds multimodal routes across Yogyakarta — on foot, by andong/becak, TransJogja, KRL, and the KA Bandara YIA airport rail — from one plain-language request.",
    ogTitle: "Pathrix — Multimodal Navigation for Yogyakarta",
    ogDescription:
      "AI Agent for Multimodal Mobility Navigation in Yogyakarta. MAPID WebGIS Competition 2026.",
  },

  tagline: "AI Agent for Multimodal Mobility Navigation in Yogyakarta",

  navLabels: {
    beranda: "Home",
    "cara-kerja": "How It Works",
    fitur: "Features",
    kontak: "Contact",
  },

  masalah: {
    eyebrow: "The Problem",
    heading: "Just arrived in Yogyakarta, and the city map isn't in your head yet.",
    paraOne:
      "Thousands of students and tourists arrive in Yogyakarta every year without a private vehicle. TransJogja, the KRL commuter rail, and the KA Bandara YIA airport rail already exist, but the information is scattered across many different sources — and the moment you step off a bus stop or station platform, nothing explains the rest of the journey.",
    paraTwo: {
      before: "General navigation apps know the main roads, but they don't map ",
      emphasis: "andong (horse-drawn carriage) and becak (cycle rickshaw)",
      after:
        " — the first/last-mile connectors newcomers need most. Pathrix fills that gap, through a single AI Agent you can just talk to.",
    },
  },

  caraKerja: {
    eyebrow: "How It Works",
    heading: "From one sentence to a complete route, in three steps.",
    steps: [
      {
        index: "01",
        title: "Type what you need",
        body: 'One free-form sentence to the AI Agent — "route to the nearest mall, show me the boarding houses nearby" — no need to understand layer menus or GIS filters.',
        accent: "lift",
      },
      {
        index: "02",
        title: "The AI Agent gets to work",
        body: "The agent reads your intent, switches on the relevant layers, reads the map area you're currently viewing, then calculates the route through structured backend functions — not something the model made up.",
        accent: "lift",
      },
      {
        index: "03",
        title: "Route ready to go",
        body: "A staged itinerary appears — on foot, andong/becak, TransJogja/KRL — complete with easiest/fastest/cheapest options and the carbon you saved.",
        accent: "warm",
      },
    ],
  },

  fitur: {
    eyebrow: "Features",
    heading: "One screen to ask, see the route, and go.",
    ctaLabel: "Open the map",
    items: [
      {
        index: "01",
        title: "Multimodal map",
        body: "TransJogja, KRL rail lines, the KA Bandara YIA airport rail, down to andong and becak stands — all in one map you can switch on layer by layer.",
        accent: "lift",
      },
      {
        index: "02",
        title: "An AI Agent, not a chatbot",
        body: "Just type what you mean — the agent calls functions to switch on layers and adjust zoom, without you opening a manual menu.",
        accent: "lift",
      },
      {
        index: "03",
        title: "Ask in plain language",
        body: "“What food is around this area?” — the agent reads the map area you're currently viewing and answers directly as a highlight on the map.",
        accent: "lift",
      },
      {
        index: "04",
        title: "Multi-stop routes",
        body: "One request for several destinations at once, arranged into an itinerary with easiest, fastest, or cheapest route options.",
        accent: "lift",
      },
      {
        index: "05",
        title: "First/last-mile connectors",
        body: "Andong and becak stands mapped from field surveys, shown as the link from a bus stop or station to your final destination.",
        accent: "lift",
      },
      {
        index: "06",
        title: "Sustainability Tracker",
        body: "Every public-transport route shows the carbon footprint it saves over a private vehicle — calculated, not invented.",
        accent: "warm",
      },
    ],
  },

  productShot: {
    caption: "Pathrix WebGIS concept visual",
    note: "Concept visual — product not yet built",
    alt: "Pathrix WebGIS interface: a map of Yogyakarta's transit nodes with a layer panel, a plain-language query field, and an AI assessment panel for a single node.",
  },

  kontak: {
    eyebrow: "Contact",
    heading: "Help newcomers to Yogyakarta move more easily.",
    body: "Pathrix is being built together with the people who move this city — Dishub DIY, KAI Commuter, universities, and local small businesses. If that's you, or you have field data that could enrich the map, we'd like to hear from you.",
    emailLabel: "Email",
    fields: {
      nama: { label: "Name", placeholder: "Your name" },
      kontak: { label: "Email or institution", placeholder: "nama@instansi.go.id" },
      pesan: {
        label: "Message",
        placeholder: "Which area or node would you like to discuss?",
      },
    },
    submitLabel: "Send message",
    submitSentLabel: "Sent",
    notes: {
      sent: "Thanks — your message has been recorded.",
      error: {
        before: "Message failed to send. Try again, or send it directly to ",
        after: ".",
      },
      handoff: {
        before: "Opening your email app. If it doesn't open, send it manually to ",
        after: ".",
      },
    },
    mailto: {
      subjectPrefix: "Pathrix — message from ",
      nameLabel: "Name: ",
      contactLabel: "Email or institution: ",
    },
  },

  footer: {
    competition: "MAPID WebGIS Competition 2026",
    modelCredit:
      // Non-breaking hyphens and space keep "CC BY-NC-ND 4.0" whole: the
      // licence identifier is not a phrase to wrap mid-way.
      '3D model "Tugu Jogja" by Djonk, licensed CC BY\u2011NC\u2011ND\u00a04.0',
  },

  ui: {
    skipLink: "Skip to content",
    exploreMap: "Explore the Map",
    navAriaLabel: "Main navigation",
    markAriaLabel: "Pathrix, go to home",
    menuOpenLabel: "Open menu",
    menuCloseLabel: "Close menu",
    menuAriaLabel: "Navigation menu",
    menuCloseButton: "Close ×",
    footerNavAriaLabel: "Footer navigation",
    sending: "Sending…",
    dioramaFallbackAlt:
      "Illustration of a diorama island of Yogyakarta's transit hub: the Tugu monument at the centre, surrounded by roads and rail lines.",
    langSwitchAriaLabel: "Change language",
  },
};
