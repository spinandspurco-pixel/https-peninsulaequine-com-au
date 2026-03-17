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
    <footer className="bg-[hsl(var(--footer-bg))] text-[hsl(var(--footer-foreground))]">
      {/* Main Footer */}
      <div className="section-container py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3 mb-5 group">
              <img src={logoPeMark} alt="Peninsula Equine" className="h-8 w-8 object-contain" />
              <span className="font-serif text-sm font-semibold tracking-wide">
                Peninsula Equine
              </span>
            </Link>
            <p className="text-[hsl(var(--footer-muted))] text-sm leading-relaxed max-w-xs mb-6">
              Engineered equine infrastructure. Arenas, stables, ground systems, and rural builds — designed for the horse, built for generations.
            </p>
            <div className="flex gap-2">
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center border border-[hsl(var(--footer-muted))]/20 hover:border-[hsl(var(--footer-hover))] hover:text-[hsl(var(--footer-hover))] transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="h-3.5 w-3.5" />
              </a>
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center border border-[hsl(var(--footer-muted))]/20 hover:border-[hsl(var(--footer-hover))] hover:text-[hsl(var(--footer-hover))] transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-[hsl(var(--footer-foreground))] mb-5">
              Navigate
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-[hsl(var(--footer-muted))] hover:text-[hsl(var(--footer-hover))] transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-[hsl(var(--footer-foreground))] mb-5">
              Services
            </h4>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-[hsl(var(--footer-muted))] hover:text-[hsl(var(--footer-hover))] transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-[hsl(var(--footer-foreground))] mb-5">
              Contact
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={`tel:${siteConfig.phone}`}
                  className="flex items-center gap-2.5 text-sm text-[hsl(var(--footer-muted))] hover:text-[hsl(var(--footer-hover))] transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  {siteConfig.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="flex items-center gap-2.5 text-sm text-[hsl(var(--footer-muted))] hover:text-[hsl(var(--footer-hover))] transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {siteConfig.email}
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <Link
                to="/contact"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] font-medium text-[hsl(var(--footer-hover))] hover:underline"
              >
                Book Assessment <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Seed */}
      <div className="border-t border-[hsl(var(--footer-foreground))]/6">
        <div className="section-container py-8 text-center">
          <p className="text-[11px] font-serif tracking-[0.15em] text-[hsl(var(--footer-muted))]/60">
            Equus Ridge
          </p>
          <p className="text-[9px] text-[hsl(var(--footer-muted))]/35 tracking-wide mt-1">
            Home of Peninsula Equine &amp; Spin &amp; Spur Co.
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[hsl(var(--footer-foreground))]/8">
        <div className="section-container py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[10px] text-[hsl(var(--footer-muted))] tracking-wide">
            © {new Date().getFullYear()} Peninsula Equine. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-[10px] text-[hsl(var(--footer-muted))] hover:text-[hsl(var(--footer-hover))] transition-colors">Privacy</Link>
            <Link to="/terms" className="text-[10px] text-[hsl(var(--footer-muted))] hover:text-[hsl(var(--footer-hover))] transition-colors">Terms</Link>
            <Link to="/login" className="text-[10px] text-[hsl(var(--footer-muted))] hover:text-[hsl(var(--footer-hover))] transition-colors">Staff</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
