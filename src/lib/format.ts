export function money(value: number | string | null | undefined, currency = "EUR") {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

export function compactMoney(value: number | string | null | undefined, currency = "EUR") {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function num(value: number | string | null | undefined) {
  return new Intl.NumberFormat("en-GB").format(Number(value ?? 0));
}

export function initialsOf(name: string | null | undefined) {
  if (!name) return "··";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

export function toneClass(seed: string | null | undefined) {
  const s = (seed ?? "").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 3;
  return s === 0 ? "" : s === 1 ? "g2" : "g3";
}

export function relativeDate(value: string | null | undefined) {
  if (!value) return "—";
  const then = new Date(value).getTime();
  const diff = Date.now() - then;
  const day = 86_400_000;
  if (diff < 0) {
    const inDays = Math.round(-diff / day);
    if (inDays === 0) return "Today";
    if (inDays === 1) return "Tomorrow";
    return `in ${inDays} days`;
  }
  if (diff < 3_600_000) return "Just now";
  if (diff < day) return "Today";
  if (diff < 2 * day) return "Yesterday";
  return `${Math.round(diff / day)} days ago`;
}

export function shortDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function daysUntil(value: string | null | undefined) {
  if (!value) return null;
  return Math.round((new Date(value).getTime() - Date.now()) / 86_400_000);
}

export function healthTone(score: number) {
  if (score >= 75) return "ok";
  if (score >= 50) return "warn";
  return "bad";
}

export function statusTone(status: string | null | undefined) {
  const s = (status ?? "").toLowerCase();
  if (["active", "on track", "healthy", "hired", "closed won", "closing"].includes(s)) return "ok";
  if (
    ["expiring soon", "needs attention", "at risk", "on hold", "draft", "offer"].includes(s)
  )
    return "warn";
  if (["expired", "behind plan", "rejected", "closed lost", "overdue"].includes(s)) return "bad";
  return "";
}
