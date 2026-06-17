import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    document.title = "Page Not Found — Peninsula Equine";
  }, [location.pathname]);

  return (
    <Layout>
      <section className="relative min-h-[80vh] flex items-center justify-center bg-background overflow-hidden">
        {/* Subtle architectural grid backdrop */}
        <div className="absolute inset-0 engineering-grid opacity-[0.04] pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          {/* Overline */}
          <p className="font-mono uppercase text-accent/55 text-[10px] tracking-[0.5em] mb-10">
            404 — Off the plan
          </p>

          {/* Heading */}
          <h1 className="font-serif text-foreground/90 leading-[1.05] tracking-[-0.02em] text-[clamp(2rem,1.25rem+3vw,3.25rem)] mb-6">
            This page isn't built.
          </h1>

          {/* Body */}
          <p className="font-sans font-light text-foreground/55 leading-[1.85] text-[14px] max-w-md mx-auto mb-14">
            The route you followed doesn't lead anywhere on the estate.
            Step back to the homepage, or speak with us directly.
          </p>

          {/* Hairline divider */}
          <span className="block mx-auto w-10 h-px bg-accent/40 mb-12" aria-hidden="true" />

          {/* Minimal text-link CTAs */}
          <div className="flex flex-col sm:flex-row gap-[clamp(1.75rem,1rem+2vw,3.5rem)] justify-center items-center">
            <Link
              to="/"
              className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/70 hover:text-foreground transition-colors duration-500 text-[11px] tracking-[0.4em]"
            >
              <span className="w-6 h-px bg-accent/50 transition-all duration-700 group-hover:w-12 group-hover:bg-accent" />
              Return Home
            </Link>
            <Link
              to="/contact"
              className="group inline-flex items-center gap-3 font-mono uppercase text-foreground/40 hover:text-foreground/80 transition-colors duration-500 text-[11px] tracking-[0.4em]"
            >
              Speak With Us
              <span className="w-6 h-px bg-foreground/20 transition-all duration-700 group-hover:w-12 group-hover:bg-foreground/60" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
