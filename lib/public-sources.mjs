export function decodeText(value = "") {
  return String(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(x[\da-f]+|\d+);/gi, (_, n) =>
      String.fromCodePoint(
        n[0].toLowerCase() === "x" ? parseInt(n.slice(1), 16) : Number(n),
      ),
    )
    .replace(
      /&(amp|quot|apos|lt|gt|nbsp);/g,
      (_, e) =>
        ({ amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " })[e],
    );
}
export const plainText = (value) =>
  decodeText(
    String(value)
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]*>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
export function publicHTTPS(value, base) {
  try {
    const url = new URL(decodeText(value), base);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      /^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|\[|172\.(1[6-9]|2\d|3[01])\.)/i.test(
        url.hostname,
      )
    )
      return null;
    return url.href;
  } catch {
    return null;
  }
}
function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map((m) => [
      m[1].toLowerCase(),
      decodeText(m[2]),
    ]),
  );
}
export function articleMetadata(html, url) {
  const meta = {};
  for (const tag of html.matchAll(/<meta\b[^>]*>/gi)) {
    const a = attributes(tag[0]);
    if (a.property || a.name) meta[a.property || a.name] = a.content;
  }
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const title = plainText(
    h1 ||
      meta["og:title"] ||
      html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ||
      "",
  );
  let image = publicHTTPS(meta["og:image"] || meta["twitter:image"], url);
  if (!image) {
    const candidates = [...html.matchAll(/<img\b[^>]*>/gi)].map((t) =>
      attributes(t[0]),
    );
    const found = candidates.find(
      (i) =>
        i.src &&
        !/logo|icon|avatar|pixel/i.test(i.src) &&
        (/hero|news|202[4-9]|uploads/i.test(i.src) || Number(i.width) > 500),
    );
    if (found) image = publicHTTPS(found.src, url);
  }
  return {
    title: title.slice(0, 240),
    description: plainText(
      meta.description || meta["og:description"] || "",
    ).slice(0, 360),
    image,
    date: meta["article:published_time"]?.slice(0, 10),
    text: plainText(html),
  };
}
export function parseNewsRSS(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
    .map(([, item]) => {
      const tag = (name) =>
        decodeText(
          item.match(
            new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"),
          )?.[1] || "",
        ).trim();
      const source = item.match(
        /<source\b[^>]*url=["']([^"']*)["'][^>]*>([\s\S]*?)<\/source>/i,
      );
      return {
        title: plainText(tag("title")),
        url: publicHTTPS(tag("link")),
        date: tag("pubDate"),
        publisher: source ? plainText(source[2]) : "Google News",
        sourceURL: source ? publicHTTPS(source[1]) : null,
        description: plainText(tag("description")),
      };
    })
    .filter(
      (item) =>
        item.url && item.title && Number.isFinite(Date.parse(item.date)),
    );
}
export function isRelevantMention(item) {
  const text = `${item.title} ${item.description}`.toLowerCase();
  const host = (() => {
    try {
      return new URL(item.sourceURL || item.url).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  })();
  return (
    [
      "rdpolytech.ca",
      "rdnewsnow.com",
      "caunitedway.ca",
      "educationnewscanada.com",
    ].includes(host) ||
    (/akshun\s+(?:\(ak\)\s+)?chauhan/.test(text) &&
      /red deer|alberta|xun innovation|energy innovation|nasa space|polytechnic/.test(
        text,
      ))
  );
}
export function paginate(items, page = 0, size = 6) {
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.max(0, Math.min(Math.trunc(page) || 0, totalPages - 1));
  return {
    items: items.slice(current * size, (current + 1) * size),
    page: current,
    totalPages,
    total: items.length,
  };
}
export function slugify(value) {
  return plainText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}
