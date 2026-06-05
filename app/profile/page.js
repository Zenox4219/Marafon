"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getUser } from "@/lib/firestore";
import AuthModal from "@/components/AuthModal";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user === undefined) return; // still loading auth
    if (!user) { setLoading(false); return; }
    getUser(user.uid)
      .then(setProfile)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading || user === undefined) {
    return <div className="loading"><div className="spinner" />Загрузка...</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: "120px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
        <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 36, marginBottom: 12 }}>
          Войдите в аккаунт
        </div>
        <p style={{ color: "var(--muted)", marginBottom: 28 }}>
          Чтобы видеть свой профиль, нужно авторизоваться.
        </p>
        <button className="btn-primary" onClick={() => setShowModal(true)}>Войти</button>
        {showModal && <AuthModal onClose={() => setShowModal(false)} />}
      </div>
    );
  }

  const initials = (user.displayName || user.email || "?")[0].toUpperCase();

  return (
    <div className="section">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.photoURL ? <img src={user.photoURL} alt="" /> : initials}
          </div>
          <div>
            <div className="profile-name">{user.displayName || "Атлет"}</div>
            <div className="profile-email">{user.email}</div>
            <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
              Провайдер: {user.providerData?.[0]?.providerId === "google.com" ? "Google" : "Email"}
            </div>
          </div>
        </div>

        <div className="section-label" style={{ marginBottom: 16 }}>Статистика</div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="num">{profile?.totalKm?.toFixed(1) || "0"}</div>
            <div className="lbl">Километров</div>
          </div>
          <div className="stat-card">
            <div className="num">{profile?.finishedMarathons || "0"}</div>
            <div className="lbl">Марафонов</div>
          </div>
          <div className="stat-card">
            <div className="num" style={{ fontSize: 28, paddingTop: 8 }}>
              {profile?.createdAt
                ? new Date(profile.createdAt.seconds * 1000).toLocaleDateString("ru-RU", { month: "short", year: "numeric" })
                : "—"}
            </div>
            <div className="lbl">Участник с</div>
          </div>
        </div>

        <div style={{ marginTop: 40, padding: 24, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>Достижения</div>
          {(profile?.finishedMarathons || 0) === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 14 }}>
              Запишись на первый марафон и начни зарабатывать достижения! 🏅
            </p>
          ) : (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {(profile?.finishedMarathons || 0) >= 1 && <span style={{ padding: "6px 14px", background: "rgba(232,244,0,.1)", border: "1px solid var(--accent)", color: "var(--accent)", borderRadius: 4, fontSize: 13 }}>🏃 Первый финиш</span>}
              {(profile?.totalKm || 0) >= 100 && <span style={{ padding: "6px 14px", background: "rgba(232,244,0,.1)", border: "1px solid var(--accent)", color: "var(--accent)", borderRadius: 4, fontSize: 13 }}>💯 100 км</span>}
              {(profile?.finishedMarathons || 0) >= 5 && <span style={{ padding: "6px 14px", background: "rgba(232,244,0,.1)", border: "1px solid var(--accent)", color: "var(--accent)", borderRadius: 4, fontSize: 13 }}>⭐ Ветеран</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
