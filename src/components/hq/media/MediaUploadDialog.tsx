import { useState, type FormEvent } from "react";
import { uploadImage } from "@/lib/mediaVault";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
}

export function MediaUploadDialog({ open, onClose, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [altText, setAltText] = useState("");
  const [location, setLocation] = useState("");
  const [credit, setCredit] = useState("");
  const [usageRights, setUsageRights] = useState("internal");
  const [approval, setApproval] = useState<"draft" | "approved">("draft");
  const [isDemo, setIsDemo] = useState(false);
  const [tagsRaw, setTagsRaw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setFile(null);
    setTitle("");
    setAltText("");
    setLocation("");
    setCredit("");
    setUsageRights("internal");
    setApproval("draft");
    setIsDemo(false);
    setTagsRaw("");
    setError(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file || !title.trim()) {
      setError("Image and title are required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await uploadImage({
        file,
        title: title.trim(),
        altText: altText.trim() || undefined,
        location: location.trim() || undefined,
        credit: credit.trim() || undefined,
        usageRights: usageRights || undefined,
        approvalState: approval,
        isDemo,
        tags: tagsRaw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      reset();
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && (reset(), onClose())}>
      <DialogContent className="max-w-xl bg-background border-accent/15">
        <DialogHeader>
          <DialogTitle className="font-serif text-[1.4rem] tracking-tight text-foreground/90">
            Upload image
          </DialogTitle>
          <DialogDescription className="font-sans text-[12px] font-light text-foreground/55">
            Single image, ≤ 20 MB. Drafts stay invisible to preview accounts.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5 pt-2">
          <Field label="Image file" required>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-[12px] font-sans text-foreground/85"
            />
          </Field>

          <Field label="Title" required>
            <Input value={title} onChange={setTitle} placeholder="e.g. Main Ridge — covered arena, dusk" />
          </Field>

          <Field label="Alt text">
            <Input value={altText} onChange={setAltText} placeholder="Accessible description" />
          </Field>

          <div className="grid grid-cols-2 gap-5">
            <Field label="Location">
              <Input value={location} onChange={setLocation} placeholder="Main Ridge, VIC" />
            </Field>
            <Field label="Credit">
              <Input value={credit} onChange={setCredit} placeholder="Photographer / source" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Field label="Usage rights">
              <select
                value={usageRights}
                onChange={(e) => setUsageRights(e.target.value)}
                className="bg-transparent border-b border-accent/20 outline-none py-1 text-[13px] font-sans text-foreground/85"
              >
                <option value="internal" className="bg-background">Internal only</option>
                <option value="client" className="bg-background">Client-shareable</option>
                <option value="public" className="bg-background">Public OK</option>
              </select>
            </Field>
            <Field label="Approval">
              <select
                value={approval}
                onChange={(e) => setApproval(e.target.value as "draft" | "approved")}
                className="bg-transparent border-b border-accent/20 outline-none py-1 text-[13px] font-sans text-foreground/85"
              >
                <option value="draft" className="bg-background">Draft</option>
                <option value="approved" className="bg-background">Approved</option>
              </select>
            </Field>
          </div>

          <Field label="Tags (comma-separated)">
            <Input value={tagsRaw} onChange={setTagsRaw} placeholder="arena, dusk, main-ridge" />
          </Field>

          <label className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] font-mono text-foreground/55">
            <input
              type="checkbox"
              checked={isDemo}
              onChange={(e) => setIsDemo(e.target.checked)}
              className="accent-accent"
            />
            Demo-safe (preview accounts may view if approved)
          </label>

          {error && (
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-red-500/80">{error}</p>
          )}

          <div className="flex items-center justify-end gap-6 pt-2">
            <button
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
              className="font-mono uppercase text-[10px] tracking-[0.4em] text-foreground/55 hover:text-foreground/85"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-3 font-mono uppercase text-[10px] tracking-[0.42em] text-accent hover:text-accent/80 disabled:opacity-40"
            >
              <span className="w-8 h-px bg-accent/60" />
              {busy ? "Uploading…" : "Commit to vault"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="font-mono uppercase text-[9px] tracking-[0.36em] text-foreground/45">
        {label}
        {required ? " ·" : ""}
      </span>
      {children}
    </label>
  );
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-transparent border-b border-accent/20 focus:border-accent/60 outline-none py-1 text-[13px] font-sans font-light text-foreground/85"
    />
  );
}
