import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  "aria-hidden": true,
  focusable: false,
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function ArrowUpIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" strokeWidth="2" {...base} {...props}>
      <path d="M10 16V4M4.5 9.5 10 4l5.5 5.5" />
    </svg>
  );
}

export function StopIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...base} {...props}>
      <rect x="5.5" y="5.5" width="9" height="9" rx="1.5" fill="currentColor" />
    </svg>
  );
}

export function NewChatIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" strokeWidth="1.6" {...base} {...props}>
      <path d="M9 3.5H5.5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V11" />
      <path d="M14.2 3.3a1.5 1.5 0 0 1 2.1 2.1L10 11.7l-2.8.7.7-2.8 6.3-6.3Z" />
    </svg>
  );
}
