/**
 * Splits a display name into GHL first/last segments (best-effort).
 */
export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  if (trimmed.length === 0) {
    return { firstName: "Patient", lastName: "" };
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0] ?? "Patient", lastName: "." };
  }
  const firstName = parts[0] ?? "Patient";
  const lastName = parts.slice(1).join(" ");
  return { firstName, lastName };
}
