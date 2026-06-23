import {
  AnchorHTMLAttributes,
  forwardRef,
  PointerEvent as RPointerEvent,
  ReactNode,
  useRef,
} from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type BaseProps = {
  children: ReactNode;
  /** Pull strength in px at the proximity boundary. Default 6. */
  strength?: number;
  /** Activation radius in px around the element. Default 80. */
  radius?: number;
  className?: string;
};

type LinkProps = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className">;

/**
 * A text-link with magnetic hover: on pointermove within `radius`, the
 * element translates up to `strength` px toward the cursor; springs back
 * on leave. Honours prefers-reduced-motion.
 */
export const MagneticLink = forwardRef<HTMLAnchorElement, LinkProps>(function MagneticLink(
  { children, strength = 6, radius = 80, className, ...rest },
  ref,
) {
  const innerRef = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();

  // expose ref upward if requested
  const setRefs = (el: HTMLAnchorElement | null) => {
    innerRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) (ref as { current: HTMLAnchorElement | null }).current = el;
  };

  const onMove = (e: RPointerEvent<HTMLAnchorElement>) => {
    if (reduce) return;
    const el = innerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > radius) {
      el.style.transform = "translate3d(0,0,0)";
      return;
    }
    const k = (1 - dist / radius) * strength;
    const nx = (dx / (dist || 1)) * k;
    const ny = (dy / (dist || 1)) * k;
    el.style.transform = `translate3d(${nx.toFixed(2)}px, ${ny.toFixed(2)}px, 0)`;
  };

  const onLeave = () => {
    const el = innerRef.current;
    if (!el) return;
    el.style.transform = "translate3d(0,0,0)";
  };

  return (
    <a
      {...rest}
      ref={setRefs}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn(
        "inline-block will-change-transform",
        // 1px thread underline that extends on hover, consistent with project style
        "relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-px after:bg-current after:opacity-60 after:w-full after:origin-left after:scale-x-0 after:transition-transform after:duration-500 hover:after:scale-x-100",
        className,
      )}
      style={{
        transition: reduce
          ? "none"
          : "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {children}
    </a>
  );
});
