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
      <div className="section-container py-20 sm:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14 lg:gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
              <img src={logoPeMark} alt="Peninsula Equine" className="h-8 w-8 object-contain" />
              <span className="font-serif text-sm font-semibold tracking-wide">
                Peninsula Equine
              </span>
            </Link>
            <p className="text-[hsl(var(--footer-muted))] text-sm leading-[1.8] max-w-xs mb-8">
              Engineered equine infrastructure — arenas, stables, ground systems, and rural builds designed for the horse.
            </p>
            <div className="flex gap-2">
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center border border-[hsl(var(--footer-muted))]/15 hover:border-[hsl(var(--footer-hover))] hover:text-[hsl(var(--footer-hover))] transition-all duration-500"
                aria-label="Instagram"
              >
                <Instagram className="h-3.5 w-3.5" />
              </a>
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center border border-[hsl(var(--footer-muted))]/15 hover:border-[hsl(var(--footer-hover))] hover:text-[hsl(var(--footer-hover))] transition-all duration-500"
                aria-label="Facebook"
              >
                <Facebook className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="text-[9px] font-sans font-semibold uppercase tracking-[0.25em] text-[hsl(var(--footer-foreground))]/70 mb-6">
              Navigate
            </h4>
            <ul className="space-y-3.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-[hsl(var(--footer-muted))] hover:text-[hsl(var(--footer-hover))] transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[9px] font-sans font-semibold uppercase tracking-[0.25em] text-[hsl(var(--footer-foreground))]/70 mb-6">
              Services
            </h4>
            <ul className="space-y-3.5">
              {serviceLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-[hsl(var(--footer-muted))] hover:text-[hsl(var(--footer-hover))] transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[9px] font-sans font-semibold uppercase tracking-[0.25em] text-[hsl(var(--footer-foreground))]/70 mb-6">
              Contact
            </h4>
            <ul className="space-y-3.5">
              <li>
                <a
                  href={`tel:${siteConfig.phone}`}
                  className="flex items-center gap-2.5 text-sm text-[hsl(var(--footer-muted))] hover:text-[hsl(var(--footer-hover))] transition-colors duration-300"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  {siteConfig.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="flex items-center gap-2.5 text-sm text-[hsl(var(--footer-muted))] hover:text-[hsl(var(--footer-hover))] transition-colors duration-300"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {siteConfig.email}
                </a>
              </li>
            </ul>
            <div className="mt-8">
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

      {/* Equus Ridge — Brand Seed */}
      <div className="border-t border-[hsl(var(--footer-foreground))]/5">
        <div className="section-container py-14 text-center">
          <p className="font-serif text-sm tracking-[0.12em] text-[hsl(var(--footer-muted))]/50">
            Equus Ridge&trade;
          </p>
          <p className="text-[10px] text-[hsl(var(--footer-muted))]/30 tracking-[0.1em] mt-2 font-sans">
            The home of Peninsula Equine &amp; Spin &amp; Spur Co.
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[hsl(var(--footer-foreground))]/5">
        <div className="section-container py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-[hsl(var(--footer-muted))]/60 tracking-wide">
            © {new Date().getFullYear()} Peninsula Equine. All rights reserved.
          </p>
          <p className="text-[10px] text-[hsl(var(--footer-muted))]/25 italic tracking-[0.1em]">
            Built properly. From the ground up.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-[10px] text-[hsl(var(--footer-muted))]/50 hover:text-[hsl(var(--footer-hover))] transition-colors duration-300">Privacy</Link>
            <Link to="/terms" className="text-[10px] text-[hsl(var(--footer-muted))]/50 hover:text-[hsl(var(--footer-hover))] transition-colors duration-300">Terms</Link>
            <Link to="/login" className="text-[10px] text-[hsl(var(--footer-muted))]/50 hover:text-[hsl(var(--footer-hover))] transition-colors duration-300">Staff</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
