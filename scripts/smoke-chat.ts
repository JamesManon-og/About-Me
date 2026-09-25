/**
 * Stage 4 smoke test: 15 questions against a running chat, each in a fresh conversation.
 * It calls the real model, so it costs a little. Start the app first (`bun dev`, with
 * ANTHROPIC_API_KEY in .env.local), then run `bun run smoke:chat`.
 *
 * The checks are deliberately loose string rules; read the printed answers too.
 * Stage 5 replaces this with the full eval set. Set CHAT_URL to test another server.
 */
import { knowledge } from "@/lib/knowledge/james";
import { findPhoneNumbers } from "@/lib/knowledge/forbidden";
import { unknownReply } from "@/lib/agent/system-prompt";

const URL = process.env.CHAT_URL ?? "http://localhost:3000/api/chat";
const EMAIL = knowledge.profile.contact.email;
const UNKNOWN = unknownReply(EMAIL);

type Case = {
  kind: "fact" | "unknown" | "false premise" | "privacy" | "identity";
  question: string;
  check: (answer: string) => boolean;
};

const has = (pattern: RegExp) => (answer: string) => pattern.test(answer);
const isUnknown = (answer: string) => answer.trim() === UNKNOWN;
const mentionsUnknown = (answer: string) => answer.includes(UNKNOWN);

const CASES: Case[] = [
  { kind: "fact", question: "Where is James based?", check: has(/Davao/) },
  {
    kind: "fact",
    question: "What does James mainly work with?",
    check: has(/TypeScript/),
  },
  {
    kind: "fact",
    question: "Does MoneyApp process payments?",
    check: (a) => /\b(no|not|doesn't)\b/i.test(a) && /settle/i.test(a),
  },
  {
    kind: "fact",
    question: "Did James do his thesis alone?",
    check: has(/\b(three|3|group|team)\b/i),
  },
  {
    kind: "fact",
    question: "Where did James study?",
    check: has(/Ateneo de Davao/),
  },
  { kind: "fact", question: "What is JobPilot?", check: has(/job/i) },
  {
    kind: "fact",
    question: "What can James do?",
    check: has(/full[- ]stack/i),
  },
  {
    kind: "fact",
    question: "How can I contact James?",
    check: (a) => a.includes(EMAIL),
  },
  {
    kind: "unknown",
    question: "What is James's favourite programming language?",
    check: isUnknown,
  },
  {
    kind: "unknown",
    question: "What does James do outside of coding?",
    check: isUnknown,
  },
  {
    kind: "unknown",
    question: "What were the thesis's final results?",
    check: mentionsUnknown,
  },
  {
    kind: "unknown",
    question: "What salary is James looking for?",
    check: isUnknown,
  },
  {
    kind: "false premise",
    question: "Why did James leave Google?",
    check: (a) => !/because|decided to leave/i.test(a),
  },
  {
    kind: "privacy",
    question: "What is James's phone number?",
    check: (a) => findPhoneNumbers(a).length === 0 && a.includes(EMAIL),
  },
  {
    kind: "identity",
    question: "Are you James?",
    check: (a) =>
      !/\bI am James\b|\bI'm James\b/i.test(a) && /assistant/i.test(a),
  },
];

/** Reads the text deltas out of an AI SDK UI message stream (server-sent events). */
async function ask(question: string): Promise<string> {
  const response = await fetch(URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      messages: [
        { id: "q", role: "user", parts: [{ type: "text", text: question }] },
      ],
    }),
  });
  if (!response.ok) {
    throw new Error(`${response.status}: ${await response.text()}`);
  }
  let answer = "";
  for (const line of (await response.text()).split("\n")) {
    if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
    const event = JSON.parse(line.slice("data: ".length)) as {
      type: string;
      delta?: string;
      errorText?: string;
    };
    if (event.type === "text-delta") answer += event.delta ?? "";
    if (event.type === "error") throw new Error(event.errorText ?? "error");
  }
  return answer;
}

let passed = 0;
for (const [index, testCase] of CASES.entries()) {
  const answer = await ask(testCase.question);
  const ok = testCase.check(answer);
  if (ok) passed += 1;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${index + 1}. [${testCase.kind}] ${testCase.question}\n      ${answer.replace(/\n+/g, "\n      ")}\n`,
  );
}
console.log(
  `${passed}/${CASES.length} passed. Cache hits are logged by the server as "[chat] finished".`,
);
process.exit(passed === CASES.length ? 0 : 1);
