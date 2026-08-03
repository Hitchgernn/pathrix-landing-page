import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import { localeFromDocument } from "./lib/locale";
import "./styles/global.css";

const root = document.getElementById("root");
if (!root) throw new Error("#root not found");

const tree = (
  <StrictMode>
    <App locale={localeFromDocument()} />
  </StrictMode>
);

// The build prerenders the markup, so hydrate it. Fall back to a fresh render
// when the shell is empty (dev server, or a prerender that did not run).
if (root.hasChildNodes()) hydrateRoot(root, tree);
else createRoot(root).render(tree);
