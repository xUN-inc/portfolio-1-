import { recommendationDetail } from "./experience.mjs";
export function mountExperience(profile, base = "") {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)"),
    fine = matchMedia("(hover: hover) and (pointer: fine)");
  if (!reduced.matches) {
    const reveal = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            reveal.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    document
      .querySelectorAll(
        ".section-heading,.project-card,.lab-intro,.lab-card,.venture-body,.journey-layout,.news-card",
      )
      .forEach((el, i) => {
        el.classList.add("reveal");
        el.style.setProperty("--reveal-delay", `${(i % 3) * 60}ms`);
        reveal.observe(el);
      });
  }
  const cursor = document.querySelector("#expressive-cursor"),
    trail = document.querySelector("#cursor-trail");
  if (cursor && trail && fine.matches && !reduced.matches) {
    let x = innerWidth / 2,
      y = innerHeight / 2,
      cx = x,
      cy = y,
      tx = x,
      ty = y,
      raf = 0;
    const frame = () => {
      const dx = x - cx,
        dy = y - cy;
      cx += dx * 0.25;
      cy += dy * 0.25;
      tx += (x - tx) * 0.12;
      ty += (y - ty) * 0.12;
      const speed = Math.min(1.7, Math.hypot(dx, dy) / 35 + 1),
        angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      cursor.style.transform = `translate3d(${cx}px,${cy}px,0) translate(-50%,-50%) rotate(${angle}deg) scale(${speed},${1 / speed})`;
      cursor.querySelector("span").style.transform = `rotate(${-angle}deg)`;
      trail.style.transform = `translate3d(${tx}px,${ty}px,0) translate(-50%,-50%)`;
      if (Math.abs(x - tx) + Math.abs(y - ty) > 0.15)
        raf = requestAnimationFrame(frame);
      else raf = 0;
    };
    document.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType !== "mouse") return;
        document.body.classList.add("cursor-ready");
        x = event.clientX;
        y = event.clientY;
        if (!raf) raf = requestAnimationFrame(frame);
      },
      { passive: true },
    );
    document.addEventListener("pointerover", (event) => {
      const target = event.target.closest("a,button,input,select");
      const expandable = target && !target.matches("input,select,.page-button");
      cursor.classList.toggle("cursor-expanded", Boolean(expandable));
      cursor.querySelector("span").textContent = expandable
        ? target.dataset.cursor ||
          (target.closest(".news-card")
            ? "READ"
            : target.closest(".project-card")
              ? "VIEW"
              : target.tagName === "A"
                ? "↗"
                : "")
        : "";
    });
    document.addEventListener("pointerdown", () =>
      cursor.classList.add("cursor-pressed"),
    );
    document.addEventListener("pointerup", () =>
      cursor.classList.remove("cursor-pressed"),
    );
    document.documentElement.addEventListener("pointerleave", () =>
      document.body.classList.remove("cursor-ready"),
    );
    document.addEventListener("keydown", (event) => {
      if (event.key === "Tab") document.body.classList.remove("cursor-ready");
    });
    reduced.addEventListener("change", () => {
      if (reduced.matches) {
        cancelAnimationFrame(raf);
        document.body.classList.remove("cursor-ready");
      }
    });
    document.querySelectorAll(".button,.contact-circle").forEach((button) => {
      button.addEventListener("pointermove", (event) => {
        const rect = button.getBoundingClientRect();
        button.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * 0.08}px,${(event.clientY - rect.top - rect.height / 2) * 0.12}px)`;
      });
      button.addEventListener("pointerleave", () =>
        button.style.removeProperty("transform"),
      );
    });
  }
  const portrait = document.querySelector(".hero-art");
  if (portrait && fine.matches && !reduced.matches) {
    portrait.addEventListener("pointermove", (event) => {
      const r = portrait.getBoundingClientRect();
      portrait.style.setProperty(
        "--portrait-y",
        `${((event.clientX - r.left - r.width / 2) / r.width) * 5}deg`,
      );
      portrait.style.setProperty(
        "--portrait-x",
        `${(-(event.clientY - r.top - r.height / 2) / r.height) * 5}deg`,
      );
    });
    portrait.addEventListener("pointerleave", () => {
      portrait.style.setProperty("--portrait-y", "0deg");
      portrait.style.setProperty("--portrait-x", "0deg");
    });
  }
  const heroText = document.querySelector("#hero-typing-text");
  if (heroText) {
    const desktop = matchMedia("(min-width: 681px)");
    const line = heroText.closest(".hero-role-line");
    const roles = [
      "Scientific Data Analyst.",
      "Software Developer.",
      "Founder at Xun Innovation.",
    ];
    let index = 0,
      length = roles[0].length,
      erasing = true,
      timer = 0,
      inView = false;
    const allowed = () =>
      desktop.matches && !reduced.matches && !document.hidden && inView;
    const tick = () => {
      if (!allowed()) return;
      length += erasing ? -1 : 1;
      heroText.textContent = roles[index].slice(0, length);
      let delay = erasing ? 32 : 78;
      if (erasing && length === 0) {
        index = (index + 1) % roles.length;
        erasing = false;
        delay = 260;
      } else if (!erasing && length === roles[index].length) {
        erasing = true;
        delay = 2400;
      }
      timer = setTimeout(tick, delay);
    };
    const sync = () => {
      clearTimeout(timer);
      line.dataset.typingActive = String(allowed());
      if (reduced.matches) {
        index = 0;
        length = roles[0].length;
        erasing = true;
        heroText.textContent = roles[0];
      }
      if (allowed()) timer = setTimeout(tick, 1800);
    };
    new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      sync();
    }).observe(line);
    desktop.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();
  }
  const techDetail = document.querySelector("#technology-detail");
  if (techDetail) {
    document.querySelectorAll("[data-technology]").forEach((button) =>
      button.addEventListener("click", () => {
        const t = profile.technologies[Number(button.dataset.technology)];
        if (!t) return;
        document.querySelectorAll("[data-technology]").forEach((item) => {
          item.classList.toggle("selected", item === button);
          item.setAttribute("aria-pressed", String(item === button));
        });
        techDetail.querySelector("strong").textContent = t.name;
        techDetail.querySelector("p").textContent = t.description;
      }),
    );
    document.querySelectorAll("[data-tech-filter]").forEach((button) =>
      button.addEventListener("click", () => {
        document.querySelectorAll("[data-tech-filter]").forEach((item) => {
          item.classList.toggle("active", item === button);
          item.setAttribute("aria-pressed", String(item === button));
        });
        document
          .querySelectorAll("[data-tech-category]")
          .forEach(
            (card) =>
              (card.hidden =
                button.dataset.techFilter !== "all" &&
                card.dataset.techCategory !== button.dataset.techFilter),
          );
      }),
    );
  }
  const recommendationDialog = document.querySelector(".recommendation-dialog");
  if (recommendationDialog) {
    let trigger = null,
      previousOverflow = "";
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-open-recommendation]");
      if (!button || button.closest("[inert]")) return;
      const r =
        profile.recommendations[Number(button.dataset.openRecommendation)];
      if (!r || recommendationDialog.open) return;
      trigger = button;
      recommendationDialog.querySelector(
        ".recommendation-dialog-content",
      ).innerHTML = recommendationDetail(r, base);
      document
        .querySelectorAll("[data-recommendation-loop]")
        .forEach((loop) => loop.classList.add("has-open-recommendation"));
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      recommendationDialog.showModal();
    });
    recommendationDialog
      .querySelector(".recommendation-close")
      .addEventListener("click", () => recommendationDialog.close());
    recommendationDialog.addEventListener("click", (event) => {
      const r = recommendationDialog.getBoundingClientRect();
      if (
        event.target === recommendationDialog &&
        (event.clientX < r.left ||
          event.clientX > r.right ||
          event.clientY < r.top ||
          event.clientY > r.bottom)
      )
        recommendationDialog.close();
    });
    recommendationDialog.addEventListener("close", () => {
      document.body.style.overflow = previousOverflow;
      trigger?.focus({ preventScroll: true });
      document
        .querySelectorAll("[data-recommendation-loop]")
        .forEach((loop) => loop.classList.remove("has-open-recommendation"));
    });
  }
  document.querySelectorAll("[data-recommendation-loop]").forEach((loop) => {
    const button = loop.querySelector(".recommendation-pause");
    let paused = false,
      inView = false;
    const draw = () => {
      loop.classList.toggle(
        "is-paused",
        paused || reduced.matches || document.hidden || !inView,
      );
      loop.classList.toggle("manual-scroll", paused || reduced.matches);
      button.setAttribute("aria-pressed", String(paused));
      button.textContent = paused ? "Resume motion →" : "Pause motion Ⅱ";
      button.hidden = reduced.matches;
    };
    button.addEventListener("click", () => {
      paused = !paused;
      draw();
    });
    new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      draw();
    }).observe(loop);
    document.addEventListener("visibilitychange", draw);
    reduced.addEventListener("change", draw);
    draw();
  });
}
