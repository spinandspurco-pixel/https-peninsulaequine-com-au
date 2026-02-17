import { type SVGProps } from "react";
import { cn } from "@/lib/utils";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const defaults = (props: IconProps, size = 24) => ({
  width: props.size || size,
  height: props.size || size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
  className: cn("shrink-0", props.className),
});

/** Horse head profile — brand hero icon */
export function PEHorseHead(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <path d="M19 3c-1 1-2 1.5-3.5 1.5S13 4 12 5c-1.5 1.5-2 4-2.5 6-.3 1.2-1 2.5-2 3.5-1.5 1.5-2.5 3-2.5 4.5 0 1 .5 2 2 2h1c1 0 2-.5 2.5-1.5.3-.6.5-1.2.5-2 0-1 .5-2 1.5-3l1-1c1-1 2.5-1.5 3.5-3 1.5-2 2-4 2-6.5V3z" />
      <path d="M15 5.5c.5-.5 1.5-.5 2.5.5" />
      <circle cx="14" cy="8" r=".75" fill="currentColor" stroke="none" />
      <path d="M8.5 17.5c-.5.5-1.5 1-2 1" />
    </svg>
  );
}

/** Horseshoe — luck / blacksmith heritage */
export function PEHorseshoe(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <path d="M6 3c-1.5 2-2.5 5-2.5 8 0 4.5 3 7.5 5 9l1.5 1 1.5-1c0 0-.5-1.5-.5-3 0-1 .5-1.5 1-1.5s1 .5 1 1.5c0 1.5-.5 3-.5 3l1.5 1 1.5-1c2-1.5 5-4.5 5-9 0-3-1-6-2.5-8" />
      <circle cx="7" cy="7" r=".75" fill="currentColor" stroke="none" />
      <circle cx="17" cy="7" r=".75" fill="currentColor" stroke="none" />
      <circle cx="5.5" cy="11" r=".75" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="11" r=".75" fill="currentColor" stroke="none" />
      <circle cx="6.5" cy="15" r=".75" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="15" r=".75" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Barn / stable structure */
export function PEBarn(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <path d="M3 10L12 3l9 7" />
      <path d="M5 10v11h14V10" />
      <path d="M9 21v-6h6v6" />
      <path d="M9 15h6" />
      <line x1="12" y1="3" x2="12" y2="7" />
      <path d="M7 13h2M15 13h2" />
    </svg>
  );
}

/** Arena — oval riding ring with fence posts */
export function PEArena(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <ellipse cx="12" cy="13" rx="9" ry="6" />
      <path d="M5 8v5M8 6.5v6.5M12 6v7M16 6.5v6.5M19 8v5" />
      <path d="M5 10h14" />
    </svg>
  );
}

/** Saddle — side view */
export function PESaddle(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <path d="M4 16c0-3 2-6 4-7.5 1-.8 2-1.5 4-1.5s3 .7 4 1.5c2 1.5 4 4.5 4 7.5" />
      <path d="M6 16c0-2 1.5-4 3-5h6c1.5 1 3 3 3 5" />
      <path d="M4 16h16" />
      <path d="M10 11c0-1.5 1-3 2-3s2 1.5 2 3" />
      <path d="M3 18c1-1 2-2 4-2h10c2 0 3 1 4 2" />
    </svg>
  );
}

/** Lasso / rope loop */
export function PELasso(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <circle cx="10" cy="11" r="6" />
      <path d="M14.5 15c1.5 1.5 3 3 4.5 5" />
      <path d="M16 11c0-3.3-2.7-6-6-6s-6 2.7-6 6 2.7 6 6 6" />
      <path d="M19.5 20.5l1 1" />
    </svg>
  );
}

/** Spur — western boot spur */
export function PESpur(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <path d="M3 15c2-1 4-3 6-3h4c2 0 3 1 4 2l3 3" />
      <circle cx="20" cy="12" r="2.5" />
      <path d="M17.5 12h-3" />
      <path d="M20 9.5l1-1.5M20 14.5l1 1.5M22.5 12h-1" />
      <path d="M3 15l1 3h4l1-3" />
    </svg>
  );
}

/** Crown / admin hat — western boss */
export function PEBossHat(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <path d="M3 17h18" />
      <path d="M4 17c0-2 1-4 2-5l2-6 4 3 4-3 2 6c1 1 2 3 2 5" />
      <path d="M6 17v2c0 .5.5 1 1 1h10c.5 0 1-.5 1-1v-2" />
      <circle cx="12" cy="11" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Fence post — infrastructure */
export function PEFencePost(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <line x1="4" y1="4" x2="4" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
      <line x1="20" y1="4" x2="20" y2="20" />
      <line x1="4" y1="8" x2="20" y2="8" />
      <line x1="4" y1="14" x2="20" y2="14" />
      <path d="M2 4h4M10 4h4M18 4h4" />
    </svg>
  );
}

/** Stonework chisel — masonry detail */
export function PEStonework(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <rect x="3" y="14" width="8" height="4" rx="0.5" />
      <rect x="5" y="10" width="6" height="4" rx="0.5" />
      <rect x="12" y="12" width="7" height="6" rx="0.5" />
      <rect x="14" y="8" width="5" height="4" rx="0.5" />
      <rect x="3" y="18" width="16" height="3" rx="0.5" />
    </svg>
  );
}

/** Timber / woodwork — log cross-section */
export function PETimber(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <rect x="3" y="6" width="18" height="5" rx="1" />
      <rect x="3" y="13" width="18" height="5" rx="1" />
      <circle cx="7" cy="8.5" r="1.5" />
      <circle cx="15" cy="15.5" r="1.5" />
      <line x1="3" y1="11" x2="21" y2="11" strokeDasharray="2 2" />
    </svg>
  );
}

/** Calendar with horseshoe */
export function PECalendar(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M10 15c0-1.2.8-2 2-2s2 .8 2 2c0 1.5-1 2.5-2 3-1-.5-2-1.5-2-3z" />
    </svg>
  );
}

/** Event ribbon / rosette */
export function PERosette(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <circle cx="12" cy="10" r="5" />
      <circle cx="12" cy="10" r="2.5" />
      <path d="M9 14.5L7 21l3-1.5L12 21" />
      <path d="M15 14.5l2 6.5-3-1.5L12 21" />
      <circle cx="12" cy="10" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Sunrise over paddock */
export function PESunrise(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="5.6" y1="5.6" x2="7.8" y2="7.8" />
      <line x1="18.4" y1="5.6" x2="16.2" y2="7.8" />
      <line x1="2" y1="13" x2="5" y2="13" />
      <line x1="19" y1="13" x2="22" y2="13" />
      <path d="M5 17h14" />
      <path d="M7 13a5 5 0 0 1 10 0" />
      <path d="M3 21h18" />
      <line x1="3" y1="17" x2="3" y2="21" />
      <line x1="21" y1="17" x2="21" y2="21" />
    </svg>
  );
}

/** Rider silhouette — trainer icon */
export function PERider(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <circle cx="14" cy="4" r="2" />
      <path d="M7 21c0-4 1-6 3-8l2-2c1-1 1.5-2 1.5-3" />
      <path d="M10 13l3.5-2 2 3" />
      <path d="M4 17c2-1 4-3 5.5-4.5" />
      <path d="M20 21c-1-3-2-5-4-6.5" />
      <path d="M15.5 14l1 2.5" />
    </svg>
  );
}

/** Video camera — construction footage */
export function PEVideo(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <rect x="2" y="6" width="14" height="12" rx="2" />
      <path d="M16 10l5-3v10l-5-3" />
      <circle cx="9" cy="12" r="2" />
    </svg>
  );
}

/** Map pin with horse head */
export function PELocation(props: IconProps) {
  return (
    <svg {...defaults(props)}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <path d="M12 7c-.5 0-1 .3-1.5 1-.3.5-.5 1-.5 1.5 0 1 .5 1.5 1 2l1 .5c.5-.5 1-1 1-2s-.3-2-1-3z" />
    </svg>
  );
}

/* ─── Branded avatar icon set (replaces emoji avatars) ─── */

export const PE_AVATARS = [
  { id: "mustang",   label: "Mustang",       Icon: PEHorseHead,  bg: "bg-accent/10" },
  { id: "stallion",  label: "Stallion",       Icon: PERider,      bg: "bg-primary/10" },
  { id: "farrier",   label: "Farrier",        Icon: PEHorseshoe,  bg: "bg-accent/15" },
  { id: "builder",   label: "Builder",        Icon: PEBarn,       bg: "bg-secondary" },
  { id: "trailboss", label: "Trail Boss",     Icon: PEBossHat,    bg: "bg-accent/10" },
  { id: "rancher",   label: "Rancher",        Icon: PEFencePost,  bg: "bg-muted" },
  { id: "roper",     label: "Roper",          Icon: PELasso,      bg: "bg-accent/15" },
  { id: "wrangler",  label: "Wrangler",       Icon: PESaddle,     bg: "bg-primary/10" },
] as const;

export type PEAvatarId = (typeof PE_AVATARS)[number]["id"];

export function PEAvatarIcon({ avatarId, size = 24, className }: { avatarId: string; size?: number; className?: string }) {
  const avatar = PE_AVATARS.find((a) => a.id === avatarId) || PE_AVATARS[0];
  const { Icon, bg } = avatar;
  return (
    <div className={cn("rounded-full flex items-center justify-center", bg, className)}>
      <Icon size={size} className="text-accent" />
    </div>
  );
}
