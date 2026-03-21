interface Props {
  overview: string | null;
}

export function ProposalOverview({ overview }: Props) {
  if (!overview) return null;

  return (
    <section className="pb-20">
      <p
        className="text-[10px] font-sans uppercase tracking-[0.2em] mb-6"
        style={{ color: "#8C6A3B", opacity: 0.4 }}
      >
        Overview
      </p>
      <p
        className="text-[15px] font-sans leading-[2] max-w-2xl whitespace-pre-line"
        style={{ color: "#2B2B2B", opacity: 0.5 }}
      >
        {overview}
      </p>
    </section>
  );
}
