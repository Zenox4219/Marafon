// app/auth/callback/page.js
// Google возвращает сюда с code — обмениваем на токены и логиним через Firebase

"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState("Выполняется вход...");
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError("Вход отменён.");
      setTimeout(() => router.replace("/"), 2000);
      return;
    }

    if (!code) {
      setError("Ошибка авторизации.");
      setTimeout(() => router.replace("/"), 2000);
      return;
    }

    // Обмениваем code на id_token через наш API route
    fetch("/api/auth/google-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((res) => res.json())
      .then(async (data) => {
        if (!data.id_token) throw new Error(data.error || "No id_token");

        // Логиним в Firebase с полученным Google токеном
        const credential = GoogleAuthProvider.credential(data.id_token);
        await signInWithCredential(auth, credential);

        setStatus("Вход выполнен! Переход...");
        router.replace("/");
      })
      .catch((err) => {
        console.error("Callback error:", err);
        setError("Ошибка входа. Попробуйте ещё раз.");
        setTimeout(() => router.replace("/"), 3000);
      });
  }, []);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "#050505",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Inter, sans-serif",
    }}>
      {error ? (
        <>
          <div style={{ fontSize: 40, marginBottom: 16 }}>❌</div>
          <div style={{ color: "#F4FF20", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{error}</div>
          <div style={{ color: "#888", fontSize: 13 }}>Возвращаемся на главную...</div>
        </>
      ) : (
        <>
          <div style={{
            width: 44,
            height: 44,
            border: "3px solid rgba(244,255,32,0.2)",
            borderTop: "3px solid #F4FF20",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            marginBottom: 20,
          }} />
          <div style={{ color: "#F4FF20", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{status}</div>
          <div style={{ color: "#888", fontSize: 13 }}>Пожалуйста, подождите</div>
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
