import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { publicSiteURL } from "../lib/seo.mjs";

const root = resolve(import.meta.dirname, "..");
const profile = JSON.parse(await readFile(resolve(root, "data/portfolio.json"), "utf8"));
const origin = publicSiteURL(profile);

test("both profile pages expose the requested title, image, identity, and distinct canonical URLs without JavaScript", async () => {
  for (const path of ["", "simple/"]) {
    const html = await readFile(resolve(root, path, "index.html"), "utf8");
    assert.ok(html.includes(`<title>${profile.searchTitle}</title>`));
    assert.ok(html.includes(`content="${profile.searchTitle}"`));
    assert.ok(html.includes(`rel="canonical" href="${origin}/${path}"`));
    assert.ok(html.includes(`property="og:image" content="${origin}/images/about/akshunchauhan.jpg"`));
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(schema.mainEntity.name, "Akshun Chauhan");
    assert.equal(schema.mainEntity["@id"], origin + "/#akshun-chauhan");
    assert.equal(schema.url, origin + "/" + path);
    assert.deepEqual(schema.mainEntity.alumniOf.map((x) => x.name), ["Red Deer Polytechnic"]);
    assert.ok(!html.includes('content="noindex"'));
  }
  const simple = await readFile(resolve(root, "simple/index.html"), "utf8");
  for (const heading of ["Who I am", "What I’m working toward", "Skills"]) assert.ok(simple.includes(`>${heading}</h2>`));
  assert.ok(simple.includes('width="224" height="224"'));
});

test("the sitemap covers real public pages and crawler access remains open", async () => {
  const xml = await readFile(resolve(root, "sitemap.xml"), "utf8");
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.ok(urls.includes(origin + "/"));
  assert.ok(urls.includes(origin + "/simple/"));
  assert.equal(new Set(urls).size, urls.length);
  for (const value of urls) {
    const url = new URL(value);
    assert.equal(url.origin, origin);
    assert.ok((await stat(resolve(root, url.pathname.slice(1), "index.html"))).isFile());
  }
  const robots = await readFile(resolve(root, "robots.txt"), "utf8");
  assert.ok(robots.includes("User-agent: *\nAllow: /"));
  assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
  assert.ok(!/Disallow:\s*\/\s*$/m.test(robots));
});

test("education is collapsed and the removed degree is absent from published profile data", async () => {
  const about = await readFile(resolve(root, "about/index.html"), "utf8");
  assert.ok(about.includes('<details class="education-disclosure">'));
  assert.ok(!/<details[^>]*class="education-disclosure"[^>]*\bopen\b/.test(about));
  assert.ok(about.includes("Computer Programming Diploma"));
  assert.ok(!about.includes("BSc Computer Science"));
  assert.ok(!about.includes("Indira Gandhi National Open University"));
  const snapshot = await readFile(resolve(root, "content.json"), "utf8");
  assert.ok(!snapshot.includes("BSc Computer Science"));
});

test("canonical origins default to the owned domain and reject unsafe overrides", () => {
  assert.equal(publicSiteURL(profile, ""), "https://ak.xuninnovation.ca");
  assert.equal(publicSiteURL(profile, "https://example.ca/"), "https://example.ca");
  for (const value of ["http://example.ca", "https://example.ca/path", "https://user:password@example.ca", "https://example.ca/?q=1"]) {
    assert.throws(() => publicSiteURL(profile, value));
  }
});
