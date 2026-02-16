import { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  aspectRatio?: string;
  objectFit?: "cover" | "contain" | "fill";
  placeholderColor?: string;
  onLoad?: () => void;
}

/** Generates a tiny inline SVG data-URI with a shimmer animation */
function generatePlaceholderSvg(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.15"/>
        <stop offset="50%" stop-color="${color}" stop-opacity="0.08"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0.15"/>
        <animate attributeName="x1" values="-100%;100%" dur="1.8s" repeatCount="indefinite"/>
      </linearGradient>
    </defs>
    <rect width="400" height="300" fill="${color}" fill-opacity="0.06"/>
    <rect width="400" height="300" fill="url(#g)"/>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg.replace(/\n\s*/g, ""))}`;
}

/** Deterministic warm tone from src string for visual consistency */
function colorFromSrc(src: string): string {
  let hash = 0;
  for (let i = 0; i < src.length; i++) hash = ((hash << 5) - hash + src.charCodeAt(i)) | 0;
  const hue = 25 + (Math.abs(hash) % 20); // warm 25-45 range
  return `hsl(${hue}, 18%, 55%)`;
}

export function OptimizedImage({
  src,
  alt,
  className,
  priority = false,
  aspectRatio,
  objectFit = "cover",
  placeholderColor,
  onLoad,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  const phColor = placeholderColor || colorFromSrc(src);
  const placeholderUri = useMemo(() => generatePlaceholderSvg(phColor), [phColor]);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted/20",
        aspectRatio,
        className
      )}
    >
      {/* Lightweight inline SVG placeholder with shimmer */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-500",
          isLoaded ? "opacity-0" : "opacity-100"
        )}
        style={{ backgroundImage: `url("${placeholderUri}")`, backgroundSize: "cover" }}
      />

      {/* Actual image */}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        onLoad={handleLoad}
        className={cn(
          "w-full h-full transition-all duration-700",
          objectFit === "cover" && "object-cover",
          objectFit === "contain" && "object-contain",
          objectFit === "fill" && "object-fill",
          isLoaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-sm scale-105"
        )}
      />
    </div>
  );
}
