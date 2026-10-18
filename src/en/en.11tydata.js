// English pages: published under /en/, mirroring the Bulgarian paths
export default {
  lang: "en",
  layout: "layouts/base.njk",
  permalink: "{{ page.filePathStem }}.html",
  eleventyComputed: {
    T: (data) => data.i18n[data.lang],
  },
};
