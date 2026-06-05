"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const BMI_CATEGORIES = {
  male: [
    { label: "Недостаточный", max: 18.5, color: "#4fc3f7" },
    { label: "Здоровый",      max: 25,   color: "#e8f400" },
    { label: "Избыточный",    max: 30,   color: "#ffa726" },
    { label: "Ожирение",      max: Infinity, color: "#ff4d00" },
  ],
  female: [
    { label: "Недостаточный", max: 17.5, color: "#4fc3f7" },
    { label: "Здоровый",      max: 24,   color: "#e8f400" },
    { label: "Избыточный",    max: 29,   color: "#ffa726" },
    { label: "Ожирение",      max: Infinity, color: "#ff4d00" },
  ],
};

function getCategory(bmi, gender) {
  return BMI_CATEGORIES[gender].find((c) => bmi < c.max);
}

function MaleIcon({ size = 80, color = "#666" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 100" fill="none">
      <circle cx="30" cy="14" r="10" fill={color} />
      <rect x="20" y="26" width="20" height="38" rx="4" fill={color} />
      <rect x="20" y="64" width="8"  height="28" rx="3" fill={color} />
      <rect x="32" y="64" width="8"  height="28" rx="3" fill={color} />
      <rect x="6"  y="26" width="8"  height="26" rx="3" fill={color} />
      <rect x="46" y="26" width="8"  height="26" rx="3" fill={color} />
    </svg>
  );
}

function FemaleIcon({ size = 80, color = "#666" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 100" fill="none">
      <circle cx="30" cy="14" r="10" fill={color} />
      <path d="M18 26 Q10 50 20 64 H40 Q50 50 42 26 Z" fill={color} />
      <rect x="20" y="64" width="8"  height="28" rx="3" fill={color} />
      <rect x="32" y="64" width="8"  height="28" rx="3" fill={color} />
      <rect x="6"  y="28" width="8"  height="24" rx="3" fill={color} />
      <rect x="46" y="28" width="8"  height="24" rx="3" fill={color} />
    </svg>
  );
}

function BMIScale({ bmi, gender }) {
  if (!bmi) return null;
  const pct = Math.min(Math.max(((bmi - 10) / 30) * 100, 0), 100);
  const cats = BMI_CATEGORIES[gender];
  return (
    <div style={{ width: "100%", marginTop: 24 }}>
      <div style={{
        position: "relative", height: 10, borderRadius: 5,
        background: "linear-gradient(to right, #4fc3f7 0%, #e8f400 37%, #ffa726 67%, #ff4d00 100%)"
      }}>
        <div style={{
          position: "absolute", top: "50%", left: `${pct}%`,
          transform: "translate(-50%, -50%)",
          width: 16, height: 16, borderRadius: "50%",
          background: "white", border: "3px solid #000",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8,
        fontSize: 11, color: "var(--muted)" }}>
        {cats.map((c) => <span key={c.label}>{c.label}</span>)}
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
        {gender === "male"
          ? "Норма для мужчин: 18.5 – 25"
          : "Норма для женщин: 17.5 – 24"}
      </div>
    </div>
  );
}

export default function BMIPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [gender, setGender] = useState("male");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi]       = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const [saved, setSaved]   = useState(false);

  const category = bmi ? getCategory(bmi, gender) : null;

  function calculate() {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h < 50 || h > 250 || w < 20 || w > 300) {
      setError("Введите корректные значения роста (50–250 см) и веса (20–300 кг)");
      return;
    }
    setError("");
    setSaved(false);
    const result = w / Math.pow(h / 100, 2);
    setBmi(Math.round(result * 10) / 10);
  }

  function reset() {
    setHeight("");
    setWeight("");
    setBmi(null);
    setError("");
    setSaved(false);
  }

  async function save() {
    if (!bmi) return;
    if (!user) { setError("Войдите в аккаунт, чтобы сохранить результат"); return; }
    setSaving(true);
    setError("");
    try {
      await setDoc(doc(db, "bmi_records", user.uid), {
        uid: user.uid,
        displayName: user.displayName || "Участник",
        email: user.email,
        bmi,
        height: parseFloat(height),
        weight: parseFloat(weight),
        gender,
        updatedAt: serverTimestamp(),
      });
      setSaved(true);
      setTimeout(() => router.push("/participants"), 1000);
    } catch (err) {
      setError("Ошибка сохранения: " + err.message);
    }
    setSaving(false);
  }

  return (
    <div>
      <div className="page-header">
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="section-label">Здоровье</div>
            <h1>BMI Calculator</h1>
          </div>
          {bmi && (
            <button className="btn-primary" onClick={save} disabled={saving || saved}>
              {saved ? "✓ Сохранено!" : saving ? "Сохранение..." : "Сохранить"}
            </button>
          )}
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div className="card" style={{ marginBottom: 32 }}>
            <div className="section-label">Что такое BMI?</div>
            <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.8, marginBottom: 0 }}>
              <strong style={{ color: "var(--text)" }}>Индекс массы тела (BMI)</strong> — показатель соответствия веса и роста.
              Формула: <strong style={{ color: "var(--accent)" }}>вес (кг) / рост² (м)</strong>.
              Нормы отличаются для мужчин и женщин — выбери свой пол для точного результата.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div className="card">
              <h3 style={{ marginBottom: 24 }}>BMI калькулятор</h3>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Пол</div>
                <div style={{ display: "flex", gap: 12 }}>
                  {[["male", "Мужской"], ["female", "Женский"]].map(([val, label]) => (
                    <button key={val} onClick={() => { setGender(val); setBmi(null); setSaved(false); }} style={{
                      flex: 1, padding: "12px 0",
                      border: `1px solid ${gender === val ? "var(--accent)" : "var(--border)"}`,
                      background: gender === val ? "rgba(232,244,0,0.08)" : "var(--surface2)",
                      color: gender === val ? "var(--accent)" : "var(--muted)",
                      borderRadius: "var(--radius)", cursor: "pointer", fontWeight: 600, fontSize: 13,
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                      transition: "all .2s",
                    }}>
                      {val === "male"
                        ? <MaleIcon size={40} color={gender === val ? "#e8f400" : "#666"} />
                        : <FemaleIcon size={40} color={gender === val ? "#e8f400" : "#666"} />}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 16, padding: "10px 14px", background: "var(--surface2)",
                border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12, color: "var(--muted)" }}>
                {gender === "male"
                  ? "🏃 Норма для мужчин: до 18.5 — недостаток, 18.5–25 — норма, 25–30 — избыток, 30+ — ожирение"
                  : "🏃‍♀️ Норма для женщин: до 17.5 — недостаток, 17.5–24 — норма, 24–29 — избыток, 29+ — ожирение"}
              </div>

              <div className="form-group">
                <label>Рост (см)</label>
                <input type="number" placeholder="170" value={height}
                  onChange={(e) => setHeight(e.target.value)} min="50" max="250" />
              </div>

              <div className="form-group" style={{ marginBottom: 24 }}>
                <label>Вес (кг)</label>
                <input type="number" placeholder="70" value={weight}
                  onChange={(e) => setWeight(e.target.value)} min="20" max="300" />
              </div>

              {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}

              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={calculate}>Рассчитать</button>
                <button className="btn-secondary" onClick={reset}>Сброс</button>
              </div>
            </div>

            <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320 }}>
              {bmi ? (
                <>
                  <div style={{ marginBottom: 16 }}>
                    {gender === "male"
                      ? <MaleIcon size={100} color={category.color} />
                      : <FemaleIcon size={100} color={category.color} />}
                  </div>
                  <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 64,
                    color: category.color, letterSpacing: 1, lineHeight: 1 }}>
                    {bmi}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: category.color, marginBottom: 16 }}>
                    {category.label}
                  </div>
                  <BMIScale bmi={bmi} gender={gender} />
                  {user && (
                    <div style={{ marginTop: 20, fontSize: 13, color: "var(--muted)",
                      borderTop: "1px solid var(--border)", paddingTop: 16, width: "100%", textAlign: "center" }}>
                      {user.displayName || user.email}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ opacity: 0.25, marginBottom: 16 }}>
                    {gender === "male"
                      ? <MaleIcon size={100} color="#e8f400" />
                      : <FemaleIcon size={100} color="#e8f400" />}
                  </div>
                  <p style={{ color: "var(--muted)", fontSize: 14 }}>
                    Введите рост и вес<br />для расчёта BMI
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
