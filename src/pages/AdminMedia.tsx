import { useEffect, useMemo, useState, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { HqNav } from "@/components/hq/HqNav";
import { useAuth } from "@/hooks/useAuth";
import {
  listMedia,
  applyClientFilter,
  type MediaAsset,
  type MediaApprovalState,
  type MediaAssetType,
} from "@/lib/mediaVault";
import { MediaGrid } from "@/components/hq/media/MediaGrid";
import { MediaUploadDialog } from "@/components/hq/media/MediaUploadDialog";
import { MediaDetailDrawer } from "@/components/hq/media/MediaDetailDrawer";

const STATES: Array<{ value: MediaApprovalState | "all"; label: string }> = [
  { value: "all", label: "All states" },
  { value: "draft", label: "Draft" },
  { value: "approved", label: "Approved" },
  { value: "archived", label: "Archived" },
];

const TYPES: Array<{ value: MediaAssetType | "all"; label: string }> = [
  { value: "all", label: "All types" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "pdf", label: "PDF" },
];

export default function AdminMedia() {
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<MediaApprovalState | "all">("all");
  const [type, setType] = useState<MediaAssetType | "all">("all");
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Media Vault | Peninsula Equine HQ";
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listMedia();
      setRows(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () => applyClientFilter(rows, { approvalState: state, assetType: type, search }),
    [rows, state, type, search],
  );

  const selected = useMemo(
    () => (selectedId ? rows.find((r) => r.id === selectedId) ?? null : null),
    [rows, selectedId],
  );

  return (
    <Layout>
      <main className="bg-background text-foreground type-architectural min-h-screen">
        <div className="section-container max-w-[1320px] pt-28 pb-24">
          <HqNav className="mb-12" />

          <header className="mb-12 flex items-baseline gap-5">
            <span className="font-mono text-accent/55 text-[0.68rem] tracking-[0.32em] tabular-nums">
              HQ / 10
            </span>
            <span className="h-px flex-1 max-w-[3.5rem] bg-accent/25" />
            <span className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.5em]">
              Media Vault
            </span>
          </header>

          <div className="mb-14 grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 md:col-span-8 space-y-3">
              <h1 className="font-serif text-foreground/95 leading-[1.02] tracking-[-0.024em] text-[clamp(1.9rem,1.2rem+2.2vw,2.8rem)]">
                The evidence vault.
              </h1>
              <p className="font-sans font-light text-foreground/55 leading-[1.7] text-[0.95rem] max-w-xl">
                Every approved image of every build — kept together, attributed, rights-aware.
                The quiet source the rest of the studio draws from.
              </p>
            </div>
          </div>

          <div className="mb-10 border-y border-accent/12 py-4 flex flex-wrap items-center gap-x-8 gap-y-3">
            <Filter
              label="State"
              value={state}
              onChange={(v) => setState(v as MediaApprovalState | "all")}
              options={STATES}
            />
            <Filter
              label="Type"
              value={type}
              onChange={(v) => setType(v as MediaAssetType | "all")}
              options={TYPES}
            />
            <label className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-foreground/45 font-mono">
              Search
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="title, tag, location"
                className="bg-transparent border-b border-accent/20 focus:border-accent/60 outline-none px-1 py-1 text-[12px] tracking-normal normal-case font-sans text-foreground/85 w-56"
              />
            </label>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setUploadOpen(true)}
                className="ml-auto inline-flex items-center gap-3 font-mono uppercase text-foreground/70 hover:text-accent transition-colors text-[10px] tracking-[0.42em]"
              >
                <span className="w-8 h-px bg-accent/40" />
                Upload image
              </button>
            )}
          </div>

          {error && (
            <p role="alert" className="mb-6 font-mono text-[11px] uppercase tracking-[0.4em] text-red-500/80">
              Failed to load · {error}
            </p>
          )}

          <MediaGrid
            rows={filtered}
            loading={loading}
            onSelect={(r) => setSelectedId(r.id)}
          />
        </div>

        {isAdmin && (
          <MediaUploadDialog
            open={uploadOpen}
            onClose={() => setUploadOpen(false)}
            onUploaded={() => {
              setUploadOpen(false);
              load();
            }}
          />
        )}

        <MediaDetailDrawer
          asset={selected}
          canEdit={isAdmin}
          onClose={() => setSelectedId(null)}
          onChanged={load}
        />
      </main>
    </Layout>
  );
}

interface FilterProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}

function Filter({ label, value, onChange, options }: FilterProps) {
  return (
    <label className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-foreground/45 font-mono">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-b border-accent/20 focus:border-accent/60 outline-none px-1 py-1 text-[12px] tracking-normal normal-case font-sans text-foreground/85"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-background text-foreground">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
