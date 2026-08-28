import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function interpolate(template: string, vars: Record<string, string | number | undefined | null>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? ""));
}

export function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 6) return "••••••••";
  return `+${digits.slice(0, 2)} ${digits.slice(2, 4)}••• ••${digits.slice(-2)}`;
}

export function jsonString(value: unknown) {
  return JSON.stringify(value);
}

export function jsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
