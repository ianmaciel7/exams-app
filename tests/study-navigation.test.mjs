import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { Script } from 'node:vm';

const html = readFileSync(new URL('../prototypes/exam-app-0.1.1/index.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter((match) => !/\bsrc\s*=/.test(match[1]) && !/application\/json/.test(match[1]));
const source = scripts.map((match) => match[2]).join('\n');

test('inline application JavaScript parses without syntax errors', () => {
  assert.ok(scripts.length > 0);
  for (const [index, script] of scripts.entries()) {
    assert.doesNotThrow(() => new Script(script[2], { filename: 'inline-' + index + '.js' }));
  }
});

test('study tasks are primary sidebar actions', () => {
  assert.match(html, /id="questionsRow" href="#\/questoes"/);
  assert.match(html, /id="examsRow" href="#\/simulado"/);
  assert.match(html, /id="reviewRow" href="#\/questoes\/erradas"/);
});

test('practice and exam routes render study screens instead of redirecting to object types', () => {
  assert.match(source, /if\(h0\.startsWith\('\/questoes'\)\|\|h0==='\/simulado'\)\{ showStudyRoute\(h0\); return; \}/);
  assert.doesNotMatch(source, /h0\.startsWith\('\/questoes'\).*location\.replace\('#\/tipo\/questao'\)/);
});

test('home has honest study-entry actions and wrong-answer shortcut', () => {
  assert.match(html, /Como quer estudar agora\?/);
  assert.match(html, /Resolver questões/);
  assert.match(html, /Configurar simulado/);
  assert.match(html, /href="#\/questoes\/erradas"/);
  assert.doesNotMatch(html, /Simulado Rápido/);
});

test('practice position and path filter are preserved across redraws', () => {
  assert.match(source, /store\.get\('qIndex'\)/);
  assert.match(source, /store\.set\('qIndex',qIndex\)/);
  assert.match(source, /if\(qPracticeRoute!==path\)/);
});

test('native selects match the explicit theme and the automatic OS preference', () => {
  const head = html.slice(0, html.indexOf('</head>'));
  // color-scheme affects browser-rendered option menus, not only CSS-styled controls.
  assert.match(head, /:root\[data-theme="dark"\]\s*\{\s*color-scheme:\s*dark\s*;/);
  assert.match(head, /:root\[data-theme="light"\]\s*\{\s*color-scheme:\s*light\s*;/);
  assert.match(head, /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*:root:not\(\[data-theme="light"\]\)\s*\{\s*color-scheme:\s*dark\s*;/);
  assert.ok(head.lastIndexOf('color-scheme:') > head.lastIndexOf(':root{color-scheme:light;'), 'theme-aware rules must override the initial light default');
  assert.match(source, /<select id=\\"qPer\\"/);
  assert.match(source, /\[1,5,10,20\]\.map\(/);
});
