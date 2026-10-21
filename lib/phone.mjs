/** Normalize Iranian mobile input to E.164. Returns null when the number is invalid. */
export function normalizeIranPhone(input) {
  if (typeof input !== 'string') return null;
  const eastern='۰۱۲۳۴۵۶۷۸۹', arabic='٠١٢٣٤٥٦٧٨٩';
  let value=input.trim().replace(/[۰-۹]/g,d=>String(eastern.indexOf(d))).replace(/[٠-٩]/g,d=>String(arabic.indexOf(d)));
  value=value.replace(/[\s()\-]/g,'');
  if (/^09\d{9}$/.test(value)) return `+98${value.slice(1)}`;
  if (/^\+989\d{9}$/.test(value)) return value;
  if (/^989\d{9}$/.test(value)) return `+${value}`;
  return null;
}
