"use client";

import { useEffect, useRef, useState } from "react";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

export default function CoachChat({ suggestions }: { suggestions: string[] }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages, loading]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setInput("");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8">
      {/* aria-live makes screen readers read new answers out */}
      <div aria-live="polite" className="space-y-4">
        {messages.length === 0 && (
          <div>
            <p className="font-medium">Try asking:</p>
            <ul className="mt-3 flex flex-wrap gap-3">
              {suggestions.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border-2 border-accent px-5 py-2 text-base font-medium text-accent hover:bg-accent-soft"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <p
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-5 py-3 ${
                m.role === "user" ? "bg-accent text-white" : "bg-gray-100 text-ink"
              }`}
            >
              <span className="sr-only">{m.role === "user" ? "You: " : "Coach: "}</span>
              {m.content}
            </p>
          </div>
        ))}
        {loading && <p className="text-muted">The coach is thinking…</p>}
        <div ref={endRef} />
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-amber-900">
          {error}
        </p>
      )}

      <form
        className="mt-6 flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <div className="min-w-0 flex-1">
          <label htmlFor="question" className="block font-medium">
            Your question
          </label>
          <input
            id="question"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={500}
            autoComplete="off"
            className="mt-1 w-full rounded-xl border-2 border-gray-500 px-4 py-3"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-full bg-accent px-8 py-3 text-lg font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
