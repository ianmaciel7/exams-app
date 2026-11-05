import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "../../../..");

const DOCS_DIR = join(REPO_ROOT, "node_modules/next/dist/docs");
const SERVER_LIB_DIR = join(REPO_ROOT, "node_modules/next/dist/server/lib");

function scanDirectory(dir, filterExts) {
  const results = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...scanDirectory(fullPath, filterExts));
      } else if (entry.isFile()) {
        if (!filterExts || filterExts.some((ext) => entry.name.endsWith(ext))) {
          results.push(fullPath);
        }
      }
    }
  } catch {
    // Directory might not exist or be inaccessible
  }
  return results;
}

function searchFiles(files, query, repoRoot) {
  const matches = [];
  const lowerQuery = query.toLowerCase();

  for (const filePath of files) {
    const relPath = relative(repoRoot, filePath).replace(/\\/g, "/");
    const nameMatch = filePath.toLowerCase().includes(lowerQuery);

    const contentMatches = [];
    try {
      const content = readFileSync(filePath, "utf8");
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(lowerQuery)) {
          contentMatches.push({
            line: i + 1,
            text: lines[i].trim(),
          });
          if (contentMatches.length >= 3) break; // Limit snippets per file
        }
      }
    } catch {
      // Binary or unreadable
    }

    if (nameMatch || contentMatches.length > 0) {
      matches.push({
        file: relPath,
        nameMatch,
        snippets: contentMatches,
      });
    }
  }

  return matches;
}

function printHelp() {
  console.log(`Next.js Installed Documentation & Server Internals Lookup

Usage:
  node .agents/skills/nextjs-docs/scripts/lookup.mjs <query>
  node .agents/skills/nextjs-docs/scripts/lookup.mjs --list
  node .agents/skills/nextjs-docs/scripts/lookup.mjs --server <query>

Options:
  --list, -l      List main categories and topics in installed docs
  --server, -s    Search exclusively in node_modules/next/dist/server/lib
  --docs, -d      Search exclusively in node_modules/next/dist/docs
  --help, -h      Show this help message
`);
}

function listTopics() {
  console.log("=== Next.js Installed Documentation Overview ===");
  console.log(`Location: node_modules/next/dist/docs\n`);

  const appDir = join(DOCS_DIR, "01-app");
  try {
    const sections = readdirSync(appDir, { withFileTypes: true });
    for (const sec of sections) {
      const secPath = join(appDir, sec.name);
      if (sec.isDirectory()) {
        console.log(`📁 01-app/${sec.name}:`);
        const files = readdirSync(secPath, { withFileTypes: true });
        for (const file of files) {
          if (file.isFile() && file.name.endsWith(".md")) {
            console.log(`   - ${file.name.replace(".md", "")}`);
          } else if (file.isDirectory()) {
            console.log(`   📁 ${file.name}/`);
          }
        }
      } else if (sec.isFile()) {
        console.log(`📄 01-app/${sec.name}`);
      }
    }
  } catch (err) {
    console.error(`Unable to read ${DOCS_DIR}: ${err.message}`);
  }

  console.log("\n=== Next.js Server Internals Overview ===");
  console.log(`Location: node_modules/next/dist/server/lib\n`);
  try {
    const serverFiles = readdirSync(SERVER_LIB_DIR, { withFileTypes: true });
    for (const f of serverFiles) {
      if (f.isDirectory()) {
        console.log(`📁 ${f.name}/`);
      } else if (f.name.endsWith(".d.ts")) {
        console.log(`📄 ${f.name}`);
      }
    }
  } catch (err) {
    console.error(`Unable to read ${SERVER_LIB_DIR}: ${err.message}`);
  }
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }

  if (args.includes("--list") || args.includes("-l")) {
    listTopics();
    return;
  }

  const serverOnly = args.includes("--server") || args.includes("-s");
  const docsOnly = args.includes("--docs") || args.includes("-d");
  const queryWords = args.filter((arg) => !arg.startsWith("-"));

  if (queryWords.length === 0) {
    console.error("Error: Please provide a search query.");
    process.exitCode = 1;
    return;
  }

  const query = queryWords.join(" ");

  const docFiles = serverOnly ? [] : scanDirectory(DOCS_DIR, [".md"]);
  const serverFiles = docsOnly
    ? []
    : scanDirectory(SERVER_LIB_DIR, [".d.ts", ".js"]);

  const allFiles = [...docFiles, ...serverFiles];
  const results = searchFiles(allFiles, query, REPO_ROOT);

  if (results.length === 0) {
    console.log(`No results found for "${query}".`);
    console.log(
      `Try a broader term or run with --list to see available categories.`,
    );
    return;
  }

  console.log(`Found ${results.length} matching file(s) for "${query}":\n`);
  for (const res of results) {
    console.log(`\x1b[36m${res.file}\x1b[0m`);
    if (res.snippets.length > 0) {
      for (const snip of res.snippets) {
        console.log(`  Line ${snip.line}: ${snip.text}`);
      }
    }
    console.log("");
  }
}

main();
