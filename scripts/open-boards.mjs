import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

// OPEN_ARTIFACT_WHITEBOARD_CLI can point to another installation of the CLI.
function findCli() {
  const override = process.env.OPEN_ARTIFACT_WHITEBOARD_CLI;
  if (override) {
    if (!existsSync(override)) throw new Error(`Whiteboard CLI not found: ${override}`);
    return override;
  }
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

try {
  const cli = findCli();
  const boards = {
    overview: 'docs/boards/overview',
    releases: 'docs/boards/release-stages',
    hub: 'docs/boards/project-hub',
    architecture: 'docs/releases/v0.1.0/information-architecture',
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
  updateLinks(boards.hub, [['e5', urls.overview], ['e7', urls.releases], ['e11', urls.architecture]]);
  updateLinks(boards.releases, [['e24', urls.architecture]]);
  console.log('\nExam App boards are ready:');
  for (const [name, url] of Object.entries(urls)) console.log(`${name}: ${url}`);
  console.log('\nOpen the hub URL in your browser. Links are local and may change after a server restart.');
} catch (error) {
  console.error(`Could not open the boards: ${error.message}`);
  process.exitCode = 1;
}
