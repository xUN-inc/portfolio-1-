import { escapeHTML as e } from "./portfolio.mjs";

const icons = {
  Python: "skill-python.png",
  TypeScript: "skill-ts.png",
  React: "skill-react.png",
  "React Native": "skill-react.png",
  "Next.js": "skill-next.webp",
  PostgreSQL: "skill-post.png",
  Azure: "azure.png",
  Firebase: "firebase.png",
  Electron: "Electron.png",
  Docker: "Docker.png",
  TensorFlow: "TensorFlow.png",
  "Node.js": "skill-node.png",
  MongoDB: "skill-mongo.png",
  "Socket.io": "skill-socket.png",
  Django: "django.svg",
  FastAPI: "fastapi.svg",
  Flutter: "flutter.svg",
  Dart: "dart.svg",
  SQLite: "sqlite.svg",
  Ollama: "ollama.svg",
  Expo: "expo.svg",
  Twilio: "twilio.svg",
  Java: "skill-java.webp",
  "C#": "NETcore.png",
  JavaScript: "skill-js.png",
};

export function projectTechnologies(tags, base = "") {
  return `<div class="project-technologies" aria-label="Project technologies">${tags.map((tag) => `<span class="project-tech">${icons[tag] ? `<img src="${base}images/skills/${icons[tag]}" alt="" width="18" height="18" loading="lazy">` : '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m6 5-4 5 4 5m8-10 4 5-4 5m-3-12-2 14" stroke="currentColor" stroke-width="1.3"/></svg>'}<span>${e(tag)}</span></span>`).join("")}</div>`;
}
