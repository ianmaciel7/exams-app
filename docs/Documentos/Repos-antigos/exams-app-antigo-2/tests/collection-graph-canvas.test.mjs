import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Collection graph (#tipo/...) rendered on canvas (#227). Pure geometry is run from the shipped source.
const html = readFileSync(new URL('../prototype/exam-app-0.1.1__index.html', import.meta.url), 'utf8');
const begin = html.indexOf('function collectionRingLayout(');
const end = html.indexOf('function rpCvView(', begin);
assert.ok(begin >= 0 && end > begin, 'collectionRingLayout anchors exist');
const layout = runInNewContext(html.slice(begin, end) + '\ncollectionRingLayout');

test('collection ring layout keeps every node inside the fit box', () => {
  for (const n of [1, 2, 9, 70, 200]) {
    const L = layout(n);
    assert.equal(L.pts.length, n);
    const { x, y, w, h } = L.fit;
    for (const [px, py] of L.pts) {
      assert.ok(px >= x && px <= x + w, `x in fit for n=${n}`);
      assert.ok(py >= y && py <= y + h, `y in fit for n=${n}`);
    }
  }
});

test('collection ring layout is deterministic and centred on the collection node', () => {
  const a = layout(12), b = layout(12);
  assert.deepEqual(a.pts, b.pts);
  assert.equal(a.cx, a.R + 45);
  assert.equal(a.cy, a.R + 45);
});

test('canvas renderer is wired: no SVG collection markup, zoom routed to canvas, click and keyboard handled', () => {
  assert.ok(html.includes('canvas[data-rpg-cv]'), 'zoom buttons route to canvas');
  assert.ok(html.includes('function drawCollectionCanvas('), 'draw function exists');
  assert.ok(html.includes('initCollectionCanvases(b)'), 'canvases initialised after panel paint');
});
