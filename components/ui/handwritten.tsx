import { cx } from "@/lib/cx";

type HandwrittenProps = {
  children: string;
  className?: string;
};

/**
 * A short handwritten phrase: a signature or margin note, never body copy or UI labels,
 * and no more than about 5% of the text on screen.
 *
 * Stage 3 renders the phrase in Caveat. When James's own handwriting is vectorised, this
 * component maps each phrase to its SVG (role="img" with the phrase as its label) and
 * falls back to Caveat for phrases without one. Call sites do not change.
 */
export function Handwritten({ children, className }: HandwrittenProps) {
  return (
    <span
      className={cx(
        "font-hand text-[1.3em] leading-none font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}
