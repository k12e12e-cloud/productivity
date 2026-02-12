import { getSetting } from "@/db/queries/settings";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "anthropic/claude-sonnet-4-5";

function getApiKey(): string {
  const dbKey = getSetting("openrouter_api_key");
  return dbKey || process.env.OPENROUTER_API_KEY || "";
}

function headers() {
  return {
    Authorization: `Bearer ${getApiKey()}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "Productivity App",
  };
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function chatStream(system: string, messages: ChatMessage[]) {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      stream: true,
      stream_options: { include_usage: true },
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${body}`);
  }

  return res.body!;
}

export async function chatComplete(system: string, messages: ChatMessage[]) {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.choices[0].message.content as string;
}
