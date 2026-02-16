import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react";
import { siteConfig } from "@/data/content";
import logoPeMark from "@/assets/logo-pe-mark.png";

const footerLinks = {
  services: [
    { name: "Arena Construction", href: "/services#arena-construction" },
    { name: "Barn Building", href: "/services#barn-construction" },
    { name: "Equine Fencing", href: "/services#fencing" },
    { name: "Renovations", href: "/services#renovations" },
  ],
  company: [
    { name: "About Ciro", href: "/about" },
    { name: "Gallery", href: "/gallery" },
    { name: "Testimonials", href: "/testimonials" },
    { name: "FAQ", href: "/faq" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[hsl(var(--footer-bg))] text-[hsl(var(--footer-foreground))]">
      <div className="section-container py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
              <img 
                src={logoPeMark} 
                alt="Peninsula Equine" 
                className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-serif text-2xl font-semibold text-[hsl(var(--footer-foreground))]">
                Peninsula<span className="text-[hsl(var(--footer-hover))]">Equine</span>
              </span>
            </Link>
            <p className="text-[hsl(var(--footer-muted))] mb-6 max-w-xs">
              Expert equine facility construction by a horseman who understands what your horses need.
            </p>
            <div className="flex gap-4">
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-[hsl(var(--footer-foreground))]/10 hover:bg-[hsl(var(--footer-hover))] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-[hsl(var(--footer-foreground))]/10 hover:bg-[hsl(var(--footer-hover))] transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-[hsl(var(--footer-muted))] hover:text-[hsl(var(--footer-hover))] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-[hsl(var(--footer-muted))] hover:text-[hsl(var(--footer-hover))] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6">Contact</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href={`tel:${siteConfig.phone}`}
                  className="flex items-start gap-3 text-[hsl(var(--footer-muted))] hover:text-[hsl(var(--footer-hover))] transition-colors"
                >
                  <Phone className="h-5 w-5 mt-0.5 shrink-0" />
                  <span>{siteConfig.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="flex items-start gap-3 text-[hsl(var(--footer-muted))] hover:text-[hsl(var(--footer-hover))] transition-colors"
                >
                  <Mail className="h-5 w-5 mt-0.5 shrink-0" />
                  <span>{siteConfig.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-[hsl(var(--footer-muted))]">
                <MapPin className="h-5 w-5 mt-0.5 shrink-0" />
                <span>
                  {siteConfig.address.street}<br />
                  {siteConfig.address.city}, {siteConfig.address.state} {siteConfig.address.zip}
                </span>
              </li>
            </ul>
            <div className="mt-6 pt-6 border-t border-[hsl(var(--footer-foreground))]/10">
              <p className="text-sm text-[hsl(var(--footer-muted))]/80">{siteConfig.hours.weekdays}</p>
              <p className="text-sm text-[hsl(var(--footer-muted))]/80">{siteConfig.hours.saturday}</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[hsl(var(--footer-foreground))]/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[hsl(var(--footer-muted))]/80">
            © {new Date().getFullYear()} Peninsula Equine. All rights reserved.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm text-[hsl(var(--footer-muted))]/80 hover:text-[hsl(var(--footer-hover))] transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/hq"
              className="text-sm text-[hsl(var(--footer-muted))]/60 hover:text-[hsl(var(--footer-hover))] transition-colors"
            >
              Staff
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
