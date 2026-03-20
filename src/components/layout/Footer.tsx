import { Link } from "react-router-dom";
import { Phone, Mail, Instagram, Facebook, ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/data/content";
import logoPeMark from "@/assets/logo-pe-mark.png";

const quickLinks = [
  { name: "Projects", href: "/gallery" },
  { name: "Services", href: "/services" },
  { name: "GroundLock™", href: "/groundlock" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const serviceLinks = [
  { name: "Arenas", href: "/services" },
  { name: "Stables & Barns", href: "/services" },
  { name: "Ground Systems", href: "/groundlock" },
  { name: "Rural Infrastructure", href: "/services" },
  { name: "Design & Planning", href: "/services" },
];

export function Footer() {
  return (
    <footer className="bg-[hsl(var(--footer-bg))] text-[hsl(var(--footer-foreground))] relative">
      {/* Subtle top accent line */}
      <div className="divider-grid" />

      {/* Main Footer — generous breathing room */}
      <div className="section-container py-28 sm:py-36 lg:py-44">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-14">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3.5 mb-10 group">
              <img src={logoPeMark} alt="Peninsula Equine" className="h-8 w-8 object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="font-serif text-sm font-semibold tracking-[0.06em]">
                Peninsula Equine
              </span>
            </Link>
            <p className="text-[hsl(var(--footer-muted))] text-[13px] leading-[2] max-w-xs mb-12">
              Engineered equine infrastructure — arenas, stables, ground systems, and rural builds designed for the horse.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Instagram, href: siteConfig.social.instagram, label: "Instagram" },
                { icon: Facebook, href: siteConfig.social.facebook, label: "Facebook" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center border border-[hsl(var(--footer-muted))]/10 hover:border-accent/30 hover:text-accent transition-all duration-500"
                  aria-label={label}
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="text-[9px] font-sans font-semibold uppercase tracking-[0.35em] text-accent/50 mb-10">
              Navigate
            </h4>
            <ul className="space-y-5">
              {quickLinks.map((link) => (
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

          {/* Services */}
          <div>
            <h4 className="text-[9px] font-sans font-semibold uppercase tracking-[0.35em] text-accent/50 mb-10">
              Services
            </h4>
            <ul className="space-y-5">
              {serviceLinks.map((link) => (
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
            </ul>
            <div className="mt-12">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-accent/80 hover:text-accent transition-colors duration-500"
              >
                Request Assessment <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Equus Ridge — Brand Seed */}
      <div className="border-t border-border/10">
        <div className="section-container py-20 text-center">
          <p className="font-serif text-sm tracking-[0.15em] text-muted-foreground/40 italic">
            Equus Ridge&trade;
          </p>
          <p className="text-[10px] text-muted-foreground/20 tracking-[0.12em] mt-3 font-sans">
            The home of Peninsula Equine &amp; Spin &amp; Spur Co.
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/8">
        <div className="section-container py-8 flex flex-col sm:flex-row justify-between items-center gap-5">
          <p className="text-[10px] text-muted-foreground/40 tracking-wider">
            © {new Date().getFullYear()} Peninsula Equine. All rights reserved.
          </p>
          <p className="text-[10px] text-muted-foreground/20 italic tracking-[0.12em]">
            Built properly. From the ground up.
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
