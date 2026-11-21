import fs from "node:fs";

function readQuestionTypes(source) {
  const match = source.match(
    /export const QUESTION_TYPES = \[(?<body>[\s\S]*?)\] as const;/
  );
  if (!match?.groups?.body) {
    throw new Error("QUESTION_TYPES declaration not found");
  }
  return [...match.groups.body.matchAll(/"([^"]+)"/g)].map(([, type]) => type);
}

function readParserTypes(source) {
  const match = source.match(
    /export function parseSubmittedAnswer[\s\S]*?switch \(type\) \{(?<body>[\s\S]*?)\n\s*default:/
  );
  if (!match?.groups?.body) {
    throw new Error("parseSubmittedAnswer switch not found");
  }
  return [...match.groups.body.matchAll(/case "([^"]+)":/g)].map(
    ([, type]) => type
  );
}

function readRuleTypes(source) {
  const match = source.match(
    /data\.questionType in \[(?<body>[\s\S]*?)\n\s*\]/
  );
  if (!match?.groups?.body) {
    throw new Error("Firestore questionType rule list not found");
  }
  return [...match.groups.body.matchAll(/'([^']+)'/g)].map(([, type]) => type);
}

function differences(expected, actual) {
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  return {
    missing: expected.filter((type) => !actualSet.has(type)),
    extra: actual.filter((type) => !expectedSet.has(type)),
  };
}

export function inspectQuestionTypeCoverage({ questionTypes, parser, rules }) {
  const surfaces = { parser, rules };
  const failures = [];
  for (const [surface, actual] of Object.entries(surfaces)) {
    const { missing, extra } = differences(questionTypes, actual);
    if (missing.length || extra.length) {
      failures.push({ surface, missing, extra });
    }
  }
  return { failures };
}

export function inspectRepository(root) {
  const read = (relativePath) =>
    fs.readFileSync(
      new URL(relativePath, `${root.endsWith("/") ? root : `${root}/`}`),
      "utf8"
    );
  const questionTypes = readQuestionTypes(read("src/types/question.ts"));
  return inspectQuestionTypeCoverage({
    questionTypes,
    parser: readParserTypes(read("src/lib/validators/submitted-answer.ts")),
    rules: readRuleTypes(read("firestore.rules")),
  });
}

export { readParserTypes, readQuestionTypes, readRuleTypes };
