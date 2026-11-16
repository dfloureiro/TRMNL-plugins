function run(input) {
  const MAX_ARTICLES = 30;
  // Top-level Observador sections. An article's tags run from specific to general
  // ("Metro de Lisboa", ..., "Economia", "País", "Sociedade"), so the label shown
  // is the first tag that is one of these.
  const SECTIONS = [
    "Política", "Economia", "Mundo", "Desporto", "Cultura", "Ciência",
    "Tecnologia", "Lifestyle", "Opinião", "País", "Sociedade", "Rádio Observador"
  ];

  const fields = input?.trmnl?.plugin_settings?.custom_fields_values || {};
  const sectionFilter = String(fields.section || "all").trim();
  const hidePrograms = !/^(false|no|0|off)$/i.test(String(fields.hide_programs ?? true).trim());

  const norm = (s) => String(s || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().trim();

  const text = (v) => {
    if (v == null) return "";
    if (typeof v === "string" || typeof v === "number") return String(v);
    if (typeof v === "object") return text(v["#text"] ?? v.__content__ ?? v._ ?? "");
    return "";
  };

  const clean = (s) => text(s)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

  const list = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);

  const channel = input?.rss?.channel;
  const items = list(channel?.item);

  const sectionKeys = SECTIONS.map(norm);
  const filterKey = norm(sectionFilter);
  const filtering = filterKey !== "" && filterKey !== "all";

  const articles = [];
  for (const item of items) {
    const title = clean(item?.title);
    if (!title) continue;

    const link = text(item?.link) || text(item?.guid);
    if (hidePrograms && /\/programas\//.test(link)) continue;

    const categories = list(item?.category).map(clean).filter(Boolean);
    const categoryKeys = categories.map(norm);
    if (filtering && !categoryKeys.includes(filterKey)) continue;

    const sectionIndex = categoryKeys.findIndex((key) => sectionKeys.includes(key));
    const section = sectionIndex !== -1 ? categories[sectionIndex] : (categories[0] || "");

    const ts = Date.parse(text(item?.pubDate));

    articles.push({
      title,
      description: clean(item?.description),
      section,
      author: clean(item?.["dc:creator"] ?? item?.creator),
      pub_ts: Number.isFinite(ts) ? Math.floor(ts / 1000) : null
    });
    if (articles.length >= MAX_ARTICLES) break;
  }

  return {
    feed_ok: items.length > 0,
    articles,
    section_filter: filtering ? sectionFilter : "",
    feed_updated: text(channel?.lastBuildDate)
  };
}
