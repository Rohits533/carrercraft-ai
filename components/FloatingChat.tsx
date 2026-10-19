"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  Loader2,
  MessageSquare,
  Minimize2
} from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your CareerCraft consultant. I know your saved resume — ask me to rewrite a bullet, prep you for an interview, or explore career moves."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, loading]);

  // Cooldown countdown when rate-limited
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || cooldown > 0) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    // Placeholder assistant message that will be filled by the stream
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        const msg =
          data.message ||
          "I'm thinking too fast — please wait a moment and try again.";
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: msg };
          return copy;
        });
        setCooldown(5);
        return;
      }

      if (!res.ok || !res.body) {
        throw new Error("Chat failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: accumulated
          };
          return copy;
        });
      }

      if (!accumulated) {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: "I couldn't form a reply just now. Try again?"
          };
          return copy;
        });
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content:
            "Sorry, I couldn't respond just now. Please try again in a moment."
        };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const disabled = loading || cooldown > 0 || !input.trim();

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-navy-900 text-white shadow-card transition hover:bg-navy-800"
            aria-label="Open career chat"
          >
            <MessageSquare className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card"
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-navy-900 text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-navy-900">
                    CareerCraft Copilot
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Gemini · online
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-navy-900"
                aria-label="Minimize chat"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 px-4 py-4 scrollbar-thin"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-navy-900 text-white"
                        : "border border-slate-200 bg-white text-navy-900 shadow-soft"
                    }`}
                  >
                    {m.content || (loading && i === messages.length - 1 ? (
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:120ms]" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:240ms]" />
                      </span>
                    ) : null)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 bg-white p-3">
              {cooldown > 0 && (
                <div className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  Take a breath — you can send again in {cooldown}s.
                </div>
              )}
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Ask about your resume..."
                  className="max-h-32 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-navy-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
                <button
                  onClick={send}
                  disabled={disabled}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-900 text-white transition hover:bg-navy-800 disabled:opacity-40"
                  aria-label="Send message"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
