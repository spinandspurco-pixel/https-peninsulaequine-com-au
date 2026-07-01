import { useEffect } from "react";

type PageMeta = {
  title: string;
  description: string;
  path?: string; // canonical path, e.g. "/about"
  /**
   * Optional JSON-LD structured data (or an array of graphs) injected as a
   * <script type="application/ld+json"> in <head>. Automatically removed on
   * unmount so per-route schemas never leak between pages.
   */
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
};

const BASE = "https://peninsulaequine.systems";
const CANONICAL_ID = "route-canonical-link";
const JSONLD_ID = "route-jsonld";

function upsertMeta(selector: string, attr: string, key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function upsertCanonical(url: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link#${CANONICAL_ID}`);
  if (!el) {
    // Remove any static canonical from index.html so we don't double-ship.
    document.head
      .querySelectorAll<HTMLLinkElement>('link[rel="canonical"]')
      .forEach((n) => n.parentElement?.removeChild(n));
    el = document.createElement("link");
    el.id = CANONICAL_ID;
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = url;
}

/**
 * Sets <title>, meta description, canonical, Open Graph, Twitter card, and
 * optional JSON-LD structured data for the current public route. Use one
 * call per public page component.
 */
export function usePageMeta({ title, description, path, jsonLd }: PageMeta) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;
    upsertMeta('meta[name="description"]', "name", "description", description);
    upsertMeta('meta[property="og:title"]', "property", "og:title", title);
    upsertMeta('meta[property="og:description"]', "property", "og:description", description);
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    if (path) {
      const url = `${BASE}${path}`;
      upsertMeta('meta[property="og:url"]', "property", "og:url", url);
      upsertCanonical(url);
    }

    let scriptEl: HTMLScriptElement | null = null;
    if (jsonLd) {
      scriptEl = document.createElement("script");
      scriptEl.type = "application/ld+json";
      scriptEl.id = JSONLD_ID;
      scriptEl.text = JSON.stringify(jsonLd);
      // Remove any prior per-route JSON-LD before appending.
      document.head
        .querySelectorAll<HTMLScriptElement>(`script#${JSONLD_ID}`)
        .forEach((n) => n.parentElement?.removeChild(n));
      document.head.appendChild(scriptEl);
    }

    return () => {
      document.title = prevTitle;
      if (scriptEl && scriptEl.parentElement) {
        scriptEl.parentElement.removeChild(scriptEl);
      }
    };
  }, [title, description, path, jsonLd]);
}
