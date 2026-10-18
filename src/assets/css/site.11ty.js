// Bundles the design-system stylesheets into one file: /assets/css/site.css
// Order of the files does not matter for the cascade — the @layer statement does.
import { readFileSync } from "node:fs";

const files = ["fonts.css", "tokens.css", "base.css", "components.css"];

export default class {
  data() {
    return { permalink: "/assets/css/site.css", eleventyExcludeFromCollections: true };
  }

  render() {
    const css = files.map((f) => readFileSync(new URL(f, import.meta.url), "utf8")).join("\n");
    const minified = css
      .replace(/\/\*[\s\S]*?\*\//g, "")      // comments
      .replace(/\s+/g, " ")                    // whitespace runs
      .replace(/\s*([{};,])\s*/g, "$1")        // spaces around punctuation (":" kept: "a :hover" ≠ "a:hover")
      .replace(/;}/g, "}")
      .trim();
    return "@layer reset,tokens,base,layout,components,utilities;" + minified + "\n";
  }
}
