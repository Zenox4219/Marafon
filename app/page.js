"use client";
import { useState } from "react";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

export default function HomePage() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="hero">
        <div className="container">
          <div className="hero-tag">🏃 MarathonTrack 2026</div>
          <h1>
            Беги.<br />
            <span>Расти.</span><br />
            Побеждай.
          </h1>
          <p>
            Платформа для настоящих атлетов. Записывайся на марафоны,
            отслеживай результаты и соревнуйся с лучшими.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link href="/marathons" className="btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>
                Смотреть марафоны →
              </Link>
            ) : (
              <>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                  Начать сейчас
                </button>
                <Link href="/marathons" className="btn-secondary" style={{ textDecoration: "none", display: "inline-block" }}>
                  Смотреть марафоны
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "32px 24px" }}>
        <div className="container" style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
          {[["1 200+", "Участников"], ["48", "Марафонов"], ["320 000", "км пробежано"], ["99.2%", "Довольных атлетов"]].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 36, color: "var(--accent)", letterSpacing: 1 }}>{n}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="section">
        <div className="container">
          <div className="section-label">Возможности</div>
          <div className="section-title">Всё в одном месте</div>
          <div className="cards-grid">
            {[
              { icon: "🏆", title: "Марафоны и тренировки", desc: "Каталог забегов разных дистанций — от 5 км до полного марафона." },
              { icon: "📊", title: "Таблица лидеров", desc: "Соревнуйся с другими атлетами. Реальный рейтинг по пройденным километрам." },
              { icon: "👤", title: "Личный кабинет", desc: "Вся твоя статистика в одном месте. Прогресс, история, достижения." },
              { icon: "🔐", title: "Быстрая авторизация", desc: "Вход через Google или email — без лишних шагов." },
            ].map((f) => (
              <div className="card" key={f.title}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p style={{ marginBottom: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </>
  );
}
