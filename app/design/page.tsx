import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
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
  { name: "page", text: false },
  { name: "surface", text: false },
  { name: "surface-hover", text: false },
  { name: "fg", text: true },
  { name: "fg-muted", text: true },
  { name: "line", text: false },
  { name: "line-strong", text: false },
] as const;

const DURATIONS = [
  ["--duration-fast", "150ms", "Hover, press"],
  ["--duration-base", "200ms", "Menus, chips"],
  ["--duration-slow", "250ms", "Message entrance"],
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
            "rounded-md border border-line bg-page p-5 text-fg sm:p-8 " +
            (className ?? "")
          }
        >
          <p className="mb-5 text-caption font-medium text-fg-muted">{theme}</p>
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
      <h2 id={`${id}-title`} className="text-h2 font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Swatches({ theme }: { theme: Theme }) {
  const palette = resolvePalette(tokens, theme);
  const page = palette.page ?? "#000000";
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {SWATCHES.map(({ name, text }) => {
        const hex = palette[name] ?? "";
        return (
          <li key={name} className="text-small">
            <span
              className="block h-12 rounded-sm border border-line"
              style={{ backgroundColor: hex }}
            />
            <span className="mt-1.5 block font-medium">{name}</span>
            <span className="block font-mono text-fg-muted">
              {hex}
              {text ? ` · ${contrastRatio(hex, page).toFixed(1)}:1` : null}
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
      <header className="max-w-chat">
        <p className="text-caption font-medium text-fg-muted">
          Internal preview
        </p>
        <h1 className="mt-3 text-title font-semibold">Design system</h1>
        <p className="mt-4 text-fg-muted">
          Tokens and primitives in both themes. Not indexed. Rationale is in{" "}
          <code className="font-mono text-small">docs/BRAND_DIRECTION.md</code>.
          Tab through the page to check focus rings.
        </p>
      </header>

      <Group id="colour" title="Colour">
        <Themed>{(theme) => <Swatches theme={theme} />}</Themed>
        <p className="text-small text-fg-muted">
          Ratios are text on the page colour. Every text and border pair is
          checked in both themes by{" "}
          <code className="font-mono">lib/design/contrast.test.ts</code>.
        </p>
      </Group>

      <Group id="type" title="Type">
        <Themed>
          <div className="space-y-6">
            <p className="text-title font-semibold">
              What do you want to know about James?
            </p>
            <p className="text-h2 font-semibold">Heading two</p>
            <p className="max-w-chat">
              Body copy is the system sans at 16px with a 1.6 line height, set
              to the 48rem conversation column. Answers, labels and controls all
              use it.
            </p>
            <p className="text-small text-fg-muted">
              Small text for secondary labels.
            </p>
            <p className="text-caption text-fg-muted">
              Caption text, for the line under the input.
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
              <Chip>What can James do?</Chip>
              <Chip selected>Selected chip</Chip>
            </div>
          </div>
        </Themed>
      </Group>

      <Group id="links" title="Links">
        <Themed>
          <p className="max-w-chat">
            An <TextLink href="/">internal link</TextLink> and an{" "}
            <TextLink href="https://www.w3.org/WAI/">external link</TextLink>{" "}
            sit inside body copy with an underline, so colour is never the only
            cue.
          </p>
        </Themed>
      </Group>

      <Group id="surfaces" title="Cards and surfaces">
        <Themed>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card as="article">
              <h3 className="font-semibold">Outlined card</h3>
              <p className="mt-2 text-small text-fg-muted">
                On the page colour, with a hairline border.
              </p>
            </Card>
            <Card tone="filled">
              <h3 className="font-semibold">Filled card</h3>
              <p className="mt-2 text-small text-fg-muted">
                The surface grey, shared with the composer and user bubbles.
              </p>
            </Card>
          </div>
        </Themed>
      </Group>

      <Group id="tokens" title="Radius and motion">
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
                  className={`flex size-20 items-center justify-center border border-line-strong bg-surface text-small ${r}`}
                >
                  {r.replace("rounded-", "")}
                </div>
              ))}
            </div>
            <table className="w-full text-left text-small">
              <caption className="sr-only">Motion durations</caption>
              <thead className="text-fg-muted">
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
            <p className="text-small text-fg-muted">
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
