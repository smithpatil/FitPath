import { NextResponse } from "next/server";
import { WEEKDAYS } from "@/lib/dates";
import { createLimiter } from "@/lib/coach/rateLimit";
import { sanitizeMessages, withSafetyNotes } from "@/lib/coach/safety";
import { buildSystemPrompt } from "@/lib/coach/systemPrompt";
import { describeTarget } from "@/lib/labels";
import { EQUIPMENT, GOALS, LEVELS, LIMITATIONS } from "@/lib/onboarding";
import { getCurrentWeek } from "@/lib/planStore";
import { getProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

// The Groq API key is read here, on the SERVER only. It is never sent to the browser.
const limiter = createLimiter(8, 60_000); // 8 questions per minute per person

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });
const labelOf = <T,>(opts: { value: T; label: string }[], v: T) => opts.find((o) => o.value === v)?.label ?? String(v);

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("Please log in first.", 401);

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return fail("The coach is not set up yet.", 503);

  if (!limiter.allow(user.id)) return fail("You are sending messages very quickly. Please wait a minute.", 429);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Something was wrong with that message.", 400);
  }
  const parsed = sanitizeMessages((body as { messages?: unknown })?.messages);
  if (!parsed.ok) return fail(parsed.error, 400);

  const profile = await getProfile(supabase);
  if (!profile) return fail("Please finish the questions first.", 400);
  const week = await getCurrentWeek(supabase, user.id, profile);

  // Give the AI the user's plan so it can answer questions about it (it cannot change it).
  const plan = week.days.map((d) => {
    const items = d.items.map((i) => `${i.exercise.name} (${describeTarget(i.sets, i.reps, i.exercise.unit)})`);
    return `${WEEKDAYS[d.weekday]}: ${items.join(", ")}`;
  });
  const system = buildSystemPrompt({
    goal: labelOf(GOALS, profile.goal),
    level: labelOf(LEVELS, profile.level),
    days: profile.days,
    minutes: profile.minutes,
    equipment: profile.equipment.length ? profile.equipment.map((e) => labelOf(EQUIPMENT, e)).join(", ") : "No equipment",
    limitations: profile.limitations.length ? profile.limitations.map((l) => labelOf(LIMITATIONS, l)).join(", ") : "None",
    plan,
  });

  // Try the chosen model first, then fallbacks, in case Groq has retired or hidden one of them.
  const models = [process.env.GROQ_MODEL, "llama-3.1-8b-instant", "openai/gpt-oss-20b", "llama-3.3-70b-versatile"].filter(
    (m, i, all): m is string => !!m && all.indexOf(m) === i,
  );

  let res: Response | null = null;
  let lastDetail = "";
  for (const model of models) {
    try {
      res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [{ role: "system", content: system }, ...parsed.messages],
          temperature: 0.4,
          max_tokens: 350,
        }),
        signal: AbortSignal.timeout(20_000),
      });
    } catch (e) {
      console.error("[coach] request failed:", e instanceof Error ? e.message : e);
      return fail("The coach could not be reached. Please try again in a moment.", 502);
    }
    if (res.ok) break;
    lastDetail = (await res.text()).slice(0, 300);
    console.error("[coach] Groq error", res.status, model, lastDetail);
    if (!(res.status === 404 || lastDetail.includes("model_not_found"))) break; // only retry when the model is missing
  }

  if (!res || !res.ok) {
    const status = res?.status ?? 502;
    // While developing, show the real reason on screen (never in production).
    if (process.env.NODE_ENV === "development") return fail(`Groq said (${status}): ${lastDetail}`, 502);
    if (status === 429) return fail("The free coach is busy right now. Please try again in a minute.", 429);
    if (status === 401) return fail("The coach is not set up correctly yet.", 503);
    return fail("The coach could not answer right now. Please try again later.", 502);
  }

  const data = await res.json();
  const text: string = data?.choices?.[0]?.message?.content ?? "";
  const lastUser = parsed.messages[parsed.messages.length - 1].content;
  const reply = withSafetyNotes(text || "Sorry, I could not think of an answer. Could you ask that another way?", lastUser);
  return NextResponse.json({ reply });
}
