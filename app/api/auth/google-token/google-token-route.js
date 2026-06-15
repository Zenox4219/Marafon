// app/api/auth/google-token/route.js
// Серверный роут: обменивает Google authorization code на id_token

import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    const params = new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      grant_type: "authorization_code",
    });

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    const data = await res.json();

    if (!res.ok || !data.id_token) {
      console.error("Google token exchange error:", data);
      return NextResponse.json(
        { error: data.error_description || "Token exchange failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({ id_token: data.id_token });
  } catch (err) {
    console.error("google-token route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
