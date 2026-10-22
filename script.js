import { programmingYears } from "./lib/profile-story.mjs";
import { mountSelectedWork } from "./lib/selected-work.mjs";
import { mountNewsRotation, mountPostcard } from "./lib/exploration.mjs";
import { answerQuestion } from "./lib/portfolio.mjs";
import { mountRepositoryLibrary } from "./lib/repository-library.mjs";
import { mountExperience } from "./lib/motion.mjs";
import { recommendationMarquee } from "./lib/experience.mjs";
const bootstrap = JSON.parse(
  document.querySelector("#portfolio-data").textContent,
);
let profile = bootstrap.profile;
let repos = bootstrap.repos;
mountSelectedWork(profile);
mountRepositoryLibrary(profile, repos, (updated) => (repos = updated));
document
  .querySelectorAll("[data-programming-years]")
  .forEach(
    (el) =>
      (el.textContent = programmingYears(Number(el.dataset.programmingYears))),
  );
mountExperience(profile);
const newsRotation = mountNewsRotation(profile);
mountPostcard();
const menu = document.querySelector(".menu-toggle"),
  mobileNav = document.querySelector("#mobile-nav");
function closeMenu() {
  mobileNav.hidden = true;
  menu.setAttribute("aria-expanded", "false");
  menu.setAttribute("aria-label", "Open navigation");
}
menu.addEventListener("click", () => {
  const open = mobileNav.hidden;
  mobileNav.hidden = !open;
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
});
mobileNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("click", (event) => {
  if (
    !mobileNav.hidden &&
    !mobileNav.contains(event.target) &&
    !menu.contains(event.target)
  )
    closeMenu();
});
window.matchMedia("(min-width: 681px)").addEventListener("change", closeMenu);
for (const button of document.querySelectorAll("[data-journal]"))
  button.addEventListener("click", () => {
    for (const tab of document.querySelectorAll("[data-journal]")) {
      const active = tab === button;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-pressed", String(active));
    }
    document.querySelector("#press-feed").hidden =
      button.dataset.journal !== "press";
    document.querySelector(".news-rotation").hidden =
      button.dataset.journal !== "press";
    document.querySelector("#linkedin-feed").hidden =
      button.dataset.journal !== "linkedin";
  });

document.querySelector("#copyright-year").textContent =
  new Date().getFullYear();
let copyTimeout;
document.querySelector("#copy-email").addEventListener("click", async () => {
  const copyStatus = document.querySelector("#copy-status");
  clearTimeout(copyTimeout);
  try {
    await navigator.clipboard.writeText(profile.email);
    copyStatus.textContent = "Copied";
  } catch {
    copyStatus.textContent = "Select the email to copy";
  }
  copyTimeout = setTimeout(() => (copyStatus.textContent = ""), 3500);
});

const panel = document.querySelector("#chat-panel"),
  launcher = document.querySelector("#chat-launcher"),
  input = document.querySelector("#chat-input"),
  messages = document.querySelector("#chat-messages"),
  form = document.querySelector("#chat-form");
const inertSurfaces = [
  ...document.querySelectorAll(
    ".site-header,.mobile-nav,main,.site-footer,.chat-launcher",
  ),
];
let previousFocus, lastAnswer;
function openChat() {
  if (!panel.hidden) return;
  previousFocus = document.activeElement;
  closeMenu();
  panel.hidden = false;
  launcher.setAttribute("aria-expanded", "true");
  for (const surface of inertSurfaces) surface.inert = true;
  input.focus({ preventScroll: true });
}
function closeChat() {
  if (panel.hidden) return;
  panel.hidden = true;
  launcher.setAttribute("aria-expanded", "false");
  for (const surface of inertSurfaces) surface.inert = false;
  previousFocus?.focus({ preventScroll: true });
}
for (const trigger of document.querySelectorAll(
  "[data-open-chat],#chat-launcher",
))
  trigger.addEventListener("click", openChat);
document.querySelector("#close-chat").addEventListener("click", closeChat);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (!panel.hidden) {
      closeChat();
      event.preventDefault();
    } else if (!mobileNav.hidden) {
      closeMenu();
      menu.focus();
    }
  }
  if (event.key === "Tab" && !panel.hidden) {
    const focusable = [
      ...panel.querySelectorAll("button:not([disabled]),a[href],input"),
    ].filter((el) => el.getClientRects().length > 0);
    const first = focusable[0],
      last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
document.addEventListener("pointerdown", (event) => {
  if (
    !panel.hidden &&
    !panel.contains(event.target) &&
    !event.target.closest("[data-open-chat],#chat-launcher")
  )
    closeChat();
});
function appendMessage(kind, text) {
  const message = document.createElement("div");
  message.className = `chat-message ${kind}`;
  const p = document.createElement("p");
  p.textContent = text;
  message.append(p);
  messages.append(message);
  return message;
}
function respond(question) {
  const trimmed = question.trim().slice(0, 1000);
  if (!trimmed) return;
  appendMessage("user", trimmed);
  const answer = answerQuestion(trimmed, profile, repos, {
    previous: lastAnswer,
  });
  lastAnswer = answer;
  const message = appendMessage("assistant", answer.text);
  const label = document.createElement("span");
  label.className = "chat-message-label";
  label.textContent = "PORTFOLIO GUIDE";
  const heading = document.createElement("h3");
  heading.textContent = answer.title;
  message.prepend(label, heading);
  if (answer.sources?.length) {
    const sources = document.createElement("div");
    sources.className = "chat-sources";
    for (const source of answer.sources) {
      const link = document.createElement("a");
      try {
        const url = new URL(source.url, document.baseURI);
        if (!["http:", "https:", "mailto:"].includes(url.protocol)) continue;
        link.href = url.href;
      } catch {
        continue;
      }
      link.textContent = source.label + " ↗";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      sources.append(link);
    }
    message.append(sources);
  }
  if (answer.followUps?.length) {
    const followUps = document.createElement("div");
    followUps.className = "chat-prompts chat-followups";
    for (const suggestion of answer.followUps.slice(0, 3)) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = suggestion.label;
      button.addEventListener("click", () => respond(suggestion.question));
      followUps.append(button);
    }
    message.append(followUps);
  }
  document.querySelector("#chat-prompts").hidden = true;
  input.value = "";
  messages.scrollTo({
    top: messages.scrollHeight,
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
  });
  input.focus({ preventScroll: true });
}
form.addEventListener("submit", (event) => {
  event.preventDefault();
  respond(input.value);
});
for (const prompt of document.querySelectorAll("[data-question]"))
  prompt.addEventListener("click", () => respond(prompt.dataset.question));

// Revalidate the same-origin content snapshot produced by the public-source job.
// The rendered HTML remains a complete fallback when a host is offline.
fetch("content.json", { cache: "no-cache", signal: AbortSignal.timeout(5000) })
  .then((response) => (response.ok ? response.json() : null))
  .then((data) => {
    if (
      !data?.profile ||
      data.profile.github !== profile.github ||
      !Array.isArray(data.profile.press)
    )
      return;
    const updated = data.profile;
    const recsChanged =
      JSON.stringify(updated.recommendations) !==
      JSON.stringify(profile.recommendations);
    Object.assign(profile, updated);
    newsRotation.update(profile);
    if (recsChanged && Array.isArray(profile.recommendations)) {
      document.querySelector(".recommendation-track").innerHTML =
        recommendationMarquee(profile.recommendations, "", true);
      document.dispatchEvent(new CustomEvent("portfolio:content"));
    }
  })
  .catch(() => {});
