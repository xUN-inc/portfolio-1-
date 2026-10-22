import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  validateFeed,
  preserveRecommendationMedia,
} from "../lib/content-feed.mjs";
const root = resolve(import.meta.dirname, "..");
const path = process.argv[2];
let raw;
if (path) {
  raw = await readFile(resolve(path), "utf8");
} else {
  if (!process.env.CONTENT_FEED_URL)
    throw new Error(
      "Pass a local JSON file or configure CONTENT_FEED_URL for your authorized content provider.",
    );
  const url = new URL(process.env.CONTENT_FEED_URL);
  if (url.protocol !== "https:")
    throw new Error("Content endpoint must use HTTPS.");
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(process.env.CONTENT_FEED_TOKEN
        ? { Authorization: `Bearer ${process.env.CONTENT_FEED_TOKEN}` }
        : {}),
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw new Error(
      `Content provider returned HTTP ${response.status}; existing content preserved.`,
    );
  raw = await response.text();
}
if (Buffer.byteLength(raw) > 1024 * 1024)
  throw new Error("Content feed exceeds 1 MB.");
const update = validateFeed(JSON.parse(raw));
const profile = JSON.parse(
  await readFile(resolve(root, "data/portfolio.json"), "utf8"),
);
if (update.recommendations)
  update.recommendations = preserveRecommendationMedia(
    profile.recommendations,
    update.recommendations,
  );
Object.assign(profile, update);
profile.contentReviewedAt = new Date().toISOString().slice(0, 10);
await writeFile(
  resolve(root, "data/portfolio.json"),
  JSON.stringify(profile, null, 2) + "\n",
);
console.log(
  `Imported ${Object.keys(update).join(", ")}. Run npm run build to publish the updated editorial content.`,
);
