import { buildKnowledge, reply } from "./portfolio-guide.mjs";
import { projectTechnologies } from "./technology-icons.mjs";
export const escapeHTML = (value = "") =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function safeURL(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "#";
  } catch {
    return "#";
  }
}
export const arrow =
  '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.5"/></svg>';
export const githubIcon =
  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.07c-3.1.67-3.75-1.32-3.75-1.32-.5-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 .1.97 1.51 3.22.81.1-.72.39-1.21.7-1.49-2.48-.28-5.09-1.24-5.09-5.5 0-1.21.43-2.2 1.15-2.97-.11-.28-.5-1.41.11-2.94 0 0 .94-.3 3.05 1.13A10.7 10.7 0 0 1 12 6.12c.94 0 1.88.13 2.77.37 2.12-1.43 3.05-1.13 3.05-1.13.61 1.53.23 2.66.11 2.94.72.77 1.15 1.76 1.15 2.97 0 4.27-2.61 5.21-5.1 5.49.4.35.76 1.02.76 2.06v3.17c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z"/></svg>';
export const dateLabel = (value) =>
  new Intl.DateTimeFormat("en-CA", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
const colors = {
  Python: "#85b9e8",
  TypeScript: "#7ea8ec",
  JavaScript: "#d9c47a",
  Dart: "#75cccf",
  Java: "#d69277",
  "C#": "#a895d5",
  Swift: "#ec9b7c",
  HTML: "#e6a38a",
};
export function normalizeRepos(input) {
  if (!Array.isArray(input))
    throw new Error("GitHub did not return a repository list.");
  return input
    .filter(
      (r) => r && typeof r.name === "string" && typeof r.html_url === "string",
    )
    .map((r) => ({
      name: r.name.slice(0, 160),
      description:
        typeof r.description === "string" ? r.description.slice(0, 800) : "",
      html_url: safeURL(r.html_url),
      homepage: safeURL(r.homepage),
      language: r.language || "Other",
      stargazers_count: Number(r.stargazers_count) || 0,
      fork: Boolean(r.fork),
      archived: Boolean(r.archived),
      pushed_at: Number.isFinite(Date.parse(r.pushed_at))
        ? r.pushed_at
        : "1970-01-01",
      topics: Array.isArray(r.topics)
        ? r.topics.filter((t) => typeof t === "string")
        : [],
    }))
    .filter((r) => r.html_url.startsWith("https://github.com/"))
    .sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at));
}
export function categoryFor(repo) {
  if (repo.category) return repo.category;
  const text =
    `${repo.name} ${repo.description} ${repo.topics?.join(" ")}`.toLowerCase();
  if (/asteroid|energy|solar|iot/.test(text)) return "research";
  if (
    /rag|\bai\b|ai-|machine|nlp|trace|data|python/.test(text) ||
    repo.language === "Python"
  )
    return "ai";
  return "web";
}
export function filterRepos(
  repos,
  { query = "", category = "all", includeForks = false } = {},
) {
  const term = query.toLowerCase().trim();
  return repos.filter(
    (r) =>
      (includeForks || !r.fork) &&
      !r.archived &&
      (category === "all" || categoryFor(r) === category) &&
      `${r.name} ${r.description} ${r.language} ${r.topics?.join(" ")}`
        .toLowerCase()
        .includes(term),
  );
}
export function curatedRepos(profile, input) {
  const fresh = new Map(
    normalizeRepos(input).map((r) => [r.html_url.toLowerCase(), r]),
  );
  const publicProjects = (profile.repositorySelection || [])
    .map((p) => {
      const r = fresh.get(safeURL(p.url).toLowerCase());
      return {
        ...(r || {
          name: p.name,
          html_url: safeURL(p.url),
          homepage: "#",
          language: "Software",
          fork: false,
          archived: false,
          pushed_at: /^20\d{2}/.test(p.year || "")
            ? p.year.slice(0, 4) + "-01-01"
            : "2024-01-01",
          topics: [],
        }),
        name: p.name,
        description: p.description,
        category: p.category,
        casePath: p.casePath,
        visibility: "public",
      };
    })
    .filter((r) => !r.fork && !r.archived);
  const privateProjects = profile.projects
    .filter((p) => p.visibility === "private")
    .map((p) => ({
      name: p.name,
      description: p.summary,
      html_url: "#",
      casePath: `projects/${p.slug}/`,
      language: p.tags[0],
      category: p.category,
      visibility: "private",
      topics: [],
      fork: false,
      archived: false,
    }));
  return [...publicProjects, ...privateProjects];
}
export function repoRow(repo, base = "") {
  const href = repo.casePath ? base + repo.casePath : safeURL(repo.html_url);
  const external = !repo.casePath
    ? ' target="_blank" rel="noopener noreferrer"'
    : "";
  return `<a class="repo-row" href="${escapeHTML(href)}"${external}><span class="repo-title">${githubIcon}<span>${escapeHTML(repo.name)}<small>${escapeHTML(repo.description)}</small></span></span><span class="repo-language"><i style="--language-color:${colors[repo.language] || "#a5b4a4"}"></i>${escapeHTML(repo.language)}</span><span class="repo-project-kind">${repo.visibility === "private" ? "PRIVATE PROJECT" : repo.casePath ? "CASE STUDY" : "SOURCE CODE"}</span>${arrow}</a>`;
}
export function projectVisual(p, base = "") {
  if (p.image)
    return `<img src="${base}${escapeHTML(p.image)}" alt="${escapeHTML(p.imageAlt || p.name + " application interface")}" loading="lazy" width="1200" height="680"><span class="project-capture-label">${escapeHTML(p.imageCaption || "Original application screenshot")}</span>`;
  return `<div class="project-text-cover"><span>${escapeHTML(p.eyebrow)}</span><strong>${escapeHTML(p.name)}</strong><p>${p.visibility === "private" ? "Private project · in development" : "Project documentation"}</p><small>Explore the approach & implementation ↗</small></div>`;
}
export function projectCard(p, index, base = "") {
  const path = `${base}projects/${escapeHTML(p.slug)}/`;
  return `<article class="project-card" data-category="${escapeHTML(p.category)}" data-visibility="${p.visibility === "private" ? "private" : "public"}"><a class="project-image ${escapeHTML(p.slug)}" href="${path}" aria-label="Explore ${escapeHTML(p.name)}">${projectVisual(p, base)}<span class="project-number">${String(index + 1).padStart(2, "0")} / SELECTED WORK</span>${p.slug === "asteroid" ? '<span class="award-label">1st place · NASA Space Apps Edmonton</span>' : ""}<span class="project-open">${arrow}</span></a><div class="project-meta"><span>${escapeHTML(p.eyebrow)}</span><span>${escapeHTML(p.year)}${p.visibility === "private" ? " · PRIVATE SOURCE" : ""}</span></div><a class="project-title" href="${path}"><h3>${escapeHTML(p.name)}</h3>${arrow}</a><p>${escapeHTML(p.summary)}</p>${projectTechnologies(p.tags, base)}</article>`;
}
export function pressRow(p) {
  return `<a class="press-row" href="${escapeHTML(safeURL(p.url))}" target="_blank" rel="noopener noreferrer"><span class="press-date">${dateLabel(p.date)}</span><span class="press-content"><small>${escapeHTML(p.publisher)} <span> / ${escapeHTML(p.type)}</span></small><h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.description)}</p></span>${arrow}</a>`;
}

export function knowledgeEntries(profile, repos = []) {
  return buildKnowledge(profile, curatedRepos(profile, repos));
}
export function answerQuestion(question, profile, repos = [], context = {}) {
  return reply(question, profile, curatedRepos(profile, repos), context);
}
