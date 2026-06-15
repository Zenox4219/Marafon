// app/auth/google/page.js
// Эта страница открывается в WebView вместо popup/redirect
// Делает Google OAuth через серверный flow и возвращает пользователя на главную

import { redirect } from "next/navigation";

// Генерируем URL для Google OAuth
function getGoogleOAuthUrl() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`;
  const scope = "openid email profile";
  const state = Math.random().toString(36).slice(2); // CSRF защита

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
    state,
    access_type: "offline",
    prompt: "select_account",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export default function GoogleAuthPage() {
  const googleUrl = getGoogleOAuthUrl();
  redirect(googleUrl);
}
