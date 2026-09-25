import type { ReactNode, SVGProps } from "react";
import { cx } from "@/lib/cx";

/*
 * Hand-drawn marks: the human layer over the page. Decorative only (aria-hidden), so the
 * wrapped text must make sense without them. Paths use pathLength={1} so Stage 8 can draw
 * them once on view with a stroke-dashoffset from 1 to 0. For now they render static.
 */

function Stroke({ className, children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cx("pointer-events-none overflow-visible", className)}
      {...props}
    >
      {children}
    </svg>
  );
}

type WrapProps = { children: ReactNode; className?: string };

/** A loose underline under a word or short phrase. */
export function Underline({ children, className }: WrapProps) {
  return (
    <span
      className={cx("relative isolate inline-block text-accent", className)}
    >
      <span className="text-ink">{children}</span>
      <Stroke
        viewBox="0 0 200 12"
        preserveAspectRatio="none"
        className="absolute inset-x-0 -bottom-[0.28em] -z-10 h-[0.45em] w-full"
      >
        <path
          d="M3 8.5C42 4.2 92 3.4 132 5.4 160 6.8 184 8 197 5"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
        />
      </Stroke>
    </span>
  );
}

/** A loop drawn around a word, overshooting where the pen started. */
export function Circled({ children, className }: WrapProps) {
  return (
    <span
      className={cx(
        "relative isolate mx-[0.3em] inline-block px-[0.1em] text-accent",
        className,
      )}
    >
      <span className="text-ink">{children}</span>
      <Stroke
        viewBox="0 0 200 80"
        preserveAspectRatio="none"
        className="absolute -top-[0.3em] -left-[0.45em] -z-10 h-[calc(100%+0.6em)] w-[calc(100%+0.9em)]"
      >
        <path
          d="M36 16C78 1 168 3 190 31c14 26-36 45-95 44C40 74 5 62 8 40 11 21 47 9 84 7"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
        />
      </Stroke>
    </span>
  );
}

type ArrowProps = {
  /** Which way the head points. */
  direction?: "right" | "left";
  className?: string;
};

/** A curved pointer from a margin note to the thing it describes. */
export function Arrow({ direction = "right", className }: ArrowProps) {
  return (
    <Stroke
      viewBox="0 0 80 48"
      className={cx(
        "inline-block h-8 w-14 text-accent",
        direction === "left" && "-scale-x-100",
        className,
      )}
    >
      <path d="M5 40C19 14 46 6 72 14" strokeWidth="2" pathLength={1} />
      <path d="M60 5.5 73 14 62 24" strokeWidth="2" pathLength={1} />
    </Stroke>
  );
}
