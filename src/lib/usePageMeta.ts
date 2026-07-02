import { useEffect } from "react";

type PageMeta = {
  title: string;
  description: string;
  /** Canonical path, e.g. "/about". Defaults to the current pathname. */
  path?: string;
  /** Absolute or root-relative image URL for og:image / twitter:image. */
  image?: string;
  /** Open Graph object type. Defaults to "website". */
  ogType?: "website" | "article" | "profile";
  /** Twitter card type. Defaults to "summary_large_image". */
  twitterCard?: "summary" | "summary_large_image";
  /**
   * Optional JSON-LD structured data (or an array of graphs) injected as a
   * <script type="application/ld+json"> in <head>. Automatically removed on
   * unmount so per-route schemas never leak between pages.
   */
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
};

const BASE = "https://peninsulaequine.systems";
const SITE_NAME = "Peninsula Equine";
const DEFAULT_IMAGE = `${BASE}/og-image.jpg`;
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

function absolutise(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Sets <title>, meta description, canonical, Open Graph, Twitter card, and
 * optional JSON-LD structured data for the current public route. Use one
 * call per public page component.
 */
export function usePageMeta({
  title,
  description,
  path,
  image,
  ogType = "website",
  twitterCard = "summary_large_image",
  jsonLd,
}: PageMeta) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    const canonicalPath =
      path ?? (typeof window !== "undefined" ? window.location.pathname : "/");
    const canonicalUrl = `${BASE}${canonicalPath}`;
    const imageUrl = absolutise(image ?? DEFAULT_IMAGE);

    upsertMeta('meta[name="description"]', "name", "description", description);

    // Open Graph
    upsertMeta('meta[property="og:site_name"]', "property", "og:site_name", SITE_NAME);
    upsertMeta('meta[property="og:type"]', "property", "og:type", ogType);
    upsertMeta('meta[property="og:title"]', "property", "og:title", title);
    upsertMeta('meta[property="og:description"]', "property", "og:description", description);
    upsertMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    upsertMeta('meta[property="og:image"]', "property", "og:image", imageUrl);
    upsertMeta('meta[property="og:image:alt"]', "property", "og:image:alt", title);

    // Twitter
    upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", twitterCard);
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", imageUrl);

    upsertCanonical(canonicalUrl);

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
  }, [title, description, path, image, ogType, twitterCard, jsonLd]);
}

