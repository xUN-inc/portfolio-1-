// Import only the editorial fields supported by the portfolio. Never accept HTML.
const fields = {
  recommendations: ["name", "initials", "context", "quote", "summary", "url"],
  press: ["title", "publisher", "date", "type", "description", "url"],
  linkedinActivity: ["title", "publisher", "type", "description", "url"],
};
export function validateFeed(feed) {
  if (!feed || Array.isArray(feed) || typeof feed !== "object")
    throw new Error("Content feed must be a JSON object.");
  const result = {};
  for (const [key, required] of Object.entries(fields)) {
    if (!(key in feed)) continue;
    if (!Array.isArray(feed[key]) || feed[key].length > 200)
      throw new Error(`${key} must be an array with no more than 200 entries.`);
    result[key] = feed[key].map((item, index) => {
      const entry = {};
      for (const field of required) {
        if (
          typeof item?.[field] !== "string" ||
          !item[field].trim() ||
          item[field].length > 3000
        )
          throw new Error(`Invalid ${key}[${index}].${field}`);
        entry[field] = item[field].trim();
      }
      if (key === "recommendations" && item.image !== undefined) {
        const image = item.image;
        if (
          typeof image !== "string" ||
          !(
            /^images\/people\/[\w.-]+$/.test(image) ||
            new URL(image).protocol === "https:"
          )
        )
          throw new Error(
            "Recommendation headshots must be a local people asset or an HTTPS image.",
          );
        entry.image = image;
      }
      if (key === "recommendations") {
        for (const field of [
          "currentContext",
          "profileURL",
          "profileCheckedAt",
          "sourceCheckedAt",
          "imageCheckedAt",
          "imageSource",
        ]) {
          if (item[field] === undefined) continue;
          if (typeof item[field] !== "string" || item[field].length > 1000)
            throw new Error(`Invalid recommendation ${field}`);
          if (field.endsWith("At") && !/^\d{4}-\d{2}-\d{2}$/.test(item[field]))
            throw new Error("Profile checks must use YYYY-MM-DD.");
          if (field === "profileURL" || field === "imageSource") {
            const source = new URL(item[field]);
            if (source.protocol !== "https:")
              throw new Error("Profile sources must use HTTPS.");
            if (
              field === "profileURL" &&
              !/(^|\.)linkedin\.com$/.test(source.hostname)
            )
              throw new Error("Profile URLs must link to LinkedIn.");
          }
          entry[field] = item[field];
        }
      }
      const url = new URL(entry.url);
      if (url.protocol !== "https:")
        throw new Error("Source URLs must use HTTPS.");
      if (key === "recommendations" || key === "linkedinActivity") {
        if (!/(^|\.)linkedin\.com$/.test(url.hostname))
          throw new Error("LinkedIn content must link to its LinkedIn source.");
      }
      if (key === "press" && !/^\d{4}-\d{2}-\d{2}$/.test(entry.date))
        throw new Error("Press dates must use YYYY-MM-DD.");
      if (key === "press" && !Number.isFinite(Date.parse(entry.date)))
        throw new Error("Invalid press date.");
      return entry;
    });
  }
  if (!Object.keys(result).length)
    throw new Error(
      "Feed contains none of: recommendations, press, linkedinActivity.",
    );
  return result;
}

export function preserveRecommendationMedia(previous, incoming) {
  return incoming.map((item) => {
    const old = previous.find((r) => r.name === item.name) || {};
    const merged = { ...item };
    if (!item.image) {
      for (const field of ["image", "imageCheckedAt", "imageSource"])
        if (old[field]) merged[field] = old[field];
      if (!merged.image) merged.image = "";
    }
    for (const field of [
      "currentContext",
      "profileURL",
      "profileCheckedAt",
      "sourceCheckedAt",
    ]) {
      if (merged[field] === undefined && old[field] !== undefined)
        merged[field] = old[field];
    }
    return merged;
  });
}
