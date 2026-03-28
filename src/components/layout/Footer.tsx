import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Instagram, Facebook, ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/data/content";
import logoPeMark from "@/assets/logo-pe-mark.webp";

const navLinks = [
  { name: "Projects", href: "/gallery" },
  { name: "GroundLock™", href: "/groundlock" },
  { name: "GroundLock Systems", href: "/forge" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const ecosystemLinks = [
  { name: "Equus Ridge", desc: "Destination" },
  { name: "Spin & Spur", desc: "Lifestyle" },
];

export function Footer() {
  return (
    <footer className="bg-[hsl(var(--footer-bg))] text-[hsl(var(--footer-foreground))] relative">
      {/* Subtle top accent line */}
      <div className="divider-grid" />

      {/* Main Footer */}
      <div className="section-container py-28 sm:py-36 lg:py-44">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-20">

          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-3.5 mb-10 group">
              <img
                src={logoPeMark}
                alt="Peninsula Equine"
                className="h-8 w-8 object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-500"
              />
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
              {navLinks.map((link) => (
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
                Discuss Project <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Ecosystem */}
      <div className="border-t border-border/10">
        <div className="section-container py-16 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
          {ecosystemLinks.map((link) => (
            <div key={link.name} className="text-center">
              <p className="font-serif text-sm tracking-[0.15em] text-muted-foreground/40 italic">
                {link.name}
              </p>
              <p className="text-[10px] text-muted-foreground/20 tracking-[0.12em] mt-2 font-sans">
                {link.desc}
              </p>
            </div>
          ))}
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
