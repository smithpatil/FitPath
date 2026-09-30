// Safety helpers for the AI coach. These run in OUR code, so they work even if the AI forgets its rules.

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const MAX_MESSAGE_CHARS = 500;
const MAX_HISTORY = 8;

// Words that suggest pain, injury or a health condition.
const MEDICAL =
  /\b(pain\w*|hurt\w*|ache\w*|aching|sore|injur\w*|sprain\w*|strain\w*|torn|tear|swell\w*|swollen|dizz\w*|faint\w*|numb\w*|tingl\w*|surgery|pregnan\w*|diabet\w*|blood pressure|heart (problem|condition|disease|attack)|asthma|arthritis|fracture\w*|broken|hernia|dislocat\w*|medication|medical|doctor|physio\w*|condition)\b/i;

// Extreme dieting or fast-weight-loss talk.
const DIET =
  /(starv\w*|crash diet|detox|cleanse|skip(ping)? meals|laxative\w*|\b\d{3,4} ?calories|lose \d+ ?(kg|kilos?|lbs?|pounds) in|fasting)/i;

export const MEDICAL_NOTE =
  "Because you mentioned pain, an injury or a health condition, please check with a doctor or physio before you continue. I cannot give medical advice.";
export const DIET_NOTE =
  "I cannot give diet plans or fast weight-loss advice. For food and weight questions, please talk to a doctor or a registered dietitian.";

export const needsMedicalNote = (text: string): boolean => MEDICAL.test(text);
export const needsDietNote = (text: string): boolean => DIET.test(text);

/** Add our fixed safety notes to the AI's reply when the user's message calls for them. */
export function withSafetyNotes(reply: string, userMessage: string): string {
  const notes: string[] = [];
  if (needsMedicalNote(userMessage)) notes.push(MEDICAL_NOTE);
  if (needsDietNote(userMessage)) notes.push(DIET_NOTE);
  return notes.length ? `${reply.trim()}\n\n${notes.join("\n")}` : reply.trim();
}

export type SanitizeResult = { ok: true; messages: ChatMessage[] } | { ok: false; error: string };

/**
 * Check chat history sent from the browser. Only "user" and "assistant" roles are allowed
 * (the browser must never be able to inject its own "system" instructions).
 */
export function sanitizeMessages(input: unknown): SanitizeResult {
  if (!Array.isArray(input) || input.length === 0) return { ok: false, error: "Please type a question." };
  const messages: ChatMessage[] = [];
  for (const m of input.slice(-MAX_HISTORY)) {
    if (typeof m !== "object" || m === null) return { ok: false, error: "Something was wrong with that message." };
    const { role, content } = m as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") {
      return { ok: false, error: "Something was wrong with that message." };
    }
    const text = content.trim();
    if (!text) return { ok: false, error: "Please type a question." };
    if (text.length > MAX_MESSAGE_CHARS) return { ok: false, error: `Please keep messages under ${MAX_MESSAGE_CHARS} characters.` };
    messages.push({ role, content: text });
  }
  if (messages[messages.length - 1].role !== "user") return { ok: false, error: "Please type a question." };
  return { ok: true, messages };
}
