import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { services } from "@/data/content";

const pages = [
  { title: "Home", href: "/", keywords: ["home", "landing"] },
  { title: "Services", href: "/services", keywords: ["services", "build", "construction"] },
  { title: "Boarding", href: "/boarding", keywords: ["boarding", "stabling", "horse care"] },
  { title: "About", href: "/about", keywords: ["about", "team", "ciro", "story"] },
  { title: "Gallery", href: "/gallery", keywords: ["gallery", "photos", "projects"] },
  { title: "The Forge", href: "/shop", keywords: ["shop", "forge", "products", "steel", "fabrication"] },
  { title: "Events", href: "/events", keywords: ["events", "clinics"] },
  { title: "FAQ", href: "/faq", keywords: ["faq", "questions", "help"] },
  { title: "Contact", href: "/contact", keywords: ["contact", "inquire", "quote"] },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const select = (href: string) => {
    setOpen(false);
    navigate(href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all
          bg-foreground/5 hover:bg-foreground/10 text-muted-foreground hover:text-foreground border border-border/50"
        aria-label="Search"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden xl:inline">Search</span>
        <kbd className="hidden xl:inline-flex h-5 items-center gap-0.5 rounded border border-border/60 bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search services, pages…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Services">
            {services.map((s) => (
              <CommandItem
                key={s.id}
                value={`${s.title} ${s.shortDescription}`}
                onSelect={() => select(`/services#${s.id}`)}
                className="flex flex-col items-start gap-0.5"
              >
                <span className="font-medium text-sm">{s.title}</span>
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {s.shortDescription} · {s.startingPrice}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Pages">
            {pages.map((p) => (
              <CommandItem
                key={p.href}
                value={`${p.title} ${p.keywords.join(" ")}`}
                onSelect={() => select(p.href)}
              >
                {p.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
