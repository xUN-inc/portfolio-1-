import { writeFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fetchPublicRepos } from "../lib/github.mjs";
const root = resolve(import.meta.dirname, "..");
const profile = JSON.parse(
  await readFile(resolve(root, "data/portfolio.json"), "utf8"),
);
const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "akshun-portfolio-sync",
  ...(process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {}),
};
async function get(path) {
  const response = await fetch(`https://api.github.com/${path}`, {
    headers,
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw new Error(
      `GitHub returned HTTP ${response.status}; existing snapshot preserved.`,
    );
  return response.json();
}
const user = await get(`users/${encodeURIComponent(profile.github)}`);
const normalized = await fetchPublicRepos(profile.github, {
  headers,
  timeout: 15000,
});
// All requests and validation finish before replacing the working snapshots.
await writeFile(
  resolve(root, "data/github-repos.json"),
  JSON.stringify(normalized, null, 2) + "\n",
);
await writeFile(
  resolve(root, "data/github-profile.json"),
  JSON.stringify(
    {
      login: user.login,
      name: user.name,
      bio: user.bio,
      blog: user.blog,
      location: user.location,
      public_repos: user.public_repos,
      followers: user.followers,
      avatar_url: user.avatar_url,
    },
    null,
    2,
  ) + "\n",
);
profile.githubSnapshotAt = new Date().toISOString();
await writeFile(
  resolve(root, "data/portfolio.json"),
  JSON.stringify(profile, null, 2) + "\n",
);
console.log(
  `Updated ${normalized.length} public repositories. Run npm run build to refresh crawlable content.`,
);
