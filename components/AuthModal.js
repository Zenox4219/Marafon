"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const clearError = () => setError("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "register") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        onClose();
        router.push("/bmi");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
      }
    } catch (err) {
      const msgs = {
        "auth/email-already-in-use": "Этот email уже зарегистрирован.",
        "auth/invalid-email": "Неверный формат email.",
        "auth/weak-password": "Пароль должен быть не менее 6 символов.",
        "auth/user-not-found": "Пользователь не найден.",
        "auth/wrong-password": "Неверный пароль.",
        "auth/invalid-credential": "Неверный email или пароль.",
      };
      setError(msgs[err.code] || "Произошла ошибка. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError("");
    try {
      // Use redirect instead of popup — works in all browsers without popup blockers
      await signInWithRedirect(auth, googleProvider);
      // Page will redirect to Google and come back — no need to call onClose()
    } catch (err) {
      setError("Ошибка входа через Google.");
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ position: "relative" }}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{mode === "login" ? "Вход" : "Регистрация"}</h2>
        <p className="sub">
          {mode === "login" ? "С возвращением, атлет!" : "Начни своё марафонское путешествие"}
        </p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="form-group">
              <label>Имя</label>
              <input
                type="text"
                placeholder="Твоё имя"
                value={name}
                onChange={(e) => { setName(e.target.value); clearError(); }}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="athlete@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError(); }}
              required
            />
          </div>
          <div className="form-group">
            <label>Пароль</label>
            <input
              type="password"
              placeholder={mode === "register" ? "Минимум 6 символов" : "••••••••"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError(); }}
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary btn-full"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? "Загрузка..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>

        <div className="divider"><span>или</span></div>

        <button className="btn-google" onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
            <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.59.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.548 0 9c0 1.452.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          {loading ? "Перенаправление..." : "Войти через Google"}
        </button>

        <div className="modal-switch">
          {mode === "login" ? (
            <>Нет аккаунта? <button onClick={() => { setMode("register"); clearError(); }}>Зарегистрируйся</button></>
          ) : (
            <>Уже есть аккаунт? <button onClick={() => { setMode("login"); clearError(); }}>Войти</button></>
          )}
        </div>
      </div>
    </div>
  );
}
