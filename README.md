# MarathonTrack 🏃

Next.js 14 + Firebase приложение для марафонцев.

## Стек
- **Next.js 14** (App Router)
- **Firebase** (Auth + Firestore)
- Авторизация: Email/пароль + Google

## Запуск

```bash
npm install
npm run dev
```

Открой http://localhost:3000

## Firebase — что нужно включить

### Authentication
Firebase Console → Authentication → Sign-in method:
- ✅ Email/Password
- ✅ Google (добавь `localhost` в авторизованные домены)

### Firestore Database
Firebase Console → Firestore → Create database → Start in test mode

Правила безопасности (Firestore → Rules):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == uid;
    }
    match /marathons/{doc} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## Структура
```
app/
  page.js          — Главная
  marathons/       — Список марафонов
  leaderboard/     — Таблица лидеров
  profile/         — Личный кабинет
components/
  AuthProvider.js  — Контекст авторизации
  AuthModal.js     — Модальное окно входа/регистрации
  Navbar.js        — Навигация
lib/
  firebase.js      — Инициализация Firebase
  firestore.js     — Хелперы для Firestore
.env.local         — Firebase ключи
```
