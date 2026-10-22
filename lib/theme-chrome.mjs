export function themeHead(base = "") {
  return `<script src="${base}lib/theme.js"></script><link rel="stylesheet" href="${base}theme.css"><link rel="stylesheet" href="${base}editorial.css">`;
}

export function themeButton() {
  return `<button class="theme-toggle" type="button" data-theme-toggle aria-label="Dark mode" aria-pressed="false" title="Switch to dark mode"><span class="theme-choice theme-light"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="1.3"/><path d="M10 1v2m0 14v2M1 10h2m14 0h2M3.6 3.6 5 5m10 10 1.4 1.4M3.6 16.4 5 15M15 5l1.4-1.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg><span>Light</span></span><span class="theme-choice theme-dark"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M16.7 11.7A7 7 0 0 1 8.3 3.3a7 7 0 1 0 8.4 8.4Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg><span>Dark</span></span></button>`;
}
