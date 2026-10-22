// Runs in the document head so a saved choice is applied before the page paints.
(() => {
  const key = "ak-portfolio-theme";
  const root = document.documentElement;
  const read = () => {
    try {
      return localStorage.getItem(key) === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  };
  function apply(theme, save = false) {
    theme = theme === "dark" ? "dark" : "light";
    root.dataset.theme = theme;
    const dark = theme === "dark";
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", dark ? "#0b0a1b" : "#f3f0e8");
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.setAttribute("aria-pressed", String(dark));
      button.title = `Switch to ${dark ? "light" : "dark"} mode`;
    });
    if (save) {
      try {
        localStorage.setItem(key, theme);
      } catch {}
    }
    window.dispatchEvent(
      new CustomEvent("portfolio:theme", { detail: { theme } }),
    );
  }
  apply(read());
  document.addEventListener("DOMContentLoaded", () =>
    apply(root.dataset.theme),
  );
  document.addEventListener("click", (event) => {
    if (event.target.closest?.("[data-theme-toggle]"))
      apply(root.dataset.theme === "dark" ? "light" : "dark", true);
  });
  window.addEventListener("storage", (event) => {
    if (event.key === key || event.key === null) apply(read());
  });
  window.addEventListener("pageshow", () => apply(read()));
})();
