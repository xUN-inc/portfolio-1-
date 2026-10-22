import { escapeHTML as e, safeURL, arrow, dateLabel } from "./portfolio.mjs";
import { slugify } from "./public-sources.mjs";
export function newsCard(p, { base = "" } = {}) {
  const slug = slugify(p.slug || p.title);
  const image =
    p.image &&
    (/^(images\/editorial\/)[\w./-]+$/.test(p.image) ||
      p.image.startsWith("https://"))
      ? p.image
      : null;
  return `<article class="news-card" data-news-type="${e(p.type)}"><a class="news-image" href="${base}news/${e(slug)}/" data-cursor="READ">${
    image
      ? `<img src="${image.startsWith("https:") ? "" : base}${e(image)}" alt="${e(p.title)}" loading="lazy" width="900" height="600" referrerpolicy="no-referrer">`
      : `<div class="news-cover" aria-hidden="true"><span>${e(
          p.publisher
            .split(" ")
            .slice(0, 3)
            .map((w) => w[0])
            .join(""),
        )}</span><strong>${e(p.type)}</strong><i>AK / IN THE CONVERSATION</i></div>`
  }<span class="news-type">${e(p.type)}</span><span class="news-open">${arrow}</span></a><div class="news-meta"><span>${e(p.publisher)}</span><time datetime="${e(p.datePrecision === "month" ? p.date.slice(0, 7) : p.date)}">${p.datePrecision === "discovered" ? "Found " : ""}${dateLabel(p.date)}</time></div><h3><a href="${base}news/${e(slug)}/">${e(p.title)}</a></h3><p>${e(p.description)}</p><a class="news-read" href="${base}news/${e(slug)}/">Read the story <span>↗</span></a></article>`;
}
export function technologyButtons(technologies) {
  return technologies
    .map(
      (t, i) =>
        `<button class="tech-orbit-card${i === 0 ? " selected" : ""}" data-technology="${i}" data-tech-category="${e(t.category)}" aria-pressed="${i === 0}" style="--tech-delay:${i * -0.7}s"><img src="${e(t.image)}" alt="" loading="lazy" width="40" height="40"><span>${e(t.name)}</span><small>${e(t.category)}</small></button>`,
    )
    .join("");
}
export function recommendationExcerpt(quote, limit = 310) {
  if (quote.length <= limit) return { text: quote, truncated: false };
  const end = quote.lastIndexOf(" ", limit);
  return {
    text: quote.slice(0, end > 0 ? end : limit).trimEnd() + "…",
    truncated: true,
  };
}
function recommendationPerson(r, base = "") {
  const image =
    r.image && r.imageCheckedAt && r.imageSource
      ? `<img class="quote-headshot" src="${e(r.image.startsWith("https:") ? r.image : base + r.image)}" alt="${e(r.name)}" loading="lazy" width="64" height="64">`
      : "";
  return `<div class="quote-person">${image}<span><strong>${e(r.name)}</strong><small>${e(r.currentContext || r.context)}</small></span><a href="${e(safeURL(r.profileURL || r.url))}" target="_blank" rel="noopener noreferrer" aria-label="${e(r.name)} on LinkedIn">in ↗</a></div>`;
}
export function recommendationCards(recommendations, base = "") {
  return recommendations
    .map((r, index) => {
      const preview = recommendationExcerpt(r.quote);
      return `<article class="recommendation recommendation-full recommendation-preview">${recommendationPerson(r, base)}<div class="quote-card-top"><span class="quote-mark" aria-hidden="true">“</span><span class="quote-source">LINKEDIN RECOMMENDATION</span></div><blockquote>${e(preview.text)}</blockquote><button type="button" class="recommendation-read" data-open-recommendation="${index}" aria-haspopup="dialog" aria-label="${preview.truncated ? "Read full recommendation" : "View recommendation"} from ${e(r.name)}">${preview.truncated ? "Read full recommendation" : "View recommendation"} <span>↗</span></button></article>`;
    })
    .join("");
}
export function recommendationDetail(r, base = "") {
  return `<p class="eyebrow">LINKEDIN RECOMMENDATION</p><h2 id="recommendation-dialog-title">${e(r.name)}</h2>${recommendationPerson(r, base)}<blockquote>${e(r.quote)}</blockquote><div class="recommendation-detail-links"><a class="text-link" href="${e(safeURL(r.url))}" target="_blank" rel="noopener noreferrer">Read the original on LinkedIn ↗</a>${r.profileURL ? `<a class="text-link" href="${e(safeURL(r.profileURL))}" target="_blank" rel="noopener noreferrer">Current profile ↗</a>` : ""}</div>${r.profileURL && r.profileCheckedAt ? `<p class="recommendation-checked">Profile checked ${e(r.profileCheckedAt)} · ${e(r.context)}</p>` : ""}`;
}
export function recommendationMarquee(
  recommendations,
  base = "",
  trackOnly = false,
) {
  const cards = recommendationCards(recommendations, base);
  const track = `<div class="recommendation-group">${cards}</div><div class="recommendation-group recommendation-copy" aria-hidden="true" inert>${cards}</div>`;
  return trackOnly
    ? track
    : `<div class="recommendation-loop" data-recommendation-loop><div class="recommendation-viewport" tabindex="0" role="region" aria-label="LinkedIn recommendations"><div class="recommendation-track">${track}</div></div><div class="recommendation-loop-footer"><span>IN THEIR OWN WORDS · ${recommendations.length} RECOMMENDATIONS</span><button type="button" class="recommendation-pause" aria-pressed="false">Pause motion Ⅱ</button></div></div><dialog class="recommendation-dialog" aria-labelledby="recommendation-dialog-title"><button type="button" class="recommendation-close" aria-label="Close recommendation" autofocus>Close <span>×</span></button><div class="recommendation-dialog-content"></div></dialog>`;
}

export function careerSection(career, base = "") {
  return `<section id="career" class="section container career-section" aria-labelledby="career-heading"><div class="section-heading"><div><p class="eyebrow section-label">EXPERIENCE & THE NEXT CHAPTER</p><h2 id="career-heading">Where I put it to work<span class="mint">.</span></h2></div><a class="text-link" href="${base}docs/ak.pdf" target="_blank" rel="noopener noreferrer">View résumé ↗</a></div><div class="career-context"><img src="${base}images/editorial/f7445489da39.jpg" alt="Akshun at the RDP Energy Test Hub announcement" loading="lazy" width="1200" height="630"><div><span class="eyebrow">APPLIED RESEARCH / RED DEER POLYTECHNIC</span><p>Working where physical systems, research data, and useful software meet.</p><a href="${base}news/energy-test-hub/">At the Energy Test Hub announcement ↗</a><small>Photo: Red Deer Polytechnic</small></div></div><div class="career-list">${career.map((c, i) => `<article class="career-row"><a class="career-logo-link" href="${e(safeURL(c.url))}" target="_blank" rel="noopener noreferrer" aria-label="${e(c.company)} website"><img class="career-logo" src="${base}${e(c.logo)}" alt="${e(c.company)}" loading="lazy" width="150" height="100"></a><div class="career-main"><span class="career-kind">${e(c.kind)} / ${e(c.period)}</span><h3>${e(c.role)}</h3><a class="career-company" href="${e(safeURL(c.url))}" target="_blank" rel="noopener noreferrer">${e(c.company)} ↗</a>${c.department ? `<span class="career-department">${e(c.department)}</span>` : ""}<p>${e(c.description)}</p>${c.previous.length ? `<details class="earlier-roles"><summary>Earlier experience at RDP <span>+</span></summary><ul>${c.previous.map((r) => (typeof r === "string" ? `<li>${e(r)}</li>` : `<li class="previous-role"><span class="previous-role-period">${e(r.period)}</span><strong>${e(r.role)}</strong><span>${e(r.department)}</span><p>${e(r.description)}</p></li>`)).join("")}</ul></details>` : ""}</div><span class="career-index">0${i + 1}</span></article>`).join("")}</div><a class="text-link work-all" href="https://www.linkedin.com/in/akshunchauhan/details/experience/" target="_blank" rel="noopener noreferrer">More experience on LinkedIn ↗</a></section>`;
}

export function ventureCards(ventures, base = "") {
  return ventures
    .map(
      (v, i) =>
        `<article class="venture-card venture-card-${i} venture-with-media"><a class="venture-media" href="${e(safeURL(v.url))}" target="_blank" rel="noopener noreferrer" data-cursor="VISIT"><img src="${base}${e(v.image)}" alt="${e(v.imageAlt)}" loading="lazy" width="1280" height="720"><span>${e(v.imageCaption)} ↗</span></a><div class="venture-content"><div class="venture-card-top"><span>${e(v.label)}</span><span>0${i + 1} / BUILDING</span></div><a class="venture-brand" href="${e(safeURL(v.url))}" target="_blank" rel="noopener noreferrer"><span class="venture-logo-box"><img src="${base}${e(v.logo)}" alt="" loading="lazy" width="76" height="76"></span><h3>${e(v.name)}</h3><b>↗</b></a><p>${e(v.description)}</p><div class="venture-focus">${v.focus.map((f) => `<span>${e(f)}</span>`).join("")}</div><div class="venture-card-links"><a href="${base}ventures/${e(v.slug)}/">The story behind it ↗</a><a href="${e(safeURL(v.url))}" target="_blank" rel="noopener noreferrer">Visit the website ↗</a></div></div></article>`,
    )
    .join("");
}
