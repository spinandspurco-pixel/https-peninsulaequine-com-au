import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { HqNav } from "@/components/hq/HqNav";
import { ActivityTimeline } from "@/components/hq/ActivityTimeline";

export default function AdminActivity() {
  useEffect(() => {
    document.title = "Activity Timeline | Peninsula Equine HQ";
  }, []);

  return (
    <Layout>
      <main className="bg-background text-foreground type-architectural min-h-screen">
        <div className="section-container max-w-[1280px] pt-28 pb-24">
          <HqNav className="mb-12" />

          <header className="mb-12 flex items-baseline gap-5">
            <span className="font-mono text-accent/55 text-[0.68rem] tracking-[0.32em] tabular-nums">
              HQ / 09
            </span>
            <span className="h-px flex-1 max-w-[3.5rem] bg-accent/25" />
            <span className="font-mono uppercase text-accent/55 text-[0.6rem] tracking-[0.5em]">
              Activity Timeline
            </span>
          </header>

          <div className="mb-14 grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 md:col-span-8 space-y-3">
              <h1 className="font-serif text-foreground/95 leading-[1.02] tracking-[-0.024em] text-[clamp(1.9rem,1.2rem+2.2vw,2.8rem)]">
                Who did what, and when.
              </h1>
              <p className="font-sans font-light text-foreground/55 leading-[1.7] text-[0.95rem] max-w-xl">
                A single, human record of every meaningful move across the studio — inquiries,
                projects, gallery edits, staff updates.
              </p>
            </div>
          </div>

          <ActivityTimeline limit={120} />
        </div>
      </main>
    </Layout>
  );
}
