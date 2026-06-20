import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { PreviewNotice } from "./PreviewNotice";
import { FileText, ArrowLeft, BookOpen, Image, Info, Briefcase } from "lucide-react";

const ALTERNATIVES = [
  {
    href: "/field-notes",
    label: "Field Notes",
    description: "Build journal, site progress, and project documentation.",
    icon: BookOpen,
  },
  {
    href: "/selected-works",
    label: "Selected Works",
    description: "Completed projects, portfolios, and outcomes.",
    icon: Image,
  },
  {
    href: "/about",
    label: "About",
    description: "Company profile, standards, and philosophy.",
    icon: Info,
  },
  {
    href: "/services",
    label: "Services",
    description: "Capabilities, process, and engagement models.",
    icon: Briefcase,
  },
];

export function DocumentsPreviewStub() {
  return (
    <Layout>
      <div className="section-padding">
        <div className="section-container max-w-3xl">
          <PreviewNotice
            eyebrow="Client Preview"
            message="This surface is restricted to internal staff. The links below are available in your preview tour."
          />

          <div className="mb-12">
            <Link
              to="/hq?view=preview"
              className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground/60 hover:text-accent transition-colors mb-8"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to Command Centre
            </Link>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground leading-[1.05] mb-4">
              Document Portal
            </h1>
            <p className="text-sm text-muted-foreground/60 font-light leading-relaxed max-w-xl">
              SWMS, daily site reports, compliance records, and incident logs are
              managed on a private staff surface. Client Preview does not include
              access to operational documentation for privacy and safety reasons.
            </p>
          </div>

          <div className="space-y-8">
            <p className="font-mono text-[9px] uppercase tracking-[0.45em] text-muted-foreground/40">
              Public alternatives
            </p>

            <div className="grid gap-4">
              {ALTERNATIVES.map((alt) => {
                const Icon = alt.icon;
                return (
                  <Link
                    key={alt.href}
                    to={alt.href}
                    className="group flex items-start gap-4 py-5 border-b border-border/30 hover:border-accent/20 transition-colors"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground/40 group-hover:text-accent mt-0.5 shrink-0 transition-colors" />
                    <div>
                      <span className="block text-sm font-medium text-foreground/80 group-hover:text-accent transition-colors">
                        {alt.label}
                      </span>
                      <span className="block text-xs text-muted-foreground/50 font-light mt-0.5">
                        {alt.description}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-border/20">
            <p className="text-[11px] text-muted-foreground/30 font-light">
              If you require access to operational documents for a live project,
              contact your project lead or request a staff account through Peninsula
              Equine HQ.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
