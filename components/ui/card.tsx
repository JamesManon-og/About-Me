import type { HTMLAttributes } from "react";
import { cx } from "@/lib/cx";

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "article" | "li";
  /** Filled cards use the surface grey, like the composer; outlined cards sit on the page. */
  tone?: "outlined" | "filled";
};

export function Card({
  as: Tag = "div",
  tone = "outlined",
  className,
  ...props
}: CardProps) {
  return (
    <Tag
      className={cx(
        "rounded-md p-5",
        tone === "outlined" ? "border border-line bg-page" : "bg-surface",
        className,
      )}
      {...props}
    />
  );
}
