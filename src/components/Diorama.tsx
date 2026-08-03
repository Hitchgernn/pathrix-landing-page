import { useEffect, useRef, useState } from "react";
import styles from "./Diorama.module.css";
import { useCopy } from "../lib/locale";

type Props = {
  /** Camera framing. The hero uses "stage". */
  view?: "stage" | "split" | "wide";
  /** Page colour behind the transparent canvas; the scene fog fades into it. */
  tint?: string;
};

type Handle = {
  reducedMotion: boolean;
  /** Resolves once shaders are compiled and the first frame is drawn. */
  ready: Promise<void>;
  dispose: () => void;
};

/**
 * Cheap probe, duplicated here so the fallback can render without loading
 * three.js. Returns true during SSR so the prerendered markup matches what a
 * capable browser hydrates into (the effect corrects it otherwise).
 */
function webglSupported(): boolean {
  if (typeof document === "undefined") return true;
  if (typeof WebGLRenderingContext === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * Mounts the three.js diorama into a positioned wrapper. The scene itself is
 * unchanged from the prototype — this handles React lifecycle, the WebGL-absent
 * fallback, and deferring the three.js download until after first paint.
 */
export function Diorama({ view = "stage", tint = "#dfeaf3" }: Props) {
  const { ui } = useCopy();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(() => !webglSupported());

  useEffect(() => {
    if (failed) return;
    const host = hostRef.current;
    if (!host) return;

    let handle: Handle | null = null;
    let cancelled = false;
    let idle = 0;

    const mount = () => {
      if (cancelled) return;
      // Dynamic import: keeps three.js out of the critical path so the hero
      // wordmark (the LCP element) paints first.
      import("../hero/diorama.js")
        .then(({ mountDiorama }) => {
          if (cancelled || !hostRef.current) return;
          handle = mountDiorama(hostRef.current, { view, transparent: true, tint });
          if (!handle) {
            setFailed(true);
            return;
          }
          // Fade in only once there is a real frame to show.
          handle.ready.then(() => {
            if (!cancelled) setReady(true);
          });
        })
        .catch((error) => {
          console.warn("[pathrix] diorama failed to load:", error);
          if (!cancelled) setFailed(true);
        });
    };

    // Building the scene (terrain generation, geometry merging, shader compile)
    // is one long task. Waiting for idle after load keeps it from competing with
    // hydration and first paint — the hero text is readable well before the
    // island appears, which is the right order of priority.
    const schedule = () => {
      if (cancelled) return;
      if (typeof window.requestIdleCallback === "function") {
        idle = window.requestIdleCallback(mount, { timeout: 2000 });
      } else {
        idle = window.setTimeout(mount, 200);
      }
    };

    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      handle?.dispose();
    };
  }, [view, tint, failed]);

  if (failed) {
    return (
      <div className={styles.root}>
        <div className={styles.fallback}>
          <img
            className={styles.fallbackImage}
            src="/hero/diorama-fallback.svg"
            alt={ui.dioramaFallbackAlt}
            width={1240}
            height={800}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root} aria-hidden="true">
      <div ref={hostRef} className={styles.surface} data-ready={ready} />
    </div>
  );
}
