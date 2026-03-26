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
          "bg-primary text-primary-foreground hover:opacity-85 border border-border/50 transition-opacity duration-300",
        destructive:
          "bg-destructive text-destructive-foreground hover:opacity-85 transition-opacity duration-300",
        outline:
          "border border-border bg-transparent hover:bg-accent/5 hover:border-accent/30 text-foreground transition-opacity duration-300",
        secondary:
          "bg-secondary text-secondary-foreground hover:opacity-85 border border-border/30 transition-opacity duration-300",
        ghost:
          "hover:bg-accent/5 hover:text-accent transition-opacity duration-300",
        link:
          "text-accent underline-offset-4 hover:underline transition-opacity duration-300",
        /** Gold CTA — premium high-impact action */
        gold:
          "bg-accent text-accent-foreground font-semibold tracking-[0.15em] uppercase text-[11px] shadow-[0_4px_24px_-8px_hsl(var(--accent)/0.3)] transition-[filter,box-shadow,opacity] duration-300 ease-in-out hover:brightness-[1.08] hover:shadow-[0_4px_28px_-8px_hsl(var(--accent)/0.28)]",
        /** Outline-light — refined secondary on dark */
        "outline-light":
          "border border-foreground/20 text-foreground hover:opacity-80 tracking-[0.15em] uppercase text-[11px] font-medium transition-opacity duration-300",
        /** Outline-navy — keep for compatibility */
        "outline-navy":
          "border border-accent/30 text-accent hover:opacity-80 tracking-[0.15em] uppercase text-[11px] font-semibold transition-opacity duration-300",
      },
      size: {
        default: "h-12 px-7 py-2.5",
        sm: "h-10 px-6 py-2 text-xs",
        lg: "h-14 px-10 py-3 text-sm",
        xl: "h-[3.75rem] px-14 py-3.5 text-sm",
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
