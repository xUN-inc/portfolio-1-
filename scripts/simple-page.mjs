import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { themeHead, themeButton } from "../lib/theme-chrome.mjs";
import { escapeHTML as e } from "../lib/portfolio.mjs";
import { pageMetadata, profilePageSchema } from "../lib/seo.mjs";

export async function buildSimplePage({ root, profile, repos, siteURL }) {
  const landing = profile.landing;
  const json = (value) => JSON.stringify(value).replace(/</g, "\\u003c");
  const slots = {
    SEARCH_TITLE: e(profile.searchTitle),
    SEARCH_DESCRIPTION: e(profile.searchDescription),
    LANDING_ROLE: e(landing.role),
    LANDING_SPECIALIZATION: e(landing.specialization),
    LANDING_INTRO: e(landing.intro),
    LANDING_DIRECTION: e(landing.direction),
    LANDING_SKILLS: landing.skills.map((s) => `<div><h3>${e(s.name)}</h3><p>${e(s.description)}</p></div>`).join(""),
    SEO: pageMetadata(siteURL, "simple/"),
    THEME_HEAD: themeHead("../"),
    THEME_BUTTON: themeButton(),
    SCHEMA: json(profilePageSchema(profile, siteURL, "simple/")),
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
