import { mkdirSync, readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";

const items = JSON.parse(readFileSync(new URL("../src/data/squishies.json", import.meta.url), "utf8"));
const outDir = new URL("../public/squishies/", import.meta.url);
mkdirSync(outDir, { recursive: true });

const key = process.env.XAI_API_KEY;
if (!key) {
  console.error("missing key");
  process.exit(1);
}

function fileFor(id) {
  return new URL(`${id}.jpg`, outDir);
}

function compress(src, dest) {
  return new Promise((resolve, reject) => {
    const ff = spawn("ffmpeg", [
      "-y",
      "-i",
      src,
      "-vf",
      "scale=640:640:force_original_aspect_ratio=increase,crop=640:640",
      "-q:v",
      "5",
      dest,
    ], { stdio: "ignore" });
    ff.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg ${code}`))));
  });
}

async function generate(item) {
  const dest = fileFor(item.id);
  if (existsSync(dest) && statSync(dest).size > 4000) return "skip";
  const prompt = `A single cute kid-friendly squishy squeeze toy shaped like ${item.imageHint}. Main color ${item.colors[0]}. Soft realistic product photograph, one toy only, centered, sitting on a seamless warm cream background, gentle studio daylight, rounded and squeezable, no text, no letters, no logo, no watermark, no packaging, no people.`;
  const res = await fetch("https://api.x.ai/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "grok-imagine-image",
      prompt,
      n: 1,
      resolution: "1k",
      response_format: "b64_json",
      aspect_ratio: "1:1",
    }),
  });
  if (res.status === 429) return "retry";
  if (!res.ok) {
    const err = await res.text();
    console.error("FAIL", item.id, res.status, err.slice(0, 180));
    return "fail";
  }
  const body = await res.json();
  const b64 = body.data?.[0]?.b64_json;
  if (!b64) {
    console.error("FAIL", item.id, "no image");
    return "fail";
  }
  const rawPath = `/tmp/squish-${item.id}.jpg`;
  writeFileSync(rawPath, Buffer.from(b64, "base64"));
  await compress(rawPath, dest.pathname);
  return "ok";
}

const queue = [...items];
let cursor = 0;
let ok = 0;
let fail = 0;
let skip = 0;

async function worker(n) {
  for (;;) {
    const index = cursor++;
    if (index >= queue.length) return;
    const item = queue[index];
    let result = "fail";
    for (let attempt = 0; attempt < 3; attempt++) {
      result = await generate(item);
      if (result !== "retry") break;
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
    if (result === "ok") ok += 1;
    else if (result === "skip") skip += 1;
    else fail += 1;
    if ((ok + fail + skip) % 10 === 0 || result === "fail") {
      console.log(`${ok + skip + fail}/${queue.length} ok=${ok} skip=${skip} fail=${fail} last=${item.id}:${result}`);
    }
  }
}

await Promise.all([1, 2, 3, 4].map((n) => worker(n)));
console.log("DONE", { ok, skip, fail, total: queue.length });
process.exit(fail > 40 ? 1 : 0);
