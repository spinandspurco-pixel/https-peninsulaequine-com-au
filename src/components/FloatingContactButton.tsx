import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingContactButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();

  // Don't show on contact page
  const isContactPage = location.pathname === "/contact";

  useEffect(() => {
    // Delay appearance for a smoother page load experience
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isContactPage) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-6 z-50 transition-all duration-500",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8 pointer-events-none"
      )}
    >
      {/* Tooltip */}
      <div
        className={cn(
          "absolute bottom-full left-0 mb-2 px-3 py-1.5 rounded-lg",
          "bg-foreground text-background text-sm font-medium whitespace-nowrap",
          "transition-all duration-300 pointer-events-none",
          isHovered
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2"
        )}
      >
        Get in touch
        <div className="absolute top-full left-4 w-2 h-2 bg-foreground rotate-45 -translate-y-1" />
      </div>

      {/* Button */}
      <Link
        to="/contact"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "group flex items-center justify-center",
          "w-14 h-14 rounded-full",
          "bg-accent text-accent-foreground shadow-lg",
          "hover:bg-accent/90 hover:shadow-xl hover:scale-105",
          "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
          "transition-all duration-300 ease-out"
        )}
        aria-label="Contact us"
      >
        <MessageCircle className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
      </Link>

      {/* Pulse ring animation */}
      <div
        className={cn(
          "absolute inset-0 rounded-full bg-accent/30",
          "animate-ping pointer-events-none",
          isHovered ? "opacity-0" : "opacity-100"
        )}
        style={{ animationDuration: "2s" }}
      />
    </div>
  );
}
