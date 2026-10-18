// Bulgarian pages: published at the site root, keeping every old URL (blog.html, /booking/ …)
export default {
  lang: "bg",
  layout: "layouts/base.njk",
  permalink: "{{ page.filePathStem | replace('/bg/', '/', 1) }}.html",
  eleventyComputed: {
    T: (data) => data.i18n[data.lang],
  },
};
