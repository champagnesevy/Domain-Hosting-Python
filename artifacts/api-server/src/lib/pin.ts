import { createHash } from "crypto";

const PIN_SECRET = process.env.PIN_SECRET ?? "faculty-desk-pin-2026";

export function getDailyPin(): string {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
  const hash = createHash("sha256").update(PIN_SECRET + today).digest("hex");
  const num = parseInt(hash.slice(0, 8), 16);
  return String(1000 + (num % 9000));
}
