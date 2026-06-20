import { useHqMode } from "@/hooks/useHqMode";

interface Props {
  /** Override the default body copy. */
  message?: string;
  /** Override the default eyebrow chip. */
  eyebrow?: string;
}

/**
 * Inline notice that makes Client Preview read-only state feel intentional
 * inside a content editor. Renders nothing in staff mode.
 */
export function PreviewNotice({
  message = "Public content preview · view-only demonstration environment. Edits, uploads and deletes are disabled.",
  eyebrow = "Client Preview",
}: Props) {
  const { isPreview } = useHqMode();
  if (!isPreview) return null;

  return (
    <div className="border-l-2 border-accent/40 pl-5 py-3 mb-8 bg-background/40">
      <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/70 mb-1">
        {eyebrow}
      </p>
      <p className="text-[12px] text-muted-foreground/70 leading-relaxed">{message}</p>
    </div>
  );
}
