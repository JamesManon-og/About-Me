import Link from "next/link";
import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";

type TextLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

const EXTERNAL = /^https?:\/\//;

const classes =
  "text-accent underline decoration-accent/45 decoration-1 underline-offset-[0.2em] " +
  "transition-[text-decoration-color] duration-(--duration-fast) ease-out " +
  "hover:decoration-accent hover:decoration-2";

/**
 * Inline link. Internal paths use next/link. External URLs render a plain anchor with a
 * small arrow; they open in the same tab. Stage 7 limits external links to the allowlist.
 */
export function TextLink({
  href,
  className,
  children,
  ...props
}: TextLinkProps) {
  if (EXTERNAL.test(href)) {
    return (
      <a
        href={href}
        rel="noopener noreferrer"
        className={cx(classes, className)}
        {...props}
      >
        {children}
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 12 12"
          className="ml-0.5 inline-block size-[0.7em] align-baseline"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4" />
        </svg>
      </a>
    );
  }

  return (
    <Link href={href} className={cx(classes, className)} {...props}>
      {children}
    </Link>
  );
}
