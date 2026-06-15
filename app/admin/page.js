"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { isAdmin } from "@/lib/adminConfig";
import {
  getAllUsers, deleteUser,
  getMarathons, addMarathon, updateMarathon, deleteMarathon,
  getLeaderboard,
} from "@/lib/firestore";
import {
  exportUsersCSV, exportUsersExcel,
  exportMarathonsCSV, exportMarathonsExcel,
  exportAllCSV, exportAllExcel,
} from "@/lib/exportUtils";

const TABS = ["📊 Статистика", "👥 Пользователи", "🏃 Марафоны", "📥 Экспорт"];

const emptyForm = { title: "", type: "marathon", city: "", date: "", distance: "", participants: 0, desc: "" };

export default function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [marathons, setMarathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null); // marathon id being edited
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // { type, id, name }

  useEffect(() => {
    if (!user || !isAdmin(user)) return;
    Promise.all([getAllUsers(), getMarathons()])
      .then(([u, m]) => { setUsers(u); setMarathons(m); })
      .finally(() => setLoading(false));
  }, [user]);

  if (user === undefined) return <div className="loading"><div className="spinner" />Загрузка...</div>;
  if (!user || !isAdmin(user)) {
    return (
      <div style={{ padding: "120px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
        <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 40, marginBottom: 12 }}>Нет доступа</div>
        <p style={{ color: "var(--muted)" }}>Эта страница только для администраторов.</p>
      </div>
    );
  }

  // ── Stats ──
  const totalKm = users.reduce((s, u) => s + (u.totalKm || 0), 0);
  const totalFinished = users.reduce((s, u) => s + (u.finishedMarathons || 0), 0);

  // ── Delete handlers ──
  async function handleDeleteUser(u) {
    if (!confirm(`Удалить пользователя ${u.displayName || u.email}?`)) return;
    await deleteUser(u.uid || u.id);
    setUsers((prev) => prev.filter((x) => (x.uid || x.id) !== (u.uid || u.id)));
  }

  async function handleDeleteMarathon(m) {
    if (!confirm(`Удалить марафон "${m.title}"?`)) return;
    await deleteMarathon(m.id);
    setMarathons((prev) => prev.filter((x) => x.id !== m.id));
  }

  // ── Marathon form ──
  function openAdd() { setForm(emptyForm); setEditing(null); setShowForm(true); }
  function openEdit(m) { setForm({ title: m.title, type: m.type, city: m.city, date: m.date, distance: m.distance, participants: m.participants || 0, desc: m.desc || "" }); setEditing(m.id); setShowForm(true); }

  async function handleSaveMarathon(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateMarathon(editing, form);
        setMarathons((prev) => prev.map((m) => m.id === editing ? { ...m, ...form } : m));
      } else {
        const ref = await addMarathon(form);
        setMarathons((prev) => [...prev, { id: ref.id, ...form }]);
      }
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  const inp = (field, label, type = "text", opts = {}) => (
    <div className="form-group">
      <label>{label}</label>
      <input
        type={type}
        value={form[field]}
        onChange={(e) => setForm((p) => ({ ...p, [field]: type === "number" ? Number(e.target.value) : e.target.value }))}
        {...opts}
        required
      />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ padding: "40px 24px 0", borderBottom: "1px solid var(--border)", marginBottom: 0 }}>
        <div className="container">
          <div className="section-label">Панель управления</div>
          <h1 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "clamp(40px,6vw,64px)", letterSpacing: 1, marginBottom: 24 }}>
            Admin Panel
          </h1>
          <div style={{ display: "flex", gap: 4 }}>
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setTab(i)} style={{
                padding: "10px 20px",
                borderRadius: "var(--radius) var(--radius) 0 0",
                border: "1px solid",
                borderBottom: i === tab ? "1px solid var(--bg)" : "1px solid var(--border)",
                background: i === tab ? "var(--bg)" : "var(--surface)",
                color: i === tab ? "var(--accent)" : "var(--muted)",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                marginBottom: i === tab ? -1 : 0,
                transition: "color .2s",
              }}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">
          {loading ? (
            <div className="loading"><div className="spinner" />Загрузка данных...</div>
          ) : (
            <>
              {/* ── TAB 0: Stats ── */}
              {tab === 0 && (
                <div>
                  <div className="stats-grid" style={{ marginBottom: 40 }}>
                    {[
                      ["num", users.length, "Пользователей"],
                      ["num", marathons.length, "Марафонов"],
                      ["num", totalKm.toFixed(0), "Км пробежано"],
                      ["num", totalFinished, "Финишей"],
                    ].map(([, n, l]) => (
                      <div className="stat-card" key={l}>
                        <div className="num">{n}</div>
                        <div className="lbl">{l}</div>
                      </div>
                    ))}
                  </div>

                  <div className="section-label" style={{ marginBottom: 16 }}>Последние регистрации</div>
                  <div style={{ overflowX: "auto" }}>
                    <table className="lb-table">
                      <thead><tr><th>Пользователь</th><th>Email</th><th>Км</th><th>Марафонов</th></tr></thead>
                      <tbody>
                        {[...users].slice(0, 10).map((u, i) => (
                          <tr key={u.uid || i}>
                            <td>
                              <span className="lb-avatar">{(u.displayName || "?")[0].toUpperCase()}</span>
                              {u.displayName || "—"}
                            </td>
                            <td style={{ color: "var(--muted)", fontSize: 13 }}>{u.email}</td>
                            <td><span className="lb-km">{(u.totalKm || 0).toFixed(1)}</span></td>
                            <td style={{ color: "var(--muted)" }}>{u.finishedMarathons || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── TAB 1: Users ── */}
              {tab === 1 && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <div style={{ color: "var(--muted)", fontSize: 14 }}>Всего: <b style={{ color: "var(--text)" }}>{users.length}</b> пользователей</div>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table className="lb-table">
                      <thead>
                        <tr>
                          <th>Пользователь</th>
                          <th>Email</th>
                          <th>Км</th>
                          <th>Марафонов</th>
                          <th>Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u, i) => (
                          <tr key={u.uid || i}>
                            <td>
                              <span className="lb-avatar">
                                {u.photoURL ? <img src={u.photoURL} alt="" /> : (u.displayName || "?")[0].toUpperCase()}
                              </span>
                              {u.displayName || "Аноним"}
                            </td>
                            <td style={{ color: "var(--muted)", fontSize: 13 }}>{u.email || "—"}</td>
                            <td><span className="lb-km">{(u.totalKm || 0).toFixed(1)}</span></td>
                            <td style={{ color: "var(--muted)" }}>{u.finishedMarathons || 0}</td>
                            <td>
                              <button
                                onClick={() => handleDeleteUser(u)}
                                style={{ padding: "5px 12px", background: "rgba(255,77,0,.15)", border: "1px solid rgba(255,77,0,.3)", color: "#ff6b35", borderRadius: "var(--radius)", fontSize: 12, cursor: "pointer", fontFamily: "Inter, sans-serif" }}
                              >Удалить</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── TAB 3: Export ── */}
              {tab === 3 && (
                <div>
                  <div style={{ marginBottom: 32 }}>
                    <div className="section-label" style={{ marginBottom: 8 }}>Экспорт всех данных</div>
                    <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 20 }}>
                      Выгрузите все данные из Firebase в удобный формат. Excel-файл содержит два листа: Пользователи и Марафоны.
                    </p>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <button
                        onClick={() => exportAllExcel(users, marathons)}
                        className="btn-primary"
                        style={{ padding: "12px 24px", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}
                      >
                        📊 Скачать Excel (все данные)
                      </button>
                      <button
                        onClick={() => exportAllCSV(users, marathons)}
                        style={{
                          padding: "12px 24px", fontSize: 14,
                          background: "rgba(255,255,255,.06)", border: "1px solid var(--border)",
                          borderRadius: "var(--radius)", color: "var(--text)", cursor: "pointer",
                          fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", gap: 8,
                        }}
                      >
                        📄 Скачать CSV (все данные)
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 20 }}>
                    {/* Users export */}
                    <div className="card" style={{ cursor: "default" }}>
                      <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
                      <h3 style={{ marginBottom: 6 }}>Пользователи</h3>
                      <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 20 }}>
                        {users.length} записей · UID, Имя, Email, Км, Марафонов
                      </p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => exportUsersExcel(users)}
                          style={{
                            flex: 1, padding: "9px", fontSize: 12, cursor: "pointer",
                            background: "rgba(232,244,0,.1)", border: "1px solid rgba(232,244,0,.3)",
                            color: "var(--accent)", borderRadius: "var(--radius)", fontFamily: "Inter, sans-serif",
                          }}
                        >📊 Excel</button>
                        <button
                          onClick={() => exportUsersCSV(users)}
                          style={{
                            flex: 1, padding: "9px", fontSize: 12, cursor: "pointer",
                            background: "rgba(255,255,255,.05)", border: "1px solid var(--border)",
                            color: "var(--muted)", borderRadius: "var(--radius)", fontFamily: "Inter, sans-serif",
                          }}
                        >📄 CSV</button>
                      </div>
                    </div>

                    {/* Marathons export */}
                    <div className="card" style={{ cursor: "default" }}>
                      <div style={{ fontSize: 32, marginBottom: 12 }}>🏃</div>
                      <h3 style={{ marginBottom: 6 }}>Марафоны</h3>
                      <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 20 }}>
                        {marathons.length} записей · Название, Город, Дата, Дистанция, Участники
                      </p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => exportMarathonsExcel(marathons)}
                          style={{
                            flex: 1, padding: "9px", fontSize: 12, cursor: "pointer",
                            background: "rgba(232,244,0,.1)", border: "1px solid rgba(232,244,0,.3)",
                            color: "var(--accent)", borderRadius: "var(--radius)", fontFamily: "Inter, sans-serif",
                          }}
                        >📊 Excel</button>
                        <button
                          onClick={() => exportMarathonsCSV(marathons)}
                          style={{
                            flex: 1, padding: "9px", fontSize: 12, cursor: "pointer",
                            background: "rgba(255,255,255,.05)", border: "1px solid var(--border)",
                            color: "var(--muted)", borderRadius: "var(--radius)", fontFamily: "Inter, sans-serif",
                          }}
                        >📄 CSV</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 2: Marathons ── */}
              {tab === 2 && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <div style={{ color: "var(--muted)", fontSize: 14 }}>Всего: <b style={{ color: "var(--text)" }}>{marathons.length}</b> марафонов</div>
                    <button className="btn-primary" onClick={openAdd} style={{ padding: "10px 22px", fontSize: 13 }}>+ Добавить</button>
                  </div>

                  <div className="cards-grid">
                    {marathons.map((m) => (
                      <div className="card" key={m.id} style={{ cursor: "default" }}>
                        <span className={`card-badge ${m.type === "marathon" ? "badge-marathon" : "badge-training"}`}>
                          {m.type === "marathon" ? "Марафон" : "Тренировка"}
                        </span>
                        <h3>{m.title}</h3>
                        <p>{m.desc}</p>
                        <div className="card-meta">
                          <span>📍 {m.city}</span>
                          <span>📏 {m.distance}</span>
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                          <button onClick={() => openEdit(m)} style={{ flex: 1, padding: "7px", background: "rgba(232,244,0,.1)", border: "1px solid rgba(232,244,0,.3)", color: "var(--accent)", borderRadius: "var(--radius)", fontSize: 12, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                            ✏️ Редактировать
                          </button>
                          <button onClick={() => handleDeleteMarathon(m)} style={{ flex: 1, padding: "7px", background: "rgba(255,77,0,.1)", border: "1px solid rgba(255,77,0,.3)", color: "#ff6b35", borderRadius: "var(--radius)", fontSize: 12, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                            🗑 Удалить
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Marathon form modal ── */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal" style={{ maxWidth: 520, position: "relative" }}>
            <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
            <h2>{editing ? "Редактировать" : "Новый марафон"}</h2>
            <p className="sub">Заполни информацию о забеге</p>
            <form onSubmit={handleSaveMarathon}>
              {inp("title", "Название")}
              <div className="form-group">
                <label>Тип</label>
                <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                  style={{ width: "100%", padding: "12px 14px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: 14, fontFamily: "Inter, sans-serif", outline: "none" }}>
                  <option value="marathon">Марафон</option>
                  <option value="training">Тренировка</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>{inp("city", "Город")}</div>
                <div>{inp("date", "Дата")}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>{inp("distance", "Дистанция", "text", { placeholder: "42.2 км" })}</div>
                <div>{inp("participants", "Участников", "number", { min: 0 })}</div>
              </div>
              {inp("desc", "Описание")}
              <button type="submit" className="btn-primary btn-full" disabled={saving} style={{ marginTop: 8 }}>
                {saving ? "Сохранение..." : editing ? "Сохранить изменения" : "Добавить марафон"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
