/**
 * Shared utilities for the Chatbot component.
 */

/** Unique ID using Web Crypto — no collisions unlike Date.now() arithmetic. */
export function uid(): string {
  return crypto.randomUUID();
}

/** Maps API errors to user-friendly messages. Single source of truth used by
 *  both text sendMessage and voice runConversationLoop. */
export function getErrorMessage(error: unknown): string {
  const err = error as any;
  const status = err?.status ?? err?.response?.status;
  const msg: string = err?.message?.toLowerCase() ?? '';

  if (status === 429 || msg.includes('rate limit')) {
    return "I've hit my API rate limit for now. Please try again in a few minutes — or come back tomorrow. Sorry for the inconvenience!";
  }
  if (status === 401 || msg.includes('api key')) {
    return "There's an API key configuration issue. Please contact me at ramanathanmurugappan29@gmail.com.";
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return "Network error — please check your internet connection and try again.";
  }
  return `Something went wrong: ${err?.message || 'Unknown error'}. Please try again later.`;
}
