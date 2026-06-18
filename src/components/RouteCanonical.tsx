import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_ORIGIN = "https://peninsulaequine.com.au";

/**
 * Keeps <link rel="canonical"> and <meta property="og:url"> in sync
 * with the current route. Mounted once inside <BrowserRouter>.
 *
 * Strips query strings and trailing slashes (except root) so the
 * canonical URL matches the sitemap entries exactly.
 */
export function RouteCanonical() {
  const { pathname } = useLocation();

  useEffect(() => {
    const normalised =
      pathname.length > 1 && pathname.endsWith("/")
        ? pathname.slice(0, -1)
        : pathname;
    const url = `${SITE_ORIGIN}${normalised}`;

    let canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]'
    );
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    let ogUrl = document.querySelector<HTMLMetaElement>(
      'meta[property="og:url"]'
    );
    if (!ogUrl) {
      ogUrl = document.createElement("meta");
      ogUrl.setAttribute("property", "og:url");
      document.head.appendChild(ogUrl);
    }
    ogUrl.content = url;
  }, [pathname]);

  return null;
}
