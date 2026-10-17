import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const PASS = "shelf-open-v1";

/** SHA-256 of the shared code. The code itself is not stored here. */
const WEEK_KEY_HASH = "c1f4ceb4665e376a52edea567131a010766acf2f350285d9e95871249184c916";

export function normalizeKey(raw: string) {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function secret() {
  return process.env.SQUISHY_ACCESS_SECRET?.trim() ?? "";
}

function same(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function allowedHashes() {
  const hashes = new Set<string>();
  const extra = process.env.SQUISHY_ACCESS_KEYS ?? "";
  for (const key of extra.split(",")) {
    const norm = normalizeKey(key);
    if (norm.length < 8) continue;
    hashes.add(createHash("sha256").update(norm).digest("hex"));
  }
  return hashes;
}

export function isWeekKey(raw: string) {
  const norm = normalizeKey(raw);
  if (norm.length < 8) return false;
  const digest = createHash("sha256").update(norm).digest("hex");
  return same(digest, WEEK_KEY_HASH);
}

export function keyMatches(raw: string) {
  const norm = normalizeKey(raw);
  if (norm.length < 8 || isWeekKey(raw)) return false;
  const digest = createHash("sha256").update(norm).digest("hex");
  for (const allowed of allowedHashes()) {
    if (same(digest, allowed)) return true;
  }
  return false;
}

export function passToken() {
  const key = secret();
  if (!key) return "";
  return createHmac("sha256", key).update(PASS).digest("base64url");
}

export function weekPass(expiresAtSec: number) {
  const key = secret();
  if (!key || !Number.isFinite(expiresAtSec)) return "";
  const exp = String(Math.floor(expiresAtSec));
  const sig = createHmac("sha256", key).update(`week:${exp}`).digest("base64url");
  return `w.${exp}.${sig}`;
}

function weekStillOpen(cookie: string) {
  const key = secret();
  if (!key) return false;
  const parts = cookie.split(".");
  if (parts.length !== 3 || parts[0] !== "w") return false;
  const exp = Number(parts[1]);
  if (!Number.isFinite(exp) || exp <= Date.now() / 1000) return false;
  const expected = createHmac("sha256", key).update(`week:${parts[1]}`).digest("base64url");
  return same(parts[2], expected);
}

export function hasPass(cookie: string | undefined) {
  if (!cookie) return false;
  if (cookie.startsWith("w.")) return weekStillOpen(cookie);
  const expected = passToken();
  if (!expected) return false;
  return same(cookie, expected);
}
