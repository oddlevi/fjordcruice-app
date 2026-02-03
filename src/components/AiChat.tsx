"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useTranslations, useLocale } from "next-intl";
import ReactMarkdown from "react-markdown";
import { PreferenceForm } from "./PreferenceForm";
import { DayPlan, type DayPlanData } from "./DayPlan";
import { MAX_MESSAGES_PER_SESSION } from "@/lib/constants";

function getMessageText(msg: UIMessage): string {
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export function AiChat() {
  const t = useTranslations("ai");
  const locale = useLocale();
  const [phase, setPhase] = useState<"preferences" | "loading" | "result">("preferences");
  const [sessionId] = useState(() => crypto.randomUUID());
  const [inputValue, setInputValue] = useState("");
  const [planData, setPlanData] = useState<DayPlanData | null>(null);
  const [streamedMarkdown, setStreamedMarkdown] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, setMessages } = useChat({
    id: sessionId,
    transport: new DefaultChatTransport({
      api: "/api/ai/chat",
      body: { session_id: sessionId, language: locale },
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";
  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const sessionEnded = userMessageCount >= MAX_MESSAGES_PER_SESSION;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handlePreferences(preferences: {
    duration: string;
    interests: string[];
    budget: string;
    group_type: string;
    fitness_level: string;
    travel_month: number;
  }) {
    setPhase("loading");

    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: locale, preferences }),
      });

      const contentType = res.headers.get("content-type") ?? "";

      // Structured plan JSON (fallback or future AI structured output)
      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (data.type === "plan") {
          setPlanData(data as DayPlanData);
          setPhase("result");
          return;
        }
      }

      // Streaming AI text response
      const reader = res.body?.getReader();
      if (!reader) return;

      let fullText = "";
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
      }

      if (fullText) {
        setStreamedMarkdown(fullText);
        setPhase("result");
      }
    } catch {
      setStreamedMarkdown(t("fallbackDescription"));
      setPhase("result");
    }
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage({ parts: [{ type: "text", text: inputValue }] });
    setInputValue("");
  }

  function handleStartOver() {
    setPhase("preferences");
    setPlanData(null);
    setStreamedMarkdown("");
    setMessages([]);
  }

  // --- Preferences form ---
  if (phase === "preferences") {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <PreferenceForm onSubmit={handlePreferences} />
      </div>
    );
  }

  // --- Loading ---
  if (phase === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-6 flex space-x-1.5">
          <span className="inline-block h-3 w-3 animate-bounce rounded-full bg-blue-600 [animation-delay:0ms]" />
          <span className="inline-block h-3 w-3 animate-bounce rounded-full bg-blue-500 [animation-delay:150ms]" />
          <span className="inline-block h-3 w-3 animate-bounce rounded-full bg-blue-400 [animation-delay:300ms]" />
        </div>
        <p className="text-lg font-medium text-slate-700">{t("thinking")}</p>
      </div>
    );
  }

  // --- Result ---
  return (
    <div className="space-y-8">
      {/* Structured day plan or streamed markdown */}
      {planData ? (
        <DayPlan plan={planData} onStartOver={handleStartOver} />
      ) : streamedMarkdown ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="prose prose-slate max-w-none prose-h2:text-2xl prose-h3:text-lg prose-a:text-blue-600">
              <ReactMarkdown>{streamedMarkdown}</ReactMarkdown>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleStartOver}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              {t("startOver") ?? "Change preferences"}
            </button>
          </div>
        </div>
      ) : null}

      {/* Follow-up Chat */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-3">
          <h3 className="text-sm font-semibold text-slate-800">{t("followUp") ?? "Have questions? Ask away!"}</h3>
          {!sessionEnded && (
            <p className="text-xs text-slate-400">
              {t("messagesLeft", { count: MAX_MESSAGES_PER_SESSION - userMessageCount })}
            </p>
          )}
        </div>

        {messages.length > 0 && (
          <div className="max-h-[300px] overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-slate max-w-none prose-p:my-1 prose-a:text-blue-600">
                      <ReactMarkdown>{getMessageText(msg)}</ReactMarkdown>
                    </div>
                  ) : (
                    getMessageText(msg)
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-400">
                  <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
                  <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                  <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {sessionEnded ? (
          <div className="border-t border-slate-200 px-5 py-3 text-center text-sm text-slate-400">
            {t("sessionEnded")}
          </div>
        ) : (
          <form
            onSubmit={handleSend}
            className="flex gap-2 border-t border-slate-200 p-4"
          >
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t("placeholder")}
              maxLength={500}
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm transition-colors focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
            >
              {t("send")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
