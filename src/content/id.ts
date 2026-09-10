import type { Copy } from "./types";

/** Indonesian copy — the default locale, verbatim from the PRD rewrite. */
export const id: Copy = {
  meta: {
    title: "Pathrix — AI Agent WebGIS untuk Navigasi Multimoda Yogyakarta",
    description:
      "Pathrix adalah AI agent berbasis WebGIS yang menyusun rute multimoda di Yogyakarta — jalan kaki, andong/becak, TransJogja, KRL, dan KA Bandara YIA — dari satu kalimat perintah bebas.",
    ogTitle: "Pathrix — Navigasi Multimoda Yogyakarta",
    ogDescription:
      "AI Agent for Multimodal Mobility Navigation in Yogyakarta. MAPID WebGIS Competition 2026.",
  },

  tagline: "AI Agent for Multimodal Mobility Navigation in Yogyakarta",

  navLabels: {
    beranda: "Beranda",
    "cara-kerja": "Cara Kerja",
    fitur: "Fitur",
    kontak: "Kontak",
  },

  masalah: {
    eyebrow: "Masalahnya",
    heading: "Baru sampai di Yogyakarta, dan peta kota belum ada di kepala.",
    paraOne:
      "Ribuan mahasiswa dan wisatawan datang ke Yogyakarta tiap tahun tanpa kendaraan pribadi. TransJogja, KRL, dan KA Bandara YIA sudah ada, tapi infonya tersebar di banyak sumber berbeda — dan begitu turun dari halte atau stasiun, tidak ada yang menjelaskan sisa perjalanan itu.",
    paraTwo: {
      before: "Aplikasi navigasi umum tahu jalan raya, tapi tidak memetakan ",
      emphasis: "andong dan becak",
      after:
        " — konektor first/last mile yang justru paling dibutuhkan pendatang. Pathrix mengisi celah itu, lewat satu AI Agent yang bisa diajak bicara.",
    },
  },

  caraKerja: {
    eyebrow: "Cara Kerja",
    heading: "Dari satu kalimat, jadi rute lengkap, dalam tiga langkah.",
    steps: [
      {
        index: "01",
        title: "Ketik maumu",
        body: 'Satu kalimat bebas ke AI Agent — "rute ke mall terdekat, tampilkan kos-kosan di sekitarnya" — tanpa perlu paham menu layer atau filter GIS.',
        accent: "lift",
      },
      {
        index: "02",
        title: "AI Agent bergerak",
        body: "Agent membaca maksudmu, menyalakan layer yang relevan, membaca area peta yang sedang kamu lihat, lalu menghitung rute lewat fungsi backend terstruktur — bukan dikarang model.",
        accent: "lift",
      },
      {
        index: "03",
        title: "Rute siap dijalani",
        body: "Itinerary bertahap muncul — jalan kaki, andong/becak, TransJogja/KRL — lengkap opsi termudah/tercepat/termurah dan estimasi karbon yang kamu hemat.",
        accent: "warm",
      },
    ],
  },

  fitur: {
    eyebrow: "Fitur",
    heading: "Satu layar untuk bertanya, melihat rute, dan berangkat.",
    ctaLabel: "Buka peta",
    items: [
      {
        index: "01",
        title: "Peta multimoda",
        body: "TransJogja, jalur KRL, KA Bandara YIA, sampai pangkalan andong dan becak dalam satu peta yang bisa dinyalakan per lapisan.",
        accent: "lift",
      },
      {
        index: "02",
        title: "AI Agent, bukan chatbot",
        body: "Cukup ketik maksudmu — agent yang memanggil fungsi untuk menyalakan layer dan mengatur zoom, tanpa kamu buka menu manual.",
        accent: "lift",
      },
      {
        index: "03",
        title: "Tanya bahasa sehari-hari",
        body: "“Ada kuliner apa di area ini?” — agent membaca area peta yang sedang kamu lihat dan menjawab langsung sebagai sorotan di peta.",
        accent: "lift",
      },
      {
        index: "04",
        title: "Rute multi-tujuan",
        body: "Satu perintah untuk beberapa tujuan sekaligus, disusun jadi itinerary dengan opsi rute termudah, tercepat, atau termurah.",
        accent: "lift",
      },
      {
        index: "05",
        title: "Konektor first/last mile",
        body: "Pangkalan andong dan becak hasil survei lapangan, dipetakan sebagai penghubung dari halte atau stasiun ke tujuan akhir.",
        accent: "lift",
      },
      {
        index: "06",
        title: "Sustainability Tracker",
        body: "Tiap rute transportasi umum menunjukkan penghematan jejak karbon dibanding kendaraan pribadi — dihitung, bukan dikarang.",
        accent: "warm",
      },
    ],
  },

  productShot: {
    caption: "Konsep visual WebGIS Pathrix",
    note: "Konsep visual — produk belum dibangun",
    alt: "Antarmuka WebGIS Pathrix: peta simpul transit Yogyakarta dengan panel lapisan, kolom tanya bahasa sehari-hari, dan panel penilaian AI untuk satu simpul.",
  },

  kontak: {
    eyebrow: "Kontak",
    heading: "Mari bantu pendatang Yogyakarta bergerak lebih mudah.",
    body: "Pathrix dibangun bersama pihak yang menggerakkan mobilitas kota — Dishub DIY, KAI Commuter, kampus, dan pelaku UMKM lokal. Kalau kamu salah satunya, atau punya data lapangan yang bisa memperkaya peta, kami ingin dengar.",
    emailLabel: "Surel",
    fields: {
      nama: { label: "Nama", placeholder: "Nama kamu" },
      kontak: { label: "Surel atau instansi", placeholder: "nama@instansi.go.id" },
      pesan: {
        label: "Pesan",
        placeholder: "Kawasan atau simpul mana yang ingin kamu bahas?",
      },
    },
    submitLabel: "Kirim pesan",
    submitSentLabel: "Terkirim",
    notes: {
      sent: "Terima kasih — pesanmu tercatat.",
      error: {
        before: "Pesan gagal terkirim. Coba lagi, atau kirim langsung ke ",
        after: ".",
      },
      handoff: {
        before: "Membuka aplikasi surel kamu. Kalau tidak terbuka, kirim manual ke ",
        after: ".",
      },
    },
    mailto: {
      subjectPrefix: "Pathrix — pesan dari ",
      nameLabel: "Nama: ",
      contactLabel: "Surel atau instansi: ",
    },
  },

  footer: {
    competition: "MAPID WebGIS Competition 2026",
    modelCredit:
      // Non-breaking hyphens and space keep "CC BY-NC-ND 4.0" whole: the
      // licence identifier is not a phrase to wrap mid-way.
      'Model 3D "Tugu Jogja" oleh Djonk, lisensi CC BY\u2011NC\u2011ND\u00a04.0',
  },

  ui: {
    skipLink: "Lewati ke konten",
    exploreMap: "Jelajahi Peta",
    navAriaLabel: "Navigasi utama",
    markAriaLabel: "Pathrix, ke beranda",
    menuOpenLabel: "Buka menu",
    menuCloseLabel: "Tutup menu",
    menuAriaLabel: "Menu navigasi",
    menuCloseButton: "Tutup ×",
    footerNavAriaLabel: "Navigasi footer",
    sending: "Mengirim…",
    dioramaFallbackAlt:
      "Ilustrasi diorama pulau simpul transit Yogyakarta: monumen Tugu di pusat, dikelilingi jalur jalan dan jalur kereta.",
    langSwitchAriaLabel: "Ganti bahasa",
  },
};
