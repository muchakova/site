// Text helpers shared by the build: the reading time is the same on the cards, in the article and in the feeds.
export const WORDS_PER_MINUTE = 200;
export const plainText = (html) => String(html).replace(/<(script|style)[\s\S]*?<\/\1>/g, " ").replace(/<[^>]+>/g, " ");
export const readingMinutes = (html) =>
  Math.max(1, Math.ceil((plainText(html).match(/[\p{L}\p{N}]+/gu) || []).length / WORDS_PER_MINUTE));
