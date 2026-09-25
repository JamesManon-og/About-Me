import Markdown, { type Components } from "react-markdown";

/**
 * Renders an answer. Raw HTML is dropped (skipHtml), unsafe URLs are removed by
 * react-markdown's default URL filter, and only the elements an answer needs are kept:
 * anything else, such as headings or images, is unwrapped to its text.
 * Stage 7 limits links to the allowlist in data/james/links.ts.
 */
const ALLOWED = [
  "p",
  "strong",
  "em",
  "ul",
  "ol",
  "li",
  "a",
  "code",
  "pre",
  "br",
  "blockquote",
];

const components: Components = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  ),
};

export function AnswerMarkdown({ text }: { text: string }) {
  return (
    <div className="chat-markdown">
      <Markdown
        skipHtml
        allowedElements={ALLOWED}
        unwrapDisallowed
        components={components}
      >
        {text}
      </Markdown>
    </div>
  );
}
