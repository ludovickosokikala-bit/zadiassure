import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export const ctaVariants = cva(
  "group inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-soft hover:shadow-lift hover:-translate-y-0.5",
        accent: "bg-accent text-accent-foreground shadow-soft hover:shadow-lift hover:-translate-y-0.5",
        outline: "border border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary",
        ghost: "text-primary hover:bg-secondary",
        onNavy:
          "border border-navy-foreground/25 bg-navy-foreground/10 text-navy-foreground backdrop-blur hover:bg-navy-foreground/20",
      },
      size: {
        sm: "px-4 py-2 text-sm",
        md: "px-5 py-2.5 text-sm",
        lg: "px-7 py-3.5 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

interface CtaProps extends VariantProps<typeof ctaVariants> {
  to: string;
  children: ReactNode;
  className?: string;
  withArrow?: boolean;
  hash?: string;
  onClick?: () => void;
}

export function Cta({ to, children, className, variant, size, withArrow = true, hash, onClick }: CtaProps) {
  return (
    <Link
      to={to}
      {...(hash ? { hash } : {})}
      {...(onClick ? { onClick } : {})}
      className={cn(ctaVariants({ variant, size }), className)}
    >
      <span>{children}</span>
      {withArrow && (
        <ArrowRight className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
      )}
    </Link>
  );
}
