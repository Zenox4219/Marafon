"use client";
import { useEffect, useState } from "react";
import { getLeaderboard } from "@/lib/firestore";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard(20)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="section-label">Рейтинг</div>
          <h1>Таблица лидеров</h1>
        </div>
      </div>

      <div className="section">
        <div className="container">
          {loading ? (
            <div className="loading"><div className="spinner" />Загрузка...</div>
          ) : rows.length === 0 ? (
            <div className="loading" style={{ flexDirection: "column", gap: 12 }}>
              <span style={{ fontSize: 48 }}>🏁</span>
              <span>Пока нет данных. Стань первым!</span>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="lb-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Атлет</th>
                    <th>Марафонов</th>
                    <th>Всего км</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.uid || i}>
                      <td>
                        <span className={`lb-rank ${i < 3 ? "top" : ""}`}>
                          {i < 3 ? MEDALS[i] : r.rank}
                        </span>
                      </td>
                      <td>
                        <span className="lb-avatar">
                          {r.photoURL
                            ? <img src={r.photoURL} alt="" />
                            : (r.displayName || "?")[0].toUpperCase()}
                        </span>
                        {r.displayName || "Аноним"}
                      </td>
                      <td style={{ color: "var(--muted)" }}>{r.finishedMarathons || 0}</td>
                      <td><span className="lb-km">{(r.totalKm || 0).toFixed(1)}</span> км</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
