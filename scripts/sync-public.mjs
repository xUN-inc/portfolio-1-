import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import {
  articleMetadata,
  parseNewsRSS,
  isRelevantMention,
  publicHTTPS,
  slugify,
  plainText,
} from "../lib/public-sources.mjs";
import {
  validateFeed,
  preserveRecommendationMedia,
} from "../lib/content-feed.mjs";
const root = resolve(import.meta.dirname, "..");
const profilePath = resolve(root, "data/portfolio.json");
const profile = JSON.parse(await readFile(profilePath, "utf8"));
const at = new Date().toISOString();
const status = {
  checkedAt: at,
  googleNews: { state: "pending" },
  linkedin: { state: "pending" },
  pages: { updated: 0, failed: 0 },
};
const agent = {
  "User-Agent":
    "AkshunPortfolio/3.0 (public professional mentions; contact: ak@xuninnovation.ca)",
  Accept: "text/html,application/rss+xml,application/json",
};
async function get(url, extra = {}) {
  const safe = publicHTTPS(url);
  if (!safe) throw new Error("Only public HTTPS URLs are supported");
  const response = await fetch(safe, {
    headers: { ...agent, ...extra },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (Number(response.headers.get("content-length")) > 5_000_000)
    throw new Error("Source exceeds size limit");
  return response;
}
// Direct publisher pages refresh their own image/title metadata automatically.
const allowed = [
  "rdpolytech.ca",
  "rdnewsnow.com",
  "caunitedway.ca",
  "educationnewscanada.com",
  "linkedin.com",
  "www.linkedin.com",
  "reddeeradvocate.com",
  "www.reddeeradvocate.com",
  "centralalbertaonline.com",
  "www.ctvnews.ca",
];
for (const item of profile.press) {
  if (
    item.url.endsWith(".pdf") ||
    !allowed.includes(new URL(item.url).hostname)
  )
    continue;
  try {
    const response = await get(item.url);
    const html = await response.text();
    if (html.length > 5_000_000) throw new Error("Page too large");
    const meta = articleMetadata(html, item.url);
    if (!/akshun\s+(?:\(ak\)\s+)?chauhan/i.test(meta.text))
      throw new Error("Identity not present in page");
    item.sourceTitle = meta.title;
    item.checkedAt = at;
    item.slug ||= slugify(item.title);
    if (meta.image) {
      item.remoteImage = meta.image;
      try {
        const image = await get(meta.image, { Accept: "image/*" });
        const mime = image.headers.get("content-type") || "";
        if (!/^image\/(jpeg|png|webp)/.test(mime))
          throw new Error("Unsupported image");
        const buffer = Buffer.from(await image.arrayBuffer());
        if (buffer.length > 3_000_000) throw new Error("Image too large");
        const ext = mime.includes("png")
          ? "png"
          : mime.includes("webp")
            ? "webp"
            : "jpg";
        const file = `images/editorial/${createHash("sha256").update(meta.image).digest("hex").slice(0, 12)}.${ext}`;
        await mkdir(resolve(root, "images/editorial"), { recursive: true });
        await writeFile(resolve(root, file), buffer);
        item.image = file;
      } catch {
        /* Keep the last downloaded image if an upstream image is unavailable. */
      }
    }
    status.pages.updated++;
  } catch {
    status.pages.failed++;
  }
}
try {
  const response = await get(
    "https://news.google.com/rss/search?q=%22Akshun%20Chauhan%22&hl=en-CA&gl=CA&ceid=CA%3Aen",
  );
  const items = parseNewsRSS(await response.text()).filter(isRelevantMention);
  let added = 0;
  for (const item of items) {
    const title = item.title.replace(
      new RegExp(
        `\\s*[-–—]\\s*${item.publisher.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      ),
      "",
    );
    if (
      profile.press.some(
        (p) =>
          p.url === item.url ||
          slugify(p.sourceTitle || p.title) === slugify(title),
      )
    )
      continue;
    profile.press.push({
      title,
      publisher: item.publisher,
      date: new Date(item.date).toISOString().slice(0, 10),
      type: "In the news",
      description: `Coverage from ${item.publisher}. Open the original story for the full article.`,
      url: item.url,
      slug: slugify(title),
      discoveredBy: "Google News",
      checkedAt: at,
    });
    added++;
  }
  status.googleNews = { state: "synced", found: items.length, added };
} catch (error) {
  status.googleNews = { state: "unavailable", reason: error.message };
}
// Optional Google web search broadens discovery beyond the public Google News RSS.
if (process.env.SERPAPI_API_KEY) {
  try {
    const url = new URL("https://serpapi.com/search.json");
    url.search = new URLSearchParams({
      engine: "google",
      q: '"Akshun Chauhan" ("Red Deer" OR "Xun Innovation" OR "Alberta")',
      api_key: process.env.SERPAPI_API_KEY,
      num: "20",
    });
    const response = await get(url.href, { Accept: "application/json" });
    const data = await response.json();
    let added = 0;
    for (const result of data.organic_results || []) {
      const item = {
        title: plainText(result.title),
        url: publicHTTPS(result.link),
        description: plainText(result.snippet),
        sourceURL: result.link,
      };
      if (
        !item.url ||
        !isRelevantMention(item) ||
        profile.press.some((p) => p.url === item.url)
      )
        continue;
      profile.press.push({
        ...item,
        publisher: new URL(item.url).hostname.replace(/^www\./, ""),
        date: at.slice(0, 10),
        datePrecision: "discovered",
        type: "Public mention",
        slug: slugify(item.title),
        discoveredBy: "Google Search",
        checkedAt: at,
      });
      added++;
    }
    status.googleSearch = { state: "synced", added };
  } catch {
    status.googleSearch = { state: "unavailable" };
  }
}
if (process.env.LINKEDIN_FEED_URL) {
  try {
    const response = await get(process.env.LINKEDIN_FEED_URL, {
      Accept: "application/json",
      ...(process.env.LINKEDIN_FEED_TOKEN
        ? { Authorization: `Bearer ${process.env.LINKEDIN_FEED_TOKEN}` }
        : {}),
    });
    const feed = validateFeed(await response.json());
    if (feed.recommendations)
      profile.recommendations = preserveRecommendationMedia(
        profile.recommendations,
        feed.recommendations,
      );
    if (feed.linkedinActivity) profile.linkedinActivity = feed.linkedinActivity;
    status.linkedin = { state: "synced", mode: "authorized feed" };
  } catch (error) {
    status.linkedin = { state: "unavailable", reason: error.message };
  }
} else {
  // One ordinary public request; a sign-in requirement or denial is never bypassed.
  try {
    const response = await get(profile.linkedin);
    const meta = articleMetadata(await response.text(), profile.linkedin);
    if (!meta.text.toLowerCase().includes(profile.name.toLowerCase()))
      throw new Error("Public profile requires sign-in");
    status.linkedin = {
      state: "profile reachable",
      mode: "public profile",
      recommendations: "saved full recommendations",
      activity: "saved highlights",
    };
  } catch (error) {
    status.linkedin = { state: "connection required", reason: error.message };
  }
}
profile.press = profile.press
  .filter((p, index, all) => all.findIndex((a) => a.url === p.url) === index)
  .slice(0, 200);
profile.publicSync = status;
await writeFile(profilePath, JSON.stringify(profile, null, 2) + "\n");
console.log(
  `Public metadata: ${status.pages.updated} refreshed, ${status.pages.failed} retained. Google News: ${status.googleNews.state}. LinkedIn: ${status.linkedin.state}.`,
);
