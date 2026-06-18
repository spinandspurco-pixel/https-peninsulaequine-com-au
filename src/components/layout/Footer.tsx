import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Instagram, Facebook, ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/data/content";
import logoPeMark from "@/assets/logo-pe-mark.webp";

const capabilityLinks = [
  { name: "Covered Arenas", href: "/arenas" },
  { name: "Stables & Barns", href: "/stables" },
  { name: "Pavilions & Rural Builds", href: "/equine-estates" },
  { name: "Equine Infrastructure", href: "/infrastructure" },
  { name: "LumenArc", href: "/lumenarc" },
];

const studioLinks = [
  { name: "Selected Works", href: "/gallery" },
  { name: "Field Notes", href: "/field-notes" },
  { name: "The Standard", href: "/the-standard" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];


export function Footer() {
  return (
    <footer className="bg-[hsl(var(--footer-bg))] text-[hsl(var(--footer-foreground))] relative">
      <div className="divider-grid" />

      <div className="section-container py-16 sm:py-24 lg:py-32">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 sm:gap-12 lg:gap-20">

          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3.5 mb-6 sm:mb-10 group">
              <img
                src={logoPeMark}
                alt="Peninsula Equine"
                className="h-8 w-8 object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                loading="lazy"
                decoding="async"
              />

              <span className="font-serif text-sm font-semibold tracking-[0.06em]">
                Peninsula Equine
              </span>
            </Link>
            <p className="text-[hsl(var(--footer-muted))] text-[13px] leading-[1.85] max-w-xs mb-8 sm:mb-12">
              Covered arenas, stables and premium equine environments — built by riders, crafted for performance.
            </p>
            <div className="flex gap-5">
              {[
                { icon: Instagram, href: siteConfig.social.instagram, label: "Instagram" },
                { icon: Facebook, href: siteConfig.social.facebook, label: "Facebook" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[hsl(var(--footer-muted))]/40 hover:text-accent/60 transition-colors duration-500"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <h4 className="text-[9px] font-sans font-semibold uppercase tracking-[0.35em] text-accent/50 mb-10">
              Capabilities
            </h4>
            <ul className="space-y-5">
              {capabilityLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-[13px] text-[hsl(var(--footer-muted))] hover:text-accent transition-colors duration-500"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio */}
          <div>
            <h4 className="text-[9px] font-sans font-semibold uppercase tracking-[0.35em] text-accent/50 mb-10">
              Studio
            </h4>
            <ul className="space-y-5">
              {studioLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-[13px] text-[hsl(var(--footer-muted))] hover:text-accent transition-colors duration-500"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[9px] font-sans font-semibold uppercase tracking-[0.35em] text-accent/50 mb-10">
              Contact
            </h4>
            <ul className="space-y-5">
              <li>
                <a
                  href={`tel:${siteConfig.phone}`}
                  className="flex items-center gap-3 text-[13px] text-[hsl(var(--footer-muted))] hover:text-accent transition-colors duration-500"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  {siteConfig.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="flex items-center gap-3 text-[13px] text-[hsl(var(--footer-muted))] hover:text-accent transition-colors duration-500"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {siteConfig.email}
                </a>
              </li>
              <li>
                <span className="flex items-center gap-3 text-[13px] text-[hsl(var(--footer-muted))]">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  Mornington Peninsula, VIC
                </span>
              </li>
            </ul>
            <div className="mt-12">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-accent/80 hover:text-accent transition-colors duration-500"
              >
                Apply to Build <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/8">
        <div className="section-container py-8 flex flex-col sm:flex-row justify-between items-center gap-5">
          <p className="text-[10px] text-muted-foreground/40 tracking-wider">
            © {new Date().getFullYear()} Peninsula Equine. All rights reserved.
          </p>
          <p className="text-[10px] text-muted-foreground/20 italic tracking-[0.12em]">
            From Dirt to Dynasty.
          </p>
          <div className="flex gap-8">
            <Link to="/privacy" className="text-[10px] text-muted-foreground/30 hover:text-accent/60 transition-colors duration-500">Privacy</Link>
            <Link to="/terms" className="text-[10px] text-muted-foreground/30 hover:text-accent/60 transition-colors duration-500">Terms</Link>
            <Link to="/login" className="text-[10px] text-muted-foreground/30 hover:text-accent/60 transition-colors duration-500">Staff</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
