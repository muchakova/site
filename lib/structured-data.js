// Structured data (schema.org JSON-LD) for search engines.
// One @graph per page type; Marina (Person) and the consulting practice (ProfessionalService)
// have fixed @ids, so every page refers to the same entities:
//   home     → WebSite + Person + ProfessionalService
//   about    → AboutPage + Person
//   services, booking → WebPage + ProfessionalService (with the two consultations as offers)
//   contact  → ContactPage + ProfessionalService
//   blog     → Blog
//   article  → BlogPosting
// Breadcrumbs are added separately from the visible breadcrumb (breadcrumbLd), so the two always match.

const json = (data) => JSON.stringify(data).replace(/</g, "\\u003c");
const isoDay = (d) => (d instanceof Date ? d.toISOString() : new Date(`${d}T12:00:00Z`).toISOString()).slice(0, 10);

export function structuredData(ctx) {
  const { kind, url, lang, title, description, date, updated, keywords, tag, image, site, T, other, links } = ctx;
  if (!kind) return "";
  const pageUrl = site.url + url;
  const id = (name) => `${site.url}/#${name}`;
  const homeUrl = site.url + links.home;

  const personRef = { "@type": "Person", "@id": id("person"), name: T.site.name, url: homeUrl };
  const person = {
    ...personRef,
    alternateName: other.site.name,
    jobTitle: T.site.role,
    description: T.site.description,
    image: `${site.url}/images/profile_1.jpg`,
    email: site.email,
    telephone: site.phone,
    sameAs: site.socials.map((s) => s.url),
    worksFor: site.ventures.filter((v) => v.external).map((v) => ({ "@type": "Organization", name: T.home.ventures[v.key].name, url: v.url })),
    knowsAbout: T.site.knowsAbout,
  };
  const prices = Object.values(site.prices);
  const businessRef = { "@type": "ProfessionalService", "@id": id("business"), name: `${T.site.name} — ${T.site.role}` };
  const business = {
    ...businessRef,
    url: homeUrl,
    description: T.site.description,
    image: `${site.url}/images/profile_1.jpg`,
    email: site.email,
    telephone: site.phone,
    priceRange: lang === "bg" ? `${Math.min(...prices)}–${Math.max(...prices)} €` : `€${Math.min(...prices)}–€${Math.max(...prices)}`,
    address: { "@type": "PostalAddress", addressLocality: T.site.city, addressCountry: "BG" },
    founder: personRef,
    makesOffer: Object.keys(site.prices).map((minutes) => {
      const plan = T.home.plans[minutes];
      return {
        "@type": "Offer",
        name: `${plan.name} (${plan.duration})`,
        price: String(site.prices[minutes]),
        priceCurrency: "EUR",
        url: `${site.url}${links.booking}?format=${minutes}`,
        itemOffered: { "@type": "Service", name: plan.name, description: plan.fit, provider: personRef },
      };
    }),
  };
  const webPage = (type, extra = {}) => ({ "@type": type, "@id": `${pageUrl}#page`, url: pageUrl, name: title, description, inLanguage: lang, ...extra });

  const graphs = {
    home: () => [
      { "@type": "WebSite", "@id": id("website"), url: `${site.url}/`, name: T.site.name, description: T.site.description, inLanguage: ["bg", "en"], publisher: personRef },
      person,
      business,
    ],
    about: () => [webPage("AboutPage", { mainEntity: personRef }), person],
    services: () => [webPage("WebPage", { about: businessRef }), business],
    booking: () => [webPage("WebPage", { about: businessRef }), business],
    contact: () => [webPage("ContactPage", { about: businessRef }), business],
    blog: () => [{ "@type": "Blog", "@id": `${pageUrl}#blog`, url: pageUrl, name: T.feed.title, description, inLanguage: lang, publisher: personRef }],
    article: () => [{
      "@type": "BlogPosting",
      "@id": `${pageUrl}#article`,
      url: pageUrl,
      mainEntityOfPage: pageUrl,
      headline: title.length > 110 ? `${title.slice(0, 109)}…` : title,
      description,
      image: [image],
      datePublished: isoDay(date),
      dateModified: isoDay(updated || date),
      inLanguage: lang,
      author: personRef,
      publisher: personRef,
      isPartOf: { "@type": "Blog", "@id": `${site.url}${links.blog}#blog`, url: `${site.url}${links.blog}` },
      ...(tag ? { articleSection: tag } : {}),
      ...(keywords?.length ? { keywords } : {}),
    }],
  };
  if (!graphs[kind]) return "";
  return `<script type="application/ld+json">${json({ "@context": "https://schema.org", "@graph": graphs[kind]() })}</script>`;
}

// BreadcrumbList from the page's visible breadcrumb (<nav class="breadcrumb">). When the breadcrumb ends
// in a section (an article ends with its topic), the page itself is added as the last, unlinked step.
const ENTITIES = { "&amp;": "&", "&quot;": '"', "&#39;": "'", "&lt;": "<", "&gt;": ">", "&nbsp;": " " };
const text = (html) => html.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/g, (e) => ENTITIES[e] ?? e).replace(/\s+/g, " ").trim();

export function breadcrumbLd(html, siteUrl) {
  const nav = html.match(/<nav class="breadcrumb"[^>]*>([\s\S]*?)<\/nav>/);
  if (!nav) return html;
  const steps = [...nav[1].matchAll(/<a href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/g)]
    .map((m) => ({ name: text(m[3]), item: siteUrl + m[1].replace(/&amp;/g, "&"), current: m[2].includes('aria-current="page"') }));
  if (!steps.length) return html;
  if (!steps.at(-1).current) {
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    if (h1) steps.push({ name: text(h1[1]) });
  }
  const list = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: steps.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.name, ...(s.item ? { item: s.item } : {}) })),
  };
  return html.replace("</head>", `<script type="application/ld+json">${json(list)}</script>\n</head>`);
}
