"use client";
import { useEffect, useState } from "react";

const NEXT_MARATHON = {
  name: "Астана Марафон 2026",
  date: new Date("2026-06-15T09:00:00"),
};

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(null);
  const [visible, setVisible] = useState(true);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    function calc() {
      const diff = NEXT_MARATHON.date - new Date();
      if (diff <= 0) return setTimeLeft(null);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  if (!visible || !timeLeft) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      zIndex: 500,
      width: minimized ? "auto" : 300,
      background: "#111",
      border: "1px solid #222",
      borderRadius: 12,
      boxShadow: "0 8px 32px rgba(0,0,0,.6)",
      overflow: "hidden",
      transition: "all .3s ease",
      fontFamily: "Inter, sans-serif",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: minimized ? "10px 14px" : "14px 16px",
        background: "#0a0a0a",
        borderBottom: minimized ? "none" : "1px solid #1a1a1a",
        cursor: "pointer",
      }} onClick={() => setMinimized(!minimized)}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>🏃</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#e8f400", letterSpacing: 1, textTransform: "uppercase" }}>
            {minimized ? "До марафона" : NEXT_MARATHON.name}
          </span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={(e) => { e.stopPropagation(); setMinimized(!minimized); }} style={{ background: "none", border: "none", color: "#555", fontSize: 16, cursor: "pointer", lineHeight: 1, padding: "0 4px" }}>{minimized ? "▲" : "▼"}</button>
          <button onClick={(e) => { e.stopPropagation(); setVisible(false); }} style={{ background: "none", border: "none", color: "#555", fontSize: 16, cursor: "pointer", lineHeight: 1, padding: "0 4px" }}>×</button>
        </div>
      </div>
      {!minimized && (
        <div style={{ padding: "16px" }}>
          <div style={{ fontSize: 11, color: "#555", marginBottom: 14, letterSpacing: .5 }}>📅 15 июня 2026 · Астана</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {[[timeLeft.days, "ДНИ"],[timeLeft.hours, "ЧАС"],[timeLeft.minutes, "МИН"],[timeLeft.seconds, "СЕК"]].map(([val, label]) => (
              <div key={label} style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 8, padding: "10px 4px", textAlign: "center" }}>
                <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 28, color: "#e8f400", lineHeight: 1, marginBottom: 4 }}>{pad(val)}</div>
                <div style={{ fontSize: 9, color: "#444", letterSpacing: 1.5, fontWeight: 700 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {minimized && (
        <div style={{ padding: "8px 14px", display: "flex", gap: 8, alignItems: "center" }}>
          {[[timeLeft.days, "д"],[timeLeft.hours, "ч"],[timeLeft.minutes, "м"],[timeLeft.seconds, "с"]].map(([val, label]) => (
            <span key={label} style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 18, color: "#e8f400" }}>
              {pad(val)}<span style={{ fontSize: 11, color: "#555", marginLeft: 1 }}>{label}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
