import { themeHead, themeButton } from "../lib/theme-chrome.mjs";
import {
  storyMetrics,
  presentationsSection,
  educationSection,
} from "../lib/profile-story.mjs";
import { projectTechnologies } from "../lib/technology-icons.mjs";
import {
  selectedProjects,
  selectedWorkControls,
} from "../lib/selected-work.mjs";
import { writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import {
  escapeHTML as e,
  arrow,
  repoRow,
  filterRepos,
  curatedRepos,
  projectCard,
  dateLabel,
} from "../lib/portfolio.mjs";
import {
  newsCard,
  recommendationCards,
  recommendationMarquee,
  careerSection,
  ventureCards,
} from "../lib/experience.mjs";
import { slugify } from "../lib/public-sources.mjs";
export async function buildDetailPages({ root, profile, repos, siteURL }) {
  const paths = [];
  const json = (value) => JSON.stringify(value).replace(/</g, "\\u003c");
  async function page(
    path,
    title,
    description,
    body,
    { type = "WebPage", image = "images/editorial/nasa-team.jpg" } = {},
  ) {
    const base = "../".repeat(path.split("/").filter(Boolean).length);
    const directory = resolve(root, path);
    await mkdir(directory, { recursive: true });
    paths.push(path);
    const canonical = siteURL
      ? `<link rel="canonical" href="${e(siteURL + "/" + path)}"><meta property="og:url" content="${e(siteURL + "/" + path)}"><meta property="og:image" content="${e(siteURL + "/" + image)}">`
      : "";
    const schema = {
      "@context": "https://schema.org",
      "@type": type,
      name: title,
      description,
      ...(siteURL ? { url: siteURL + "/" + path } : {}),
    };
    const html = `<!doctype html><html lang="en-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(title)} — Akshun Chauhan</title><meta name="description" content="${e(description)}"><meta name="theme-color" content="#f3f0e8"><meta property="og:title" content="${e(title)} — Akshun Chauhan"><meta property="og:description" content="${e(description)}"><meta name="twitter:card" content="summary_large_image">${canonical}<link rel="icon" type="image/svg+xml" href="${base}favicon.svg"><link rel="stylesheet" href="${base}style.css">${themeHead(base)}<script type="application/ld+json">${json(schema)}</script></head><body class="detail-page"><div id="expressive-cursor" aria-hidden="true"><span></span></div><div id="cursor-trail" aria-hidden="true"></div><a class="skip-link" href="#main">Skip to content</a><header class="site-header"><a class="brand" href="${base}" aria-label="Akshun Chauhan home"><span class="brand-mark">ak<span>↗</span></span><span class="brand-name">AKSHUN<br>CHAUHAN</span></a><nav class="detail-nav" aria-label="Main navigation"><a href="${base}work/">Work</a><a href="${base}about/">About</a><a href="${base}news/">News</a></nav><div class="header-actions">${themeButton()}<a class="header-contact" href="${base}#contact">Let’s talk ↗</a></div></header><main id="main" class="container detail-main"><a class="case-back" href="${base}">← Back to home</a>${body}</main><footer class="case-footer container"><span>© ${new Date().getFullYear()} Akshun Chauhan</span><a href="${base}#contact">Let’s make something useful ↗</a></footer><script type="application/json" id="portfolio-data">${json({ profile, repos, base })}</script><script type="module" src="${base}archive.js"></script></body></html>`;
    await writeFile(resolve(directory, "index.html"), html);
  }
  const sorted = profile.press.toSorted((a, b) => b.date.localeCompare(a.date));
  await page(
    "news/",
    "News, stories & mentions",
    "A growing archive of research stories, recognition, press coverage, and public mentions of Akshun Chauhan.",
    `<div class="detail-intro"><p class="eyebrow">OUT IN THE WORLD</p><h1>Stories worth<br><span>bringing together.</span></h1><p>Research, recognition, and the moments in between. Explore the original coverage behind the work.</p></div><div class="news-archive-toolbar"><label class="search-field"><input id="news-search" type="search" placeholder="Search the archive…" aria-label="Search news and mentions"></label><label class="news-source-select">Publication <select id="news-source"><option value="all">All publications</option>${[...new Set(sorted.map((p) => p.publisher))].map((p) => `<option>${e(p)}</option>`).join("")}</select></label><span id="news-result-count">${sorted.length} stories</span></div><div class="news-grid archive-grid" id="news-archive">${sorted
      .slice(0, 6)
      .map((p) => newsCard(p, { base: "../" }))
      .join(
        "",
      )}</div><p id="news-empty" class="repo-empty" hidden>No stories match that search. Try a different publication or keyword.</p><div class="archive-pagination"><button id="news-previous" class="page-button" disabled aria-label="Previous news page">← Previous</button><span id="news-page" aria-live="polite">1 / ${Math.ceil(sorted.length / 6)}</span><button id="news-next" class="page-button" aria-label="Next news page">More stories →</button></div><p class="source-note">A collection of verified public matches. Sources are refreshed automatically when the update job runs. Google News can discover additional coverage; search results are not an exhaustive record of the web.</p>`,
    { type: "CollectionPage" },
  );
  for (const p of sorted) {
    const slug = p.slug || slugify(p.title);
    const image = p.image || "images/editorial/nasa-team.jpg";
    await page(
      `news/${slug}/`,
      p.title,
      p.description,
      `<article class="story-detail"><div class="detail-intro"><p class="eyebrow">${e(p.publisher)} / ${e(p.type)}</p><h1>${e(p.title)}</h1><div class="story-date"><time datetime="${e(p.datePrecision === "month" ? p.date.slice(0, 7) : p.date)}">${p.datePrecision === "discovered" ? "Discovered " : ""}${dateLabel(p.date)}</time><span>PUBLIC MENTION / SOURCE LINKED</span></div></div>${p.image ? `<figure class="story-photo"><img src="../../${e(p.image)}" alt="${e(p.title)}" width="1400" height="850"><figcaption>Photo via ${e(p.imageCredit || p.publisher)} · <a href="${e(p.url)}" target="_blank" rel="noopener noreferrer">View original source ↗</a></figcaption></figure>` : ""}<div class="story-body"><p>${e(p.description)}</p><p>This page brings the coverage into one place. Read the original publication for the complete story and its context.</p><a class="button button-primary" href="${e(p.url)}" target="_blank" rel="noopener noreferrer">Read at ${e(p.publisher)} <span>↗</span></a></div><div class="story-related"><a class="text-link" href="../">← All news & mentions</a><a class="text-link" href="../../about/">The story behind the work ↗</a></div></article>`,
      { image },
    );
  }
  const original = curatedRepos(profile, repos);
  const selected = selectedProjects(profile);
  await page(
    "work/",
    "Project library",
    "Explore Akshun Chauhan’s live GitHub project library, filtered by research, AI, data, and software.",
    `<div class="detail-intro"><p class="eyebrow">THE WORKBENCH / SELECTED PROJECTS</p><h1>A few ideas.<br><span>A lot of building.</span></h1><p>Native apps, campus navigation, applied research, and local AI. Eleven selected projects, followed by a broader library of substantial work. Private projects open case studies; public projects also link to source.</p></div><section class="directory-selected" aria-labelledby="selected-heading"><h2 id="selected-heading">A closer look.</h2><div class="project-grid" id="selected-projects">${selected
      .slice(0, 6)
      .map((p, i) => projectCard(p, i, "../"))
      .join(
        "",
      )}</div>${selectedWorkControls(selected.length)}</section><section class="github-section directory-library" aria-labelledby="directory-heading"><h2 id="directory-heading">The rest of the workbench.</h2><div class="github-toolbar"><div class="filter-tabs" role="group" aria-label="Filter repositories">${[
      ["all", "All work"],
      ["ai", "AI & data"],
      ["web", "Web & platforms"],
      ["research", "Research"],
    ]
      .map(
        ([key, label]) =>
          `<button class="filter-tab${key === "all" ? " active" : ""}" data-filter="${key}" aria-pressed="${key === "all"}">${label}</button>`,
      )
      .join(
        "",
      )}</div><label class="search-field"><input id="repo-search" type="search" placeholder="Find a project…" aria-label="Search GitHub projects"></label></div><div id="repo-list" class="repo-list">${original
      .slice(0, 6)
      .map((r) => repoRow(r, "../"))
      .join(
        "",
      )}</div><p id="repo-empty" class="repo-empty" hidden>No projects match that search.</p><div class="github-footer"><p id="github-status" class="sync-status" role="status">Saved GitHub snapshot</p><div class="repo-pagination" role="group" aria-label="Project pages"><button id="previous-repos" class="page-button" aria-label="Previous six projects" disabled>←</button><span id="repo-page" aria-live="polite">1–6 / ${original.length}</span><button id="more-repos" class="page-button" aria-label="Next six projects">More projects →</button></div><span id="repo-count">${original.length} curated projects</span></div></section>`,
    { type: "CollectionPage" },
  );
  await page(
    "ventures/",
    "Businesses & ventures",
    "Explore Akshun Chauhan’s work building Xun Innovation and INDine.ca.",
    `<div class="detail-intro"><p class="eyebrow">ENTREPRENEURSHIP</p><h1>What I’m building.</h1><p>Practical software for the people running the business. Explore the companies, their products, and the problems they work on.</p></div><div class="venture-duo">${ventureCards(profile.ventures, "../")}</div>`,
  );
  await page(
    "about/",
    "The person behind the work",
    profile.bio,
    `<div class="detail-intro"><p class="eyebrow">AKSHUN CHAUHAN / RED DEER, ALBERTA</p><h1>A curious mind.<br><span>A builder’s instinct.</span></h1><p>${e(profile.bio)}</p></div>${storyMetrics(profile)}<div class="about-detail-grid"><img class="about-detail-portrait" src="../images/about/akshunchauhan.jpg" alt="Akshun Chauhan" width="700" height="900"><div><p class="eyebrow">RIGHT NOW</p><h2>Following the interesting problems.</h2><p>${e(profile.now)}</p><p>I like working across disciplines: understanding a physical system, connecting its data, and building software that makes the result useful. That’s the thread between my energy research, software projects, and work through Xun Innovation.</p><div class="detail-links"><a class="text-link" href="../docs/ak.pdf" target="_blank" rel="noopener noreferrer">View résumé ↗</a><a class="text-link" href="${e(profile.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></div></div></div>${careerSection(profile.career, "../")}${presentationsSection(profile, "../")}<section class="section detail-journey"><p class="eyebrow">PROGRESS & RECOGNITION</p><h2>The journey so far.</h2><div class="timeline">${profile.milestones.map((m) => `<a class="timeline-item" href="${e(m.localSource ? "../" + m.localSource : m.url)}" target="_blank" rel="noopener noreferrer"><span class="year">${e(m.year)}</span><span><h3>${e(m.title)}</h3><p>${e(m.description)}</p></span>${arrow}</a>`).join("")}</div></section>${educationSection(profile.education, "../")}<section id="recommendations" class="section"><p class="eyebrow">PEOPLE I’VE WORKED WITH</p><h2>Good work is a team effort.</h2>${recommendationMarquee(profile.recommendations, "../")}</section><section class="section"><p class="eyebrow">LEARNING NEVER STOPS</p><div class="certifications">${profile.certifications.map((c) => `<div class="certification">${e(c.name)}<small>${e(c.issuer)} · ${e(c.year)}</small></div>`).join("")}</div></section><section class="section profile-sources"><p class="eyebrow">FIND ME IN CONTEXT</p><a href="https://rdpolytech.ca/about-us/services-departments/division-applied-research" target="_blank" rel="noopener noreferrer">RDP Division of Applied Research ↗</a><a href="https://vancouversummit.com/post-event/networking" target="_blank" rel="noopener noreferrer">Indoor Air Quality Summit networking directory ↗</a><a href="../ventures/xun-innovation/">Xun Innovation ↗</a><a href="../news/">Writing, press & public mentions ↗</a></section>`,
  );
  await page(
    "speaking/",
    "Presentations & events",
    "Research presentations, public speaking, and professional events with Akshun Chauhan.",
    `<div class="detail-intro"><p class="eyebrow">ON STAGE & IN THE ROOM</p><h1>Ideas worth<br><span>talking about.</span></h1><p>Sharing the work, learning from the questions, and connecting with people who see a problem from a different angle.</p></div>${presentationsSection(profile, "../", true)}<div class="speaking-contact"><p>Planning a conversation around applied research, software, or practical AI?</p><a class="button button-primary" href="mailto:${e(profile.email)}">Let’s talk ↗</a></div>`,
  );
  const venture = profile.ventures[0];
  await page(
    "ventures/xun-innovation/",
    "Building Xun Innovation",
    venture.description,
    `<div class="detail-intro venture-detail-intro"><p class="eyebrow">MY COMPANY / CENTRAL ALBERTA</p><h1>Good ideas deserve<br><span>great execution.</span></h1><p>${e(venture.description)}</p><a class="button button-primary" href="${e(venture.url)}" target="_blank" rel="noopener noreferrer">Visit xuninnovation.ca <span>↗</span></a></div><figure class="venture-detail-photo"><img src="../../${e(venture.image)}" alt="${e(venture.imageAlt)}" width="1280" height="720"><figcaption><img src="../../${e(venture.logo)}" alt="Xun Innovation" width="50" height="50">${e(venture.imageCaption)}</figcaption></figure><section class="section"><p class="eyebrow">WHAT WE BUILD</p><div class="venture-service-grid">${venture.services.map((s, i) => `<article><span>0${i + 1}</span><h2>${e(s.name)}</h2><p>${e(s.text)}</p></article>`).join("")}</div></section><section class="section xun-philosophy"><h2>Practical problems.<br>Thoughtful software.</h2><p>My research work starts with understanding a system. The same approach shapes Xun: understand the business, choose tools that fit, and make the experience clear for the people using it.</p><a class="text-link" href="${e(venture.url)}" target="_blank" rel="noopener noreferrer">Explore the company and current services ↗</a></section>`,
  );
  const indine = profile.ventures[1];
  await page(
    "ventures/indine/",
    "Building INDine.ca",
    indine.description,
    `<div class="detail-intro"><p class="eyebrow">RESTAURANT TECHNOLOGY / INDINE.CA</p><h1>One visit.<br><span>A lasting connection.</span></h1><p>${e(indine.description)}</p><a class="button button-primary" href="${e(indine.url)}" target="_blank" rel="noopener noreferrer">Explore INDine.ca ↗</a></div><section class="section venture-technical"><p class="eyebrow">THE ENGINEERING BEHIND IT</p><h2>From guest data to useful insights.</h2><p>${e(indine.technicalDescription || "")}</p>${projectTechnologies(indine.technologies || [], "../../")}</section><figure class="venture-detail-photo"><img src="../../${e(indine.image)}" alt="${e(indine.imageAlt)}" width="1280" height="720"><figcaption><img src="../../${e(indine.logo)}" alt="INDine.ca" width="50" height="50">${e(indine.imageCaption)}</figcaption></figure><section class="section"><p class="eyebrow">FROM THE DINING ROOM TO THE NEXT VISIT</p><div class="venture-service-grid">${indine.services.map((service, i) => `<article><span>0${i + 1}</span><h2>${e(service.name)}</h2><p>${e(service.text)}</p></article>`).join("")}</div></section><a class="text-link" href="../../#ventures">← Back to what I’m building</a>`,
  );
  return paths;
}
