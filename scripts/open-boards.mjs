import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

// OPEN_ARTIFACT_WHITEBOARD_CLI can point to another installation of the CLI.
function findCli() {
  const override = process.env.OPEN_ARTIFACT_WHITEBOARD_CLI;
  if (override) {
    if (!existsSync(override)) throw new Error(`Whiteboard CLI not found: ${override}`);
    return override;
  }
  const geminiCli = join(homedir(), '.gemini', 'config', 'plugins', 'open-artifact', 'skills', 'open-artifact', 'vendor', 'artifact-types', 'whiteboard', 'scripts', 'cli.mjs');
  if (existsSync(geminiCli)) return geminiCli;
  const cache = join(homedir(), '.codex', 'plugins', 'cache', 'created-by-me-remote', 'open-artifact');
  if (!existsSync(cache)) throw new Error('Open Artifact is not installed; set OPEN_ARTIFACT_WHITEBOARD_CLI to its whiteboard CLI.');
  const versions = readdirSync(cache, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d+\.\d+\.\d+$/.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => {
      const left = a.split('.').map(Number);
      const right = b.split('.').map(Number);
      return right[0] - left[0] || right[1] - left[1] || right[2] - left[2];
    });
  for (const version of versions) {
    const cli = join(cache, version, 'skills', 'whiteboard', 'scripts', 'cli.mjs');
    if (existsSync(cli)) return cli;
  }
  throw new Error('Open Artifact whiteboard CLI not found; set OPEN_ARTIFACT_WHITEBOARD_CLI.');
}

function call(cli, args) {
  const result = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', cwd: process.cwd() });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr.trim() || result.stdout.trim() || `Open Artifact exited with ${result.status}`);
  return result.stdout.trim();
}

// Keep the title fix in the project rather than modifying a shared plugin install.
function prepareWhiteboardAssets(cli) {
  const candidates = [
    resolve(dirname(cli), '../../open-artifact/vendor/type-server'),
    resolve(dirname(cli), '../../../type-server'),
  ];
  const source = candidates.find((path) => existsSync(join(path, 'editors', 'whiteboard', 'index.html')));
  if (!source) throw new Error(`Could not locate whiteboard assets for ${cli}`);
  const cache = resolve('node_modules/.cache/exam-app-open-artifact');
  const assets = join(cache, 'assets');
  mkdirSync(join(assets, 'editors'), { recursive: true });
  cpSync(join(source, 'editors', 'whiteboard'), join(assets, 'editors', 'whiteboard'), { recursive: true, force: true });
  cpSync(join(source, 'shell'), join(assets, 'shell'), { recursive: true, force: true });
  cpSync(join(source, 'support.js'), join(assets, 'support.js'));
  const index = join(assets, 'editors', 'whiteboard', 'index.html');
  const html = readFileSync(index, 'utf8');
  const script = `<script id="exam-app-board-title">
    async function syncExamAppBoardTitle() {
      try {
        const response = await fetch('./_api/db/get?path=board%2Fmeta', { cache: 'no-store' });
        if (!response.ok) return;
        const result = await response.json();
        if (typeof result.data?.title === 'string' && result.data.title.trim()) document.title = result.data.title.trim();
      } catch { /* Preserve the fallback title until the board is available. */ }
    }
    syncExamAppBoardTitle();
    setInterval(syncExamAppBoardTitle, 5000);
  </script>`;
  if (!html.includes('</head>')) throw new Error('Whiteboard editor has no head element');
  writeFileSync(index, html.replace('</head>', `${script}\n  </head>`));
  process.env.OPEN_ARTIFACT_ASSETS = assets;
  process.env.OPEN_ARTIFACT_TYPE_SERVER_HOME = join(cache, 'server');
}

try {
  const cli = findCli();
  prepareWhiteboardAssets(cli);
  const boards = {
    overview: 'docs/boards/overview',
    releases: 'docs/boards/release-stages',
    hub: 'docs/boards/project-hub',
    architecture: 'docs/releases/v0.1.0/information-architecture',
    screens: 'docs/releases/v0.1.0/screen-inventory',
    flows: 'docs/releases/v0.1.0/user-flows',
    sketch: 'docs/releases/v0.1.0/sketch',
  };
  const urls = {};
  for (const [name, path] of Object.entries(boards)) {
    const root = resolve(path);
    if (!existsSync(join(root, 'db', 'board', 'meta.json'))) throw new Error(`Board not found: ${root}`);
    urls[name] = JSON.parse(call(cli, ['open', root, '--type', 'whiteboard', '--json'])).url;
  }
  const updateLinks = (root, links) => call(cli, [
    'write-db', resolve(root),
    JSON.stringify(links.map(([id, href]) => ({ op: 'update', path: `elements/${id}`, data: { href } }))),
  ]);
  updateLinks(boards.hub, [
    ['e5', urls.overview],
    ['e7', urls.releases],
    ['e11', urls.architecture],
    ['e12', urls.screens],
    ['e13', urls.flows],
    ['e14', urls.sketch],
  ]);
  updateLinks(boards.releases, [['e24', urls.architecture], ['e25', urls.screens], ['e26', urls.flows], ['e27', urls.sketch]]);
  console.log('\nExam App boards are ready:');
  for (const [name, url] of Object.entries(urls)) console.log(`${name}: ${url}`);
  console.log('\nOpen the hub URL in your browser. Links are local and may change after a server restart.');
} catch (error) {
  console.error(`Could not open the boards: ${error.message}`);
  process.exitCode = 1;
}
