/** Types for the ported JS diorama modules. */

export declare function webglAvailable(): boolean;

export declare function mountDiorama(
  container: HTMLElement,
  options?: {
    view?: "stage" | "split" | "wide";
    transparent?: boolean;
    tint?: string;
  },
): {
  reducedMotion: boolean;
  /** Resolves once shaders are compiled and the first frame has been drawn. */
  ready: Promise<void>;
  dispose: () => void;
} | null;
