export const runtime = "edge";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

async function getValueBySurname(surname) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/skills?surname=eq.${encodeURIComponent(surname)}&select=value&limit=1`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );
  const data = await res.json();
  return data && data.length > 0 ? data[0].value : null;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const message = body?.message;

    if (!message || !message.text) {
      return new Response("ok", { status: 200 });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();

    // Команда /start
    if (text === "/start") {
      await sendMessage(
        chatId,
        "👋 Привет! Я бот MarathonTrack.\n\nОтправь мне фамилию участника — я найду его результат в базе.\n\nПример: Сандалов"
      );
      return new Response("ok", { status: 200 });
    }

    // Ищем фамилию
    const surname = text;
    const value = await getValueBySurname(surname);

    if (value !== null) {
      await sendMessage(chatId, `✅ Фамилия ${surname} → значение: ${value}`);
    } else {
      await sendMessage(chatId, `❌ Фамилия «${surname}» не найдена в базе`);
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("error", { status: 500 });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ status: "Telegram webhook is running" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
