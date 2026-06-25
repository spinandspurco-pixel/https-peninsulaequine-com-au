import { useMorningBrief } from "@/hooks/command/useMorningBrief";

interface Props {
  userId: string | null | undefined;
}

/**
 * Morning Brief band — a single editorial sentence.
 *
 * Renders quietly while loading rather than flashing a spinner, in keeping
 * with the HQ "calm authority" tone. Errors degrade silently to the
 * institutional fallback so the dashboard always greets the user.
 */
export function MorningBrief({ userId }: Props) {
  const { brief, isLoading } = useMorningBrief(userId);

  if (isLoading || !brief) {
    return (
      <p className="font-serif text-2xl sm:text-3xl leading-tight tracking-tight text-foreground/40">
        Preparing today’s brief…
      </p>
    );
  }

  return (
    <p
      className="font-serif text-2xl sm:text-3xl leading-tight tracking-tight text-foreground/85"
      aria-live="polite"
    >
      {brief.sentence}
    </p>
  );
}
