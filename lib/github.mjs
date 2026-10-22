import { normalizeRepos } from "./portfolio.mjs";
export async function fetchPublicRepos(
  username,
  { fetchImpl = fetch, headers = {}, timeout = 8000, pageLimit = 20 } = {},
) {
  const results = [];
  for (let page = 1; page <= pageLimit; page++) {
    const response = await fetchImpl(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&type=owner&sort=pushed&page=${page}`,
      {
        headers: { Accept: "application/vnd.github+json", ...headers },
        signal: AbortSignal.timeout(timeout),
      },
    );
    if (!response.ok)
      throw new Error(`GitHub returned HTTP ${response.status}`);
    const batch = await response.json();
    if (!Array.isArray(batch)) throw new Error("Invalid GitHub response");
    results.push(...batch);
    if (batch.length < 100) {
      const repos = normalizeRepos(results);
      if (!repos.length) throw new Error("Empty GitHub repository response");
      return repos;
    }
  }
  throw new Error("Incomplete repository response: pagination limit reached");
}
