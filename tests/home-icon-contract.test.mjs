import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../prototypes/exam-app-0.1.1/index.html', import.meta.url), 'utf8');

test('all referenced UIICON keys render an SVG rather than undefined text', () => {
  const declaration = /const UIICON=(\{[\s\S]*?\n\});/.exec(html);
  assert.ok(declaration, 'UIICON declaration was not found');
  const icons = runInNewContext('(' + declaration[1] + ')', { IC: { target: '<svg aria-hidden="true"></svg>' } });
  const used = [...new Set([...html.matchAll(/UIICON\.([A-Za-z]\w*)/g)].map((match) => match[1]))];
  assert.ok(used.includes('timer'), 'Simulado must use a timer icon');
  for (const key of used) {
    assert.equal(typeof icons[key], 'string', 'missing UIICON.' + key);
    assert.match(icons[key], /^<svg\b/, 'UIICON.' + key + ' must be a vector icon');
    assert.doesNotMatch(icons[key], /undefined|null/, 'UIICON.' + key + ' cannot leak placeholder text');
  }
});

test('home study entrypoints preserve accessible visible labels', () => {
  assert.match(html, /<b>Resolver questões<\/b><small>Prática individual com correção imediata<\/small>/);
  assert.match(html, /<b>Fazer simulado<\/b><small>Configure a prova e acompanhe seu resultado<\/small>/);
  assert.match(html, /\.dash-actions\{[^}]*minmax\(min\(100%,200px\),1fr\)/);
  assert.match(html, /\.dash-act-txt b,\.dash-act-txt small\{overflow-wrap:anywhere\}/);
});
