import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { markerSketchCss } from './marker-sketch-style.mjs';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));

// Discover available Open Artifact whiteboard CLIs across platforms (Gemini, Codex, Claude)
function findCli() {
  const override = process.env.OPEN_ARTIFACT_WHITEBOARD_CLI;
  if (override) {
    if (!existsSync(override)) throw new Error(`Whiteboard CLI not found: ${override}`);
    return { path: override, platform: 'Custom override' };
  }

  const discovered = [];

  // 1. Google Gemini CLI / Antigravity plugin
  const geminiCli = join(homedir(), '.gemini', 'config', 'plugins', 'open-artifact', 'skills', 'open-artifact', 'vendor', 'artifact-types', 'whiteboard', 'scripts', 'cli.mjs');
  if (existsSync(geminiCli)) {
    discovered.push({ path: geminiCli, platform: 'Gemini CLI / Antigravity' });
  }

  // 2. OpenAI Codex cache / plugin
  const codexCache = join(homedir(), '.codex', 'plugins', 'cache', 'created-by-me-remote', 'open-artifact');
  if (existsSync(codexCache)) {
    const versions = readdirSync(codexCache, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && /^\d+\.\d+\.\d+$/.test(entry.name))
      .map((entry) => entry.name)
      .sort((a, b) => {
        const left = a.split('.').map(Number);
        const right = b.split('.').map(Number);
        return right[0] - left[0] || right[1] - left[1] || right[2] - left[2];
      });
    for (const version of versions) {
      const cli = join(codexCache, version, 'skills', 'whiteboard', 'scripts', 'cli.mjs');
      if (existsSync(cli)) {
        discovered.push({ path: cli, platform: `OpenAI Codex (v${version})` });
        break;
      }
    }
  }

  // 3. Anthropic Claude Code plugin / skills cache
  const claudePaths = [
    join(homedir(), '.claude', 'plugins', 'open-artifact', 'skills', 'whiteboard', 'scripts', 'cli.mjs'),
    join(homedir(), '.claude', 'plugins', 'cache', 'open-artifact', 'skills', 'whiteboard', 'scripts', 'cli.mjs'),
    join(homedir(), '.claude', 'skills', 'whiteboard', 'scripts', 'cli.mjs'),
    join(homedir(), '.claude', 'skills', 'open-artifact', 'vendor', 'artifact-types', 'whiteboard', 'scripts', 'cli.mjs'),
  ];
  for (const cPath of claudePaths) {
    if (existsSync(cPath)) {
      discovered.push({ path: cPath, platform: 'Anthropic Claude Code' });
      break;
    }
  }

  if (discovered.length === 0) {
    throw new Error('Open Artifact is not installed in Gemini, Codex, or Claude; set OPEN_ARTIFACT_WHITEBOARD_CLI to its whiteboard CLI.');
  }

  return discovered[0];
}

function call(cli, args) {
  const result = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', cwd: process.cwd() });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr.trim() || result.stdout.trim() || `Open Artifact exited with ${result.status}`);
  return result.stdout.trim();
}

// Keep the title fix in the project rather than modifying a shared plugin install.
async function prepareWhiteboardAssets(cli) {
  const candidates = [
    resolve(dirname(cli), '../../open-artifact/vendor/type-server'),
    resolve(dirname(cli), '../../../type-server'),
  ];
  const source = candidates.find((path) => existsSync(join(path, 'editors', 'whiteboard', 'index.html')));
  if (!source) throw new Error(`Could not locate whiteboard assets for ${cli}`);
  const cache = join(projectRoot, 'node_modules', '.cache', 'exam-app-open-artifact');
  const assets = join(cache, 'assets');
  mkdirSync(join(assets, 'editors'), { recursive: true });
  cpSync(join(source, 'editors', 'whiteboard'), join(assets, 'editors', 'whiteboard'), { recursive: true, force: true });
  cpSync(join(source, 'shell'), join(assets, 'shell'), { recursive: true, force: true });
  cpSync(join(source, 'support.js'), join(assets, 'support.js'));
  const index = join(assets, 'editors', 'whiteboard', 'index.html');
  const html = readFileSync(index, 'utf8');
  cpSync(join(projectRoot, 'scripts', 'marker-sketch-ink.mjs'), join(assets, 'editors', 'whiteboard', 'exam-marker-sketch-ink.mjs'));
  const markerCss = await markerSketchCss(cache);
  const script = `<style id="exam-marker-sketch-css">${markerCss}</style><script id="exam-app-board-title">
    async function syncExamAppBoardTitle() {
      try {
        const response = await fetch('./_api/db/get?path=board%2Fmeta', { cache: 'no-store' });
        if (!response.ok) return;
        const result = await response.json();
        if (typeof result.data?.title === 'string' && result.data.title.trim()) {
          document.title = result.data.title.trim();
          document.documentElement.toggleAttribute('data-exam-marker-sketch', /^Sketch\\s/.test(document.title));
        }
      } catch { /* Preserve the fallback title until the board is available. */ }
    }
    syncExamAppBoardTitle();
    setInterval(syncExamAppBoardTitle, 5000);
  </script>`;
  if (!html.includes('</head>')) throw new Error('Whiteboard editor has no head element');
  writeFileSync(index, html.replace('</head>', `${script}\n    <script src="./exam-app-board-links.js"></script>\n    <script type="module" src="./exam-marker-sketch-ink.mjs"></script>\n  </head>`));
  process.env.OPEN_ARTIFACT_ASSETS = assets;
  process.env.OPEN_ARTIFACT_TYPE_SERVER_HOME = join(cache, 'server');
  return join(assets, 'editors', 'whiteboard', 'exam-app-board-links.js');
}

try {
  const selectedCli = findCli();
  console.log(`Using Open Artifact Whiteboard CLI from: ${selectedCli.platform} (${selectedCli.path})`);
  const linksScript = await prepareWhiteboardAssets(selectedCli.path);
  const boards = {
    overview: ['art_examappoverview', 'docs/boards/overview'],
    releases: ['art_examappreleasestages', 'docs/boards/release-stages'],
    hub: ['art_examappprojecthub', 'docs/boards/project-hub'],
    product: ['art_examappproductv010', 'docs/releases/v0.1.0/product'],
    architecture: ['art_examappinformationarchitecturev010', 'docs/releases/v0.1.0/information-architecture'],
    screens: ['art_examappscreeninventoryv010', 'docs/releases/v0.1.0/screen-inventory'],
    flows: ['art_examappuserflowsv010', 'docs/releases/v0.1.0/user-flows'],
    sketch: ['art_examappsketchv010', 'docs/releases/v0.1.0/sketch'],
    lowfidelity: ['art_examapplowfidelityv010', 'docs/releases/v0.1.0/low-fidelity-wireframe'],
    midfidelity: ['art_examappmidfidelityv010', 'docs/releases/v0.1.0/mid-fidelity-wireframe'],
  };
  for (const [, path] of Object.values(boards)) {
    const root = join(projectRoot, path);
    if (!existsSync(join(root, 'db', 'board', 'meta.json'))) throw new Error(`Board not found: ${root}`);
  }
  const urls = {};
  const routes = {};
  for (const [name, [id, path]] of Object.entries(boards)) {
    const root = join(projectRoot, path);
    const opened = JSON.parse(call(selectedCli.path, ['open', root, '--type', 'whiteboard', '--id', id, '--json']));
    if (opened.id !== id) throw new Error(`Open Artifact did not register the expected ID for ${root}`);
    urls[name] = opened.url;
    routes[`/a/${id}`] = new URL(opened.url).pathname;
  }

  // Native links open /a/<id> through the shell. The standalone server serves board
  // URLs directly, so translate those routes in the local viewer before opening.
  writeFileSync(linksScript, `(() => {
    const routes = ${JSON.stringify(routes)};
    const open = window.open;
    window.open = function (url, ...options) {
      if (typeof url === 'string' && url && URL.canParse(url, location.href)) {
        const destination = new URL(url, location.href);
        if (destination.origin === location.origin && Object.hasOwn(routes, destination.pathname)) {
          destination.pathname = routes[destination.pathname];
          url = destination.href;
        }
      }
      return open.call(this, url, ...options);
    };
  })();\n`);
  console.log('\nExam App boards are ready:');
  for (const [name, url] of Object.entries(urls)) console.log(`${name}: ${url}`);
  console.log('\nOpen the overview (Ideas Board) URL in your browser. Run this launcher again after the local server stops.');
} catch (error) {
  console.error(`Could not open the boards: ${error.message}`);
  process.exitCode = 1;
}
