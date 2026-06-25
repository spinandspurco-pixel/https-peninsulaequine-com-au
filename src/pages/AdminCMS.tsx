import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { HqBreadcrumbs } from "@/components/hq/HqBreadcrumbs";
import { HqNav } from "@/components/hq/HqNav";
import { CmsCrudTab } from "@/components/hq/cms/CmsCrudTab";
import {
  servicesConfig,
  eventsConfig,
  testimonialsConfig,
  galleryConfig,
} from "@/components/hq/cms/configs";
import { cn } from "@/lib/utils";

type TabKey = "services" | "events" | "testimonials" | "gallery";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "services", label: "Services" },
  { key: "events", label: "Events" },
  { key: "testimonials", label: "Testimonials" },
  { key: "gallery", label: "Gallery" },
];

export default function AdminCMS() {
  const [tab, setTab] = useState<TabKey>("services");

  return (
    <Layout>
      <HqNav />
      <HqBreadcrumbs />
      <div className="section-padding">
        <div className="section-container max-w-5xl">
          {/* Header */}
          <header className="mb-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent/70">
              Content
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-foreground mt-2">
              Content Management
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl">
              Edit the live public surfaces. Changes apply immediately to active items.
            </p>
          </header>

          {/* Tabs — quiet text links, no SaaS pills */}
          <nav
            aria-label="CMS sections"
            className="border-y border-border/10 -mx-2 px-2 py-3 mb-10"
          >
            <ul className="flex items-center gap-x-8 flex-wrap">
              {TABS.map((t) => {
                const active = tab === t.key;
                return (
                  <li key={t.key}>
                    <button
                      type="button"
                      onClick={() => setTab(t.key)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "text-[10px] uppercase tracking-[0.22em] transition-colors whitespace-nowrap",
                        active ? "text-accent" : "text-muted-foreground/45 hover:text-foreground/80",
                      )}
                    >
                      {t.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Tab content */}
          <section role="region" aria-label={`${tab} editor`}>
            {tab === "services" && <CmsCrudTab config={servicesConfig} />}
            {tab === "events" && <CmsCrudTab config={eventsConfig} />}
            {tab === "testimonials" && <CmsCrudTab config={testimonialsConfig} />}
            {tab === "gallery" && <CmsCrudTab config={galleryConfig} />}
          </section>
        </div>
      </div>
    </Layout>
  );
}
