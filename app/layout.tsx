import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "James Manon-og",
  description:
    "Ask anything about James Manon-og, a full-stack developer. Answers come from his resume, projects and notes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
