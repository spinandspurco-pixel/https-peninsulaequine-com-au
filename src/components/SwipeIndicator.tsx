import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "lightbox-swipe-hint-shown";

interface SwipeIndicatorProps {
  show: boolean;
  onDismiss?: () => void;
}

export function SwipeIndicator({ show, onDismiss }: SwipeIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(true);

  useEffect(() => {
    // Check if hint has been shown before
    const shown = localStorage.getItem(STORAGE_KEY);
    setHasBeenShown(!!shown);
  }, []);

  useEffect(() => {
    if (show && !hasBeenShown) {
      // Small delay before showing
      const showTimer = setTimeout(() => {
        setIsVisible(true);
      }, 500);

      // Auto-dismiss after animation completes
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        localStorage.setItem(STORAGE_KEY, "true");
        setHasBeenShown(true);
        onDismiss?.();
      }, 4000);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [show, hasBeenShown, onDismiss]);

  // Don't render if already shown before or shouldn't show
  if (hasBeenShown || !show) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-20 flex items-center justify-center pointer-events-none transition-opacity duration-500",
        isVisible ? "opacity-100" : "opacity-0"
      )}
      onClick={() => {
        setIsVisible(false);
        localStorage.setItem(STORAGE_KEY, "true");
        setHasBeenShown(true);
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px]" />

      {/* Swipe animation container */}
      <div className="relative flex items-center gap-8">
        {/* Left chevron */}
        <div className="animate-swipe-hint-left">
          <ChevronLeft className="w-10 h-10 text-primary-foreground/80" />
        </div>

        {/* Hand/touch indicator */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-accent/20 border-2 border-accent/40 flex items-center justify-center animate-swipe-hand">
            <svg
              viewBox="0 0 24 24"
              className="w-8 h-8 text-primary-foreground"
              fill="currentColor"
            >
              <path d="M9.75 5.25a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm-.5 2.5v9.75a.75.75 0 0 1-1.5 0V11.5l-1.22 1.72a.75.75 0 0 1-1.23-.86l2.25-3.18a.75.75 0 0 1 .2-.2V7.75a.75.75 0 0 1 1.5 0Zm5.5-2.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Zm.5 2.5v9.75a.75.75 0 0 0 1.5 0V11.5l1.22 1.72a.75.75 0 0 0 1.23-.86l-2.25-3.18a.75.75 0 0 0-.2-.2V7.75a.75.75 0 0 0-1.5 0Z" />
            </svg>
          </div>
          {/* Touch ripple */}
          <div className="absolute inset-0 rounded-full border-2 border-accent/50 animate-ping" />
        </div>

        {/* Right chevron */}
        <div className="animate-swipe-hint-right">
          <ChevronRight className="w-10 h-10 text-primary-foreground/80" />
        </div>
      </div>

      {/* Text instruction */}
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 text-center">
        <p className="text-primary-foreground font-medium text-lg mb-1">
          Swipe to navigate
        </p>
        <p className="text-primary-foreground/60 text-sm">
          Tap anywhere to dismiss
        </p>
      </div>
    </div>
  );
}

// Hook to reset the swipe hint (for testing)
export function useResetSwipeHint() {
  return () => {
    localStorage.removeItem(STORAGE_KEY);
  };
}
