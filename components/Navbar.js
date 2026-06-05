"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import AuthModal from "./AuthModal";
import { isAdmin } from "@/lib/adminConfig";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <nav>
        <Link href="/" className="nav-logo">MarathonTrack</Link>
        <div className="nav-links">
          <Link href="/marathons" className="nav-link">Марафоны</Link>
          <Link href="/leaderboard" className="nav-link">Лидеры</Link>
          {user ? (
            <>
              <Link href="/profile" className="nav-link">Профиль</Link>
              {isAdmin(user) && (
                <Link href="/admin" className="nav-link" style={{ color: "var(--accent)", fontWeight: 600 }}>
                  ⚙️ Админ
                </Link>
              )}
              <button className="nav-link" onClick={logout}>Выйти</button>
            </>
          ) : (
            <button className="btn-nav" onClick={() => setShowModal(true)}>Войти</button>
          )}
        </div>
      </nav>

      {/* Кнопка поддержки */}
      
        href="https://t.me/marathon_zamir_bot"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed",
          bottom: 24,
          left: 24,
          zIndex: 500,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 20px",
          background: "#229ED9",
          color: "#fff",
          borderRadius: 50,
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: 14,
          textDecoration: "none",
          boxShadow: "0 4px 20px rgba(34,158,217,.4)",
          transition: "transform .2s, opacity .2s",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
        onMouseLeave={e => e.currentTarget.style.transform = "none"}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.883 13.99l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.95l.432-.381z"/>
        </svg>
        Поддержка
      </a>

      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </>
  );
}
