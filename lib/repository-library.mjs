import {
  normalizeRepos,
  curatedRepos,
  filterRepos,
  repoRow,
} from "./portfolio.mjs";
import { fetchPublicRepos } from "./github.mjs";
import { paginate } from "./public-sources.mjs";
export function mountRepositoryLibrary(
  profile,
  snapshot,
  onUpdate = () => {},
  base = "",
) {
  let repos = curatedRepos(profile, snapshot),
    category = "all",
    query = "",
    page = 0;
  const list = document.querySelector("#repo-list"),
    search = document.querySelector("#repo-search"),
    next = document.querySelector("#more-repos"),
    previous = document.querySelector("#previous-repos"),
    count = document.querySelector("#repo-count"),
    status = document.querySelector("#github-status"),
    pageLabel = document.querySelector("#repo-page");
  if (!list) return;
  function render() {
    const filtered = filterRepos(repos, { query, category });
    const view = paginate(filtered, page, 6);
    page = view.page;
    list.innerHTML = view.items.map((r) => repoRow(r, base)).join("");
    document.querySelector("#repo-empty").hidden = filtered.length > 0;
    next.disabled = page >= view.totalPages - 1;
    previous.disabled = page === 0;
    pageLabel.textContent = `${filtered.length ? page * 6 + 1 : 0}–${Math.min((page + 1) * 6, filtered.length)} / ${filtered.length}`;
    count.textContent = `${filtered.length} ${filtered.length === 1 ? "curated project" : "curated projects"}`;
  }
  document.querySelectorAll("[data-filter]").forEach((button) =>
    button.addEventListener("click", () => {
      category = button.dataset.filter;
      page = 0;
      document.querySelectorAll("[data-filter]").forEach((tab) => {
        const active = tab === button;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-pressed", String(active));
      });
      render();
    }),
  );
  search.addEventListener("input", () => {
    query = search.value;
    page = 0;
    render();
  });
  next.addEventListener("click", () => {
    page++;
    render();
  });
  previous.addEventListener("click", () => {
    page--;
    render();
  });
  function showStatus(label, snapshot = false) {
    status.replaceChildren();
    const dot = document.createElement("span");
    dot.className = "status-dot";
    status.append(dot, document.createTextNode(label));
    status.classList.toggle("snapshot", snapshot);
  }
  const key = `ak-github-v4:${profile.github}`;
  let cache;
  const apply = (input) => {
    if (
      !input ||
      input.user !== profile.github ||
      !Number.isFinite(input.savedAt) ||
      !Array.isArray(input.repos)
    )
      return false;
    const good = normalizeRepos(input.repos);
    if (!good.length) return false;
    repos = curatedRepos(profile, input.repos);
    onUpdate(repos);
    render();
    return true;
  };
  async function refresh() {
    try {
      cache = JSON.parse(localStorage.getItem(key));
      if (
        apply(cache) &&
        Date.now() - cache.savedAt >= 0 &&
        Date.now() - cache.savedAt < 30 * 60 * 1000
      ) {
        showStatus("GitHub · recently updated");
        return;
      }
    } catch {}
    try {
      const latest = await fetchPublicRepos(profile.github);
      repos = curatedRepos(profile, latest);
      onUpdate(repos);
      render();
      showStatus("Live from GitHub · updated just now");
      try {
        localStorage.setItem(
          key,
          JSON.stringify({
            user: profile.github,
            savedAt: Date.now(),
            repos: latest,
          }),
        );
      } catch {}
    } catch {
      if (cache && apply(cache))
        showStatus("GitHub unavailable · showing saved projects", true);
      else
        showStatus(
          `Saved GitHub snapshot · ${new Date(profile.githubSnapshotAt).toLocaleDateString()}`,
          true,
        );
    }
  }
  render();
  refresh();
}
