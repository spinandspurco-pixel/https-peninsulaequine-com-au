import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default: "shadow-sm",
        /** Elevated card with hover lift + gold glow */
        elevated:
          "shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-accent/30",
        /** Flat card — no shadow, minimal border */
        flat: "shadow-none border-border/50",
        /** Glass card — translucent on dark backgrounds */
        glass:
          "bg-primary-foreground/5 border-primary-foreground/10 backdrop-blur-sm text-primary-foreground",
        /** Feature card — accent border top */
        feature:
          "shadow-sm border-t-2 border-t-accent hover:shadow-lg hover:-translate-y-0.5",
        /** Inset panel — recessed surface inside another card */
        inset:
          "shadow-none bg-background border-border",
        /** Dark surface — for navy-bg sections */
        dark:
          "shadow-none bg-primary-foreground/[0.04] border-primary-foreground/10 text-primary-foreground",
        /** Interactive — lift + subtle gold glow on hover */
        interactive:
          "shadow-sm hover:-translate-y-1 hover:shadow-[0_0_20px_-8px_hsl(var(--accent)/0.2),0_10px_25px_-10px_hsl(var(--primary)/0.15)] hover:border-accent/30 cursor-pointer",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ variant, className }))} {...props} />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("heading-card", className)}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground leading-relaxed", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
