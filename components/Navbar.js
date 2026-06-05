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
                  Админ
                </Link>
              )}
              <button className="nav-link" onClick={logout}>Выйти</button>
            </>
          ) : (
            <button className="btn-nav" onClick={() => setShowModal(true)}>Войти</button>
          )}
        </div>
      </nav>

      
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
        }}
      >
        Поддержка
      </a>

      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </>
  );
}
