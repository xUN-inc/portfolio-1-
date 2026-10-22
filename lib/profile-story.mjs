import { escapeHTML as e, safeURL } from "./portfolio.mjs";

export function programmingYears(startYear, now = new Date()) {
  if (!Number.isInteger(startYear) || startYear < 1900) return 0;
  return Math.max(0, now.getUTCFullYear() - startYear);
}

export function storyMetrics(profile) {
  return `<div class="story-metrics" aria-label="A little context"><div><strong>~<span data-programming-years="${profile.programmingStartedYear}">${programmingYears(profile.programmingStartedYear)}</span></strong><span>years of programming<small>Writing code since ${profile.programmingStartedYear}</small></span></div><div><strong>${e(profile.projectCount)}</strong><span>projects built & explored<small>Personal, professional & research work</small></span></div><div><strong>2019<span class="metric-star">✳</span></strong><span>All India Science Competition<small>Winner · Model making</small></span></div></div>`;
}

function presentationDate(p) {
  return p.date
    ? new Intl.DateTimeFormat("en-CA", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(p.date + "T00:00:00Z"))
    : p.year;
}
export function presentationCards(items, base = "", full = false) {
  return items
    .map(
      (p) =>
        `<article class="research-entry"><div class="research-date"><time datetime="${e(p.date || p.year)}">${e(presentationDate(p))}</time><span>${e(p.role)}</span></div><div class="research-entry-body"><h3>${e(p.topic)}</h3>${p.authors ? `<p class="research-authors">${e(p.authors.join(", "))}</p>` : ""}<p class="research-venue"><strong>${e(p.event)}</strong> · ${e(p.venue)}, ${e(p.location)}</p>${full ? `<p class="research-description">${e(p.description)}</p>` : ""}</div><a class="research-source" href="${e(p.localSource ? base + p.localSource : safeURL(p.url))}" target="_blank" rel="noopener noreferrer">${e(p.sourceLabel)} <span>↗</span></a></article>`,
    )
    .join("");
}

export function educationSection(education, base = "") {
  return `<section class="section education-section" aria-labelledby="education-heading"><p class="eyebrow section-label">THE FOUNDATIONS</p><h2 id="education-heading">Learning that carries forward<span class="mint">.</span></h2><div class="education-grid">${education.map((item) => `<article><span class="education-year">${e(item.year)}</span><h3>${e(item.qualification)}</h3><p class="education-institution">${e(item.institution)}</p><strong>${e(item.recognition)}</strong><p>${e(item.description)}</p></article>`).join("")}</div><a class="text-link work-all" href="${base}docs/ak.pdf" target="_blank" rel="noopener noreferrer">View education & qualifications in my résumé ↗</a></section>`;
}

export function presentationsSection(profile, base = "", full = false) {
  if (!profile.presentations?.length) return "";
  const entries = profile.presentations.toSorted((a, b) =>
    (b.date || b.year).localeCompare(a.date || a.year),
  );
  return `<section id="speaking" class="section container speaking-section${full ? " speaking-full" : ""}" aria-labelledby="speaking-heading"><div class="section-heading"><div><p class="eyebrow section-label">RESEARCH PRESENTATIONS & PUBLIC SPEAKING</p><h2 id="speaking-heading">Beyond the workbench<span class="mint">.</span></h2></div><p>Research shared.<br>Methods, findings, and conversations.</p></div><div class="research-register">${presentationCards(entries, base, full)}</div>${full ? "" : `<a class="text-link work-all" href="${base}speaking/">Presentations & source details ↗</a>`}</section>`;
}
