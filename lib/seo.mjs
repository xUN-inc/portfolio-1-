import { escapeHTML as e } from "./portfolio.mjs";

export function publicSiteURL(profile, override = process.env.SITE_URL) {
  const value = override || profile.siteURL;
  if (!value) return "";
  const url = new URL(value);
  if (url.protocol !== "https:" || url.pathname !== "/" || url.search || url.hash || url.username || url.password)
    throw new Error("SITE_URL must be an HTTPS origin with no path, query, or credentials.");
  return url.origin;
}

export function pageMetadata(siteURL, path = "", image = "images/about/akshunchauhan.jpg", alt = "Akshun Chauhan") {
  if (!siteURL) return "";
  const url = `${siteURL}/${path}`;
  const photo = `${siteURL}/${image}`;
  return `<link rel="canonical" href="${e(url)}"><meta property="og:url" content="${e(url)}"><meta property="og:image" content="${e(photo)}"><meta property="og:image:alt" content="${e(alt)}"><meta name="twitter:image" content="${e(photo)}"><meta name="twitter:image:alt" content="${e(alt)}">`;
}

export function profilePageSchema(profile, siteURL, path = "") {
  const root = siteURL ? `${siteURL}/` : "";
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    ...(root ? { "@id": `${root}${path}#profile`, url: root + path } : {}),
    name: profile.searchTitle,
    description: profile.searchDescription,
    mainEntity: {
      "@type": "Person",
      ...(root ? { "@id": root + "#akshun-chauhan", url: root, image: root + "images/about/akshunchauhan.jpg" } : {}),
      name: profile.name,
      alternateName: "Akshun (AK) Chauhan",
      jobTitle: [profile.title, "AI builder", "Entrepreneur"],
      description: profile.searchDescription,
      email: profile.email,
      sameAs: [profile.linkedin, `https://github.com/${profile.github}`, ...profile.ventures.map((v) => v.url)],
      knowsAbout: ["AI agent deployment", "Local AI", "Retrieval-augmented generation", "Vector databases", "Software engineering", "Data pipelines", "Resource-constrained infrastructure"],
      address: { "@type": "PostalAddress", addressLocality: "Red Deer", addressRegion: "Alberta", addressCountry: "CA" },
      alumniOf: profile.education.map((item) => ({ "@type": "CollegeOrUniversity", name: item.institution })),
      award: ["Winner, All India Science Competition, model making, 2019", "First place, NASA Space Apps Challenge Edmonton, 2025"],
    },
  };
}
