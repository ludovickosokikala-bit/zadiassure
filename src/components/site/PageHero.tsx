import { LogoMark } from "@/components/brand/Logo";
import { Section, SectionHeader } from "@/components/site/Section";

/**
 * Sand page header with a supporting photo on the right.
 * Used at the top of every secondary page so navigating feels visual.
 */
export function PageHero({
  eyebrow,
  title,
  text,
  image,
  imageAlt,
  children,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  image: string;
  imageAlt: string;
  children?: React.ReactNode;
}) {
  return (
    <Section tone="sand">
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <SectionHeader eyebrow={eyebrow} title={title} text={text} as="h1" />
          {children}
        </div>
        <div className="relative">
          <img
            src={image}
            alt={imageAlt}
            width={1600}
            height={900}
            className="aspect-[4/3] w-full rounded-3xl border border-border object-cover shadow-soft"
          />
          <span className="absolute -bottom-5 left-5 grid size-16 place-items-center rounded-2xl border border-border bg-card shadow-soft">
            <LogoMark className="size-11" />
          </span>
        </div>
      </div>
    </Section>
  );
}
