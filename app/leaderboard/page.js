"use client";
import { useEffect, useState } from "react";
import { getAllUsers } from "@/lib/firestore";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ParticipantsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    async function load() {
      try {
        const allUsers = await getAllUsers();
        const bmiSnap = await getDocs(collection(db, "bmi_records"));
        const bmiMap = {};
        bmiSnap.forEach((d) => { bmiMap[d.id] = d.data(); });
        const merged = allUsers.map((u) => ({ ...u, bmiData: bmiMap[u.uid] || null }));
        setUsers(merged);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = users
    .filter((u) => (u.displayName || u.email || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return (a.displayName || "").localeCompare(b.displayName || "");
      if (sortBy === "bmi") return (b.bmiData?.bmi || 0) - (a.bmiData?.bmi || 0);
      if (sortBy === "km") return (b.totalKm || 0) - (a.totalKm || 0);
      return 0;
    });

  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="section-label">Сообщество</div>
          <h1>Список участников</h1>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            <input
              placeholder="Поиск по имени..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1, minWidth: 200, padding: "10px 14px",
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "var(--radius)", color: "var(--text)",
                fontSize: 14, fontFamily: "Inter, sans-serif", outline: "none",
              }}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "10px 14px", background: "var(--surface)",
                border: "1px solid var(--border)", borderRadius: "var(--radius)",
                color: "var(--text)", fontSize: 14, fontFamily: "Inter, sans-serif",
                outline: "none", cursor: "pointer",
              }}
            >
              <option value="name">По имени</option>
              <option value="bmi">По BMI</option>
              <option value="km">По км</option>
            </select>
          </div>

          <div style={{ marginBottom: 16, fontSize: 13, color: "var(--muted)" }}>
            Всего участников: <strong style={{ color: "var(--text)" }}>{filtered.length}</strong>
          </div>

          {loading ? (
            <div className="loading"><div className="spinner" />Загрузка...</div>
          ) : filtered.length === 0 ? (
            <div className="loading" style={{ flexDirection: "column", gap: 12 }}>
              <span style={{ fontSize: 48 }}>🏁</span>
              <span>Участников пока нет</span>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="lb-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Участник</th>
                    <th>Пол</th>
                    <th>BMI</th>
                    <th>Статус</th>
                    <th>Км</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => {
                    const bmi = u.bmiData?.bmi;
                    const gender = u.bmiData?.gender;
                    let status = "—";
                    let statusColor = "var(--muted)";
                    if (bmi) {
                      const limits = gender === "female"
                        ? [17.5, 24, 29]
                        : [18.5, 25, 30];
                      if (bmi < limits[0]) { status = "Недостаточный"; statusColor = "#4fc3f7"; }
                      else if (bmi < limits[1]) { status = "Здоровый"; statusColor = "#e8f400"; }
                      else if (bmi < limits[2]) { status = "Избыточный"; statusColor = "#ffa726"; }
                      else { status = "Ожирение"; statusColor = "#ff4d00"; }
                    }
                    return (
                      <tr key={u.uid || i}>
                        <td><span className="lb-rank">{i + 1}</span></td>
                        <td>
                          <span className="lb-avatar">
                            {u.photoURL
                              ? <img src={u.photoURL} alt="" />
                              : (u.displayName || "?")[0].toUpperCase()}
                          </span>
                          {u.displayName || "Аноним"}
                        </td>
                        <td style={{ color: "var(--muted)" }}>
                          {gender === "male" ? "Мужской" : gender === "female" ? "Женский" : "—"}
                        </td>
                        <td style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 20, color: statusColor }}>
                          {bmi || "—"}
                        </td>
                        <td style={{ color: statusColor, fontSize: 13 }}>{status}</td>
                        <td><span className="lb-km">{(u.totalKm || 0).toFixed(1)}</span> км</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
