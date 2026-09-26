import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-chat flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-title font-semibold">This page doesn&apos;t exist</h1>
      <p className="text-fg-muted">
        Everything here happens in one place: the chat about James.
      </p>
      <ButtonLink href="/">Ask about James</ButtonLink>
    </main>
  );
}
