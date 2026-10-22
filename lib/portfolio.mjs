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
export function projectCard(p, index) {
  return `<article class="project-card" data-category="${escapeHTML(p.category)}" data-visibility="${p.visibility === "private" ? "private" : "public"}"><a class="project-image ${escapeHTML(p.slug)}" href="projects/${escapeHTML(p.slug)}/" aria-label="Explore ${escapeHTML(p.name)}">${projectVisual(p)}<span class="project-number">0${index + 1} / SELECTED WORK</span>${p.slug === "asteroid" ? '<span class="award-label">✧ 1st place · NASA Space Apps Edmonton</span>' : ""}<span class="project-open">${arrow}</span></a><div class="project-meta"><span>${escapeHTML(p.eyebrow)}</span><span>${escapeHTML(p.year)}${p.visibility === "private" ? " · PRIVATE SOURCE" : ""}</span></div><a class="project-title" href="projects/${escapeHTML(p.slug)}/"><h3>${escapeHTML(p.name)}</h3>${arrow}</a><p>${escapeHTML(p.summary)}</p>${projectTechnologies(p.tags)}</article>`;
}
export function pressRow(p) {
  return `<a class="press-row" href="${escapeHTML(safeURL(p.url))}" target="_blank" rel="noopener noreferrer"><span class="press-date">${dateLabel(p.date)}</span><span class="press-content"><small>${escapeHTML(p.publisher)} <span> / ${escapeHTML(p.type)}</span></small><h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.description)}</p></span>${arrow}</a>`;
}

export function knowledgeEntries(profile, repos = []) {
  const github = `https://github.com/${profile.github}`;
  return [
    {
      id: "career",
      keys: ["career", "experience", "employment", "employer", "rdp", "roles"],
      title: "Experience & current work",
      text:
        `Programming since ${profile.programmingStartedYear}: approximately ${Math.max(0, new Date().getUTCFullYear() - profile.programmingStartedYear)} years, across ${profile.projectCount} projects. This includes personal learning and projects as well as professional work.\n\n` +
        (profile.career || [])
          .map(
            (c) =>
              `${c.company} — ${c.role} (${c.period}). ${c.description}${c.previous.length ? " Earlier RDP experience: " + c.previous.map((r) => (typeof r === "string" ? r : `${r.role} (${r.period}), ${r.department}. ${r.description}`)).join("; ") + "." : ""}`,
          )
          .join("\n\n"),
      sources: (profile.career || []).map((c) => ({
        label: c.company,
        url: c.url,
      })),
    },
    {
      id: "science-award",
      keys: ["science competition", "all india", "model making", "2019"],
      title: "All India Science Competition · 2019",
      text: "Akshun won the All India Science Competition in model making in 2019. The competition was organized by World Science Congress; the win is recorded in his professional résumé.",
      sources: [{ label: "Résumé", url: "docs/ak.pdf" }],
    },
    {
      id: "speaking",
      keys: [
        "speaking",
        "conference",
        "conferences",
        "presentation",
        "presentations",
        "presented",
        "talks",
      ],
      title: "Presentations & events",
      text: (profile.presentations || [])
        .map(
          (p) =>
            `${p.event} (${p.date || p.year}) — ${p.role} at ${p.venue || p.location}. ${p.topic}. ${p.description}`,
        )
        .join("\n\n"),
      sources: (profile.presentations || []).map((p) => ({
        label: p.event,
        url: p.url,
      })),
    },
    {
      id: "programming-history",
      keys: ["2016", "programming", "started", "years", "100", "journey"],
      title: "A decade of curiosity",
      text: `Akshun started programming in ${profile.programmingStartedYear}, approximately ${Math.max(0, new Date().getUTCFullYear() - profile.programmingStartedYear)} years ago. He has built and explored ${profile.projectCount} projects across personal, professional, and research work. Programming history includes early learning and project work; it is not a claim of the same length of paid employment.`,
      sources: [{ label: "Professional profile", url: profile.linkedin }],
    },
    {
      id: "indine",
      keys: ["indine", "indine.ca", "restaurant", "restaurants"],
      title: "INDine.ca",
      text:
        profile.ventures.find((v) => v.slug === "indine")?.description ||
        "Explore INDine.ca for the current restaurant platform.",
      sources: [{ label: "INDine.ca", url: "https://indine.ca/" }],
    },
    {
      id: "bio",
      keys: ["bio", "who", "background", "introduce"],
      title: "About Akshun",
      text: profile.bio,
      sources: [{ label: "Professional profile", url: profile.linkedin }],
    },
    {
      id: "now",
      keys: ["current", "now", "doing", "focus", "working"],
      title: "Current focus",
      text: profile.now,
      sources: [
        { label: "LinkedIn", url: profile.linkedin },
        { label: "Xun Innovation", url: profile.ventures[0].url },
      ],
    },
    {
      id: "contact",
      keys: [
        "contact",
        "email",
        "hire",
        "hiring",
        "available",
        "collaborate",
        "reach",
        "talk",
        "location",
        "based",
        "city",
      ],
      title: "Start a conversation",
      text: `For opportunities or collaborations, email ${profile.email}. Akshun is based in ${profile.location}. Availability and engagement details are best confirmed directly.`,
      sources: [
        { label: "Contact", url: `mailto:${profile.email}` },
        { label: "LinkedIn", url: profile.linkedin },
      ],
    },
    {
      id: "skills",
      keys: [
        "skill",
        "skills",
        "stack",
        "technology",
        "technologies",
        "python",
        "azure",
        "backend",
        "database",
        "cloud",
        "iot",
      ],
      title: "Technical focus",
      text: "Akshun works across Python data pipelines, SQL and NoSQL databases, React and TypeScript applications, backend services, Azure cloud infrastructure, IoT data, and applied machine learning. His work connects research prototypes with useful software.",
      sources: [{ label: "GitHub", url: github }],
    },
    {
      id: "education",
      keys: [
        "education",
        "study",
        "studied",
        "diploma",
        "graduate",
        "college",
        "university",
        "degree",
      ],
      title: "Education",
      text: profile.education
        .map(
          (item) =>
            `${item.qualification}, ${item.institution} (${item.year}). ${item.recognition}. ${item.description}`,
        )
        .join("\n\n"),
      sources: [
        {
          label: "Résumé",
          url: "docs/ak.pdf",
        },
      ],
    },
    {
      id: "achievements",
      keys: [
        "award",
        "awards",
        "achievement",
        "achievements",
        "nasa",
        "win",
        "winner",
        "recognition",
        "leadership",
      ],
      title: "Recognition & leadership",
      text: profile.milestones
        .filter((m) => m.year === "2019" || /NASA|40 Under/.test(m.title))
        .map((m) => `${m.title}: ${m.description}`)
        .join("\n\n"),
      sources: profile.milestones
        .filter((m) => m.year === "2019" || /NASA|40 Under/.test(m.title))
        .map((m) => ({ label: m.title, url: m.url })),
    },
    {
      id: "business",
      keys: [
        "business",
        "businesses",
        "venture",
        "ventures",
        "xun",
        "company",
        "entrepreneur",
        "founder",
      ],
      title: "Xun Innovation",
      text: profile.ventures[0].description,
      sources: [{ label: "Xun Innovation", url: profile.ventures[0].url }],
    },
    {
      id: "recommendations",
      keys: [
        "recommendation",
        "recommendations",
        "testimonial",
        "testimonials",
        "colleague",
        "colleagues",
        "linkedin",
      ],
      title: "Colleague recommendations",
      text: profile.recommendations.length
        ? profile.recommendations
            .map((r) => `${r.name}: ${r.quote}`)
            .join("\n\n") +
          "\n\nThese are the published recommendations, quoted in full. Open LinkedIn for the original context."
        : "The portfolio currently has no imported recommendations. You can visit Akshun’s LinkedIn profile to explore his professional background.",
      sources: [
        {
          label: "LinkedIn recommendations",
          url: profile.recommendations[0]?.url || profile.linkedin,
        },
      ],
    },
    {
      id: "press",
      keys: [
        "press",
        "article",
        "articles",
        "news",
        "writing",
        "media",
        "published",
        "publication",
      ],
      title: "Writing & press",
      text: profile.press
        .map((p) => `${p.title} — ${p.publisher}, ${dateLabel(p.date)}.`)
        .join("\n\n"),
      sources: profile.press.map((p) => ({ label: p.publisher, url: p.url })),
    },
    ...profile.projects.map((p) => ({
      id: p.slug,
      keys: [
        p.slug,
        p.name.toLowerCase(),
        ...p.name.toLowerCase().split(/\s+/),
        ...p.tags.map((t) => t.toLowerCase()),
      ],
      title: p.name,
      text: `${p.summary}\n\n${p.approach}\n\n${p.outcome}`,
      sources:
        p.visibility === "private"
          ? [{ label: "Discuss the project", url: `mailto:${profile.email}` }]
          : [
              { label: "Project source", url: p.source },
              { label: "GitHub repository", url: p.repo },
            ],
    })),
    {
      id: "projects",
      keys: [
        "project",
        "projects",
        "portfolio",
        "github",
        "work",
        "built",
        "build",
        "open-source",
      ],
      title: "Explore the work",
      text: `${profile.projectCount} projects across personal, professional, and research work. Selected projects include ${profile.projects.map((p) => p.name).join(", ")}. ${repos.length ? `The GitHub feed currently includes ${repos.length} public repositories. ` : ""}You can filter the project library by AI & data, web & platforms, or research.`,
      sources: [{ label: "Browse GitHub", url: github }],
    },
  ];
}
export function answerQuestion(question, profile, repos = []) {
  const q = question.toLowerCase().trim().slice(0, 1000);
  if (/^(hi|hello|hey|thanks|thank you)[!. ]*$/.test(q))
    return {
      title: "Hello, I’m AK’s portfolio guide.",
      text: "I can help you explore his projects, research, business, recommendations, and published work. What would you like to know?",
      sources: [],
    };
  const entries = knowledgeEntries(profile, repos);
  // Match specific project names before broad terms such as “AI”, “work”, or “NASA”.
  const exact = profile.projects.find(
    (p) => q.includes(p.name.toLowerCase()) || q.includes(p.slug),
  );
  if (exact) return entries.find((e) => e.id === exact.slug);
  if (/^(tell me )?about (you|him|me|akshun)[?.! ]*$/.test(q))
    return entries.find((e) => e.id === "bio");
  const repo = repos.find(
    (r) => q.includes(r.name.toLowerCase()) && r.name.length > 3,
  );
  if (repo)
    return {
      title: repo.name,
      text:
        repo.description ||
        `This is a public ${repo.language} repository. The portfolio does not yet have a detailed write-up for it; the source code is the best place to explore its current state.`,
      sources: [{ label: "Repository", url: repo.html_url }],
    };
  const matches = entries
    .map((e) => ({
      ...e,
      score: e.keys.reduce(
        (score, k) =>
          score +
          (new RegExp(
            `(?:^|[^a-z0-9])${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:$|[^a-z0-9])`,
            "i",
          ).test(q)
            ? k.includes(" ")
              ? 5
              : 2
            : 0),
        0,
      ),
    }))
    .sort((a, b) => b.score - a.score);
  if (matches[0]?.score) return matches[0];
  return {
    title: "Let’s keep this grounded.",
    text: "I don’t have a sourced answer to that yet. I can help with Akshun’s projects, skills, energy research, Xun Innovation, recommendations, education, or press. For anything else, contact Akshun directly.",
    sources: [{ label: "LinkedIn profile", url: profile.linkedin }],
  };
}
