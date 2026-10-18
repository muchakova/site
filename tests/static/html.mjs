// Validates every page built from our templates (legacy copies are skipped).
import { HtmlValidate, FileSystemConfigLoader } from "html-validate";
import { htmlFiles, read, urlOf, isNewPage, report } from "./_lib.mjs";

const validator = new HtmlValidate(new FileSystemConfigLoader());
const errors = [];
let pages = 0;
for (const file of htmlFiles()) {
  if (!isNewPage(read(file))) continue;
  pages++;
  const result = await validator.validateFile(file);
  for (const r of result.results) for (const m of r.messages)
    errors.push(`${urlOf(file)}:${m.line}:${m.column} ${m.ruleId} — ${m.message}`);
}
report(`HTML (${pages} pages)`, errors);
