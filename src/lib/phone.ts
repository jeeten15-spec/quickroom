/** Indian mobile: 10 digits, optional +91 / 91 / 0 prefix. Demo numbers use 90000xxxxx. */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (!digits) return null;
  let n = digits;
  if (n.startsWith("91") && n.length === 12) n = n.slice(2);
  if (n.startsWith("0") && n.length === 11) n = n.slice(1);
  if (n.length !== 10) return null;
  if (!/^[6-9]/.test(n)) return null;
  return `91${n}`;
}

export function formatPhoneDisplay(normalized: string) {
  const n = normalized.replace(/^91/, "");
  return `+91 ${n.slice(0, 5)} ${n.slice(5)}`;
}

export function isValidIndianMobile(input: string) {
  return normalizePhone(input) !== null;
}
