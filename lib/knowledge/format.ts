import type { Project } from "./schema";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** "2025" → "2025", "2025-01" → "Jan 2025". Input is a validated PartialDate. */
export function formatPartialDate(date: string): string {
  const [year, month] = date.split("-");
  if (!month) return date;
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

/** One end of a range. `dateTime` is null for "present". */
export type RangePart = { dateTime: string | null; label: string };

/**
 * The visible parts of a date range, for rendering with <time>:
 * - no dates → []
 * - same start and end, or only an end → one part
 * - no end → start to "present"
 */
export function dateRange(
  start: string | null,
  end: string | null,
): RangePart[] {
  const part = (d: string): RangePart => ({
    dateTime: d,
    label: formatPartialDate(d),
  });
  if (!start) return end ? [part(end)] : [];
  if (!end) return [part(start), { dateTime: null, label: "present" }];
  if (start === end) return [part(start)];
  return [part(start), part(end)];
}

export function formatDateRange(
  start: string | null,
  end: string | null,
): string {
  return dateRange(start, end)
    .map((p) => p.label)
    .join(" – ");
}

/** How the project was built, in a short phrase. Null when unknown. */
export function collaborationLabel(project: Project): string | null {
  const c = project.collaboration;
  if (!c) return null;
  switch (c.kind) {
    case "solo":
      return "Solo project";
    case "team":
      return c.size ? `Group project, ${c.size} people` : "Group project";
    case "organization":
      return `Built at ${c.organization}`;
  }
}

const STATUS_LABELS: Record<NonNullable<Project["status"]>, string> = {
  active: "Active",
  completed: "Completed",
  unreleased: "Unreleased",
};

export function statusLabel(project: Project): string | null {
  return project.status ? STATUS_LABELS[project.status] : null;
}
