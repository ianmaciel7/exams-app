import process from "node:process";
import { inspectRepository } from "./guard-question-types-lib.mjs";

const result = inspectRepository(new URL("../..", import.meta.url).href);

if (result.failures.length > 0) {
  for (const { surface, missing, extra } of result.failures) {
    const details = [
      missing.length ? `missing: ${missing.join(", ")}` : null,
      extra.length ? `extra: ${extra.join(", ")}` : null,
    ]
      .filter(Boolean)
      .join("; ");
    console.error(`[guard-question-types] ${surface}: ${details}`);
  }
  process.exit(1);
}

console.log(
  "[guard-question-types] ✓ QUESTION_TYPES, submitted-answer parser, and Firestore rules are synchronized."
);
