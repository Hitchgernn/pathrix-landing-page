import { renderToStaticMarkup } from "react-dom/server";
import App from "./App";

/**
 * Build-time prerender. The page must be fully readable with JavaScript
 * disabled, so the markup is baked into index.html rather than being assembled
 * in the browser. Hydration then attaches the behaviour (nav inversion, menu,
 * form, diorama) on top of markup that is already complete.
 */
export function render(): string {
  return renderToStaticMarkup(<App />);
}
