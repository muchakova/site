// Posts: article layout, shared key across languages (post-<slug>)
export default {
  layout: "layouts/post.njk",
  tags: ["posts"],
  ogType: "article",
  section: "blog",
  eleventyComputed: {
    key: (data) => `post-${data.page.fileSlug}`,
  },
};
