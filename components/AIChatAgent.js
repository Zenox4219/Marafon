"use client";
import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `Ты — AI-ассистент сайта MarathonTrack. Помогаешь пользователям с вопросами о марафонах, беге, регистрации, BMI-калькуляторе и функциях сайта.

О сайте:
- MarathonTrack — платформа для регистрации на марафоны и тренировки
- Пользователи могут войти через Google, просматривать марафоны, участвовать в гонках
- Есть таблица лидеров по километрам, калькулятор BMI, личный профиль
- Поддержка доступна через Telegram-бота

Отвечай дружелюбно, кратко и по делу. Отвечай на том языке, на котором задан вопрос.`;

export default function AIChatAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Привет! 👋 Я AI-ассистент MarathonTrack. Могу ответить на любые вопросы о сайте, марафонах или беге. Чем помочь?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Build messages for API (add system prompt at start)
      const apiMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...newMessages.map((m) => ({ role: m.role, content: m.content })),
      ];

      // Call our own Next.js API route — keeps GROQ_API_KEY secret on server
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();
      const reply = data.reply || "Извини, что-то пошло не так. Попробуй ещё раз.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Ошибка соединения. Попробуй позже." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Открыть AI чат"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1000,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "var(--accent, #e8f400)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 24px rgba(232,244,0,.5)",
          fontSize: 24,
          transition: "transform .2s, box-shadow .2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: "fixed",
          bottom: 90,
          right: 24,
          zIndex: 1000,
          width: "min(380px, calc(100vw - 32px))",
          height: 480,
          background: "var(--surface, #111)",
          border: "1px solid var(--border, rgba(255,255,255,.1))",
          borderRadius: 16,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,.6)",
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 18px",
            borderBottom: "1px solid var(--border, rgba(255,255,255,.1))",
            background: "rgba(232,244,0,.06)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <span style={{ fontSize: 22 }}>🤖</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, fontFamily: "Inter, sans-serif" }}>AI Ассистент</div>
              <div style={{ fontSize: 11, color: "var(--muted, #888)" }}>MarathonTrack · онлайн</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "82%",
                  padding: "10px 14px",
                  borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: m.role === "user" ? "var(--accent, #e8f400)" : "rgba(255,255,255,.07)",
                  color: m.role === "user" ? "#000" : "var(--text, #fff)",
                  fontSize: 13,
                  lineHeight: 1.5,
                  fontFamily: "Inter, sans-serif",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                  padding: "10px 16px",
                  borderRadius: "14px 14px 14px 4px",
                  background: "rgba(255,255,255,.07)",
                  fontSize: 13,
                  color: "var(--muted, #888)",
                  fontFamily: "Inter, sans-serif",
                  display: "flex",
                  gap: 4,
                  alignItems: "center",
                }}>
                  <span className="dot-pulse">●</span>
                  <span className="dot-pulse" style={{ animationDelay: ".2s" }}>●</span>
                  <span className="dot-pulse" style={{ animationDelay: ".4s" }}>●</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: "12px 14px",
            borderTop: "1px solid var(--border, rgba(255,255,255,.1))",
            display: "flex",
            gap: 8,
          }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Напиши сообщение..."
              rows={1}
              style={{
                flex: 1,
                resize: "none",
                background: "rgba(255,255,255,.06)",
                border: "1px solid var(--border, rgba(255,255,255,.12))",
                borderRadius: 10,
                padding: "9px 12px",
                color: "var(--text, #fff)",
                fontSize: 13,
                fontFamily: "Inter, sans-serif",
                outline: "none",
                maxHeight: 80,
                overflowY: "auto",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: loading || !input.trim() ? "rgba(232,244,0,.3)" : "var(--accent, #e8f400)",
                border: "none",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                alignSelf: "flex-end",
                transition: "background .2s",
                flexShrink: 0,
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: .2; }
          40% { opacity: 1; }
        }
        .dot-pulse {
          animation: dotPulse 1.4s infinite ease-in-out;
          font-size: 8px;
        }
      `}</style>
    </>
  );
}
