import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 border border-border/50 transition-all duration-700 ease-out",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all duration-500",
        outline:
          "border border-border bg-transparent hover:bg-accent/5 hover:border-accent/30 text-foreground transition-all duration-700 ease-out",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/30 transition-all duration-500",
        ghost:
          "hover:bg-accent/5 hover:text-accent transition-all duration-500",
        link:
          "text-accent underline-offset-4 hover:underline transition-all duration-300",
        /** Gold CTA — premium high-impact action */
        gold:
          "bg-accent text-accent-foreground hover:bg-accent/85 shadow-[0_4px_24px_-8px_hsl(var(--accent)/0.35)] hover:shadow-[0_8px_36px_-8px_hsl(var(--accent)/0.45)] hover:-translate-y-0.5 font-semibold tracking-[0.15em] uppercase text-[11px] transition-all duration-700 ease-out",
        /** Outline-light — refined secondary on dark */
        "outline-light":
          "border border-foreground/20 text-foreground hover:bg-foreground/5 hover:border-accent/40 hover:text-accent tracking-[0.15em] uppercase text-[11px] font-medium transition-all duration-700 ease-out",
        /** Outline-navy — keep for compatibility */
        "outline-navy":
          "border border-accent/30 text-accent hover:bg-accent/5 hover:border-accent/60 tracking-[0.15em] uppercase text-[11px] font-semibold transition-all duration-700 ease-out",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-5 text-xs",
        lg: "h-13 px-10 text-sm",
        xl: "h-14 px-12 text-sm",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
