import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Arrow, Circled, Underline } from "@/components/ui/annotation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Handwritten } from "@/components/ui/handwritten";
import { Section } from "@/components/ui/section";
import { TextLink } from "@/components/ui/text-link";
import { contrastRatio } from "@/lib/design/contrast";
import {
  parseColorTokens,
  resolvePalette,
  type Theme,
} from "@/lib/design/tokens";

export const metadata: Metadata = {
  title: "Design system · James Manon-og",
  robots: { index: false, follow: false },
};

// Read at build time; the page is static.
const tokens = parseColorTokens(
  readFileSync(join(process.cwd(), "app/globals.css"), "utf8"),
);
const themes: Theme[] = ["light", "dark"];

const SWATCHES = [
  { name: "paper", text: false },
  { name: "paper-raised", text: false },
  { name: "paper-sunken", text: false },
  { name: "ink", text: true },
  { name: "ink-muted", text: true },
  { name: "accent", text: true },
  { name: "line", text: false },
  { name: "line-strong", text: false },
  { name: "grid", text: false },
] as const;

const DURATIONS = [
  ["--duration-fast", "150ms", "Hover, press"],
  ["--duration-base", "200ms", "Menus, chips"],
  ["--duration-slow", "250ms", "Panels"],
  ["--duration-editorial", "550ms", "Annotation and diagram reveals"],
] as const;

type ThemedProps = {
  children: ReactNode | ((theme: Theme) => ReactNode);
  className?: string;
};

function Themed({ children, className }: ThemedProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {themes.map((theme) => (
        <div
          key={theme}
          data-theme={theme}
          data-testid={`panel-${theme}`}
          className={
            "rounded-lg border border-line bg-paper p-5 text-ink sm:p-8 " +
            (className ?? "")
          }
        >
          <p className="mb-5 text-eyebrow font-medium text-ink-muted uppercase">
            {theme}
          </p>
          {typeof children === "function" ? children(theme) : children}
        </div>
      ))}
    </div>
  );
}

function Group({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-title`} className="space-y-4">
      <h2 id={`${id}-title`} className="font-serif text-h2">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Swatches({ theme }: { theme: Theme }) {
  const palette = resolvePalette(tokens, theme);
  const paper = palette.paper ?? "#000000";
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {SWATCHES.map(({ name, text }) => {
        const hex = palette[name] ?? "";
        return (
          <li key={name} className="text-small">
            <span
              className="block h-12 rounded-md border border-line"
              style={{ backgroundColor: hex }}
            />
            <span className="mt-1.5 block font-medium">{name}</span>
            <span className="block font-mono text-ink-muted">
              {hex}
              {text ? ` · ${contrastRatio(hex, paper).toFixed(1)}:1` : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export default function DesignPage() {
  return (
    <main className="mx-auto w-full max-w-page space-y-16 px-4 py-12 sm:px-6 sm:py-16">
      <header className="max-w-reading">
        <p className="text-eyebrow font-medium text-accent uppercase">
          Internal preview
        </p>
        <h1 className="mt-3 font-serif text-h1">Design system</h1>
        <p className="mt-4 text-ink-muted">
          Tokens and primitives in both themes. Not indexed. Rationale is in{" "}
          <code className="font-mono text-small">docs/BRAND_DIRECTION.md</code>.
          Tab through the page to check focus rings.
        </p>
      </header>

      <Group id="colour" title="Colour">
        <Themed>{(theme) => <Swatches theme={theme} />}</Themed>
        <p className="text-small text-ink-muted">
          Ratios are text on paper. Every text and border pair is checked in
          both themes by{" "}
          <code className="font-mono">lib/design/contrast.test.ts</code>.
        </p>
      </Group>

      <Group id="type" title="Type">
        <Themed>
          <div className="space-y-6">
            <p className="font-serif text-display">
              Sketchbook meets <em>engineering lab</em>.
            </p>
            <p className="font-serif text-h1">Heading one, Instrument Serif</p>
            <p className="font-serif text-h2">Heading two</p>
            <p className="font-serif text-h3">Heading three</p>
            <p className="max-w-reading">
              Body copy is Instrument Sans at 17px with a 1.65 line height, set
              to a 40rem measure. It carries everything that has to be read to
              use the site.
            </p>
            <p className="text-small text-ink-muted">
              Small text for captions and metadata.
            </p>
            <p className="text-eyebrow font-medium text-accent uppercase">
              Eyebrow label
            </p>
            <p>
              <Handwritten>a handwritten note</Handwritten>{" "}
              <span className="text-small text-ink-muted">
                (Caveat until the real handwriting lands)
              </span>
            </p>
            <p className="font-mono text-small">
              const mono = &quot;system stack&quot;;
            </p>
          </div>
        </Themed>
      </Group>

      <Group id="buttons" title="Buttons and chips">
        <Themed>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button disabled>Disabled</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/" variant="secondary">
                Button link
              </ButtonLink>
            </div>
            <div
              role="group"
              aria-label="Example prompts"
              className="flex flex-wrap gap-2"
            >
              <Chip>Projects</Chip>
              <Chip>AI workflow</Chip>
              <Chip>Experience</Chip>
              <Chip selected>Selected filter</Chip>
            </div>
          </div>
        </Themed>
      </Group>

      <Group id="links" title="Links and annotations">
        <Themed>
          <div className="space-y-6">
            <p className="max-w-reading">
              An <TextLink href="/">internal link</TextLink> and an{" "}
              <TextLink href="https://www.w3.org/WAI/">external link</TextLink>{" "}
              sit inside body copy with an underline, so colour is never the
              only cue.
            </p>
            <p className="font-serif text-h2">
              Plans on <Underline>paper</Underline>, builds{" "}
              <Circled>systems</Circled>.
            </p>
            <p className="flex items-end gap-2">
              <Handwritten className="text-accent">margin note</Handwritten>
              <Arrow />
              <span className="text-small text-ink-muted">
                the thing it points at
              </span>
            </p>
          </div>
        </Themed>
      </Group>

      <Group id="surfaces" title="Cards, sections and surfaces">
        <Themed>
          {(theme) => (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card as="article">
                  <h3 className="font-serif text-h3">Raised card</h3>
                  <p className="mt-2 text-small text-ink-muted">
                    For story cards. Paper-raised with a soft paper shadow.
                  </p>
                </Card>
                <Card tone="sunken">
                  <h3 className="font-serif text-h3">Sunken card</h3>
                  <p className="mt-2 text-small text-ink-muted">
                    For asides and code-like notes.
                  </p>
                </Card>
              </div>
              <div className="rounded-lg border border-line bg-grid-paper px-5">
                <Section
                  id={`demo-section-${theme}`}
                  eyebrow="01 · Example"
                  title="A section heading"
                  intro="Sections are anchored, labelled by their heading, and keep intros to one reading measure."
                  headingLevel={3}
                  className="py-8"
                />
              </div>
            </div>
          )}
        </Themed>
      </Group>

      <Group id="tokens" title="Radius, shadow and motion">
        <Themed>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4">
              {(
                [
                  "rounded-sm",
                  "rounded-md",
                  "rounded-lg",
                  "rounded-full",
                ] as const
              ).map((r) => (
                <div
                  key={r}
                  className={`flex size-20 items-center justify-center border border-line-strong bg-paper-raised text-small ${r}`}
                >
                  {r.replace("rounded-", "")}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="rounded-lg bg-paper-raised p-5 text-small shadow-paper">
                shadow-paper
              </div>
              <div className="rounded-lg bg-paper-raised p-5 text-small shadow-lifted">
                shadow-lifted
              </div>
            </div>
            <table className="w-full text-left text-small">
              <caption className="sr-only">Motion durations</caption>
              <thead className="text-ink-muted">
                <tr>
                  <th className="py-1 font-medium">Token</th>
                  <th className="py-1 font-medium">Value</th>
                  <th className="py-1 font-medium">Use</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {DURATIONS.map(([token, value, use]) => (
                  <tr key={token} className="border-t border-line">
                    <td className="py-1.5 pr-3">{token}</td>
                    <td className="py-1.5 pr-3">{value}</td>
                    <td className="py-1.5 font-sans">{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-small text-ink-muted">
              Easing: <code className="font-mono">--ease-out</code> for
              entrances, <code className="font-mono">--ease-in-out</code> for
              moves. All durations drop to 0 under reduced motion.
            </p>
          </div>
        </Themed>
      </Group>
    </main>
  );
}
