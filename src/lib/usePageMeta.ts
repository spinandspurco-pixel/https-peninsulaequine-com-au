import { useEffect } from "react";

type PageMeta = {
  title: string;
  description: string;
  path?: string; // canonical path, e.g. "/about"
};

const BASE = "https://peninsulaequine.systems";

function upsertMeta(selector: string, attr: string, key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

/**
 * Sets <title>, meta description, and Open Graph title/description/url for
 * the current public route. Restores no values on unmount — the next route
 * will overwrite. Use one call per public page component.
 */
export function usePageMeta({ title, description, path }: PageMeta) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;
    upsertMeta('meta[name="description"]', "name", "description", description);
    upsertMeta('meta[property="og:title"]', "property", "og:title", title);
    upsertMeta('meta[property="og:description"]', "property", "og:description", description);
    if (path) {
      upsertMeta('meta[property="og:url"]', "property", "og:url", `${BASE}${path}`);
    }
    return () => {
      document.title = prevTitle;
    };
  }, [title, description, path]);
}
