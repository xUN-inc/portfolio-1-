import { projectCard } from "./portfolio.mjs";

// The reviewed pool is shared by the homepage and project directory.
export function selectedProjects(profile) {
  const allowed = new Set(profile.featuredProjectPolicy?.slugs || []);
  return profile.projects.filter(
    (p) => p.featured && (!allowed.size || allowed.has(p.slug)),
  );
}

export function selectedWorkControls(total) {
  return `<div class="selected-work-controls" role="group" aria-label="Selected project pages"><p>Different problems. Different ways of building.</p><div class="repo-pagination"><button class="page-button" id="selected-previous" aria-label="Previous selected projects" disabled>←</button><span id="selected-page" aria-live="polite">1–${Math.min(6, total)} / ${total}</span><button class="page-button" id="selected-next" aria-label="More selected projects">More selected work →</button></div></div>`;
}

export function mountSelectedWork(profile, base = "") {
  const grid = document.querySelector("#selected-projects");
  const next = document.querySelector("#selected-next");
  const previous = document.querySelector("#selected-previous");
  if (!grid || !next || !previous) return;
  const projects = selectedProjects(profile);
  let page = 0;
  const render = () => {
    const start = page * 6;
    grid.innerHTML = projects
      .slice(start, start + 6)
      .map((p, i) => projectCard(p, start + i, base))
      .join("");
    document.querySelector("#selected-page").textContent =
      `${start + 1}–${Math.min(start + 6, projects.length)} / ${projects.length}`;
    previous.disabled = page === 0;
    next.disabled = start + 6 >= projects.length;
    grid.scrollLeft = 0;
    grid.scrollIntoView({
      block: "start",
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };
  next.addEventListener("click", () => {
    page++;
    render();
  });
  previous.addEventListener("click", () => {
    page--;
    render();
  });
}
