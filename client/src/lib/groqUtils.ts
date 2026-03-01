/**
 * Shared utilities for Groq API calls used by AI Tools agents.
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

export type GroqMessage =
  | { role: 'system' | 'user'; content: string }
  | { role: 'assistant'; content: string | null; tool_calls?: ToolCall[] }
  | { role: 'tool'; tool_call_id: string; content: string };

// ── JSON mode call ─────────────────────────────────────────────────────────────

export async function groqJSON<T>(systemPrompt: string, userMessage: string): Promise<T> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) throw new Error('VITE_GROQ_API_KEY is not set');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage  },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    }),
  });

  if (!res.ok) throw new Error(`Groq API error ${res.status}`);
  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? '';
  if (!content) throw new Error('Empty response from Groq');

  // Strip markdown code fences if present
  const cleaned = content.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(cleaned) as T;
}

// ── Prompt injection detection (shared across all agents) ─────────────────────

const INJECTION_PATTERNS = [
  /ignore\s+(previous|prior|above|all)\s+(instructions?|prompts?|rules?|context)/i,
  /you\s+are\s+now\s+(a|an|the)/i,
  /act\s+as\s+(a|an|the)/i,
  /pretend\s+(to\s+be|you\s+are)/i,
  /jailbreak/i,
  /\bDAN\b/,
  /developer\s+mode/i,
  /system\s+override/i,
  /reveal\s+(your\s+)?(system\s+)?prompt/i,
  /show\s+(me\s+)?(your\s+)?(system\s+)?prompt/i,
  /forget\s+(everything|your\s+instructions?|all\s+previous)/i,
  /disregard\s+(all|previous|your)/i,
  /<\|im_end\|>/,
  /\[SYSTEM\]/,
  /\[INST\]/,
] as const;

export function detectInjection(text: string): boolean {
  return INJECTION_PATTERNS.some(p => (p as RegExp).test(text));
}

/** Max chars for free-text JD / resume inputs (longer than chat) */
export const MAX_JD_INPUT = 4000;
/** Max chars for question inputs */
export const MAX_Q_INPUT  = 500;

// ── Tool-calling mode call ─────────────────────────────────────────────────────

export async function groqToolCall(
  messages: GroqMessage[],
  tools: object[],
): Promise<{ content: string | null; tool_calls?: ToolCall[] }> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) throw new Error('VITE_GROQ_API_KEY is not set');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      tools,
      tool_choice: 'auto',
      max_tokens: 500,
      temperature: 0.3,
    }),
  });
  if (!res.ok) throw new Error(`Groq API error ${res.status}`);
  const data = await res.json();
  const msg = data.choices[0].message;
  return { content: msg.content ?? null, tool_calls: msg.tool_calls };
}
