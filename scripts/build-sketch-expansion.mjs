import { writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'docs/releases/v0.1.0/sketch/db/elements';
const metaPath = 'docs/releases/v0.1.0/sketch/db/board/meta.json';

function writeElem(id, obj) {
  writeFileSync(join(dir, id + '.json'), JSON.stringify(obj));
}

function hStroke(x, y, len, color = '#b8b8b8', width = 1.4) {
  return {
    type: 'stroke',
    x, y,
    points: [0, 0, len * 0.25, 0.4, len * 0.5, 0.6, len * 0.75, 0.3, len, 0],
    width,
    color
  };
}

function vStroke(x, y, h, color = '#b8b8b8', width = 1.4) {
  return {
    type: 'stroke',
    x, y,
    points: [0, 0, 0.4, h * 0.25, 0.6, h * 0.5, 0.3, h * 0.75, 0, h],
    width,
    color
  };
}

function box(x, y, w, h, color = '#b8b8b8', width = 1.4) {
  return [
    hStroke(x, y, w, color, width),
    vStroke(x + w, y, h, color, width),
    hStroke(x, y + h, w, color, width),
    vStroke(x, y, h, color, width)
  ];
}

console.log('Sketch expansion builder initialized.');
