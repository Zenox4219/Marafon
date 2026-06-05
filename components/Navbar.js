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
          <Link href="/leaderboard" className="nav-link">Участники</Link>
          <Link href="/bmi" className="nav-link">BMI</Link>
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
      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </>
  );
}
