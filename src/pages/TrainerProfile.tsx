import { useEffect, useMemo, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowRight, Star, Quote, ExternalLink, Award, CheckCircle2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionTransition } from "@/components/SectionTransition";
import { ParallaxCTA } from "@/components/ParallaxCTA";
import { TrainerVideoPlaylist } from "@/components/TrainerVideoPlaylist";
import { fetchMergedTestimonials, TRAINER_PROFILES, SERVICE_FILTERS, type TestimonialItem } from "@/lib/testimonials";
import { glennBrowitt, aboutCiro } from "@/data/content";
import ciroWithHorse from "@/assets/ciro-with-horse.png";

interface TrainerData {
  slug: string;
  name: string;
  title: string;
  portrait: string;
  bio: string[];
  specialties: string[];
  website?: string;
  yearsExperience?: number;
}

const TRAINERS: Record<string, TrainerData> = {
  "glenn-browitt": {
    slug: "glenn-browitt",
    name: glennBrowitt.name,
    title: glennBrowitt.title,
    portrait: TRAINER_PROFILES["Glenn Browitt"]?.portrait ?? "",
    bio: glennBrowitt.bio,
    specialties: glennBrowitt.specialties,
    website: glennBrowitt.website,
    yearsExperience: glennBrowitt.yearsExperience,
  },
  "ciro-postiglione": {
    slug: "ciro-postiglione",
    name: "Ciro Postiglione",
    title: aboutCiro.title,
    portrait: TRAINER_PROFILES["Ciro Postiglione"]?.portrait ?? "",
    bio: aboutCiro.bio,
    specialties: aboutCiro.values.map((v) => `${v.title} — ${v.description}`),
  },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < rating ? "text-accent fill-accent" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );
}

export default function TrainerProfile() {
  const { slug } = useParams<{ slug: string }>();
  const trainer = slug ? TRAINERS[slug] : undefined;
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMergedTestimonials().then((items) => {
      setTestimonials(items);
      setLoading(false);
    });
  }, []);

  const relatedTestimonials = useMemo(
    () => testimonials.filter((t) => t.trainer === trainer?.name),
    [testimonials, trainer]
  );

  const trainerVideos = useMemo(
    () => relatedTestimonials.filter((t) => t.mediaType === "video" && t.mediaUrl),
    [relatedTestimonials]
  );

  if (!trainer) return <Navigate to="/about" replace />;

  return (
    <Layout>
      <PageHeader title={trainer.name} description={trainer.title} />

      {/* Hero bio section */}
      <section className="section-padding bg-background">
        <div className="section-container">
          <div className="grid lg:grid-cols-3 gap-10 lg:gap-14 items-start">
            {/* Portrait column */}
            <SectionTransition variant="fade-up" className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="rounded-2xl overflow-hidden border border-border shadow-lg aspect-square">
                  <img
                    src={trainer.portrait}
                    alt={trainer.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-3">
                  <h2 className="font-serif text-xl text-foreground">{trainer.name}</h2>
                  <p className="text-sm text-muted-foreground">{trainer.title}</p>
                  {trainer.yearsExperience && (
                    <Badge variant="secondary" className="text-xs">
                      <Award className="h-3 w-3 mr-1" />
                      {trainer.yearsExperience}+ years experience
                    </Badge>
                  )}
                  {trainer.website && (
                    <a
                      href={trainer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Website
                    </a>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link to="/contact">
                      Book with {trainer.name.split(" ")[0]}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to={`/testimonials?trainer=${encodeURIComponent(trainer.name)}`}>
                      View all testimonials
                    </Link>
                  </Button>
                </div>
              </div>
            </SectionTransition>

            {/* Bio + specialties column */}
            <div className="lg:col-span-2 space-y-10">
              <SectionTransition variant="fade-up" delay={100}>
                <div className="space-y-5">
                  <h3 className="heading-section text-foreground">About {trainer.name.split(" ")[0]}</h3>
                  {trainer.bio.map((paragraph, i) => (
                    <p key={i} className="text-muted-foreground leading-relaxed">{paragraph}</p>
                  ))}
                </div>
              </SectionTransition>

              <SectionTransition variant="fade-up" delay={200}>
                <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
                  <h4 className="font-serif text-lg text-foreground mb-4">
                    {trainer.slug === "ciro-postiglione" ? "Core Values" : "Specialties"}
                  </h4>
                  <ul className="space-y-3">
                    {trainer.specialties.map((s, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </SectionTransition>
            </div>
          </div>
        </div>
      </section>

      {/* Video playlist */}
      {!loading && trainerVideos.length > 0 && (
        <TrainerVideoPlaylist videos={trainerVideos} trainerName={trainer.name} />
      )}

      {/* Related testimonials */}
      <section className="section-padding bg-card border-y border-border">
        <div className="section-container">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="w-16 h-0.5 bg-accent mx-auto mb-5" />
            <SectionTransition variant="fade-up">
              <h2 className="heading-section text-foreground">
                What Clients Say About {trainer.name.split(" ")[0]}
              </h2>
            </SectionTransition>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-background p-8 animate-pulse">
                  <div className="h-4 bg-muted rounded w-24 mb-6" />
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : relatedTestimonials.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No testimonials yet — check back soon.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {relatedTestimonials.map((t, i) => (
                <SectionTransition key={t.id} variant="fade-up" delay={i * 80}>
                  <article className="rounded-xl border border-border bg-background p-6 sm:p-8 flex flex-col h-full hover:border-accent/30 transition-colors">
                    <StarRating rating={t.rating} />
                    <div className="relative mt-4 flex-1">
                      <Quote className="absolute -top-1 -left-1 h-6 w-6 text-accent/15" />
                      <blockquote className="text-foreground leading-relaxed pl-4">
                        "{t.quote}"
                      </blockquote>
                    </div>
                    {t.serviceTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {t.serviceTags.map((tag) => {
                          const label = SERVICE_FILTERS.find((s) => s.id === tag)?.label ?? tag;
                          return <Badge key={tag} variant="secondary" className="text-[10px] font-medium">{label}</Badge>;
                        })}
                      </div>
                    )}
                    <div className="mt-6 pt-5 border-t border-border">
                      <p className="font-serif font-semibold text-foreground">{t.name}</p>
                      {t.role && <p className="text-sm text-muted-foreground mt-0.5">{t.role}</p>}
                    </div>
                  </article>
                </SectionTransition>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Other trainers */}
      <section className="section-padding bg-background">
        <div className="section-container">
          <div className="text-center mb-8">
            <h3 className="heading-section text-foreground">Meet the Team</h3>
          </div>
          <div className="grid sm:grid-cols-2 max-w-2xl mx-auto gap-6">
            {Object.values(TRAINERS)
              .filter((t) => t.slug !== trainer.slug)
              .map((other) => (
                <SectionTransition key={other.slug} variant="fade-up">
                  <Link
                    to={`/trainers/${other.slug}`}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 hover:border-accent/40 transition-colors group"
                  >
                    <img
                      src={other.portrait}
                      alt={other.name}
                      className="w-16 h-16 rounded-full object-cover border border-border"
                    />
                    <div>
                      <p className="font-serif font-semibold text-foreground group-hover:text-accent transition-colors">{other.name}</p>
                      <p className="text-sm text-muted-foreground">{other.title}</p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                  </Link>
                </SectionTransition>
              ))}
          </div>
        </div>
      </section>

      <ParallaxCTA
        title="Ready to Get Started?"
        description="Contact us to book a lesson, schedule a consultation, or learn more about our team."
        backgroundImage={ciroWithHorse}
        primaryButtonText="Get in Touch"
        primaryButtonLink="/contact"
        showPhoneButton={true}
      />
    </Layout>
  );
}
