import { X, Search } from "lucide-react";
import { projects, serviceFilters, locationFilters, quickTags } from "./galleryData";

interface GalleryFiltersProps {
  activeProject: string;
  setActiveProject: (id: string) => void;
  activeService: string;
  setActiveService: (id: string) => void;
  activeLocation: string;
  setActiveLocation: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | undefined>;
  activeFilterCount: number;
  clearAllFilters: () => void;
  imageCount: number;
  videoCount: number;
  totalCount: number;
}

export function GalleryFilters({
  activeProject,
  setActiveProject,
  activeService,
  setActiveService,
  activeLocation,
  setActiveLocation,
  searchQuery,
  setSearchQuery,
  searchInputRef,
  activeFilterCount,
  clearAllFilters,
  imageCount,
  videoCount,
  totalCount,
}: GalleryFiltersProps) {
  return (
    <div className="mb-8 space-y-5" role="search" aria-label="Gallery search and filters">
      {/* Search input */}
      <div className="relative max-w-lg mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
        <input
          ref={searchInputRef as React.RefObject<HTMLInputElement>}
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by project, service, or location… (press /)"
          className="w-full pl-11 pr-10 py-3 rounded-full border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all shadow-sm"
          aria-label="Search gallery by keyword"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Inline filter row */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        <div className="flex flex-wrap gap-1.5 items-center" role="radiogroup" aria-label="Filter by service type">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground mr-1 hidden sm:inline">Service</span>
          {serviceFilters.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveService(s.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeService === s.id
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20"
              }`}
              role="radio"
              aria-checked={activeService === s.id}
            >
              {s.name}
            </button>
          ))}
        </div>

        <span className="hidden sm:block w-px h-5 bg-border" aria-hidden="true" />

        <div className="flex flex-wrap gap-1.5 items-center" role="radiogroup" aria-label="Filter by location">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground mr-1 hidden sm:inline">Location</span>
          {locationFilters.map((l) => (
            <button
              key={l.id}
              onClick={() => setActiveLocation(l.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeLocation === l.id
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20"
              }`}
              role="radio"
              aria-checked={activeLocation === l.id}
            >
              {l.name}
            </button>
          ))}
        </div>

        {activeFilterCount > 0 && (
          <button onClick={clearAllFilters} className="text-xs text-accent hover:text-accent/80 underline underline-offset-2 transition-colors">
            Clear all
          </button>
        )}
      </div>

      {/* Quick Tag Chips */}
      <div className="flex flex-wrap gap-2 justify-center" role="group" aria-label="Quick filter tags">
        {quickTags.map((tag) => {
          const isActive =
            (tag.service !== "all" && activeService === tag.service && activeProject === "all") ||
            (tag.project !== "all" && activeProject === tag.project && activeService === "all");
          return (
            <button
              key={tag.label}
              onClick={() => {
                if (isActive) { setActiveService("all"); setActiveProject("all"); }
                else { setActiveService(tag.service); setActiveProject(tag.project); setActiveLocation("all"); }
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                isActive
                  ? "bg-accent text-accent-foreground border-accent shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:border-accent/40 hover:text-foreground"
              }`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

      {/* Project Filter Tabs */}
      <div className="flex flex-wrap gap-2 justify-center" role="tablist" aria-label="Filter by project">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => setActiveProject(project.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeProject === project.id
                ? "bg-accent text-accent-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
            role="tab"
            aria-selected={activeProject === project.id}
          >
            {project.name}
          </button>
        ))}
      </div>

      {/* Count */}
      <div className="text-center">
        {activeProject !== "all" && (
          <h2 className="font-serif text-2xl text-foreground">
            {projects.find((p) => p.id === activeProject)?.name || "All Projects"}
          </h2>
        )}
        <p className="text-muted-foreground text-sm mt-1" aria-live="polite">
          {totalCount === 0 ? "No results found" : (
            <>
              {imageCount > 0 && `${imageCount} photo${imageCount !== 1 ? "s" : ""}`}
              {imageCount > 0 && videoCount > 0 && " · "}
              {videoCount > 0 && `${videoCount} video${videoCount !== 1 ? "s" : ""}`}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
