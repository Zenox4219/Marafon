"use client";
import { useEffect, useState } from "react";
import { getMarathons } from "@/lib/firestore";

// Seed data shown when Firestore is empty
const SEED = [
  { id: "1", type: "marathon", title: "Астана Марафон 2026", date: "15 июня 2026", distance: "42.2 км", participants: 840, city: "Астана", desc: "Главный забег года по улицам столицы Казахстана." },
  { id: "2", type: "training", title: "Подготовка к полумарафону", date: "1–30 мая 2026", distance: "21.1 км", participants: 312, city: "Онлайн", desc: "8-недельный план подготовки с личным тренером." },
  { id: "3", type: "marathon", title: "Алматы Горный Трейл", date: "20 июля 2026", distance: "50 км", participants: 195, city: "Алматы", desc: "Экстремальный горный трейл в предгорьях Алатау." },
  { id: "4", type: "training", title: "Старт: 5 км за 4 недели", date: "Постоянно", distance: "5 км", participants: 1200, city: "Онлайн", desc: "Программа для начинающих. Первый забег без остановок." },
  { id: "5", type: "marathon", title: "Шымкент Ночной Забег", date: "5 августа 2026", distance: "10 км", participants: 430, city: "Шымкент", desc: "Ночной забег по освещённым улицам Шымкента." },
  { id: "6", type: "marathon", title: "Каспийский Марафон", date: "12 сентября 2026", distance: "42.2 км", participants: 267, city: "Актау", desc: "Берег Каспия, морской воздух и финиш у воды." },
];

export default function MarathonsPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMarathons()
      .then((data) => setItems(data.length ? data : SEED))
      .catch(() => setItems(SEED))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? items : items.filter((m) => m.type === filter);

  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="section-label">Каталог</div>
          <h1>Марафоны & Тренировки</h1>
        </div>
      </div>

      <div className="section">
        <div className="container">
          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 40 }}>
            {[["all", "Все"], ["marathon", "Марафоны"], ["training", "Тренировки"]].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setFilter(v)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "var(--radius)",
                  border: "1px solid",
                  borderColor: filter === v ? "var(--accent)" : "var(--border)",
                  background: filter === v ? "rgba(232,244,0,.1)" : "transparent",
                  color: filter === v ? "var(--accent)" : "var(--muted)",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  transition: "all .2s",
                }}
              >{l}</button>
            ))}
          </div>

          {loading ? (
            <div className="loading"><div className="spinner" />Загрузка...</div>
          ) : (
            <div className="cards-grid">
              {filtered.map((m) => (
                <div className="card" key={m.id}>
                  <span className={`card-badge ${m.type === "marathon" ? "badge-marathon" : "badge-training"}`}>
                    {m.type === "marathon" ? "Марафон" : "Тренировка"}
                  </span>
                  <h3>{m.title}</h3>
                  <p>{m.desc}</p>
                  <div className="card-meta">
                    <span>📍 {m.city}</span>
                    <span>📏 {m.distance}</span>
                    <span>👥 {m.participants}</span>
                  </div>
                  <div style={{ marginTop: 16, fontSize: 12, color: "var(--muted)" }}>🗓 {m.date}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
