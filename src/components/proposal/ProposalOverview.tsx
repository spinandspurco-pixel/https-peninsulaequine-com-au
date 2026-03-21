interface Props {
  overview: string | null;
}

export function ProposalOverview({ overview }: Props) {
  if (!overview) return null;

  return (
    <section className="pb-24">
      <p
        className="text-[9px] font-sans uppercase tracking-[0.22em] mb-6 font-medium"
        style={{ color: "#8C6A3B", opacity: 0.4 }}
      >
        Overview
      </p>
      <p
        className="text-[14px] font-sans leading-[2] max-w-2xl whitespace-pre-line"
        style={{ color: "#2B2B2B", opacity: 0.48 }}
      >
        {overview}
      </p>
    </section>
  );
}
