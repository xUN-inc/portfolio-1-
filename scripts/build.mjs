import { themeHead, themeButton } from "../lib/theme-chrome.mjs";
import { storyMetrics, presentationsSection } from "../lib/profile-story.mjs";
import { projectTechnologies } from "../lib/technology-icons.mjs";
import { readFile, writeFile, mkdir, cp, rm } from "node:fs/promises";
import { resolve } from "node:path";
import {
  escapeHTML as e,
  safeURL,
  arrow,
  githubIcon,
  normalizeRepos,
  curatedRepos,
  filterRepos,
  repoRow,
  projectCard,
  projectVisual,
  pressRow,
  dateLabel,
} from "../lib/portfolio.mjs";
import {
  newsCard,
  recommendationMarquee,
  careerSection,
  ventureCards,
} from "../lib/experience.mjs";
import { buildDetailPages } from "./detail-pages.mjs";
const root = resolve(import.meta.dirname, "..");
const readJSON = async (path) =>
  JSON.parse(await readFile(resolve(root, path), "utf8"));
const [profile, rawRepos, githubProfile, template] = await Promise.all([
  readJSON("data/portfolio.json"),
  readJSON("data/github-repos.json"),
  readJSON("data/github-profile.json"),
  readFile(resolve(root, "src/index.template.html"), "utf8"),
]);
const repos = normalizeRepos(rawRepos);
let siteURL = "";
if (process.env.SITE_URL) {
  const u = new URL(process.env.SITE_URL);
  if (u.protocol !== "https:" || u.pathname !== "/")
    throw new Error("SITE_URL must be an HTTPS origin with no path.");
  siteURL = u.origin;
}
const jsonForHTML = (value) => JSON.stringify(value).replace(/</g, "\\u003c");
const schema = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  ...(siteURL ? { url: siteURL + "/" } : {}),
  mainEntity: {
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.title,
    description: profile.bio,
    email: profile.email,
    sameAs: [
      `https://github.com/${profile.github}`,
      profile.linkedin,
      ...profile.ventures.map((v) => v.url),
    ],
    knowsAbout: [
      "Software Development",
      "Applied Research",
      "Data Analysis",
      "IoT",
      "Energy Innovation",
      "Artificial Intelligence",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Red Deer",
      addressRegion: "Alberta",
      addressCountry: "CA",
    },
    alumniOf: profile.education.map((item) => ({
      "@type": "CollegeOrUniversity",
      name: item.institution,
    })),
    award: [
      "Winner, All India Science Competition, model making, 2019",
      "First place, NASA Space Apps Challenge Edmonton, 2025",
    ],
  },
};
function seo(path = "", image = "images/editorial/nasa-team.jpg") {
  return siteURL
    ? `<link rel="canonical" href="${e(siteURL + "/" + path)}"><meta property="og:url" content="${e(siteURL + "/" + path)}"><meta property="og:image" content="${e(siteURL + "/" + image)}"><meta property="og:image:alt" content="Akshun and the RDP team at NASA Space Apps Edmonton"><meta name="twitter:image" content="${e(siteURL + "/" + image)}">`
    : "";
}
const reviewDate = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
}).format(new Date(profile.contentReviewedAt + "T00:00:00Z"));
const original = curatedRepos(profile, repos);
const sections = {
  SEO: seo(),
  THEME_HEAD: themeHead(),
  THEME_BUTTON: themeButton(),
  SCHEMA: jsonForHTML(schema),
  ARROW: arrow,
  GITHUB_ICON: githubIcon,
  PROJECTS: profile.projects
    .filter((p) => p.featured)
    .slice(0, 6)
    .map(projectCard)
    .join("\n"),
  FEATURED_COUNT: String(
    profile.projects.filter((p) => p.featured).length,
  ).padStart(2, "0"),
  STORY_METRICS: storyMetrics(profile),
  PRESENTATIONS: presentationsSection(profile),
  CAREER: careerSection(profile.career),
  VENTURES: ventureCards(profile.ventures),
  REPOS: original
    .slice(0, 6)
    .map((r) => repoRow(r))
    .join("\n"),
  REPO_COUNT: original.length,
  SNAPSHOT_DATE: dateLabel(profile.githubSnapshotAt),
  BIO: e(profile.bio),
  NOW: e(profile.now),
  VENTURE_DESCRIPTION: e(profile.ventures[0].description),
  MILESTONES: profile.milestones
    .map(
      (m) =>
        `<a class="timeline-item" href="${e(m.localSource || safeURL(m.url))}" target="_blank" rel="noopener noreferrer"><span class="year">${e(m.year)}</span><span><h3>${e(m.title)}</h3><p>${e(m.description)}</p></span>${arrow}</a>`,
    )
    .join("\n"),
  CERTIFICATIONS: profile.certifications
    .map(
      (c) =>
        `<div class="certification">${e(c.name)}<small>${e(c.issuer)} · ${e(c.year)}</small></div>`,
    )
    .join("\n"),
  RECOMMENDATIONS: recommendationMarquee(profile.recommendations),
  PRESS: profile.press
    .toSorted((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)
    .map((p) => newsCard(p))
    .join("\n"),
  PRESS_COUNT: profile.press.length,
  LINKEDIN:
    profile.linkedinActivity
      .map(
        (a) =>
          `<a class="linkedin-highlight" href="${e(safeURL(a.url))}" target="_blank" rel="noopener noreferrer"><span class="linkedin-mark" aria-hidden="true">in</span><span><small>${e(a.publisher)} / ${e(a.type)}</small><h3>${e(a.title)}</h3><p>${e(a.description)}</p></span>${arrow}</a>`,
      )
      .join("") +
    '<div class="linkedin-feed-footer"><p>Selected highlights from public LinkedIn sources. Visit LinkedIn for current posts, reactions, and the full conversation.</p><a class="text-link" href="https://www.linkedin.com/in/akshunchauhan/recent-activity/all/" target="_blank" rel="noopener noreferrer">View latest activity ↗</a></div>',
  CONTENT_DATE: reviewDate,
  DATA: jsonForHTML({
    profile,
    repos,
    githubProfile: {
      public_repos: githubProfile.public_repos,
      followers: githubProfile.followers,
    },
  }),
};
let html = template
  .replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
    if (!(key in sections)) throw new Error(`Missing template slot: ${key}`);
    return sections[key];
  })
  .replace(/[ \t]+$/gm, "");
await writeFile(resolve(root, "index.html"), html);
const casePaths = [];
for (const [index, p] of profile.projects.entries()) {
  const next = profile.projects[(index + 1) % profile.projects.length];
  const path = `projects/${p.slug}/`;
  casePaths.push(path);
  const dir = resolve(root, path);
  await mkdir(dir, { recursive: true });
  const title = `${p.name} — Akshun Chauhan`;
  const caseSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: p.name,
    description: p.summary,
    author: { "@type": "Person", name: profile.name },
    ...(p.repo ? { sameAs: p.repo } : {}),
    ...(siteURL ? { url: siteURL + "/" + path } : {}),
  };
  const caseHTML = `<!doctype html><html lang="en-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(title)}</title><meta name="description" content="${e(p.summary)}"><meta name="theme-color" content="#f3f0e8"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(p.summary)}"><meta property="og:type" content="article"><meta name="twitter:card" content="summary_large_image">${seo(path, p.image || "images/editorial/nasa-team.jpg")}<link rel="icon" href="../../favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="../../style.css">${themeHead("../../")}<script type="application/ld+json">${jsonForHTML(caseSchema)}</script></head><body><a class="skip-link" href="#main">Skip to content</a><header class="site-header"><a class="brand" href="../../" aria-label="Akshun Chauhan home"><span class="brand-mark">ak<span>↗</span></span><span class="brand-name">AKSHUN<br>CHAUHAN</span></a><div class="header-actions">${themeButton()}<a class="header-contact" href="mailto:${e(profile.email)}">Let’s talk <span>↗</span></a></div></header><main id="main" class="container"><div class="case-header"><a class="case-back" href="../../#work">← Back to selected work</a><p class="eyebrow case-eyebrow">${e(p.eyebrow)}</p><h1>${e(p.name)}<span class="mint">.</span></h1><p class="case-summary">${e(p.summary)}</p><div class="case-meta"><span><small>CONTRIBUTION</small>${e(p.role)}</span><span><small>PROJECT YEAR</small>${e(p.year)}</span><div class="case-technology-meta"><small>TECHNOLOGIES</small>${projectTechnologies(p.tags, "../../")}</div></div></div><div class="case-image">${projectVisual(p, "../../")}</div><div class="case-layout"><aside class="case-aside"><p class="eyebrow">EXPLORE THE PROJECT</p><a class="button button-primary" href="${p.repo ? e(p.repo) : `mailto:${e(profile.email)}?subject=${encodeURIComponent(p.name)}`}"${p.repo ? ' target="_blank" rel="noopener noreferrer"' : ""}>${p.repo ? "View source code" : "Discuss this project"} ${arrow}</a>${p.demo ? `<a class="text-link" href="${e(safeURL(p.demo))}" target="_blank" rel="noopener noreferrer">Open project demo ↗</a>` : ""}<ul class="case-facts">${p.facts.map((f) => `<li>${e(f)}</li>`).join("")}</ul></aside><article class="case-story"><div><h2>The question</h2><p>${e(p.challenge)}</p></div><div><h2>The approach</h2><p>${e(p.approach)}</p></div><div><h2>The result</h2><p>${e(p.outcome)}</p></div>${p.source ? `<p class="case-source">Project information from the original portfolio and linked public sources. <a class="text-link" href="${e(safeURL(p.source))}" target="_blank" rel="noopener noreferrer">${e(p.sourceLabel)} ↗</a></p>` : `<p class="case-source">Project summary shared with permission. Source code is private; contact me to discuss the work.</p>`}</article></div><div class="case-next"><span>NEXT PROJECT</span><a href="../${e(next.slug)}/">${e(next.name)} ↗</a></div></main><footer class="case-footer container"><span>© ${new Date().getUTCFullYear()} Akshun Chauhan</span><a href="../../#contact">Good work starts with a conversation ↗</a></footer></body></html>`;
  await writeFile(resolve(dir, "index.html"), caseHTML);
}
const detailPaths = await buildDetailPages({ root, profile, repos, siteURL });
casePaths.push(...detailPaths);
await writeFile(
  resolve(root, "content.json"),
  jsonForHTML({ profile, repos, generatedAt: new Date().toISOString() }),
);
const robots = `User-agent: *\nAllow: /\n${siteURL ? `Sitemap: ${siteURL}/sitemap.xml\n` : ""}`;
await writeFile(resolve(root, "robots.txt"), robots);
if (siteURL) {
  await writeFile(
    resolve(root, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${["", ...casePaths].map((p) => `<url><loc>${e(siteURL + "/" + p)}</loc></url>`).join("")}</urlset>`,
  );
} else {
  await rm(resolve(root, "sitemap.xml"), { force: true });
}
await writeFile(
  resolve(root, "404.html"),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found — Akshun Chauhan</title><meta name="robots" content="noindex"><meta name="theme-color" content="#f3f0e8"><link rel="stylesheet" href="/style.css">${themeHead("/")}</head><body><header class="site-header"><a class="brand" href="/" aria-label="Akshun Chauhan home"><span class="brand-mark">ak<span>↗</span></span></a>${themeButton()}</header><main class="not-found-wrap"><p class="eyebrow">404 / A SMALL DETOUR</p><h1>Let’s get back<br>to the good work.</h1><p>This page couldn’t be found.</p><a class="button button-primary" href="/">Explore the portfolio ↗</a></main></body></html>`,
);
await rm(resolve(root, "dist"), { recursive: true, force: true });
await mkdir(resolve(root, "dist"));
for (const file of [
  "index.html",
  "404.html",
  "style.css",
  "theme.css",
  "editorial.css",
  "script.js",
  "favicon.svg",
  "robots.txt",
  "fonts",
  "images",
  "docs",
  "lib",
  "projects",
  "news",
  "work",
  "about",
  "speaking",
  "ventures",
  "archive.js",
  "content.json",
  "THIRD_PARTY_NOTICES.md",
])
  await cp(resolve(root, file), resolve(root, "dist", file), {
    recursive: true,
  });
if (siteURL)
  await cp(resolve(root, "sitemap.xml"), resolve(root, "dist/sitemap.xml"));
console.log(
  `Built portfolio + ${profile.projects.length} case studies + ${original.length} curated projects to dist/.`,
);
if (!siteURL)
  console.log(
    "Set SITE_URL to the final HTTPS domain when deploying to generate canonical URLs, social image URLs, and sitemap.xml.",
  );
