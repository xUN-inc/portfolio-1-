import { newsCard } from "./experience.mjs";

export function newsWindow(items, start, size) {
  if (!items.length) return [];
  return items.slice(start, start + size);
}

export function projectPoint(lon, lat, rotation, tilt = -0.25) {
  const l = (lon * Math.PI) / 180 + rotation,
    p = (lat * Math.PI) / 180;
  const x = Math.cos(p) * Math.sin(l),
    y = -Math.sin(p),
    z = Math.cos(p) * Math.cos(l);
  return [
    x,
    y * Math.cos(tilt) - z * Math.sin(tilt),
    y * Math.sin(tilt) + z * Math.cos(tilt),
  ];
}

export function mountNewsRotation(profile) {
  const feed = document.querySelector("#press-feed"),
    controls = document.querySelector(".news-rotation");
  if (!feed || !controls) return { update() {} };
  const mobile = matchMedia("(max-width: 680px)"),
    reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let items = [],
    start = 0,
    paused = reduced.matches,
    visible = false,
    hovering = false;
  const pause = document.querySelector("#news-pause"),
    position = document.querySelector("#news-position");
  function render() {
    feed.innerHTML = newsWindow(items, start, mobile.matches ? 1 : 3)
      .map((p) => newsCard(p))
      .join("");
    position.textContent = mobile.matches
      ? `${start + 1} / ${items.length}`
      : `${start + 1}–${Math.min(start + 3, items.length)} / ${items.length}`;
    pause.textContent = paused ? "Play" : "Pause";
    pause.setAttribute("aria-pressed", String(paused));
  }
  function step(direction) {
    const size = mobile.matches ? 1 : 3;
    const pages = Math.ceil(items.length / size);
    start = ((Math.floor(start / size) + direction + pages) % pages) * size;
    render();
  }
  document
    .querySelector("#news-back")
    .addEventListener("click", () => step(-1));
  document
    .querySelector("#news-forward")
    .addEventListener("click", () => step(1));
  pause.addEventListener("click", () => {
    paused = !paused;
    render();
  });
  const section = feed.closest("section");
  section.addEventListener("pointerenter", () => (hovering = true));
  section.addEventListener("pointerleave", () => (hovering = false));
  new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
    },
    { threshold: 0.15 },
  ).observe(feed);
  setInterval(() => {
    if (
      visible &&
      !paused &&
      !hovering &&
      !document.hidden &&
      !feed.hidden &&
      !section.contains(document.activeElement)
    )
      step(1);
  }, 7500);
  mobile.addEventListener("change", () => {
    start = 0;
    render();
  });
  reduced.addEventListener("change", () => {
    paused = reduced.matches;
    render();
  });
  function update(value) {
    items = value.press.toSorted((a, b) => b.date.localeCompare(a.date));
    start = 0;
    render();
  }
  update(profile);
  return { update };
}

export async function mountGlobe() {
  const canvas = document.querySelector("#world-globe");
  if (!canvas) return;
  const context = canvas.getContext("2d");
  if (!context) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const toggle = document.querySelector("#globe-toggle");
  let rings = [],
    rotation = 1.96,
    tilt = -0.5,
    playing = !reduced.matches,
    inView = false,
    drag = null,
    frame = 0,
    last = 0,
    size = 450;
  const defaults = {
    light: "#e2f1df",
    mid: "#c4ddd0",
    shadow: "#8fb6a5",
    grid: "#2e6c5830",
    land: "#286650",
    pin: "#d85a3d",
    halo: "#d85a3d77",
    label: "#183d32",
    orbit: "#49765b40",
  };
  const readPalette = () => {
    const style = getComputedStyle(canvas);
    return Object.fromEntries(
      Object.entries(defaults).map(([key, value]) => [
        key,
        style.getPropertyValue(`--globe-${key}`).trim() || value,
      ]),
    );
  };
  let palette = readPalette();
  window.addEventListener("portfolio:theme", () => {
    palette = readPalette();
    wake();
  });
  const point = (lon, lat) => projectPoint(lon, lat, rotation, tilt);
  function draw() {
    context.clearRect(0, 0, size, size);
    const cx = size / 2,
      cy = size / 2,
      r = size * 0.405;
    const shade = context.createRadialGradient(
      cx - r * 0.35,
      cy - r * 0.35,
      r * 0.05,
      cx,
      cy,
      r,
    );
    shade.addColorStop(0, palette.light);
    shade.addColorStop(0.7, palette.mid);
    shade.addColorStop(1, palette.shadow);
    context.beginPath();
    context.arc(cx, cy, r, 0, Math.PI * 2);
    context.fillStyle = shade;
    context.fill();
    // Front hemisphere lines are projected onto the same rotating sphere.
    function line(coords, color, width) {
      context.beginPath();
      let started = false;
      for (const [lon, lat] of coords) {
        const [x, y, z] = point(lon, lat);
        if (z < 0) {
          started = false;
          continue;
        }
        if (!started) {
          context.moveTo(cx + x * r, cy + y * r);
          started = true;
        } else context.lineTo(cx + x * r, cy + y * r);
      }
      context.strokeStyle = color;
      context.lineWidth = width;
      context.stroke();
    }
    for (let lat = -60; lat <= 60; lat += 30)
      line(
        Array.from({ length: 181 }, (_, i) => [-180 + i * 2, lat]),
        palette.grid,
        0.6,
      );
    for (let lon = -180; lon < 180; lon += 30)
      line(
        Array.from({ length: 91 }, (_, i) => [lon, -90 + i * 2]),
        palette.grid,
        0.6,
      );
    for (const ring of rings) line(ring, palette.land, 1.05);
    const [x, y, z] = point(-113.8112, 52.2681);
    if (z > 0) {
      const px = cx + x * r,
        py = cy + y * r;
      context.beginPath();
      context.arc(px, py, 6, 0, Math.PI * 2);
      context.fillStyle = palette.pin;
      context.fill();
      context.beginPath();
      context.arc(px, py, 12, 0, Math.PI * 2);
      context.strokeStyle = palette.halo;
      context.stroke();
      context.font = "600 10px Averta, Arial";
      context.fillStyle = palette.label;
      context.fillText("ALBERTA / HOME", px + 17, py + 3);
    }
    context.beginPath();
    context.ellipse(cx, cy, r * 1.14, r * 0.32, -0.38, 0, Math.PI * 2);
    context.strokeStyle = palette.orbit;
    context.lineWidth = 1;
    context.stroke();
  }
  function animate(now) {
    frame = 0;
    if (playing && inView && !document.hidden && !drag)
      rotation += Math.min(now - last || 16, 40) * 0.00006;
    last = now;
    draw();
    if (playing && inView && !document.hidden && !drag)
      frame = requestAnimationFrame(animate);
  }
  function wake() {
    if (!frame) frame = requestAnimationFrame(animate);
  }
  function update() {
    toggle.textContent = playing ? "Pause rotation" : "Play rotation";
    toggle.setAttribute("aria-pressed", String(playing));
    canvas.dataset.rotation = rotation.toFixed(3);
    wake();
  }
  new ResizeObserver((entries) => {
    size = entries[0].contentRect.width;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }).observe(canvas);
  new IntersectionObserver((entries) => {
    inView = entries[0].isIntersecting;
    if (inView) wake();
  }).observe(canvas);
  document.addEventListener("visibilitychange", wake);
  toggle.addEventListener("click", () => {
    playing = !playing;
    update();
  });
  const reset = () => {
    rotation = 1.96;
    tilt = -0.5;
    update();
  };
  document.querySelector("#globe-reset").addEventListener("click", reset);
  canvas.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    drag = { x: event.clientX, y: event.clientY, rotation, tilt };
    playing = false;
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add("dragging");
    update();
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!drag) return;
    rotation = drag.rotation + (event.clientX - drag.x) * 0.009;
    tilt = Math.max(
      -1.15,
      Math.min(1.15, drag.tilt + (event.clientY - drag.y) * 0.006),
    );
    update();
  });
  const release = () => {
    drag = null;
    canvas.classList.remove("dragging");
  };
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);
  canvas.addEventListener("lostpointercapture", release);
  canvas.addEventListener("keydown", (event) => {
    if (
      ![
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        " ",
        "Home",
      ].includes(event.key)
    )
      return;
    event.preventDefault();
    if (event.key === " ") {
      playing = !playing;
    } else if (event.key === "Home") {
      reset();
    } else {
      playing = false;
      if (event.key === "ArrowLeft") rotation -= 0.15;
      if (event.key === "ArrowRight") rotation += 0.15;
      if (event.key === "ArrowUp") tilt = Math.max(-1.15, tilt - 0.1);
      if (event.key === "ArrowDown") tilt = Math.min(1.15, tilt + 0.1);
    }
    update();
  });
  reduced.addEventListener("change", () => {
    if (reduced.matches) playing = false;
    update();
  });
  update();
  try {
    const res = await fetch("lib/globe-coastlines.json");
    if (res.ok) {
      rings = await res.json();
      wake();
    }
  } catch {}
}

export function mountPostcard() {
  const handle = document.querySelector("#postcard-handle"),
    card = document.querySelector(".contact-postcard");
  if (!handle || !card) return;
  let x = 0,
    y = 0,
    drag = null;
  const paint = () => {
    x = Math.max(-45, Math.min(45, x));
    y = Math.max(-35, Math.min(35, y));
    card.style.transform = `translate(${x}px,${y}px) rotate(${x * 0.13 - 5}deg)`;
  };
  handle.addEventListener("pointerdown", (event) => {
    drag = { x: event.clientX, y: event.clientY, ox: x, oy: y };
    handle.setPointerCapture(event.pointerId);
    card.classList.add("being-moved");
  });
  handle.addEventListener("pointermove", (event) => {
    if (!drag) return;
    x = drag.ox + event.clientX - drag.x;
    y = drag.oy + event.clientY - drag.y;
    paint();
  });
  const release = () => {
    drag = null;
    card.classList.remove("being-moved");
  };
  handle.addEventListener("pointerup", release);
  handle.addEventListener("pointercancel", release);
  handle.addEventListener("lostpointercapture", release);
  handle.addEventListener("keydown", (event) => {
    if (
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Escape"].includes(
        event.key,
      )
    )
      return;
    event.preventDefault();
    if (event.key === "Escape") {
      x = 0;
      y = 0;
    }
    if (event.key === "ArrowLeft") x -= 10;
    if (event.key === "ArrowRight") x += 10;
    if (event.key === "ArrowUp") y -= 10;
    if (event.key === "ArrowDown") y += 10;
    paint();
  });
}
