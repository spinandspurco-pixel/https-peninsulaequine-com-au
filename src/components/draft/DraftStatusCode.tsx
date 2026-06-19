interface Props {
  code: string;
  status?: string;
  className?: string;
}

/** Small monospace project code: `PE-MR-024 · IN BUILD`. */
export function DraftStatusCode({ code, status, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.42em] text-accent/55 ${className}`}
    >
      <span className="tabular-nums">{code}</span>
      {status && (
        <>
          <span aria-hidden className="inline-block w-1 h-1 rounded-full bg-accent/40" />
          <span className="text-foreground/55">{status}</span>
        </>
      )}
    </span>
  );
}
