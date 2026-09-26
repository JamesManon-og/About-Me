import { Chat } from "@/components/chat/chat";
import { jsonLdScript, personJsonLd } from "@/lib/site";

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(personJsonLd()) }}
      />
      <Chat />
    </>
  );
}
