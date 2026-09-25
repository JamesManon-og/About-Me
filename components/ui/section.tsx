import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type SectionProps = {
  /** Anchor id. The heading gets `${id}-title` and labels the section. */
  id: string;
  title: ReactNode;
  eyebrow?: string;
  intro?: ReactNode;
  headingLevel?: 2 | 3;
  className?: string;
  children?: ReactNode;
};

export function Section({
  id,
  title,
  eyebrow,
  intro,
  headingLevel = 2,
  className,
  children,
}: SectionProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const titleId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cx("scroll-mt-24 py-16", className)}
    >
      <header className="mb-10 max-w-reading">
        {eyebrow ? (
          <p className="text-eyebrow font-medium text-accent uppercase">
            {eyebrow}
          </p>
        ) : null}
        <Heading
          id={titleId}
          className={cx(
            "font-serif text-ink",
            headingLevel === 2 ? "text-h2" : "text-h3",
            eyebrow && "mt-3",
          )}
        >
          {title}
        </Heading>
        {intro ? <p className="mt-4 text-ink-muted">{intro}</p> : null}
      </header>
      {children}
    </section>
  );
}
