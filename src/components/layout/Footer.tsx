import { Link } from "react-router-dom";
import { Phone, Mail, Instagram, Facebook } from "lucide-react";
import { siteConfig } from "@/data/content";
import logoPeMark from "@/assets/logo-pe-mark.png";

export function Footer() {
  return (
    <footer className="bg-[hsl(var(--footer-bg))] text-[hsl(var(--footer-foreground))]">
      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
              <img src={logoPeMark} alt="Peninsula Equine" className="h-9 w-9 object-contain" />
              <span className="font-sans text-xs font-semibold tracking-[0.2em] uppercase">
                Peninsula<span className="text-[hsl(var(--footer-hover))]"> Equine</span>
              </span>
            </Link>
            <p className="text-[hsl(var(--footer-muted))] text-sm leading-relaxed max-w-xs">
              World-class equine construction. From dirt to dynasty.
            </p>
            <div className="flex gap-3 mt-4">
              <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[hsl(var(--footer-foreground))]/10 hover:bg-[hsl(var(--footer-hover))] transition-colors" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a href={siteConfig.social.facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[hsl(var(--footer-foreground))]/10 hover:bg-[hsl(var(--footer-hover))] transition-colors" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] mb-4 text-[hsl(var(--footer-foreground))]">Navigate</h4>
            <ul className="space-y-2">
              {[
                { name: "Services", href: "/services" },
                { name: "Portfolio", href: "/gallery" },
                { name: "The Forge", href: "/shop" },
                { name: "About", href: "/about" },
                { name: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-[hsl(var(--footer-muted))] hover:text-[hsl(var(--footer-hover))] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] mb-4 text-[hsl(var(--footer-foreground))]">Contact</h4>
            <ul className="space-y-2.5">
              <li>
                <a href={`tel:${siteConfig.phone}`} className="flex items-center gap-2 text-sm text-[hsl(var(--footer-muted))] hover:text-[hsl(var(--footer-hover))] transition-colors">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  {siteConfig.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-2 text-sm text-[hsl(var(--footer-muted))] hover:text-[hsl(var(--footer-hover))] transition-colors">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {siteConfig.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-[hsl(var(--footer-foreground))]/10 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[10px] text-[hsl(var(--footer-muted))] tracking-wide">
            © {new Date().getFullYear()} Peninsula Equine. All rights reserved.
          </p>
          <div className="flex gap-5">
            <Link to="/privacy" className="text-[10px] text-[hsl(var(--footer-muted))] hover:text-[hsl(var(--footer-hover))] transition-colors">Privacy</Link>
            <Link to="/terms" className="text-[10px] text-[hsl(var(--footer-muted))] hover:text-[hsl(var(--footer-hover))] transition-colors">Terms</Link>
            <Link to="/hq" className="text-[10px] text-[hsl(var(--footer-muted))] hover:text-[hsl(var(--footer-hover))] transition-colors">Staff</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
