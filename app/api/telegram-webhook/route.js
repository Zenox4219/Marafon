export const runtime = "edge";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const sessions = {};

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

async function registerUser(firstName, lastName, email, telegramId) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/runners`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      email: email,
      user_id: String(telegramId),
    }),
  });
  return res.ok;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const message = body?.message;
    if (!message || !message.text) return new Response("ok", { status: 200 });

    const chatId = message.chat.id;
    const text = message.text.trim();
    const from = message.from;

    if (text === "/start") {
      sessions[chatId] = null;
      await sendMessage(chatId,
        "👋 Привет! Я бот MarathonTrack.\n\n" +
        "Команды:\n" +
        "📝 /register — зарегистрироваться\n" +
        "🔍 Напиши фамилию — найду результат в базе"
      );
      return new Response("ok", { status: 200 });
    }

    if (text === "/register") {
      sessions[chatId] = { step: "waiting_email", firstName: from?.first_name || "", lastName: from?.last_name || "" };
      await sendMessage(chatId, "📧 Введи свой email для регистрации:");
      return new Response("ok", { status: 200 });
    }

    if (sessions[chatId]?.step === "waiting_email") {
      const email = text;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        await sendMessage(chatId, "❌ Неверный формат email. Попробуй ещё раз:");
        return new Response("ok", { status: 200 });
      }
      const { firstName, lastName } = sessions[chatId];
      const ok = await registerUser(firstName, lastName, email, chatId);
      sessions[chatId] = null;
      if (ok) {
        await sendMessage(chatId, `✅ Ты зарегистрирован!\n\nИмя: ${firstName} ${lastName}\nEmail: ${email}\n\nДобро пожаловать в MarathonTrack! 🏃`);
      } else {
        await sendMessage(chatId, "⚠️ Ошибка регистрации. Возможно этот email уже используется.");
      }
      return new Response("ok", { status: 200 });
    }

    const value = await getValueBySurname(text);
    if (value !== null) {
      await sendMessage(chatId, `✅ Фамилия ${text} → значение: ${value}`);
    } else {
      await sendMessage(chatId, `❌ Фамилия «${text}» не найдена в базе`);
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
