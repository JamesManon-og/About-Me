"use client";

import { Button } from "@/components/ui/button";

/** Shown when the page itself fails to render. The chat's own errors show Retry inline. */
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-chat flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-title font-semibold">The page couldn&apos;t load</h1>
      <p className="text-fg-muted">
        Something went wrong on our side. Try again, or reload the page.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Reload
        </Button>
      </div>
    </main>
  );
}
