import { useState, useEffect, useMemo } from "react";
import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle, Phone, Star, X, ZoomIn, ChevronLeft, ChevronRight, HelpCircle, Images, Calendar, MessageSquare } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { BlueprintScene } from "@/components/BlueprintScene";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StickySubpageCTA } from "@/components/StickySubpageCTA";
import { ServicePricingCalculator } from "@/components/ServicePricingCalculator";
import { ParallaxCTA } from "@/components/ParallaxCTA";
import { services, siteConfig } from "@/data/content";
import { servicePricingTiers, serviceFaqs } from "@/data/servicePricingFaq";
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { EditorialPlaceholder } from "@/components/EditorialPlaceholder";

// ── Approved cinematic asset library ────────────────────────────────────
// All legacy bright-daytime phone photos (covered-arena-finished-lit,
// aberdeen-*, main-ridge-* construction snaps, arena-sand-prep, sequence-*)
// have been removed. If a slot has no approved equivalent it renders an
// EditorialPlaceholder rather than an off-direction image.

// PE service hero / feature imagery
import peArenaGradingAsset from "@/assets/services-new/pe-arena-grading.png.asset.json";
import peFencingGateAsset from "@/assets/services-new/pe-fencing-hero-gate.png.asset.json";
import peGroundworksDozerAsset from "@/assets/services-new/pe-groundworks-dozer.png.asset.json";
import peCustomRuralPavilionAsset from "@/assets/services-new/pe-custom-rural-pavilion.png.asset.json";
import peCustomRuralFireplaceGrillAsset from "@/assets/services-new/pe-custom-rural-fireplace-grill.png.asset.json";
import peCustomRuralFireplaceHatAsset from "@/assets/services-new/pe-custom-rural-fireplace-hat.png.asset.json";

// Approved Aberdeen / stables
import aberdeenExteriorDuskAsset from "@/assets/uploads/approved-aberdeen-exterior-dusk-frontage.png.asset.json";
import aberdeenRiderStormAsset from "@/assets/uploads/approved-aberdeen-rider-exterior-storm.png.asset.json";
import aberdeenRoundPenSunsetAsset from "@/assets/uploads/approved-aberdeen-round-pen-sunset.png.asset.json";
import stableAisleWarmAsset from "@/assets/uploads/approved-stable-aisle-detail-warm-light.png.asset.json";
import stableStallSymmetricAsset from "@/assets/uploads/approved-stable-stall-interior-symmetric.png.asset.json";
import tackRoomJoineryAsset from "@/assets/uploads/approved-tack-room-joinery.png.asset.json";

// Approved covered arena
import coveredArenaInteriorNightAsset from "@/assets/covered-arenas/approved-covered-arena-interior-night.png.asset.json";
import coveredArenaInteriorDawnAsset from "@/assets/covered-arenas/approved-covered-arena-interior-construction-dawn.png.asset.json";
import coveredArenaExteriorDuskAsset from "@/assets/covered-arenas/approved-covered-arena-exterior-dusk.png.asset.json";
import timberKickboardAsset from "@/assets/covered-arenas/approved-timber-kickboard-detail.png.asset.json";

// Approved current build / field notes
import currentBuildSteelStormAsset from "@/assets/uploads/approved-current-build-steel-frame-storm.png.asset.json";
import currentBuildRainFrameAsset from "@/assets/uploads/approved-current-build-rain-frame-symmetry.png.asset.json";
import currentBuildEquipmentStormAsset from "@/assets/uploads/approved-current-build-equipment-storm.png.asset.json";
import muddyBootsSteelFrameAsset from "@/assets/field-notes/muddy-boots-steel-frame.png.asset.json";
import compArenaDozerStormAsset from "@/assets/field-notes/covered-competition-arena-dozer-storm-sky.png.asset.json";
import compArenaDrainageAsset from "@/assets/field-notes/covered-competition-arena-drainage-detail.png.asset.json";
import compArenaNightWorkAsset from "@/assets/field-notes/covered-competition-arena-night-work-lights.png.asset.json";
import compArenaSunsetPuddlesAsset from "@/assets/field-notes/covered-competition-arena-sunset-puddles.png.asset.json";
import compArenaTruckAccessAsset from "@/assets/field-notes/covered-competition-arena-truck-access-track.png.asset.json";

// Approved Main Ridge
import mrPavilionWideAsset from "@/assets/main-ridge/main-ridge-pavilion-wide-fireplace-table.png.asset.json";
import mrPavilionBrickAsset from "@/assets/main-ridge/main-ridge-pavilion-brick-fireplace-detail.png.asset.json";
import mrBeamDetailAsset from "@/assets/main-ridge/mr-beam-detail.png.asset.json";
import mrPendantBeamsAsset from "@/assets/main-ridge/mr-pendant-beams.png.asset.json";
import mrCustomTableAsset from "@/assets/main-ridge/mr-custom-table.png.asset.json";
import mrParrillaWideAsset from "@/assets/main-ridge/mr-parrilla-wide.png.asset.json";
import mrParrillaGrillAsset from "@/assets/main-ridge/mr-parrilla-grill.png.asset.json";

// URL helpers
const peArenaGrading = peArenaGradingAsset.url;
const peFencingGate = peFencingGateAsset.url;
const peGroundworksDozer = peGroundworksDozerAsset.url;
const peCustomRuralPavilion = peCustomRuralPavilionAsset.url;
const peCustomRuralFireplaceGrill = peCustomRuralFireplaceGrillAsset.url;
const peCustomRuralFireplaceHat = peCustomRuralFireplaceHatAsset.url;

const aberdeenExteriorDusk = aberdeenExteriorDuskAsset.url;
const aberdeenRiderStorm = aberdeenRiderStormAsset.url;
const aberdeenRoundPenSunset = aberdeenRoundPenSunsetAsset.url;
const stableAisleWarm = stableAisleWarmAsset.url;
const stableStallSymmetric = stableStallSymmetricAsset.url;
const tackRoomJoinery = tackRoomJoineryAsset.url;

const coveredArenaInteriorNight = coveredArenaInteriorNightAsset.url;
const coveredArenaInteriorDawn = coveredArenaInteriorDawnAsset.url;
const coveredArenaExteriorDusk = coveredArenaExteriorDuskAsset.url;
const timberKickboard = timberKickboardAsset.url;

const currentBuildSteelStorm = currentBuildSteelStormAsset.url;
const currentBuildRainFrame = currentBuildRainFrameAsset.url;
const currentBuildEquipmentStorm = currentBuildEquipmentStormAsset.url;
const muddyBootsSteelFrame = muddyBootsSteelFrameAsset.url;
const compArenaDozerStorm = compArenaDozerStormAsset.url;
const compArenaDrainage = compArenaDrainageAsset.url;
const compArenaNightWork = compArenaNightWorkAsset.url;
const compArenaSunsetPuddles = compArenaSunsetPuddlesAsset.url;
const compArenaTruckAccess = compArenaTruckAccessAsset.url;

const mrPavilionWide = mrPavilionWideAsset.url;
const mrPavilionBrick = mrPavilionBrickAsset.url;
const mrBeamDetail = mrBeamDetailAsset.url;
const mrPendantBeams = mrPendantBeamsAsset.url;
const mrCustomTable = mrCustomTableAsset.url;
const mrParrillaWide = mrParrillaWideAsset.url;
const mrParrillaGrill = mrParrillaGrillAsset.url;

// ── Types ───────────────────────────────────────────────────────────────
type PlaceholderSpec = { code: string; label: string };
type GalleryEntry = { src?: string; placeholder?: PlaceholderSpec; caption: string };
type ProcessStep = {
  title: string;
  description: string;
  image?: string;
  placeholder?: PlaceholderSpec;
};

// ── Primary image per service ───────────────────────────────────────────
const serviceImages: Record<string, string> = {
  "arena-construction": peArenaGrading,
  "barn-construction": aberdeenExteriorDusk,
  "fencing": peFencingGate,
  "infrastructure": peGroundworksDozer,
  "round-pens": aberdeenRoundPenSunset,
  "renovations": peCustomRuralFireplaceGrill,
  "full-facility": peCustomRuralPavilion,
  "clinics-events": mrPavilionWide,
};

// ── Gallery (approved cinematic only; placeholders for empty slots) ─────
const serviceGalleryImages: Record<string, GalleryEntry[]> = {
  "arena-construction": [
    { src: peArenaGrading, caption: "Laser-graded arena base" },
    { src: coveredArenaInteriorNight, caption: "Covered arena interior, night" },
    { src: coveredArenaInteriorDawn, caption: "Interior construction, dawn" },
    { src: compArenaDrainage, caption: "Subsurface drainage detail" },
    { src: compArenaSunsetPuddles, caption: "Surface integrity after rain" },
    { src: timberKickboard, caption: "Timber kickboard detail" },
  ],
  "barn-construction": [
    { src: aberdeenExteriorDusk, caption: "Aberdeen stables — dusk frontage" },
    { src: stableAisleWarm, caption: "Stable aisle, warm light" },
    { src: stableStallSymmetric, caption: "Stall interior, symmetric" },
    { src: tackRoomJoinery, caption: "Tack room joinery" },
    { src: currentBuildSteelStorm, caption: "Steel frame, storm sky" },
  ],
  "fencing": [
    { src: peFencingGate, caption: "Engineered gate and post-and-rail run" },
    { src: aberdeenExteriorDusk, caption: "Perimeter and frontage" },
    {
      placeholder: { code: "PE / FNC-03", label: "Engineered paddock fencing — cinematic detail to come" },
      caption: "Paddock perimeter, detail",
    },
  ],
  "infrastructure": [
    { src: peGroundworksDozer, caption: "Bulk earthworks and site shaping" },
    { src: compArenaDozerStorm, caption: "Heavy plant, storm sky" },
    { src: compArenaDrainage, caption: "Drainage cut and base course" },
    { src: compArenaTruckAccess, caption: "Truck access and haul route" },
    { src: muddyBootsSteelFrame, caption: "On-site, steel frame underway" },
  ],
  "round-pens": [
    { src: aberdeenRoundPenSunset, caption: "Round pen, Aberdeen — sunset" },
    {
      placeholder: { code: "PE / RP-02", label: "Round pen slab at sunrise — approved capture pending" },
      caption: "Slab and footing prep",
    },
    {
      placeholder: { code: "PE / RP-03", label: "Round pen twilight — approved capture pending" },
      caption: "Pen at twilight",
    },
  ],
  "renovations": [
    { src: peCustomRuralFireplaceHat, caption: "Fireplace detail, custom rural build" },
    { src: peCustomRuralPavilion, caption: "Custom rural pavilion" },
    { src: mrBeamDetail, caption: "Reclaimed beam detail" },
    { src: mrPendantBeams, caption: "Pendant lighting on exposed beams" },
    { src: mrCustomTable, caption: "Custom table, in situ" },
  ],
  "full-facility": [
    { src: peCustomRuralPavilion, caption: "Bespoke entertaining pavilion" },
    { src: mrPavilionWide, caption: "Pavilion wide, fireplace and table" },
    { src: mrParrillaWide, caption: "Parrilla, wide" },
    { src: mrParrillaGrill, caption: "Parrilla grill detail" },
    { src: aberdeenExteriorDusk, caption: "Aberdeen frontage at dusk" },
  ],
  "clinics-events": [
    { src: mrPavilionWide, caption: "Pavilion gathering space" },
    { src: mrPavilionBrick, caption: "Brick fireplace, detail" },
    { src: coveredArenaInteriorNight, caption: "Covered arena, night session" },
    { src: compArenaNightWork, caption: "Night work lights, competition arena" },
  ],
};

// ── Construction Process (approved field-notes / current-build set) ─────
const constructionSteps: ProcessStep[] = [
  { image: compArenaTruckAccess, title: "Site Preparation", description: "Access tracks, haul routes and site shaping" },
  { image: compArenaDrainage, title: "Drainage & Base", description: "Subsurface drainage cut and base course" },
  { image: muddyBootsSteelFrame, title: "On-Site Build-Up", description: "Boots on the ground as the frame rises" },
  { image: currentBuildRainFrame, title: "Frame Symmetry", description: "Frame set true through rain and storm" },
  { image: currentBuildSteelStorm, title: "Steel Frame", description: "Primary steel under a working sky" },
  { image: currentBuildEquipmentStorm, title: "Plant & Equipment", description: "Heavy equipment staged on site" },
  { image: compArenaDozerStorm, title: "Heavy Earthworks", description: "Dozer work under a storm sky" },
  { image: coveredArenaInteriorDawn, title: "Interior Completion", description: "Covered arena interior at dawn" },
];


/* ── Gallery Lightbox ──────────────────────────────────── */

function GalleryLightbox({
  images,
  serviceTitle,
  onClose,
}: {
  images: GalleryEntry[];
  serviceTitle: string;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setCurrentIndex((p) => (p + 1) % images.length);
      if (e.key === "ArrowLeft") setCurrentIndex((p) => (p - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [images.length, onClose]);

  if (!images.length) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-primary/95 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-4xl mx-4" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-12 right-0 text-primary-foreground/70 hover:text-primary-foreground transition-colors" aria-label="Close gallery">
          <X className="h-6 w-6" />
        </button>

        <div className="text-center mb-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent mb-1">Gallery</p>
          <h3 className="font-serif text-xl text-primary-foreground">{serviceTitle}</h3>
        </div>

        <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-primary/50">
          {images[currentIndex].src ? (
            <img
              src={images[currentIndex].src}
              alt={images[currentIndex].caption}
              className="w-full h-full object-cover img-feature transition-opacity duration-300"
            />
          ) : (
            <EditorialPlaceholder
              aspect="16/10"
              code={images[currentIndex].placeholder?.code ?? "PE / IMG"}
              label={images[currentIndex].placeholder?.label ?? images[currentIndex].caption}
              className="w-full h-full"
            />
          )}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-primary/80 to-transparent p-4">
            <p className="text-sm text-primary-foreground/90">{images[currentIndex].caption}</p>
            <p className="text-xs text-primary-foreground/50 mt-1">{currentIndex + 1} / {images.length}</p>
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentIndex((p) => (p - 1 + images.length) % images.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-primary/60 text-primary-foreground/80 hover:bg-primary/80 flex items-center justify-center transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentIndex((p) => (p + 1) % images.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-primary/60 text-primary-foreground/80 hover:bg-primary/80 flex items-center justify-center transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 mt-3 justify-center overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`shrink-0 w-14 h-14 rounded-md overflow-hidden transition-all duration-300 ${
                  i === currentIndex
                    ? "ring-2 ring-accent ring-offset-2 ring-offset-primary scale-105"
                    : "opacity-50 hover:opacity-100"
                }`}
              >
                {img.src ? (
                  <img src={img.src} alt={img.caption} className="w-full h-full object-cover"  loading="lazy" decoding="async" />
                ) : (
                  <EditorialPlaceholder aspect="1/1" code={img.placeholder?.code ?? "PE / IMG"} label={img.caption} className="w-full h-full" />
                )}
              </button>
            ))}
          </div>
        )}

        <p className="text-primary-foreground/40 text-xs mt-3 text-center">
          <span className="hidden sm:inline">← → to navigate • Esc to close</span>
          <span className="sm:hidden">Swipe to navigate • Tap outside to close</span>
        </p>
      </div>
    </div>
  );
}

/* ── Construction Process ──────────────────────────────── */

function ConstructionProcess() {
  const { containerRef, visibleItems } = useStaggeredAnimation(constructionSteps.length);
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="section-padding bg-card">
      <div className="section-container">
        <div
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-12 transition-all duration-700 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className={`w-16 h-0.5 bg-accent mx-auto mb-6 transition-all duration-500 delay-100 ${
            headerVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
          }`} />
          <h2 className="heading-section text-foreground mb-4">Our Construction Process</h2>
          <p className="text-muted-foreground">
            Quality equine facilities don't happen by accident. Here's a behind-the-scenes
            look at how we bring your vision to life.
          </p>
        </div>

        <div ref={containerRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {constructionSteps.map((step, index) => (
            <div
              key={index}
              className={`group text-left rounded-lg transition-all duration-700 ${
                visibleItems[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-3 relative">
                {step.image ? (
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <EditorialPlaceholder
                    aspect="1/1"
                    code={step.placeholder?.code ?? "PE / PROC"}
                    label={step.placeholder?.label ?? step.title}
                  />
                )}
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-xs font-semibold text-accent">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-serif font-semibold text-foreground text-sm group-hover:text-accent transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Service Detail Page ───────────────────────────────── */

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const service = services.find((s) => s.id === slug);
  const [showGallery, setShowGallery] = useState(false);

  if (!service) return <Navigate to="/services" replace />;

  const tiers = servicePricingTiers[service.id] || [];
  const faqs = serviceFaqs[service.id] || [];
  const galleryImages = serviceGalleryImages[service.id] || [];
  const heroImage = serviceImages[service.id] || peArenaGrading;

  // Find adjacent services for navigation
  const currentIndex = services.findIndex((s) => s.id === slug);
  const prevService = currentIndex > 0 ? services[currentIndex - 1] : null;
  const nextService = currentIndex < services.length - 1 ? services[currentIndex + 1] : null;

  return (
    <Layout>
      <div className="type-architectural">
      <StickySubpageCTA
        ctaLabel="Discuss Project"
        ctaIcon={<Phone className="h-4 w-4" />}
        onCtaClick={() => (window.location.href = `/contact?services=${service.id}`)}
      />

      <PageHeader
        title={service.title}
        description={service.shortDescription}
      />

      {/* Breadcrumb + back */}
      <section className="bg-background border-b border-border">
        <div className="section-container py-4 flex items-center justify-between">
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Services
          </Link>
          {galleryImages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGallery(true)}
              className="text-accent hover:text-accent/80"
            >
              <Images className="mr-1.5 h-4 w-4" />
              View Gallery ({galleryImages.length})
            </Button>
          )}
        </div>
      </section>

      {/* Hero image + description */}
      <section className="section-padding bg-background relative overflow-hidden">
        <BlueprintScene preset="barn" />
        <div className="section-container relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium mb-3">
                What We Offer
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-6">
                {service.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg mb-8">
                {service.description}
              </p>

              <ul className="grid sm:grid-cols-2 gap-3">
                {service.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-foreground text-sm">
                    <CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
              <img
                src={heroImage}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing tiers */}
      {tiers.length > 0 && (
        <section className="section-padding bg-card relative overflow-hidden">
          {/* Subtle background accent */}
          <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.02] via-transparent to-accent/[0.02] pointer-events-none" />
          <div className="section-container max-w-5xl relative z-10">
            <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium mb-3 text-center">
              Pricing
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-2 text-center">
              Choose Your Package
            </h2>
            <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
              Every project is unique — these tiers give you a starting point. We'll customise to your exact needs.
            </p>

            <div className="grid sm:grid-cols-3 gap-6 items-stretch">
              {tiers.map((tier, idx) => (
                <div
                  key={tier.name}
                  className={cn(
                    "relative rounded-xl flex flex-col transition-all duration-300 hover:-translate-y-1",
                    tier.popular
                      ? "shadow-xl ring-2 ring-accent"
                      : "shadow-md border border-border hover:shadow-lg"
                  )}
                >
                  {/* Tier header band */}
                  <div className={cn(
                    "rounded-t-xl px-6 py-4",
                    tier.popular
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted/50 text-foreground"
                  )}>
                    {tier.popular && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider mb-1">
                        <Star className="h-3 w-3" /> Most Popular
                      </span>
                    )}
                    <h3 className="font-serif text-lg font-semibold">{tier.name}</h3>
                    <p className={cn(
                      "text-3xl font-bold mt-1",
                      tier.popular ? "text-accent-foreground" : "text-accent"
                    )}>
                      {tier.price}
                    </p>
                  </div>

                  {/* Tier body */}
                  <div className="bg-background rounded-b-xl px-6 py-5 flex flex-col flex-1">
                    <p className="text-sm text-muted-foreground mb-5">{tier.description}</p>

                    <ul className="space-y-2.5 mb-6 flex-1">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                          <CheckCircle className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Button
                      asChild
                      variant={tier.popular ? "default" : "outline"}
                      className={cn(
                        "w-full",
                        tier.popular && "bg-accent text-accent-foreground hover:bg-accent/90"
                      )}
                    >
                      <Link to={`/contact?services=${service.id}&ref=tier-${tier.name.toLowerCase()}`}>
                        Discuss Project <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing calculator */}
      <section className="section-padding bg-background">
        <div className="section-container">
          <ServicePricingCalculator serviceId={service.id} />
        </div>
      </section>

      {/* Gallery grid */}
      {galleryImages.length > 0 && (
        <section className="section-padding bg-card">
          <div className="section-container">
            <div className="text-center mb-8">
              <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium mb-3">
                Project Gallery
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl text-foreground">
                {service.title} in Action
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setShowGallery(true)}
                  className="group aspect-[4/3] rounded-lg overflow-hidden relative"
                >
                  <img
                    src={img.src}
                    alt={img.caption}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors flex items-center justify-center">
                    <ZoomIn className="h-6 w-6 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/70 to-transparent p-2 text-[11px] text-primary-foreground/80">
                    {img.caption}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Construction process (shown for build-related services) */}
      {["arena-construction", "barn-construction", "full-facility", "infrastructure"].includes(service.id) && (
        <ConstructionProcess />
      )}

      {/* FAQs */}
      {faqs.length > 0 && (
        <section className="section-padding bg-background">
          <div className="section-container max-w-3xl">
            <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium mb-3 text-center">
              Common Questions
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-8 text-center">
              {service.title} FAQ
            </h2>

            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="rounded-lg border border-border bg-card px-5"
                >
                  <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-10 rounded-xl border border-accent/20 bg-accent/5 p-6 sm:p-8 text-center">
              <p className="font-serif text-lg font-semibold text-foreground mb-2">
                Still have questions about {service.title.toLowerCase()}?
              </p>
              <p className="text-sm text-muted-foreground mb-5">
                Send us a quick message and we'll get back to you within 1–2 business days.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to={`/contact?services=${service.id}&ref=faq`}>
                    Ask a Question <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <a href={`tel:${siteConfig.phone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call Us
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Dual CTA: Book a Lesson or Consultation */}
      <section className="section-padding bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.03] to-transparent pointer-events-none" />
        <div className="section-container max-w-4xl relative z-10">
          <div className="text-center mb-10">
            <p className="text-accent uppercase tracking-[0.2em] text-xs font-medium mb-3">
              Next Steps
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-3">
              Ready to Move Forward?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Whether you're exploring riding lessons or planning a build, we're here to help.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Book a Lesson */}
            <div className="rounded-xl border border-accent/20 bg-card p-6 sm:p-8 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">Book a Lesson</h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Experience our facilities firsthand with a riding lesson. 50% deposit secures your spot.
              </p>
              <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/lessons">
                  <Calendar className="mr-2 h-4 w-4" />
                  Browse Lessons
                </Link>
              </Button>
            </div>

            {/* Book a Consultation */}
            <div className="rounded-xl border border-border bg-card p-6 sm:p-8 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">Free Consultation</h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Tell us about your project and receive a personalised quote within 1–2 business days.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to={`/contact?services=${service.id}&ref=consult-cta`}>
                  <Phone className="mr-2 h-4 w-4" />
                  Request a Consult
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Adjacent service navigation */}
      <section className="bg-card border-t border-border">
        <div className="section-container py-6">
          <div className="flex items-center justify-between">
            {prevService ? (
              <Link
                to={`/services/${prevService.id}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{prevService.title}</span>
                <span className="sm:hidden">Previous</span>
              </Link>
            ) : <div />}
            {nextService ? (
              <Link
                to={`/services/${nextService.id}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                <span className="hidden sm:inline">{nextService.title}</span>
                <span className="sm:hidden">Next</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : <div />}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <ParallaxCTA
        title="Ready to Start a Project?"
        description="Tell us about your project and we'll prepare a personalised quote within 1–2 business days."
        backgroundImage={currentBuildSteelStorm}
        primaryButtonText="Discuss Project"
        primaryButtonLink={`/contact?services=${service.id}`}
        showPhoneButton={true}
      />

      {/* Gallery Lightbox */}
      {showGallery && galleryImages.length > 0 && (
        <GalleryLightbox
          images={galleryImages}
          serviceTitle={service.title}
          onClose={() => setShowGallery(false)}
        />
      )}
      </div>
    </Layout>
  );
}
