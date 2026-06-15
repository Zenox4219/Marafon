"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createOrUpdateUser } from "@/lib/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = ещё грузится

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const isNew = await createOrUpdateUser(firebaseUser);
          if (isNew) {
            // Уведомить админа о новом пользователе
            notifyAdmin(firebaseUser).catch(console.error);
          }
        } catch (err) {
          console.error("Firestore sync failed (auth still works):", err);
        }
      } else {
        setUser(null);
      }
    });
    return unsub;
  }, []);

  const logout = () => signOut(auth);

  // Пока Firebase инициализируется — показываем тёмный экран вместо белого
  if (user === undefined) {
    return (
      <div style={{
        position: "fixed",
        inset: 0,
        background: "#050505",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40,
            height: 40,
            border: "3px solid rgba(244,255,32,0.2)",
            borderTop: "3px solid #F4FF20",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }} />
          <div style={{ color: "#888", fontSize: 13, fontFamily: "Inter, sans-serif" }}>
            Загрузка...
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

async function notifyAdmin(firebaseUser) {
  const isGoogle = firebaseUser.providerData?.some(
    (p) => p.providerId === "google.com"
  );
  await fetch("/api/notify-admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "new_user",
      user: {
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        method: isGoogle ? "google" : "email",
      },
    }),
  });
}

export const useAuth = () => useContext(AuthContext);
