/** Joins class names, skipping falsy values. Later classes do not override earlier ones. */
export function cx(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
