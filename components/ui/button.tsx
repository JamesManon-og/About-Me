import Link from "next/link";
import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";

export type ButtonVariant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 text-ui font-medium " +
  "transition-[background-color,border-color,color] duration-(--duration-fast) ease-out " +
  "disabled:cursor-not-allowed disabled:opacity-55";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-paper hover:bg-ink/85",
  secondary:
    "border border-line-strong bg-paper-raised text-ink hover:bg-paper-sunken",
  ghost: "text-ink hover:bg-paper-sunken",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  className?: string,
): string {
  return cx(base, variants[variant], className);
}

type ButtonProps = ComponentProps<"button"> & { variant?: ButtonVariant };

export function Button({
  variant,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, className)}
      {...props}
    />
  );
}

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  variant?: ButtonVariant;
};

/** A link styled as a button. Use it for navigation; use Button for actions. */
export function ButtonLink({ variant, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, className)} {...props} />;
}
