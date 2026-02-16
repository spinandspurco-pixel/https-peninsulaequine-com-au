import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, X, ArrowRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { ParallaxCTA } from "@/components/ParallaxCTA";
import { BlueprintBackground } from "@/components/BlueprintBackground";
import { faqs } from "@/data/content";
import { useStaggeredAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import blueprintDetail from "@/assets/blueprint-detail.png";
import horseAction from "@/assets/horse-action.png";

// ── Categories ───────────────────────────────────────

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "general", label: "General" },
  { value: "lessons", label: "Lessons" },
  { value: "payments", label: "Payments & Packages" },
];

// ── Auto-Suggest Keywords → Category ─────────────────

const KEYWORD_MAP: { keywords: string[]; category: string; suggestion: string; link?: { label: string; href: string } }[] = [
  {
    keywords: ["price", "cost", "pay", "payment", "money", "fee", "charge", "invoice", "card", "eft", "transfer"],
    category: "payments",
    suggestion: "Looking for payment info?",
    link: { label: "View Pricing", href: "/pricing" },
  },
  {
    keywords: ["package", "pack", "bulk", "discount", "save", "bundle"],
    category: "payments",
    suggestion: "Interested in lesson packages?",
    link: { label: "View Packages", href: "/pricing" },
  },
  {
    keywords: ["group", "party", "team", "friends", "family", "birthday"],
    category: "payments",
    suggestion: "Planning a group session?",
    link: { label: "Group Booking", href: "/group-booking" },
  },
  {
    keywords: ["book", "schedule", "reserve", "availability", "slot", "lesson", "session"],
    category: "lessons",
    suggestion: "Ready to book a lesson?",
    link: { label: "Book a Lesson", href: "/book-lesson" },
  },
  {
    keywords: ["refund", "cancel", "cancellation", "reschedule"],
    category: "payments",
    suggestion: "Questions about cancellations?",
  },
  {
    keywords: ["gift", "voucher", "present"],
    category: "payments",
    suggestion: "Looking for gift options?",
  },
];

function getAutoSuggestion(query: string) {
  if (!query || query.length < 3) return null;
  const q = query.toLowerCase();
  for (const entry of KEYWORD_MAP) {
    if (entry.keywords.some((kw) => q.includes(kw))) {
      return entry;
    }
  }
  return null;
}

// ── Page ─────────────────────────────────────────────

export default function FAQ() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const autoSuggestion = useMemo(() => getAutoSuggestion(search), [search]);

  // Auto-switch category when suggestion matches and user hasn't manually picked one
  const effectiveCategory = activeCategory;

  const filtered = useMemo(() => {
    let items = faqs;

    // Filter by category
    if (effectiveCategory !== "all") {
      items = items.filter((f) => (f.category || "general") === effectiveCategory);
    }

    // Filter by search
    const q = search.toLowerCase().trim();
    if (q) {
      items = items.filter(
        (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
      );
    }

    return items;
  }, [search, effectiveCategory]);

  const { containerRef, visibleItems } = useStaggeredAnimation(filtered.length, {
    threshold: 0.1,
  });

  const handleCategoryClick = useCallback((cat: string) => {
    setActiveCategory(cat);
  }, []);

  return (
    <Layout>
      <PageHeader
        title="Frequently Asked Questions"
        description="Got questions? We've got answers. If you don't find what you're looking for, don't hesitate to reach out."
      />

      <section className="section-padding relative overflow-hidden">
        <BlueprintBackground image={blueprintDetail} opacity={0.025} direction="bottom-to-top" duration={1800} parallaxSpeed={0.06} />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-background/90 to-background pointer-events-none z-[1]" />

        <div className="section-container max-w-3xl relative z-[2]">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryClick(cat.value)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                  effectiveCategory === cat.value
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-background text-muted-foreground border-border hover:border-accent/40 hover:text-foreground"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search filter */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions… e.g. 'group discount', 'payment', 'book a lesson'"
              className="w-full pl-11 pr-10 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/40 transition-shadow text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Auto-suggest banner */}
          {autoSuggestion && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <Lightbulb className="h-4 w-4 text-accent shrink-0" />
              <span className="text-foreground">{autoSuggestion.suggestion}</span>
              {autoSuggestion.link && (
                <Link
                  to={autoSuggestion.link.href}
                  className="ml-auto inline-flex items-center gap-1 text-accent font-medium hover:underline whitespace-nowrap"
                >
                  {autoSuggestion.link.label}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
              {autoSuggestion.category !== effectiveCategory && effectiveCategory === "all" && (
                <button
                  onClick={() => setActiveCategory(autoSuggestion.category)}
                  className="ml-2 text-xs text-accent underline whitespace-nowrap"
                >
                  Show {CATEGORIES.find((c) => c.value === autoSuggestion.category)?.label}
                </button>
              )}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">
                No results{search ? ` for "${search}"` : ""}{effectiveCategory !== "all" ? ` in ${CATEGORIES.find((c) => c.value === effectiveCategory)?.label}` : ""}
              </p>
              <div className="flex gap-2 justify-center">
                {search && (
                  <Button variant="outline" size="sm" onClick={() => setSearch("")}>
                    Clear search
                  </Button>
                )}
                {effectiveCategory !== "all" && (
                  <Button variant="outline" size="sm" onClick={() => setActiveCategory("all")}>
                    Show all categories
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Accordion
              type="single"
              collapsible
              className="space-y-4"
              ref={containerRef}
            >
              {filtered.map((faq, index) => (
                <AccordionItem
                  key={faq.question}
                  value={faq.question}
                  className={cn(
                    "border border-border rounded-lg px-6 data-[state=open]:border-accent transition-all duration-500",
                    visibleItems[index]
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-6"
                  )}
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  <AccordionTrigger className="text-left font-serif text-lg font-semibold text-foreground hover:text-accent hover:no-underline py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          {/* Result count */}
          {filtered.length > 0 && (
            <p className="text-xs text-muted-foreground mt-6 text-center">
              Showing {filtered.length} of {faqs.length} questions
            </p>
          )}
        </div>
      </section>

      <ParallaxCTA
        title="Still Have Questions?"
        description="We're here to help. Reach out and we'll get back to you as soon as possible."
        backgroundImage={horseAction}
        primaryButtonText="Contact Us"
        primaryButtonLink="/contact"
        showPhoneButton={true}
      />
    </Layout>
  );
}
