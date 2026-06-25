import { useEffect, useState } from "react";
import {
  getSignedUrl,
  updateMedia,
  archiveMedia,
  deleteMedia,
  APPROVAL_LABEL,
  type MediaAsset,
  type MediaApprovalState,
} from "@/lib/mediaVault";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

interface Props {
  asset: MediaAsset | null;
  canEdit: boolean;
  onClose: () => void;
  onChanged: () => void;
}

export function MediaDetailDrawer({ asset, canEdit, onClose, onChanged }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [altText, setAltText] = useState("");
  const [location, setLocation] = useState("");
  const [credit, setCredit] = useState("");
  const [usageRights, setUsageRights] = useState("");
  const [approval, setApproval] = useState<MediaApprovalState>("draft");
  const [isDemo, setIsDemo] = useState(false);
  const [tagsRaw, setTagsRaw] = useState("");

  useEffect(() => {
    if (!asset) return;
    setTitle(asset.title);
    setDescription(asset.description ?? "");
    setAltText(asset.alt_text ?? "");
    setLocation(asset.location ?? "");
    setCredit(asset.credit ?? "");
    setUsageRights(asset.usage_rights ?? "");
    setApproval((asset.approval_state as MediaApprovalState) ?? "draft");
    setIsDemo(asset.is_demo);
    setTagsRaw((asset.tags ?? []).join(", "));
    setError(null);
    setSrc(null);
    getSignedUrl(asset.storage_path, asset.file_url).then(setSrc);
  }, [asset]);

  if (!asset) return null;

  async function save() {
    if (!asset) return;
    setBusy(true);
    setError(null);
    try {
      await updateMedia(asset.id, {
        title: title.trim(),
        description: description.trim() || null,
        alt_text: altText.trim() || null,
        location: location.trim() || null,
        credit: credit.trim() || null,
        usage_rights: usageRights.trim() || null,
        approval_state: approval,
        is_demo: isDemo,
        tags: tagsRaw.split(",").map((t) => t.trim()).filter(Boolean),
      });
      onChanged();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function archive() {
    if (!asset) return;
    setBusy(true);
    try {
      await archiveMedia(asset.id);
      onChanged();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!asset) return;
    if (!window.confirm("Permanently delete this asset and its file?")) return;
    setBusy(true);
    try {
      await deleteMedia(asset);
      onChanged();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={!!asset} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-background border-accent/15">
        <SheetHeader>
          <SheetTitle className="font-serif text-[1.3rem] tracking-tight text-foreground/90">
            {asset.title}
          </SheetTitle>
          <SheetDescription className="font-mono text-[10px] uppercase tracking-[0.36em] text-foreground/45">
            {APPROVAL_LABEL[asset.approval_state as MediaApprovalState] ?? asset.approval_state}
            {asset.is_demo ? " · demo-safe" : ""}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 aspect-[4/3] w-full bg-accent/5 border border-accent/10 overflow-hidden">
          {src ? (
            <img src={src} alt={asset.alt_text ?? asset.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center font-mono text-[9px] uppercase tracking-[0.4em] text-foreground/30">
              loading
            </div>
          )}
        </div>

        {canEdit ? (
          <div className="mt-6 space-y-4">
            <DrawerField label="Title">
              <DrawerInput value={title} onChange={setTitle} />
            </DrawerField>
            <DrawerField label="Description">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-transparent border-b border-accent/20 focus:border-accent/60 outline-none py-1 text-[13px] font-sans font-light text-foreground/85 resize-none"
              />
            </DrawerField>
            <DrawerField label="Alt text">
              <DrawerInput value={altText} onChange={setAltText} />
            </DrawerField>
            <div className="grid grid-cols-2 gap-4">
              <DrawerField label="Location">
                <DrawerInput value={location} onChange={setLocation} />
              </DrawerField>
              <DrawerField label="Credit">
                <DrawerInput value={credit} onChange={setCredit} />
              </DrawerField>
            </div>
            <DrawerField label="Usage rights">
              <DrawerInput value={usageRights} onChange={setUsageRights} />
            </DrawerField>
            <div className="grid grid-cols-2 gap-4">
              <DrawerField label="Approval">
                <select
                  value={approval}
                  onChange={(e) => setApproval(e.target.value as MediaApprovalState)}
                  className="w-full bg-transparent border-b border-accent/20 outline-none py-1 text-[13px] font-sans text-foreground/85"
                >
                  <option value="draft" className="bg-background">Draft</option>
                  <option value="approved" className="bg-background">Approved</option>
                  <option value="archived" className="bg-background">Archived</option>
                </select>
              </DrawerField>
              <label className="flex items-end gap-3 text-[11px] uppercase tracking-[0.3em] font-mono text-foreground/55 pb-1">
                <input
                  type="checkbox"
                  checked={isDemo}
                  onChange={(e) => setIsDemo(e.target.checked)}
                  className="accent-accent"
                />
                Demo-safe
              </label>
            </div>
            <DrawerField label="Tags">
              <DrawerInput value={tagsRaw} onChange={setTagsRaw} />
            </DrawerField>

            {error && (
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-red-500/80">{error}</p>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-accent/12">
              <button
                type="button"
                onClick={remove}
                disabled={busy}
                className="font-mono uppercase text-[10px] tracking-[0.4em] text-red-500/70 hover:text-red-500"
              >
                Delete
              </button>
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={archive}
                  disabled={busy || approval === "archived"}
                  className="font-mono uppercase text-[10px] tracking-[0.4em] text-foreground/55 hover:text-foreground/85 disabled:opacity-30"
                >
                  Archive
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={busy}
                  className="inline-flex items-center gap-3 font-mono uppercase text-[10px] tracking-[0.42em] text-accent hover:text-accent/80 disabled:opacity-40"
                >
                  <span className="w-8 h-px bg-accent/60" />
                  {busy ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <dl className="mt-6 space-y-3 text-[13px] font-sans font-light text-foreground/75">
            <Row label="Description" value={asset.description} />
            <Row label="Alt text" value={asset.alt_text} />
            <Row label="Location" value={asset.location} />
            <Row label="Credit" value={asset.credit} />
            <Row label="Usage rights" value={asset.usage_rights} />
            <Row label="Tags" value={(asset.tags ?? []).join(", ") || null} />
          </dl>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="font-mono uppercase text-[9px] tracking-[0.36em] text-foreground/40">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}

function DrawerField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="font-mono uppercase text-[9px] tracking-[0.36em] text-foreground/45">{label}</span>
      {children}
    </label>
  );
}

function DrawerInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-transparent border-b border-accent/20 focus:border-accent/60 outline-none py-1 text-[13px] font-sans font-light text-foreground/85"
    />
  );
}
