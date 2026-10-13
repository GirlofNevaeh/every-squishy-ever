import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const PASS = "shelf-open-v1";

export function normalizeKey(raw: string) {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function secret() {
  return process.env.SQUISHY_ACCESS_SECRET?.trim() ?? "";
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

export function keyMatches(raw: string) {
  const norm = normalizeKey(raw);
  if (norm.length < 8 || allowedHashes().size === 0) return false;
  const digest = createHash("sha256").update(norm).digest("hex");
  for (const allowed of allowedHashes()) {
    const a = Buffer.from(digest);
    const b = Buffer.from(allowed);
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }
  return false;
}

export function passToken() {
  const key = secret();
  if (!key) return "";
  return createHmac("sha256", key).update(PASS).digest("base64url");
}

export function hasPass(cookie: string | undefined) {
  if (!cookie) return false;
  const expected = passToken();
  if (!expected) return false;
  const a = Buffer.from(cookie);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
