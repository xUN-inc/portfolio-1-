import { programmingYears } from "./lib/profile-story.mjs";
import { mountExperience } from "./lib/motion.mjs";
import { mountRepositoryLibrary } from "./lib/repository-library.mjs";
import { newsCard } from "./lib/experience.mjs";
import { paginate } from "./lib/public-sources.mjs";
const { profile, repos, base } = JSON.parse(
  document.querySelector("#portfolio-data").textContent,
);
document
  .querySelectorAll("[data-programming-years]")
  .forEach(
    (el) =>
      (el.textContent = programmingYears(Number(el.dataset.programmingYears))),
  );
mountExperience(profile, base);
mountRepositoryLibrary(profile, repos, () => {}, base);
const archive = document.querySelector("#news-archive");
if (archive) {
  let stories = profile.press.toSorted((a, b) => b.date.localeCompare(a.date)),
    query = "",
    source = "all",
    page = 0;
  const render = () => {
    const filtered = stories.filter(
      (p) =>
        (source === "all" || p.publisher === source) &&
        `${p.title} ${p.publisher} ${p.description} ${p.type}`
          .toLowerCase()
          .includes(query),
    );
    const view = paginate(filtered, page, 6);
    page = view.page;
    archive.innerHTML = view.items.map((p) => newsCard(p, { base })).join("");
    document.querySelector("#news-result-count").textContent =
      `${view.total} ${view.total === 1 ? "story" : "stories"}`;
    document.querySelector("#news-empty").hidden = view.total > 0;
    document.querySelector("#news-previous").disabled = page === 0;
    document.querySelector("#news-next").disabled = page >= view.totalPages - 1;
    document.querySelector("#news-page").textContent =
      `${page + 1} / ${view.totalPages}`;
  };
  document.querySelector("#news-search").addEventListener("input", (event) => {
    query = event.target.value.toLowerCase().trim();
    page = 0;
    render();
  });
  document.querySelector("#news-source").addEventListener("change", (event) => {
    source = event.target.value;
    page = 0;
    render();
  });
  document.querySelector("#news-next").addEventListener("click", () => {
    page++;
    render();
  });
  document.querySelector("#news-previous").addEventListener("click", () => {
    page--;
    render();
  });
  render();
  fetch(`${base}content.json`, {
    cache: "no-cache",
    signal: AbortSignal.timeout(5000),
  })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (Array.isArray(data?.profile?.press)) {
        stories = data.profile.press.toSorted((a, b) =>
          b.date.localeCompare(a.date),
        );
        render();
      }
    })
    .catch(() => {});
}
