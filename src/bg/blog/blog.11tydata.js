// Posts: article layout, shared key across languages (post-<slug>), reading time from the article file
import { readFileSync } from "node:fs";
import { readingMinutes } from "../../../lib/text.js";

export default {
  layout: "layouts/post.njk",
  tags: ["posts"],
  ogType: "article",
  section: "blog",
  eleventyComputed: {
    key: (data) => `post-${data.page.fileSlug}`,
    minutes: (data) => readingMinutes(readFileSync(data.page.inputPath, "utf8").replace(/^---[\s\S]*?\n---/, "")),
  },
};
