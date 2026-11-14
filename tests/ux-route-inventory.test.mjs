import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';

const source = readFileSync(new URL('../prototypes/exam-app-0.1.1/index.html', import.meta.url), 'utf8');
const guide = readFileSync(new URL('../docs/ux/arquitetura-informacao-navegacao.md', import.meta.url), 'utf8');

test('current route inventory is grounded in actual dispatch logic', () => {
  const active = [
    "'/questoes'", "'/simulado'", "'/simulado/exec'", "'/simulado/resultado'",
    "'/espaco'", "'/revisao'", "'/tipo/'", "'/concurso/'", "'/questao/'",
  ];
  for (const literal of active) assert.ok(source.includes(literal), 'missing route ' + literal);
  assert.match(source, /if\(h0\.startsWith\('\/questoes'\)\|\|h0==='\/simulado'\)\{ showStudyRoute\(h0\); return; \}/);
  assert.match(source, /if\(h0==='\/revisao'\)\{ location\.replace\('#\/questoes\/erradas'\); return; \}/);
});

test('guide distinguishes implemented navigation from future contracts', () => {
  for (const label of ['Status', 'Implementado (I)', 'Parcial (P)', 'Proposto (R)', 'Benchmark (B)']) {
    assert.ok(guide.includes(label), 'missing status boundary: ' + label);
  }
  for (const route of [
    '#/espaco', '#/questoes', '#/simulado', '#/questoes/erradas', '#/simulado/exec',
    '#/simulado/resultado', '#/tipo/questao', '#/questao/:id', '#/revisao',
  ]) {
    assert.ok(guide.includes(route), 'route not documented: ' + route);
  }
  assert.match(guide, /#\/questoes\?status=erradas.*R, não implementado/);
});

test('guide covers decisions, empirical validation, and issue boundaries', () => {
  for (const label of [
    'Matriz de escolha', 'Página única contínua', 'Múltiplas páginas/rotas',
    'Accordion/details', 'Popover', 'Drawer', 'Painel contextual', 'Wizard/etapas',
    'Teste de árvore', 'primeiro clique', 'Teste moderado', 'WCAG 2.2',
    '#100', '#70', '#75', '#69', '#21', 'SHA inicial', 'SHA final',
  ]) {
    assert.ok(guide.includes(label), 'missing acceptance artifact: ' + label);
  }
});
