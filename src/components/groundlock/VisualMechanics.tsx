import { useRef } from "react";
import { cn } from "@/lib/utils";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { GroundLockPanelSVG, PanelDefs } from "./GroundLockPanelSVG";

const STEPS = [
  {
    id: "panel",
    label: "01",
    text: "Structural horseshoe panel",
  },
  {
    id: "interlock",
    label: "02",
    text: "Opposing directional interlock",
  },
  {
    id: "layering",
    label: "03",
    text: "Layered base integration",
  },
  {
    id: "load",
    label: "04",
    text: "Load distribution across system",
  },
  {
    id: "surface",
    label: "05",
    text: "Stabilised finished surface",
  },
] as const;

/* ── Inline SVG illustrations for each step ── */

function StepPanel() {
  return (
    <svg viewBox="0 0 120 130" className="w-full h-auto max-w-[140px]" aria-hidden>
      <PanelDefs id="vm-p" />
      <g style={{ animation: "vm-drift 8s ease-in-out infinite" }}>
        <GroundLockPanelSVG active showTabs showJoins defsId="vm-p" direction="up" />
      </g>
    </svg>
  );
}

function StepInterlock() {
  return (
    <svg viewBox="0 0 220 130" className="w-full h-auto max-w-[220px]" aria-hidden>
      <PanelDefs id="vm-i" />
      <g transform="translate(0,0)">
        <GroundLockPanelSVG active showTabs showJoins defsId="vm-i" direction="up" />
      </g>
      <g transform="translate(100,0)">
        <GroundLockPanelSVG active showTabs showJoins defsId="vm-i" direction="down" />
      </g>
      {/* connection indicators */}
      <line x1="95" y1="55" x2="105" y2="55" stroke="hsl(var(--accent))" strokeWidth="1.5" opacity="0.35" strokeDasharray="3 2" />
      <line x1="95" y1="75" x2="105" y2="75" stroke="hsl(var(--accent))" strokeWidth="1.5" opacity="0.35" strokeDasharray="3 2" />
    </svg>
  );
}

function StepLayering() {
  return (
    <svg viewBox="0 0 240 120" className="w-full h-auto max-w-[240px]" aria-hidden>
      {/* sub-base */}
      <rect x="10" y="85" width="220" height="25" rx="2" fill="hsl(var(--muted))" opacity="0.25" />
      <text x="120" y="101" textAnchor="middle" fontSize="7" fill="hsl(var(--muted-foreground))" opacity="0.3" fontFamily="monospace">SUB-BASE</text>
      {/* drainage layer */}
      <rect x="10" y="62" width="220" height="20" rx="2" fill="hsl(var(--accent))" opacity="0.08" />
      {[30, 70, 110, 150, 190].map(x => (
        <line key={x} x1={x} y1="66" x2={x} y2="78" stroke="hsl(var(--accent))" strokeWidth="1" opacity="0.2" strokeDasharray="2 2" />
      ))}
      <text x="120" y="75" textAnchor="middle" fontSize="7" fill="hsl(var(--accent))" opacity="0.35" fontFamily="monospace">DRAINAGE</text>
      {/* panels */}
      <rect x="10" y="38" width="220" height="20" rx="2" fill="hsl(var(--foreground))" opacity="0.08" />
      <text x="120" y="51" textAnchor="middle" fontSize="7" fill="hsl(var(--foreground))" opacity="0.3" fontFamily="monospace">GROUNDLOCK PANELS</text>
      {/* divider lines */}
      <line x1="10" y1="60" x2="230" y2="60" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />
      <line x1="10" y1="83" x2="230" y2="83" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}

function StepLoad() {
  return (
    <svg viewBox="0 0 240 120" className="w-full h-auto max-w-[240px]" aria-hidden>
      {/* system base */}
      <rect x="10" y="70" width="220" height="30" rx="2" fill="hsl(var(--foreground))" opacity="0.06" />
      {/* pressure arrows */}
      {[60, 120, 180].map(x => (
        <g key={x}>
          <line x1={x} y1="20" x2={x} y2="65" stroke="hsl(var(--accent))" strokeWidth="1" opacity="0.25" />
          <polygon points={`${x - 3},65 ${x + 3},65 ${x},70`} fill="hsl(var(--accent))" opacity="0.3" />
        </g>
      ))}
      {/* load spread */}
      <path d="M55,70 L40,100 M185,70 L200,100" stroke="hsl(var(--accent))" strokeWidth="0.8" opacity="0.15" strokeDasharray="3 3" />
      {/* weight icon */}
      <text x="120" y="16" textAnchor="middle" fontSize="8" fill="hsl(var(--foreground))" opacity="0.25" fontFamily="monospace">LOAD</text>
      <text x="120" y="88" textAnchor="middle" fontSize="7" fill="hsl(var(--foreground))" opacity="0.2" fontFamily="monospace">DISTRIBUTION</text>
    </svg>
  );
}

function StepSurface() {
  return (
    <svg viewBox="0 0 240 120" className="w-full h-auto max-w-[240px]" aria-hidden>
      {/* sub layers */}
      <rect x="10" y="85" width="220" height="20" rx="2" fill="hsl(var(--muted))" opacity="0.15" />
      <rect x="10" y="62" width="220" height="20" rx="2" fill="hsl(var(--foreground))" opacity="0.06" />
      {/* surface layer */}
      <rect x="10" y="38" width="220" height="22" rx="2" fill="hsl(var(--accent))" opacity="0.12" />
      {/* surface texture dots */}
      {[30, 55, 80, 105, 130, 155, 180, 205].map(x => (
        <circle key={x} cx={x} cy={49} r="1" fill="hsl(var(--accent))" opacity="0.2" />
      ))}
      <text x="120" y="52" textAnchor="middle" fontSize="7" fill="hsl(var(--accent))" opacity="0.4" fontFamily="monospace">ARENA SURFACE</text>
      <text x="120" y="75" textAnchor="middle" fontSize="6" fill="hsl(var(--foreground))" opacity="0.15" fontFamily="monospace">GROUNDLOCK</text>
      <text x="120" y="98" textAnchor="middle" fontSize="6" fill="hsl(var(--muted-foreground))" opacity="0.15" fontFamily="monospace">SUB-BASE</text>
    </svg>
  );
}

const STEP_VISUALS: Record<string, () => JSX.Element> = {
  panel: StepPanel,
  interlock: StepInterlock,
  layering: StepLayering,
  load: StepLoad,
  surface: StepSurface,
};

export function VisualMechanics() {
  return (
    <div className="space-y-24 sm:space-y-32">
      {STEPS.map((step, i) => {
        const Visual = STEP_VISUALS[step.id];
        return (
          <RevealOnScroll key={step.id} direction="up" delay={i * 80}>
            <div className="flex flex-col items-center text-center gap-8">
              {/* Step number */}
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent/30">
                {step.label}
              </span>

              {/* Visual */}
              <div className="flex items-center justify-center min-h-[100px]">
                <Visual />
              </div>

              {/* Label */}
              <p className="text-[13px] text-foreground/40 tracking-wide leading-[1.7] max-w-[260px]">
                {step.text}
              </p>
            </div>
          </RevealOnScroll>
        );
      })}

      {/* Inject keyframes */}
      <style>{`
        @keyframes vm-drift {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(2deg); }
        }
      `}</style>
    </div>
  );
}
