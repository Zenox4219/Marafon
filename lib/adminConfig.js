// Список email-адресов с правами администратора
export const ADMIN_EMAILS = [
  "zamir@example.com", // замени на свой реальный email
];

export function isAdmin(user) {
  if (!user) return false;
  return ADMIN_EMAILS.includes(user.email);
}
