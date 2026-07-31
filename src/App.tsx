import { useEffect } from "react";
import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { Masalah } from "./components/Masalah";
import { CaraKerja } from "./components/CaraKerja";
import { Fitur } from "./components/Fitur";
import { Kontak } from "./components/Kontak";
import { Footer } from "./components/Footer";
import { initReveals, type RevealHandle } from "./lib/reveals";

export default function App() {
  useEffect(() => {
    // Reduced motion: skip the reveals entirely. The page is already in its
    // final state, so there is nothing to restore.
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    // Only draw the connector where the three steps actually share a row.
    const drawConnector =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(min-width: 1040px)").matches
        : false;

    let handle: RevealHandle | undefined;
    let cancelled = false;

    // Short delay so layout and webfonts have settled before positions are read.
    const timer = window.setTimeout(() => {
      initReveals(document.body, { drawConnector })
        .then((h) => {
          if (cancelled) h.destroy();
          else handle = h;
        })
        .catch(() => {
          /* initReveals already swallows and logs its own failures */
        });
    }, 140);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      handle?.destroy();
    };
  }, []);

  return (
    <>
      <a className="skipLink" href="#beranda">
        Lewati ke konten
      </a>
      <Nav />
      <main>
        <Hero />
        <Masalah />
        <CaraKerja />
        <Fitur />
        <Kontak />
      </main>
      <Footer />
    </>
  );
}
