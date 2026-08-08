import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  children,
  className,
  tone = "default",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "muted" | "navy" | "sand";
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-28 py-16 sm:py-20 lg:py-28",
        tone === "muted" && "bg-secondary",
        tone === "sand" && "bg-sand",
        tone === "navy" && "bg-navy text-navy-foreground",
        className,
      )}
    >
      <div className="container-page">{children}</div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  text,
  align = "left",
  invert = false,
  as: Heading = "h2",
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  align?: "left" | "center";
  invert?: boolean;
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && (
        <p className={cn("eyebrow", invert && "text-navy-foreground/60")}>{eyebrow}</p>
      )}
      <Heading
        className={cn(
          "mt-3 text-3xl font-bold leading-[1.1] sm:text-4xl lg:text-[2.75rem]",
          invert ? "text-navy-foreground" : "text-primary",
        )}
      >
        {title}
      </Heading>
      {text && (
        <p
          className={cn(
            "mt-5 text-base leading-relaxed sm:text-lg",
            invert ? "text-navy-foreground/75" : "text-muted-foreground",
          )}
        >
          {text}
        </p>
      )}
    </div>
  );
}
