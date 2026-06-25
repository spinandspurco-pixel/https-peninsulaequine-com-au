import { useEffect, useState } from "react";
import { getSignedUrl, type MediaAsset, APPROVAL_LABEL } from "@/lib/mediaVault";

interface Props {
  asset: MediaAsset;
  onClick: () => void;
  hasSuggestions?: boolean;
}

export function MediaTile({ asset, onClick, hasSuggestions = false }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSrc(null);
    setFailed(false);
    getSignedUrl(asset.storage_path, asset.file_url)
      .then((url) => {
        if (!cancelled) {
          if (url) setSrc(url);
          else setFailed(true);
        }
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [asset.id, asset.storage_path, asset.file_url]);

  const stateLabel = APPROVAL_LABEL[asset.approval_state as keyof typeof APPROVAL_LABEL] ?? asset.approval_state;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left block w-full focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/60"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-accent/5 border border-accent/10">
        {src && !failed ? (
          <img
            src={src}
            alt={asset.alt_text ?? asset.title}
            loading="lazy"
            onError={() => setFailed(true)}
            className="absolute inset-0 h-full w-full object-cover transition-[transform,filter] duration-700 group-hover:scale-[1.02] filter brightness-[0.92] contrast-[1.05] saturate-[0.85]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-[9px] uppercase tracking-[0.4em] text-foreground/30">
            {failed ? "no preview" : "loading"}
          </div>
        )}
        <div className="absolute top-2 left-2 font-mono text-[8px] uppercase tracking-[0.32em] px-2 py-1 bg-background/70 backdrop-blur-sm text-foreground/70">
          {stateLabel}
        </div>
      </div>
      <div className="pt-3 space-y-1">
        <p className="font-serif text-[0.98rem] text-foreground/85 leading-snug">
          {asset.title}
        </p>
        <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-foreground/40">
          {asset.asset_type}
          {asset.is_demo ? " · demo" : ""}
          {asset.location ? ` · ${asset.location}` : ""}
        </p>
      </div>
    </button>
  );
}
