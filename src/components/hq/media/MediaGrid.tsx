import type { MediaAsset } from "@/lib/mediaVault";
import { MediaTile } from "./MediaTile";

interface Props {
  rows: MediaAsset[];
  loading: boolean;
  onSelect: (row: MediaAsset) => void;
}

export function MediaGrid({ rows, loading, onSelect }: Props) {
  if (loading && rows.length === 0) {
    return (
      <p className="font-mono uppercase text-[10px] tracking-[0.4em] text-foreground/40">
        Loading the vault…
      </p>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="py-16 max-w-md">
        <p className="font-serif italic text-foreground/55 text-[1.05rem] leading-relaxed">
          The vault is empty. Upload approved work, and it lives here —
          one quiet source for everything the studio shows.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
      {rows.map((row) => (
        <MediaTile key={row.id} asset={row} onClick={() => onSelect(row)} />
      ))}
    </div>
  );
}
