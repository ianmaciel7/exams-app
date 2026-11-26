import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, relative, basename } from 'node:path';
import { pathToFileURL } from 'node:url';

export const MAX_BOARD_ELEMENTS = 800;

// Emoji and pseudo-emoji patterns prohibited by project AGENTS.md
const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;
const PSEUDO_EMOJI_REGEX = /\[[◨☷✎📊📁🔍⚙️🔔📌💡✨🚀❌✔️⚠️]]/;

// Prohibited / deprecated terms for v0.1.0 release scope
const V010_PROHIBITED_TERMS = [
  { pattern: /\b(dark mode toggle|theme switch(er)?)\b/i, label: 'Dark mode toggle is unprioritized/out of scope for v0.1.0' },
  { pattern: /\b(account popover)\b/i, label: 'Account popover is prohibited (avoid reintroducing per AGENTS.md)' },
  { pattern: /\b(duplicate Settings)\b/i, label: 'Duplicate Settings prohibited (use single Settings shortcut)' }
];

function scanFilesRecursively(dir, filterFn) {
  let results = [];
  if (!existsSync(dir)) return results;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    // Ignore internal agent cache or git history directories
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'history' || entry.name === '_agent') {
        continue;
      }
      results = results.concat(scanFilesRecursively(fullPath, filterFn));
    } else if (entry.isFile() && filterFn(fullPath)) {
      results.push(fullPath);
    }
  }
  return results;
}

export function auditMarkdownFile(filePath, isV010 = false) {
  const issues = [];
  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((line, idx) => {
      if (EMOJI_REGEX.test(line)) {
        issues.push({ line: idx + 1, type: 'error', message: 'Prohibited emoji detected' });
      }
      if (PSEUDO_EMOJI_REGEX.test(line)) {
        issues.push({ line: idx + 1, type: 'error', message: 'Prohibited pseudo-emoji bracketed glyph detected' });
      }
      if (isV010) {
        for (const rule of V010_PROHIBITED_TERMS) {
          if (rule.pattern.test(line)) {
            issues.push({ line: idx + 1, type: 'warning', message: rule.label });
          }
        }
      }
    });
  } catch (err) {
    issues.push({ line: 0, type: 'error', message: `Could not read file: ${err.message}` });
  }
  return issues;
}

export function auditBoardDirectory(boardDir) {
  const issues = [];
  const metaPath = join(boardDir, 'db', 'board', 'meta.json');
  if (!existsSync(metaPath)) {
    return issues; // Not an Open Artifact board directory
  }

  try {
    const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
    if (!Array.isArray(meta.order)) {
      issues.push({ type: 'error', message: 'meta.order must be an array' });
      return issues;
    }

    if (meta.order.length > MAX_BOARD_ELEMENTS) {
      issues.push({
        type: 'error',
        message: `Board exceeds ${MAX_BOARD_ELEMENTS} elements limit (found: ${meta.order.length})`
      });
    }

    const elementsDir = join(boardDir, 'db', 'elements');
    if (existsSync(elementsDir)) {
      const elementFiles = readdirSync(elementsDir).filter(f => f.endsWith('.json'));
      const idSet = new Set(meta.order);

      // Check for unlisted or missing elements
      for (const id of meta.order) {
        const elPath = join(elementsDir, `${id}.json`);
        if (!existsSync(elPath)) {
          issues.push({ type: 'error', message: `Referenced element missing: ${id}` });
          continue;
        }

        const elContent = readFileSync(elPath, 'utf8');
        if (EMOJI_REGEX.test(elContent)) {
          issues.push({ type: 'error', message: `Prohibited emoji inside element ${id}` });
        }
        if (PSEUDO_EMOJI_REGEX.test(elContent)) {
          issues.push({ type: 'error', message: `Prohibited pseudo-emoji glyph inside element ${id}` });
        }
      }

      for (const f of elementFiles) {
        const id = f.replace(/\.json$/, '');
        if (!idSet.has(id)) {
          issues.push({ type: 'warning', message: `Unlisted element file: ${f}` });
        }
      }
    }
  } catch (err) {
    issues.push({ type: 'error', message: `Error inspecting board: ${err.message}` });
  }

  return issues;
}

export function runAudit(targetArg = '') {
  let targetPath = targetArg.trim();
  const root = process.cwd();

  let targetDirs = [];

  if (!targetPath) {
    // Mode 2: Full Audit across all releases and boards
    const releasesRoot = join(root, 'docs', 'releases');
    if (existsSync(releasesRoot)) {
      const releaseDirs = readdirSync(releasesRoot, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => join(releasesRoot, d.name));
      targetDirs.push(...releaseDirs);
    }
    const boardsRoot = join(root, 'docs', 'boards');
    if (existsSync(boardsRoot)) {
      const boardDirs = readdirSync(boardsRoot, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => join(boardsRoot, d.name));
      targetDirs.push(...boardDirs);
    }
  } else {
    // Mode 3: Targeted Audit
    if (existsSync(join(root, 'docs', 'releases', targetPath))) {
      targetDirs.push(join(root, 'docs', 'releases', targetPath));
    } else if (existsSync(resolve(targetPath))) {
      targetDirs.push(resolve(targetPath));
    } else {
      console.error(`Target path or release not found: ${targetPath}`);
      process.exitCode = 1;
      return;
    }
  }

  console.log('='.repeat(70));
  console.log(' EXAM APP - RELEASE STAGE & FIDELITY AUDIT');
  console.log('='.repeat(70));
  console.log(`Targets scanned: ${targetDirs.map(d => relative(root, d)).join(', ')}\n`);

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const dir of targetDirs) {
    console.log(`Auditing target: ${relative(root, dir)}`);
    const isV010 = dir.includes('v0.1.0');

    // 1. Audit Markdown files
    const mdFiles = scanFilesRecursively(dir, f => f.endsWith('.md'));
    for (const mdFile of mdFiles) {
      const relPath = relative(root, mdFile);
      const issues = auditMarkdownFile(mdFile, isV010);
      if (issues.length > 0) {
        console.log(`  File: ${relPath}`);
        for (const iss of issues) {
          const tag = iss.type === 'error' ? 'FAIL' : 'WARN';
          console.log(`    [${tag}] line ${iss.line}: ${iss.message}`);
          if (iss.type === 'error') totalErrors++;
          if (iss.type === 'warning') totalWarnings++;
        }
      }
    }

    // 2. Audit Whiteboard directories
    const subdirs = [dir];
    if (statSync(dir).isDirectory()) {
      const nested = readdirSync(dir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => join(dir, d.name));
      subdirs.push(...nested);
    }

    for (const bDir of subdirs) {
      const boardIssues = auditBoardDirectory(bDir);
      if (boardIssues.length > 0) {
        console.log(`  Board: ${relative(root, bDir)}`);
        for (const iss of boardIssues) {
          const tag = iss.type === 'error' ? 'FAIL' : 'WARN';
          console.log(`    [${tag}] ${iss.message}`);
          if (iss.type === 'error') totalErrors++;
          if (iss.type === 'warning') totalWarnings++;
        }
      }
    }
  }

  console.log('\n' + '-'.repeat(70));
  if (totalErrors === 0 && totalWarnings === 0) {
    console.log('Audit completed: PASSED (0 errors, 0 warnings)');
  } else {
    console.log(`Audit completed: ${totalErrors} error(s), ${totalWarnings} warning(s)`);
    if (totalErrors > 0) {
      process.exitCode = 1;
    }
  }
  console.log('-'.repeat(70));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  runAudit(process.argv[2] || '');
}
