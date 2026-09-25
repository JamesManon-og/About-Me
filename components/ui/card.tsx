import type { HTMLAttributes } from "react";
import { cx } from "@/lib/cx";

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "article" | "li";
  /** Sunken cards sit below the page, for asides and code-like content. */
  tone?: "raised" | "sunken";
};

export function Card({
  as: Tag = "div",
  tone = "raised",
  className,
  ...props
}: CardProps) {
  return (
    <Tag
      className={cx(
        "rounded-lg border border-line p-6",
        tone === "raised" ? "bg-paper-raised shadow-paper" : "bg-paper-sunken",
        className,
      )}
      {...props}
    />
  );
}
