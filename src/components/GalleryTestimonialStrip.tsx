import { Star, Quote } from "lucide-react";
import { Link } from "react-router-dom";

interface GalleryTestimonialProps {
  name: string;
  role: string;
  quote: string;
  rating: number;
}

export function GalleryTestimonialCard({ name, role, quote, rating }: GalleryTestimonialProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 transition-all hover:shadow-md">
      <div className="flex gap-0.5 mb-3">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 text-accent fill-accent" />
        ))}
      </div>
      <Quote className="h-5 w-5 text-accent/30 mb-2" />
      <blockquote className="font-serif text-sm text-foreground leading-relaxed line-clamp-4 italic mb-4">
        "{quote}"
      </blockquote>
      <div>
        <p className="text-sm font-medium text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{role}</p>
      </div>
    </div>
  );
}

export function GalleryTestimonialStrip({
  testimonials,
}: {
  testimonials: GalleryTestimonialProps[];
}) {
  if (testimonials.length === 0) return null;

  return (
    <div className="mt-12 pt-10 border-t border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm uppercase tracking-widest text-muted-foreground font-medium">
          What Our Clients Say
        </h3>
        <Link
          to="/testimonials"
          className="text-xs text-accent hover:text-accent/80 underline underline-offset-2 transition-colors"
        >
          View all testimonials →
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials.map((t, i) => (
          <GalleryTestimonialCard key={i} {...t} />
        ))}
      </div>
    </div>
  );
}
