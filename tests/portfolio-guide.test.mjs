import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  answerQuestion,
  knowledgeEntries,
  curatedRepos,
} from "../lib/portfolio.mjs";
const profile = JSON.parse(
  await readFile(new URL("../data/portfolio.json", import.meta.url), "utf8"),
);
const repos = JSON.parse(
  await readFile(new URL("../data/github-repos.json", import.meta.url), "utf8"),
);

test("the guide covers every case study and reviewed library item without exposing private source", () => {
  for (const p of profile.projects) {
    const a = answerQuestion(`Tell me about ${p.name}`, profile, repos);
    assert.equal(a.title, p.name);
    assert.ok(a.text.includes(p.summary));
    assert.ok(a.sources.some((s) => s.url === `projects/${p.slug}/`));
    if (p.visibility === "private")
      assert.ok(!a.sources.some((s) => s.url.includes("github.com")));
  }
  for (const r of curatedRepos(profile, repos).filter((r) => !r.casePath)) {
    const a = answerQuestion(`Tell me about ${r.name}`, profile, repos);
    assert.equal(a.title, r.name);
    assert.ok(a.sources.some((s) => s.url === r.html_url));
  }
});
test("project follow-ups change the answer to the requested facet", () => {
  const first = answerQuestion("Tell me about RoomQuest", profile, repos);
  const stack = answerQuestion(
    "What technologies does it use?",
    profile,
    repos,
    { previous: first },
  );
  assert.equal(stack.title, "RoomQuest");
  assert.ok(stack.text.includes("TypeScript"));
  assert.ok(stack.text.includes("Dijkstra"));
  const more = answerQuestion("Tell me more", profile, repos, {
    previous: first,
  });
  assert.notEqual(more.text, first.text);
  assert.ok(more.text.includes("The question:"));
  assert.ok(more.text.includes("Contribution:"));
  const role = answerQuestion("What was your role?", profile, repos, {
    previous: first,
  });
  assert.ok(role.text.includes("Contribution: Project development"));
});
test("comparisons retain both project contexts for the next question", () => {
  const a = answerQuestion("Compare Asteroid and RoomQuest", profile, repos);
  assert.ok(a.text.includes("Asteroid"));
  assert.ok(a.text.includes("RoomQuest"));
  assert.equal(a.entityIds.length, 2);
  const follow = answerQuestion(
    "What technologies do they use?",
    profile,
    repos,
    { previous: a },
  );
  assert.ok(follow.text.includes("Three.js"));
  assert.ok(follow.text.includes("Dijkstra"));
  assert.equal(follow.entityIds.length, 2);
});
test("current focus, contact, and named recommenders use the latest profile", () => {
  assert.equal(
    answerQuestion("What is your current focus?", profile, repos).title,
    "Current focus",
  );
  assert.ok(
    answerQuestion("How can I contact you?", profile, repos).text.includes(
      "ak@xuninnovation.ca",
    ),
  );
  const yash = answerQuestion("What did Yash say?", profile, repos);
  assert.equal(yash.title, "Yash Rajput");
  assert.ok(yash.text.includes("Assistant Director · EY"));
  assert.ok(yash.text.includes(profile.recommendations[1].quote));
  const updated = structuredClone(profile);
  updated.email = "new@example.com";
  assert.ok(
    answerQuestion("What is your email?", updated, repos).text.includes(
      "new@example.com",
    ),
  );
});
test("education, certifications, presentations, business, and news are all indexed", () => {
  const knowledge = knowledgeEntries(profile, repos);
  for (const p of profile.presentations)
    assert.ok(
      knowledge.some(
        (e) => e.type === "presentation" && e.text.includes(p.topic),
      ),
    );
  for (const p of profile.press)
    assert.ok(
      knowledge.some(
        (e) =>
          e.type === "news" &&
          e.title === p.title &&
          e.text.includes(p.description),
      ),
    );
  for (const c of profile.certifications)
    assert.ok(
      answerQuestion(
        "What certifications do you have?",
        profile,
        repos,
      ).text.includes(c.name),
    );
  const company = answerQuestion("Tell me about INDine", profile, repos);
  assert.equal(company.type, "venture");
  assert.ok(company.text.includes(profile.ventures[1].services[0].text));
  assert.ok(!company.sources.some((s) => s.url.includes("github.com")));
  const news = answerQuestion("Show me NASA news coverage", profile, repos);
  assert.ok(news.text.includes("NASA"));
  assert.ok(news.sources.some((s) => s.url === "news/"));
  assert.equal(
    answerQuestion("What is your research?", profile, repos).id,
    "career",
  );
  assert.equal(
    answerQuestion("Tell me about your company", profile, repos).id,
    "businesses",
  );
  assert.equal(
    answerQuestion("Can I see your resume?", profile, repos).id,
    "resume",
  );
  assert.equal(
    answerQuestion("Who is at EY?", profile, repos).title,
    "Yash Rajput",
  );
});
test("catalogue questions preserve the curated scope and selected-project policy", () => {
  const all = answerQuestion("Show all projects", profile, repos);
  for (const r of curatedRepos(profile, repos))
    assert.ok(all.text.includes(r.name));
  assert.ok(!all.text.includes("INDine"));
  assert.ok(!all.text.includes("question1"));
  const selected = answerQuestion(
    "What are your selected projects?",
    profile,
    repos,
  );
  for (const slug of profile.featuredProjectPolicy.slugs)
    assert.ok(
      selected.text.includes(
        profile.projects.find((p) => p.slug === slug).name,
      ),
    );
});
