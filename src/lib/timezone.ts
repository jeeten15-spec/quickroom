export const TZ = "Asia/Kolkata";

export function parseHm(hm: string) {
  const [h, m] = hm.split(":").map(Number);
  return { h, m };
}

/** Format a Date in Asia/Kolkata. */
export function formatIst(date: Date, options: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: TZ, ...options }).format(date);
}

export function formatIstDate(date: Date) {
  return formatIst(date, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export function formatIstTime(date: Date) {
  return formatIst(date, { hour: "2-digit", minute: "2-digit", hour12: true });
}

export function getIstParts(date: Date) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    weekday: parts.weekday,
  };
}

/** IST calendar Y-M-D H:M as a UTC Date (IST = UTC+5:30). */
export function istLocalToUtc(year: number, month: number, day: number, hour: number, minute: number) {
  return new Date(Date.UTC(year, month - 1, day, hour - 5, minute - 30));
}

export function addDaysUtc(date: Date, days: number) {
  return new Date(date.getTime() + days * 86400000);
}

export function isPastIst(date: Date, now = new Date()) {
  return date.getTime() <= now.getTime();
}
