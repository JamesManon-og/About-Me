import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";

type ChipProps = ComponentProps<"button"> & {
  /** Sets aria-pressed, for chips that toggle a filter. Leave undefined for plain actions. */
  selected?: boolean;
};

/** A compact action, such as a suggested prompt. Always a real button. */
export function Chip({
  selected,
  className,
  type = "button",
  ...props
}: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cx(
        "inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong",
        "bg-paper-raised px-4 text-small text-ink",
        "transition-[background-color,border-color,color] duration-(--duration-fast) ease-out",
        "hover:border-ink aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-on-accent",
        "disabled:cursor-not-allowed disabled:opacity-55",
        className,
      )}
      {...props}
    />
  );
}
