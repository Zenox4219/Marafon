export const ADMIN_EMAILS = [
  "anelm1041@gmail.com",
];

export function isAdmin(user) {
  if (!user) return false;
  return ADMIN_EMAILS.includes(user.email);
}
