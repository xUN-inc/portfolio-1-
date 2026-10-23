import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { themeHead, themeButton } from "../lib/theme-chrome.mjs";
import { escapeHTML as e } from "../lib/portfolio.mjs";

export async function buildSimplePage({ root, profile, repos, siteURL }) {
  const landing = profile.landing;
  const json = (value) => JSON.stringify(value).replace(/</g, "\\u003c");
  const slots = {
    LANDING_ROLE: e(landing.role),
    LANDING_SPECIALIZATION: e(landing.specialization),
    LANDING_INTRO: e(landing.intro),
    LANDING_DIRECTION: e(landing.direction),
    LANDING_SKILLS: landing.skills.map((s) => `<div><h2>${e(s.name)}</h2><p>${e(s.description)}</p></div>`).join(""),
    SEO: siteURL ? `<link rel="canonical" href="${e(siteURL)}/simple/"><meta property="og:url" content="${e(siteURL)}/simple/"><meta property="og:image" content="${e(siteURL)}/images/about/akshunchauhan.jpg"><meta property="og:image:alt" content="Akshun Chauhan"><meta name="twitter:image" content="${e(siteURL)}/images/about/akshunchauhan.jpg">` : "",
    THEME_HEAD: themeHead("../"),
    THEME_BUTTON: themeButton(),
    SCHEMA: json({ "@context": "https://schema.org", "@type": "ProfilePage", ...(siteURL ? {url: siteURL + "/simple/"} : {}), mainEntity: {"@type": "Person", name: profile.name, jobTitle: profile.title, description: landing.intro, email: profile.email, sameAs: [profile.linkedin, `https://github.com/${profile.github}`], knowsAbout: landing.skills.map((s) => s.name)} }),
    DATA: json({ profile, repos }),
  };
  const source = await readFile(resolve(root, "src/simple.template.html"), "utf8");
  const html = source.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
    if (!(key in slots)) throw new Error(`Missing simple-page slot: ${key}`);
    return slots[key];
  });
  await mkdir(resolve(root, "simple"), { recursive: true });
  await writeFile(resolve(root, "simple/index.html"), html);
  return "simple/";
}
