import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { messages } = await request.json();

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",",
        max_tokens: 1000,
        messages,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
     console.error("Groq error:", err);
return NextResponse.json({ error: "Groq API error", details: err }, { status: 500 });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "Нет ответа";
    return NextResponse.json({ reply });
  } catch (e) {
    console.error("Chat route error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
