// Answers are assembled from the public portfolio snapshot, never private checkouts.
const list = (value) => (Array.isArray(value) ? value : []);
const normal = (value = "") =>
  String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const contains = (question, phrase) =>
  Boolean(phrase && ` ${question} `.includes(` ${normal(phrase)} `));
const link = (label, url) => ({ label, url });
const uniqueLinks = (sources) => [
  ...new Map(
    list(sources)
      .filter((s) => s?.url && s.url !== "#")
      .map((s) => [s.url, s]),
  ).values(),
];
const year = () => new Date().getUTCFullYear();
const dated = (item) => item.date || item.year || "";
const sourceFor = (item) => item.localSource || item.url;
const aliases = {
  agrag: ["ag rag"],
  focusreport: ["focus report"],
  cashvault: ["cash vault"],
  asteroid: ["astroid", "asteroid simulator"],
  qnext: ["q next"],
  "restaurant-voice-agent": [
    "ai calling agent",
    "calling agent",
    "voice agent",
  ],
  "agency-challenge": [
    "agency challenge",
    "agency challenges",
    "follow the money",
  ],
  "document-intelligence": [
    "document intelligence project",
    "document intelligentce",
    "document intelligence",
  ],
  "conf-rag": ["conf rag", "confrag"],
  "sentinel-rag": ["sentinel rag"],
  "energy-innovation-link": ["eil", "energy innovation link"],
};

function projectEntry(p, profile) {
  const caseLink = link(`${p.name} case study`, `projects/${p.slug}/`);
  return {
    id: p.slug,
    type: "project",
    title: p.name,
    names: [p.name, p.slug, ...(aliases[p.slug] || [])],
    keys: [p.name, p.slug, ...(aliases[p.slug] || [])],
    text: `${p.summary}\n\n${p.approach}\n\n${p.outcome}`,
    detailText: `${p.summary}\n\nThe question: ${p.challenge}\n\nThe approach: ${p.approach}\n\nThe result: ${p.outcome}\n\nContribution: ${p.role}. Project year: ${p.year}.\nTechnologies: ${list(p.tags).join(", ")}.\n${list(p.facts).join(" · ")}`,
    stack: `${p.name} uses ${list(p.tags).join(", ")}.`,
    comparison: `${p.summary}\nTechnologies: ${list(p.tags).join(", ")}.\nContribution: ${p.role}.\n${list(p.facts).join(" · ")}`,
    role: `${p.name} (${p.year})\nContribution: ${p.role}.\n\n${p.approach}`,
    result: `${p.outcome}\n\n${list(p.facts).join(" · ")}`,
    challenge: `${p.challenge}\n\n${p.approach}`,
    sourceText:
      p.visibility === "private"
        ? `${p.name} has private source code. Its public case study describes the work; contact ${profile.email} to discuss it.`
        : `${p.name} has public source code${p.repo ? ` at ${p.repo}` : ""}. The case study explains the project and contribution.`,
    sources: uniqueLinks([
      caseLink,
      ...(p.visibility === "private"
        ? [link("Discuss this project", `mailto:${profile.email}`)]
        : [
            link("GitHub repository", p.repo),
            link(p.sourceLabel || "Project source", p.source),
          ]),
      ...(p.demo ? [link("Open the demo", p.demo)] : []),
    ]),
    followUps: [
      {
        label: "Technologies",
        question: `What technologies does ${p.name} use?`,
      },
      {
        label: "My contribution",
        question: `What was your role in ${p.name}?`,
      },
      { label: "The full story", question: `Tell me more about ${p.name}` },
    ],
    tags: p.tags,
    category: p.category,
    visibility: p.visibility,
  };
}

export function buildKnowledge(profile, reviewed = []) {
  const projects = list(profile.projects),
    career = list(profile.career),
    ventures = list(profile.ventures);
  const presentations = list(profile.presentations),
    news = list(profile.press),
    recommendations = list(profile.recommendations);
  const allowed = new Set(profile.featuredProjectPolicy?.slugs || []);
  const featured = projects.filter(
    (p) => p.featured && (!allowed.size || allowed.has(p.slug)),
  );
  const privateProjects = projects.filter((p) => p.visibility === "private");
  const careerText = career
    .map(
      (c) =>
        `${c.company} — ${c.role} (${c.period}). ${c.department ? c.department + ". " : ""}${c.description}${list(c.previous).length ? "\nEarlier roles:\n" + c.previous.map((r) => (typeof r === "string" ? r : `${r.role} (${r.period}), ${r.department || c.company}. ${r.description}`)).join("\n") : ""}`,
    )
    .join("\n\n");
  const presentationText = (p) =>
    `${p.event} (${dated(p)}) — ${p.role}.\n${p.topic}.\n${p.authors?.length ? "Authors: " + p.authors.join(", ") + ".\n" : ""}${p.venue || ""}${p.location ? ", " + p.location : ""}. ${p.description || ""}`;
  const recommendationText = (r) =>
    `${r.name} — ${r.headline || r.currentContext || r.context}${r.recommendedAt ? `\n${r.recommendedAt} · ${r.context}` : ""}\n“${r.quote}”`;
  const newsText = (p) =>
    `${p.title} — ${p.publisher}, ${dated(p)}.\n${p.description}`;
  const experience = `Programming since ${profile.programmingStartedYear}: approximately ${Math.max(0, year() - profile.programmingStartedYear)} years, across ${profile.projectCount} projects. This includes personal learning, professional and research projects; it is not the same length of paid employment.`;
  const skills = [...new Set(projects.flatMap((p) => list(p.tags)))];
  const entry = (id, title, keys, text, sources, extra = {}) => ({
    id,
    title,
    keys,
    text,
    sources: uniqueLinks(sources),
    type: "section",
    ...extra,
  });
  const entries = [
    entry(
      "resume",
      "Résumé & qualifications",
      ["resume", "cv"],
      `The résumé records Akshun’s professional roles, education, research presentations, and achievements.\n\n${experience}\n\n${careerText}`,
      [
        link("View résumé", "docs/ak.pdf"),
        link("Career & education", "about/"),
        link("Presentations", "speaking/"),
      ],
    ),
    entry(
      "bio",
      "About Akshun",
      [
        "bio",
        "background",
        "introduce",
        "who are you",
        "who is akshun",
        "about you",
        "about akshun",
        "about me",
        "about him",
        "yourself",
      ],
      `${profile.landing ? `${profile.name} — ${profile.landing.role}\n${profile.landing.intro}\n\nDirection: ${profile.landing.direction}\n\n` : ""}${profile.bio}\n\nBased in ${profile.location}.\n${profile.now}`,
      [
        link("About & experience", "about/"),
        link("LinkedIn", profile.linkedin),
      ],
    ),
    entry(
      "now",
      "Current focus",
      [
        "current focus",
        "currently",
        "right now",
        "what are you doing",
        "working on",
        "current work",
        "what do you do",
        "what does akshun do",
      ],
      `${profile.now}\n\n${careerText}`,
      [
        link("Experience", "about/"),
        ...ventures.map((v) => link(v.name, v.url)),
      ],
    ),
    entry(
      "career",
      "Experience & current work",
      [
        "career",
        "experience",
        "employment",
        "employer",
        "employers",
        "rdp",
        "red deer polytechnic",
        "roles",
        "previous role",
        "work history",
        "worked at",
        "where have you worked",
        "who have you worked for",
        "research",
        "energy research",
        "scientific data analyst",
        "applied research tech",
      ],
      `${experience}\n\n${careerText}`,
      [
        link("Career & previous roles", "about/"),
        link("Résumé", "docs/ak.pdf"),
        ...career.map((c) => link(c.company, c.url)),
      ],
    ),
    entry(
      "programming-history",
      `Programming since ${profile.programmingStartedYear}`,
      [
        "programming",
        "started coding",
        "years of coding",
        "years",
        "2016",
        "100 projects",
        "how many projects",
      ],
      experience,
      [link("About Akshun", "about/")],
    ),
    entry(
      "contact",
      "Start a conversation",
      [
        "contact",
        "email",
        "hire",
        "hiring",
        "available",
        "availability",
        "collaborate",
        "reach",
        "location",
        "based",
        "city",
      ],
      `Email ${profile.email} for opportunities or collaborations. Akshun is based in ${profile.location}. Availability and engagement details are best confirmed directly.`,
      [
        link(profile.email, `mailto:${profile.email}`),
        link("LinkedIn", profile.linkedin),
      ],
    ),
    entry(
      "skills",
      "Technical focus",
      [
        "skills",
        "skill",
        "stack",
        "technologies",
        "technology",
        "python",
        "azure",
        "backend",
        "database",
        "cloud",
        "iot",
        "frontend",
        "languages",
        "sql",
        "nosql",
        "power bi",
        "data pipelines",
        ...skills,
      ],
      `The project catalogue includes ${skills.join(", ")}.\n\nExamples:\n${featured.map((p) => `${p.name} — ${list(p.tags).join(", ")}`).join("\n")}\n\n${career[0]?.description || ""}`,
      [link("Projects & technologies", "work/"), link("Career", "about/")],
    ),
    entry(
      "education",
      "Education",
      [
        "education",
        "study",
        "studied",
        "diploma",
        "graduate",
        "college",
        "university",
        "degree",
        "qualification",
      ],
      list(profile.education)
        .map(
          (i) =>
            `${i.qualification}, ${i.institution} (${i.year}). ${i.recognition}. ${i.description}`,
        )
        .join("\n\n"),
      [
        link("Education & qualifications", "about/"),
        link("Résumé", "docs/ak.pdf"),
      ],
    ),
    entry(
      "certifications",
      "Certifications & professional learning",
      [
        "certifications",
        "certification",
        "certificates",
        "certificate",
        "google cybersecurity",
        "deloitte",
        "tcps",
        "forage",
      ],
      list(profile.certifications)
        .map((c) => `${c.name} — ${c.issuer}, ${c.year}.`)
        .join("\n\n"),
      [link("Professional learning", "about/"), link("Résumé", "docs/ak.pdf")],
    ),
    entry(
      "speaking",
      "Presentations & events",
      [
        "speaking",
        "conference",
        "conferences",
        "presentation",
        "presentations",
        "presented",
        "talks",
        "symposium",
        "coauthors",
        "co authors",
      ],
      presentations.map(presentationText).join("\n\n"),
      [
        link("Presentations & source details", "speaking/"),
        ...presentations.map((p) => link(p.event, sourceFor(p))),
      ],
    ),
    entry(
      "achievements",
      "Recognition & leadership",
      [
        "awards",
        "award",
        "achievements",
        "achievement",
        "winner",
        "recognition",
        "leadership",
        "journey",
        "milestones",
      ],
      list(profile.milestones)
        .map((m) => `${m.title} (${m.year}) — ${m.description}`)
        .join("\n\n"),
      [
        link("Journey & recognition", "about/"),
        ...list(profile.milestones).map((m) => link(m.title, sourceFor(m))),
      ],
    ),
    entry(
      "science-award",
      "All India Science Competition · 2019",
      [
        "all india",
        "science competition",
        "model making",
        "world science congress",
        "2019",
      ],
      list(profile.milestones)
        .filter((m) => m.year === "2019")
        .map((m) => `${m.title} (${m.year}). ${m.description}`)
        .join("\n"),
      [link("Résumé", "docs/ak.pdf")],
    ),
    entry(
      "nasa",
      "NASA Space Apps · Edmonton, 2025",
      ["nasa", "space apps", "edmonton win", "space competition"],
      `${projects.find((p) => p.slug === "asteroid")?.outcome || ""}\n\n${projects.find((p) => p.slug === "asteroid")?.approach || ""}\n\nThe award was first place at the Edmonton local event, not a global NASA award.`,
      [
        link("The NASA story", "news/nasa-our-journey/"),
        link("Asteroid case study", "projects/asteroid/"),
      ],
    ),
    entry(
      "forty-under-forty",
      "Central Alberta’s Top 40 Under 40",
      ["40 under 40", "forty under forty", "united way", "gennext"],
      list(profile.milestones)
        .filter((m) => /40 Under/.test(m.title))
        .map((m) => `${m.title} (${m.year}). ${m.description}`)
        .join("\n"),
      [
        link("United Way recognition", "news/united-way-magazine/"),
        ...news
          .filter((p) => /40 under 40/i.test(p.title))
          .map((p) => link(p.title, p.url)),
      ],
    ),
    entry(
      "recommendations",
      "Colleague recommendations",
      [
        "recommendations",
        "recommendation",
        "testimonial",
        "testimonials",
        "colleagues",
        "recommends",
        "references",
        "recommended",
        "people say",
        "what others say",
      ],
      recommendations.length
        ? recommendations.map(recommendationText).join("\n\n")
        : "No recommendations are currently imported. Visit Akshun’s LinkedIn profile for his professional background.",
      [
        link("Recommendations", "about/#recommendations"),
        ...recommendations.map((r) => link(r.name, r.url)),
      ],
    ),
    entry(
      "press",
      "Writing & press",
      [
        "press",
        "articles",
        "article",
        "news",
        "writing",
        "media",
        "published",
        "publication",
        "coverage",
        "mentions",
      ],
      news
        .toSorted((a, b) => dated(b).localeCompare(dated(a)))
        .map(newsText)
        .join("\n\n"),
      [
        link("All news & mentions", "news/"),
        ...news.map((p) => link(p.title, p.url)),
      ],
    ),
    entry(
      "linkedin",
      "LinkedIn highlights",
      ["linkedin", "linkedin activity", "posts", "social", "community"],
      list(profile.linkedinActivity)
        .map((i) => `${i.title} — ${i.publisher}. ${i.description}`)
        .join("\n\n") +
        "\n\nThese are the portfolio’s sourced highlights. Visit LinkedIn for current posts and the full conversation.",
      [
        link(
          "Current LinkedIn activity",
          `${profile.linkedin.replace(/\/$/, "")}/recent-activity/all/`,
        ),
        ...list(profile.linkedinActivity).map((i) => link(i.title, i.url)),
      ],
    ),
    entry(
      "projects",
      "Explore the work",
      [
        "projects",
        "project",
        "portfolio",
        "github",
        "built",
        "workbench",
        "selected work",
        "featured work",
      ],
      `${experience}\n\nThe eleven selected projects cover local AI, native apps, navigation, voice, analytics, and applied research:\n${featured.map((p) => `• ${p.name} — ${p.summary}`).join("\n\n")}\n\nThe broader library has ${reviewed.length} curated entries, including public source and private case studies.`,
      [link("Project library & case studies", "work/")],
      {
        detailText: `${experience}\n\n${reviewed.map((r) => `• ${r.name}${r.visibility === "private" ? " (private source)" : ""} — ${r.description}`).join("\n\n")}`,
        followUps: [
          {
            label: "Private case studies",
            question: "Which projects have private source?",
          },
          {
            label: "Compare two projects",
            question: "Compare Asteroid and RoomQuest",
          },
          {
            label: "Technologies",
            question: "What technologies do you work with?",
          },
        ],
      },
    ),
    entry(
      "private-projects",
      "Private project case studies",
      [
        "private projects",
        "private repos",
        "private repositories",
        "private source",
      ],
      privateProjects.map((p) => `${p.name} — ${p.summary}`).join("\n\n") +
        "\n\nThe public case studies describe the work. Private source code is not published here.",
      privateProjects.map((p) => link(p.name, `projects/${p.slug}/`)),
    ),
    entry(
      "businesses",
      "Companies & ventures",
      [
        "businesses",
        "companies",
        "ventures",
        "entrepreneurship",
        "business",
        "company",
        "venture",
        "founder",
        "services",
      ],
      ventures
        .map(
          (v) =>
            `${v.name} — ${v.description}\n${list(v.services)
              .map((s) => `${s.name}: ${s.text}`)
              .join("\n")}`,
        )
        .join("\n\n"),
      ventures.map((v) => link(v.name, v.url)),
    ),
    entry(
      "guide",
      "About this portfolio guide",
      [
        "chatbot",
        "guide",
        "chat privacy",
        "store chats",
        "store conversations",
        "how do you answer",
      ],
      "I use the portfolio’s published profile, reviewed projects, career records, education, certifications, presentations, awards, recommendations, news, and company descriptions. I can compare projects and answer follow-ups. I do not have access to private source checkouts or live LinkedIn data. Questions stay in this browser and conversations reset when the page reloads.",
      [link("Explore the portfolio", "about/")],
    ),
  ];
  for (const v of ventures)
    entries.push(
      entry(
        v.slug === "xun-innovation" ? "business" : v.slug,
        v.name,
        v.slug === "xun-innovation"
          ? [v.name, v.slug, "xun", "business", "company", "founder"]
          : [v.name, v.slug],
        `${v.description}\n\n${list(v.services)
          .map((s) => `${s.name}: ${s.text}`)
          .join(
            "\n\n",
          )}${v.technicalDescription ? "\n\n" + v.technicalDescription : ""}`,
        [link(v.name, v.url), link("Company context", `ventures/${v.slug}/`)],
        {
          type: "venture",
          names: [
            v.name,
            v.slug,
            ...(v.slug === "xun-innovation" ? ["xun"] : []),
          ],
          stack: list(v.technologies).length
            ? `Publicly described technologies: ${v.technologies.join(", ")}.\n\n${v.technicalDescription || v.description}`
            : v.description,
          detailText: `${v.description}\n\n${list(v.services)
            .map((s) => `${s.name}: ${s.text}`)
            .join("\n\n")}`,
        },
      ),
    );
  entries.push(...projects.map((p) => projectEntry(p, profile)));
  for (const [i, r] of recommendations.entries())
    entries.push(
      entry(
        `person-${i}`,
        r.name,
        [r.name, ...r.name.split(" ").filter((n) => n.length > 3)],
        recommendationText(r),
        [
          link("Original recommendation", r.url),
          ...(r.profileURL ? [link("LinkedIn profile", r.profileURL)] : []),
        ],
        {
          type: "person",
          names: [
            r.name,
            r.name.split(" ")[0],
            ...(r.currentContext?.includes("·")
              ? [r.currentContext.split("·").at(-1).trim()]
              : []),
          ],
          role: `${r.name} — ${r.currentContext || r.context}`,
          detailText: recommendationText(r),
        },
      ),
    );
  for (const [i, p] of presentations.entries())
    entries.push(
      entry(
        `presentation-${i}`,
        p.topic,
        [p.topic, p.event],
        presentationText(p),
        [
          link("Presentation details", "speaking/"),
          link(p.sourceLabel || p.event, sourceFor(p)),
        ],
        { type: "presentation", names: [p.topic, p.event] },
      ),
    );
  for (const [i, p] of news.entries())
    entries.push(
      entry(
        `news-${i}`,
        p.title,
        [p.title],
        newsText(p),
        [link("Portfolio story", `news/${p.slug}/`), link(p.publisher, p.url)],
        { type: "news", names: [p.title] },
      ),
    );
  const written = new Set(projects.map((p) => `projects/${p.slug}/`));
  for (const [i, r] of reviewed
    .filter((r) => !written.has(r.casePath))
    .entries())
    entries.push(
      entry(
        `repository-${i}`,
        r.name,
        [r.name],
        `${r.description}\n\nPrimary repository language: ${r.language}. A detailed case study is not yet included; the public source is available below.`,
        [
          link("Public repository", r.html_url),
          link("Project library", "work/"),
        ],
        { type: "repository", names: [r.name, r.html_url.split("/").at(-1)] },
      ),
    );
  return entries;
}

function facet(q) {
  if (/\b(source|code|repository|repo|github|private)\b/.test(q))
    return "sourceText";
  if (
    /\b(technolog(?:y|ies)|stack|languages?|frameworks?|tools|built with|tech)\b/.test(
      q,
    ) ||
    /\btechnologies\b/.test(q)
  )
    return "stack";
  if (/\b(role|contribut|contribution|responsib|year|when)\b/.test(q))
    return "role";
  if (/\b(result|results|outcome|outcomes|achieved|impact)\b/.test(q))
    return "result";
  if (/\b(challenge|problem|approach|how does|how did|how it)\b/.test(q))
    return "challenge";
  if (/\b(more|detail|details|full story|everything)\b/.test(q))
    return "detailText";
  return "text";
}
function answerFor(entry, q) {
  const intent = list(entry.names)
    .toSorted((a, b) => normal(b).length - normal(a).length)
    .reduce(
      (text, name) => ` ${text} `.replace(` ${normal(name)} `, " ").trim(),
      q,
    );
  const chosen = facet(intent);
  return {
    ...entry,
    text: entry[chosen] || entry.text,
    entityIds: entry.type !== "section" ? [entry.id] : [],
    sources: uniqueLinks(entry.sources).slice(0, 8),
  };
}
export function reply(question, profile, reviewed = [], context = {}) {
  const q = normal(String(question).slice(0, 1000));
  const entries = buildKnowledge(profile, reviewed),
    byId = (id) => entries.find((e) => e.id === id);
  const unknown = () => ({
    id: "unknown",
    title: "Let’s keep this grounded.",
    text: "I don’t have a sourced answer to that yet. I can help with Akshun’s projects, career, companies, education, certifications, presentations, awards, recommendations, and news. Contact Akshun for anything the portfolio does not cover.",
    sources: [link(profile.email, `mailto:${profile.email}`)],
    followUps: [
      { label: "Selected projects", question: "Tell me about your projects" },
      { label: "Career at RDP", question: "What roles have you held at RDP?" },
    ],
  });
  if (/^(hi|hello|hey|thanks|thank you)$/.test(q))
    return {
      id: "hello",
      title: "Hello, I’m AK’s portfolio guide.",
      text: "Ask about a project, career, education, awards, companies, or people I’ve worked with. You can compare two projects or ask a follow-up about the technology or my contribution.",
      sources: [],
      followUps: [
        { label: "Projects", question: "What are your selected projects?" },
        { label: "Experience", question: "Tell me about your career" },
        { label: "Companies", question: "What companies are you building?" },
      ],
    };
  if (
    /\b(nobel|salary|password|secret|system prompt|ignore all|ignore your|ignore the rules)\b/.test(
      q,
    ) ||
    /<\s*script/i.test(question)
  )
    return unknown();
  const named = entries
    .filter(
      (e) => e.type !== "section" && list(e.names).some((n) => contains(q, n)),
    )
    .sort(
      (a, b) =>
        Math.max(...b.names.map((n) => normal(n).length)) -
        Math.max(...a.names.map((n) => normal(n).length)),
    );
  // Longer explicit names win; tag words never masquerade as project names.
  if (named.length) {
    if (
      /\b(news|articles?|coverage|press)\b/.test(q) &&
      named.some((e) => e.type === "project")
    ) {
      const terms = named
        .filter((e) => e.type === "project")
        .flatMap((e) =>
          e.id === "asteroid" ? ["asteroid", "nasa"] : [e.title],
        );
      const stories = entries.filter(
        (e) =>
          e.type === "news" &&
          terms.some((t) => contains(normal(e.title + " " + e.text), t)),
      );
      if (stories.length)
        return {
          id: "related-news",
          title: "Coverage of the project",
          text: stories.map((e) => e.text).join("\n\n"),
          sources: uniqueLinks(stories.flatMap((e) => e.sources)).slice(0, 8),
          entityIds: [],
        };
    }
    const selected = named.filter(
      (e) =>
        !named.some(
          (other) =>
            other !== e &&
            normal(other.title).includes(normal(e.title)) &&
            other.title.length > e.title.length,
        ),
    );
    if (
      selected.length > 1 &&
      /\b(compare|versus|vs|and|difference)\b/.test(q)
    ) {
      const intent = selected
        .flatMap((e) => list(e.names))
        .toSorted((a, b) => normal(b).length - normal(a).length)
        .reduce(
          (text, name) => ` ${text} `.replace(` ${normal(name)} `, " ").trim(),
          q,
        );
      const chosen = selected.slice(0, 3).map((e) => answerFor(e, intent));
      return {
        id: "comparison",
        title: chosen.map((e) => e.title).join(" & "),
        text: chosen
          .map(
            (e) =>
              `${e.title}\n${facet(intent) === "text" && e.comparison ? e.comparison : e.text}`,
          )
          .join("\n\n"),
        entityIds: chosen.map((e) => e.id),
        sources: uniqueLinks(chosen.flatMap((e) => e.sources)).slice(0, 8),
        followUps: [
          {
            label: "Compare technologies",
            question: "What technologies do they use?",
          },
          {
            label: "Compare contributions",
            question: "What was your role in each?",
          },
        ],
      };
    }
    const found = answerFor(selected[0], q);
    if (found.type === "venture" && /\b(code|source|repository|repo)\b/.test(q))
      found.text +=
        "\n\nCompany source code is not published in this portfolio. The links describe the company and its public offering.";
    return found;
  }
  const previous = context.previous;
  if (
    /^who else/.test(q) &&
    previous?.entityIds?.some((id) => id.startsWith("person-"))
  )
    return answerFor(byId("recommendations"), q);
  const followUp =
    /^(and |what about |tell me more|more$|what else|go on|how does it|how did it|how it|what (tech|technologies|stack|language|was your role|is your role|were the results)|when was it|when did|who else)/.test(
      q,
    ) ||
    /\b(it|they|them|each|this project|that project|those projects)\b/.test(q);
  if (followUp && previous?.entityIds?.length) {
    const chosen = previous.entityIds
      .map(byId)
      .filter(Boolean)
      .map((e) => answerFor(e, q));
    if (chosen.length)
      return {
        ...chosen[0],
        title: chosen.map((e) => e.title).join(" & "),
        text: chosen
          .map((e) => (chosen.length > 1 ? `${e.title}\n${e.text}` : e.text))
          .join("\n\n"),
        entityIds: chosen.map((e) => e.id),
        sources: uniqueLinks(chosen.flatMap((e) => e.sources)).slice(0, 8),
        followUps:
          chosen.length > 1
            ? [
                {
                  label: "Compare contributions",
                  question: "What was your role in each?",
                },
                {
                  label: "Compare results",
                  question: "What were the results for each?",
                },
              ]
            : chosen[0].followUps,
      };
  }
  if (/^(tell me )?about (you|him|me|akshun)$/.test(q))
    return answerFor(byId("bio"), q);
  if (
    /\b(private)\b/.test(q) &&
    /\b(projects?|repos?|repositories|source)\b/.test(q)
  )
    return answerFor(byId("private-projects"), q);
  if (
    /\b(nasa|space apps)\b/.test(q) &&
    /\b(news|articles|coverage|press)\b/.test(q)
  ) {
    const stories = entries.filter(
      (e) => e.type === "news" && /nasa|asteroid/i.test(e.title + " " + e.text),
    );
    return {
      id: "nasa-news",
      title: "NASA Space Apps coverage",
      text: stories.map((e) => e.text).join("\n\n"),
      sources: uniqueLinks([
        link("All news & mentions", "news/"),
        ...stories.flatMap((e) => e.sources),
      ]).slice(0, 8),
      entityIds: [],
    };
  }
  if (/\b(nasa|space apps)\b/.test(q)) return answerFor(byId("nasa"), q);
  if (
    /\b(current|currently|now)\b/.test(q) &&
    /\b(focus|work|doing|building|role)\b/.test(q)
  )
    return answerFor(byId("now"), q);
  if (
    /\b(projects|applications|apps)\b/.test(q) &&
    /\b(ai|data|native|desktop|mobile|web)\b/.test(q)
  ) {
    const kind = /\b(native|desktop|mobile)\b/.test(q)
      ? "native"
      : /\bweb\b/.test(q)
        ? "web"
        : "ai";
    const matches = entries.filter(
      (e) =>
        e.type === "project" &&
        (kind === "native"
          ? e.tags.some((t) => /swift|flutter|electron|pyqt/i.test(t))
          : e.category === kind),
    );
    return {
      id: "project-category",
      title:
        kind === "native"
          ? "Native, desktop & mobile projects"
          : kind === "web"
            ? "Web & platform projects"
            : "AI & data projects",
      text: matches
        .map(
          (e) =>
            `${e.title} — ${e.text.split("\n")[0]}\nTechnologies: ${e.tags.join(", ")}`,
        )
        .join("\n\n"),
      sources: [link("Project library", "work/")],
      entityIds: [],
    };
  }
  const sections = entries
    .filter((e) => e.type === "section")
    .map((e) => ({
      ...e,
      score: e.keys.reduce(
        (n, k) => n + (contains(q, k) ? (normal(k).includes(" ") ? 6 : 2) : 0),
        0,
      ),
    }))
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score);
  if (sections.length) {
    if (/\b(and|also|plus)\b/.test(q)) {
      const chosen = sections
        .filter((e) => e.score >= 2)
        .slice(0, 3)
        .map((e) => answerFor(e, q));
      if (chosen.length > 1)
        return {
          id: "overview",
          title: chosen.map((e) => e.title).join(" & "),
          text: chosen.map((e) => `${e.title}\n${e.text}`).join("\n\n"),
          sources: uniqueLinks(chosen.flatMap((e) => e.sources)).slice(0, 8),
          entityIds: [],
        };
    }
    const found = sections[0];
    if (found.id === "projects" && /\b(all|every|entire|full)\b/.test(q))
      return { ...answerFor(found, q), text: found.detailText };
    if (followUp && previous?.id === found.id && found.detailText)
      return { ...answerFor(found, q), text: found.detailText };
    return answerFor(found, q);
  }
  // Search descriptive records only when at least two distinctive words match.
  const stop = new Set(
    "tell me about what which where when your you does do is the a an in at of and for to with his akshun chauhan please can how it work works use uses my has have i".split(
      " ",
    ),
  );
  const words = [
    ...new Set(q.split(" ").filter((w) => w.length > 3 && !stop.has(w))),
  ];
  const searchable = entries
    .filter((e) => e.type !== "section")
    .map((e) => ({
      ...e,
      score: words.filter((w) => contains(normal(e.title + " " + e.text), w))
        .length,
    }))
    .sort((a, b) => b.score - a.score);
  if (
    words.length >= 2 &&
    searchable[0]?.score >= 2 &&
    searchable[0].score / words.length >= 0.6
  )
    return answerFor(searchable[0], q);
  if (followUp && previous?.id && byId(previous.id))
    return {
      ...answerFor(byId(previous.id), q),
      text: byId(previous.id).detailText || byId(previous.id).text,
    };
  return unknown();
}
