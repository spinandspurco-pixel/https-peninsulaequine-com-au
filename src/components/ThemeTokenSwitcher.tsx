import { useState } from "react";
import { Sun, Moon, ArrowLeftRight } from "lucide-react";

/**
 * Reusable color-token switcher that previews header/footer design tokens
 * in light and dark themes side-by-side. Can be used standalone or embedded.
 */

type TokenGroup = {
  label: string;
  tokens: { name: string; cssVar: string }[];
};

const HEADER_TOKENS: TokenGroup = {
  label: "Header",
  tokens: [
    { name: "Background", cssVar: "--header-bg" },
    { name: "Foreground", cssVar: "--header-foreground" },
    { name: "Scrolled BG", cssVar: "--header-scrolled-bg" },
    { name: "Scrolled FG", cssVar: "--header-scrolled-foreground" },
    { name: "Active Link", cssVar: "--header-active" },
  ],
};

const FOOTER_TOKENS: TokenGroup = {
  label: "Footer",
  tokens: [
    { name: "Background", cssVar: "--footer-bg" },
    { name: "Foreground", cssVar: "--footer-foreground" },
    { name: "Muted", cssVar: "--footer-muted" },
    { name: "Hover", cssVar: "--footer-hover" },
  ],
};

// Light & dark token values extracted from index.css
const LIGHT_VALUES: Record<string, string> = {
  "--header-bg": "30 20% 15%",
  "--header-foreground": "45 40% 97%",
  "--header-scrolled-bg": "45 40% 97%",
  "--header-scrolled-foreground": "30 15% 12%",
  "--header-active": "35 75% 50%",
  "--footer-bg": "30 20% 15%",
  "--footer-foreground": "45 40% 97%",
  "--footer-muted": "45 20% 70%",
  "--footer-hover": "35 75% 50%",
};

const DARK_VALUES: Record<string, string> = {
  "--header-bg": "30 15% 8%",
  "--header-foreground": "42 30% 92%",
  "--header-scrolled-bg": "30 15% 11%",
  "--header-scrolled-foreground": "42 30% 92%",
  "--header-active": "38 70% 55%",
  "--footer-bg": "30 15% 6%",
  "--footer-foreground": "42 30% 92%",
  "--footer-muted": "42 15% 55%",
  "--footer-hover": "38 70% 55%",
};

function Swatch({ hsl, label }: { hsl: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-6 h-6 rounded border border-border shrink-0"
        style={{ backgroundColor: `hsl(${hsl})` }}
        title={`hsl(${hsl})`}
      />
      <div className="min-w-0">
        <p className="text-[10px] text-foreground font-medium truncate">{label}</p>
        <p className="text-[9px] text-muted-foreground font-mono truncate">{hsl}</p>
      </div>
    </div>
  );
}

function PreviewStrip({ group, values, theme }: { group: TokenGroup; values: Record<string, string>; theme: "light" | "dark" }) {
  const bg = values[group.tokens[0].cssVar];
  const fg = values[group.tokens[1].cssVar];

  return (
    <div
      className="rounded-lg p-3 border border-border"
      style={{ backgroundColor: `hsl(${bg})` }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: `hsl(${fg})` }}>
          {group.label} — {theme}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {group.tokens.map((t) => (
          <div key={t.cssVar} className="flex items-center gap-1.5">
            <div
              className="w-4 h-4 rounded-sm border"
              style={{
                backgroundColor: `hsl(${values[t.cssVar]})`,
                borderColor: `hsl(${fg} / 0.3)`,
              }}
            />
            <span className="text-[9px] font-mono" style={{ color: `hsl(${fg} / 0.8)` }}>
              {t.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

type ThemeTokenSwitcherProps = {
  /** "panel" for embedded in audit panel, "standalone" for floating widget */
  variant?: "panel" | "standalone";
};

export function ThemeTokenSwitcher({ variant = "panel" }: ThemeTokenSwitcherProps) {
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark" | "split">("split");
  const [livePreview, setLivePreview] = useState(false);

  const applyTheme = (theme: "light" | "dark") => {
    const root = document.documentElement;
    const values = theme === "light" ? LIGHT_VALUES : DARK_VALUES;
    Object.entries(values).forEach(([token, val]) => {
      root.style.setProperty(token, val);
    });
  };

  const resetTheme = () => {
    const root = document.documentElement;
    Object.keys(LIGHT_VALUES).forEach((token) => {
      root.style.removeProperty(token);
    });
  };

  const toggleLivePreview = (theme: "light" | "dark") => {
    if (livePreview) {
      resetTheme();
      setLivePreview(false);
    } else {
      applyTheme(theme);
      setLivePreview(true);
    }
  };

  const groups = [HEADER_TOKENS, FOOTER_TOKENS];

  return (
    <div className={variant === "standalone" ? "p-4" : "p-2 space-y-3"}>
      {/* Theme toggle */}
      <div className="flex items-center gap-1 mx-2 mt-1">
        {(["light", "split", "dark"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setPreviewTheme(t)}
            className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-colors flex items-center justify-center gap-1 ${
              previewTheme === t
                ? "bg-accent text-accent-foreground"
                : "bg-muted/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "light" && <Sun className="w-3 h-3" />}
            {t === "dark" && <Moon className="w-3 h-3" />}
            {t === "split" && <ArrowLeftRight className="w-3 h-3" />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Token previews */}
      {groups.map((group) => (
        <div key={group.label} className="mx-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-foreground mb-1.5">
            {group.label} Tokens
          </p>

          {previewTheme === "split" ? (
            <div className="grid grid-cols-2 gap-1.5">
              <PreviewStrip group={group} values={LIGHT_VALUES} theme="light" />
              <PreviewStrip group={group} values={DARK_VALUES} theme="dark" />
            </div>
          ) : (
            <PreviewStrip
              group={group}
              values={previewTheme === "light" ? LIGHT_VALUES : DARK_VALUES}
              theme={previewTheme}
            />
          )}

          {/* Token detail list */}
          <div className="mt-1.5 space-y-0.5">
            {group.tokens.map((t) => {
              const lightVal = LIGHT_VALUES[t.cssVar];
              const darkVal = DARK_VALUES[t.cssVar];
              return (
                <div key={t.cssVar} className="flex items-center gap-2 rounded-md p-1.5 hover:bg-card transition-colors">
                  <div className="flex gap-1">
                    <Swatch hsl={lightVal} label="" />
                    <Swatch hsl={darkVal} label="" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-foreground font-medium">{t.name}</p>
                    <p className="text-[9px] text-muted-foreground font-mono truncate">{t.cssVar}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Live preview toggle */}
      <div className="mx-2 pt-1">
        <div className="flex gap-1.5">
          <button
            onClick={() => toggleLivePreview("light")}
            className={`flex-1 text-[10px] font-medium py-2 px-2 rounded-lg border transition-colors flex items-center justify-center gap-1 ${
              livePreview
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted-foreground hover:text-foreground hover:border-accent/50"
            }`}
          >
            <Sun className="w-3 h-3" />
            Apply Light
          </button>
          <button
            onClick={() => toggleLivePreview("dark")}
            className={`flex-1 text-[10px] font-medium py-2 px-2 rounded-lg border transition-colors flex items-center justify-center gap-1 ${
              livePreview
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted-foreground hover:text-foreground hover:border-accent/50"
            }`}
          >
            <Moon className="w-3 h-3" />
            Apply Dark
          </button>
          {livePreview && (
            <button
              onClick={resetTheme}
              className="text-[10px] font-medium py-2 px-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
        <p className="text-[9px] text-muted-foreground mt-1 text-center">
          Live preview overrides header/footer tokens on the current page (session-only)
        </p>
      </div>
    </div>
  );
}
