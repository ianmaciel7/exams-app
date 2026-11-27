import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { checkFidelityCoverage, checkCurrentFidelityCoverage } from './check-fidelity-coverage.mjs';
import { MAX_BOARD_ELEMENTS } from './check-boards.mjs';

const require = createRequire(import.meta.url);
const CURRENT_STATE_PATH = 'docs/releases/v0.1.0/current-state.json';
const HF_META_PATH = 'docs/releases/v0.1.0/high-fidelity-wireframe/db/board/meta.json';

function loadBaselineFixture() {
  const state = JSON.parse(readFileSync(CURRENT_STATE_PATH, 'utf8'));
  const meta = JSON.parse(readFileSync(HF_META_PATH, 'utf8'));
  return { state, meta, ids: new Set(meta.order) };
}

function centerOf(el) {
  return { x: el.x + el.w / 2, y: el.y + el.h / 2 };
}

function decodeSvg(src) {
  if (typeof src !== 'string' || !src.startsWith('data:image/svg+xml,')) return null;
  return decodeURIComponent(src.slice('data:image/svg+xml,'.length));
}

function parseSvgAttributes(src) {
  const svg = decodeSvg(src);
  if (!svg) return null;
  const rectMatch = svg.match(/<rect\b([^>]*)>/i);
  if (!rectMatch) return { svg, rect: null };
  const attrs = rectMatch[1];
  const get = (name) => {
    const m = attrs.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'));
    return m ? m[1] : null;
  };
  return {
    svg,
    rect: {
      rx: get('rx'),
      ry: get('ry'),
      stroke: get('stroke'),
      strokeWidth: get('stroke-width'),
      fill: get('fill'),
    },
  };
}

/**
 * Validates collapsed rail Logo-to-Icon swap invariants (#11):
 * - Rest shows only the provisional brand mark centered on the header axis.
 * - Hover, Focus, No-hover, and Pressed replace the brand mark with the expand toggle
 *   at the exact same center coordinates (no 48px vertical offset, no duplicate control).
 * - Hover/pressed fills and focus ring stay aligned with that same header center.
 */
export function validateCollapsedRailToggle(elements, { requirePressed = false } = {}) {
  const errors = [];

  const collapsedSidebar = elements.collapsed_sidebar;
  const collapsedBrand = elements.collapsed_brand;
  if (!collapsedSidebar || !collapsedBrand) {
    errors.push('Missing collapsed_sidebar or collapsed_brand in workspace rail');
  } else {
    const sc = centerOf(collapsedSidebar);
    const bc = centerOf(collapsedBrand);
    if (Math.abs(bc.x - sc.x) > 1) {
      errors.push(`collapsed_brand not horizontally centered in rail (${bc.x} vs ${sc.x})`);
    }
    if (elements.collapsed_toggle) {
      errors.push('collapsed_toggle must not render at rest alongside collapsed_brand');
    }
  }

  const restRail = elements.rail0;
  const restBrand = elements.rail_brand0;
  if (!restRail || !restBrand) {
    errors.push('Missing rail0 or rail_brand0 in section 08');
    return errors;
  }
  if (elements.rail_toggle0) {
    errors.push('rail0 (Rest) must not show rail_toggle0 simultaneously with rail_brand0');
  }

  const restRailCenter = centerOf(restRail);
  const restBrandCenter = centerOf(restBrand);
  if (Math.abs(restBrandCenter.x - restRailCenter.x) > 1) {
    errors.push(`rail_brand0 not horizontally centered (${restBrandCenter.x} vs ${restRailCenter.x})`);
  }
  const expectedRelY = restBrandCenter.y - restRail.y;

  const states = [[1, 'Hover'], [2, 'Focus'], [3, 'No hover']];
  if (requirePressed || elements.rail4) states.push([4, 'Pressed']);

  for (const [k, label] of states) {
    const rail = elements[`rail${k}`];
    const toggle = elements[`rail_toggle${k}`];
    const duplicateBrand = elements[`rail_brand${k}`];
    if (!rail) {
      errors.push(`Missing rail${k} (${label})`);
      continue;
    }
    if (duplicateBrand) {
      errors.push(`Duplicate control: rail_brand${k} coexists with toggle in rail${k} (${label})`);
    }
    if (!toggle) {
      errors.push(`Missing rail_toggle${k} in rail${k} (${label})`);
      continue;
    }
    const railCenter = centerOf(rail);
    const toggleCenter = centerOf(toggle);
    const actualRelY = toggleCenter.y - rail.y;
    if (Math.abs(actualRelY - expectedRelY) > 1) {
      errors.push(`rail_toggle${k} (${label}) vertical offset mismatch: ${actualRelY} vs expected ${expectedRelY}`);
    }
    if (Math.abs(toggleCenter.x - railCenter.x) > 1) {
      errors.push(`rail_toggle${k} (${label}) not horizontally centered: ${toggleCenter.x} vs ${railCenter.x}`);
    }
    const hitControl = k === 1 ? elements.rail_hover : k === 2 ? elements.rail_focus : k === 4 ? elements.rail_pressed : null;
    if (hitControl) {
      const hitCenter = centerOf(hitControl);
      if (Math.abs(hitCenter.x - toggleCenter.x) > 1 || Math.abs(hitCenter.y - toggleCenter.y) > 1) {
        errors.push(`Hit/focus ring for rail${k} misaligned from toggle center`);
      }
    }
  }

  return errors;
}

/**
 * Validates App Shell surface geometry (#19):
 * - Persistent sidebar/drawer and workspace frames meet with flush, square internal seams.
 * - Shell surfaces carry no unintended borders or corner radii (and do not use Open Artifact
 *   `type:"shape"` primitives, which inject 12px corners and inner contour strokes).
 */
export function validateAppShellSurfaces(elements, shellPairs, standaloneIds = []) {
  const errors = [];
  const checked = new Set();

  const checkSurface = (id, { allowOverlayRightRadius = false } = {}) => {
    if (checked.has(id)) return;
    checked.add(id);
    const el = elements[id];
    if (!el) {
      errors.push(`Missing App Shell surface ${id}`);
      return;
    }
    if (el.type === 'shape') {
      errors.push(`App Shell surface ${id} uses shape (${el.kind}), which renders unintended corners/contours in Open Artifact v0.17.0`);
      return;
    }
    if (el.type === 'image') {
      const parsed = parseSvgAttributes(el.src);
      if (!parsed) {
        errors.push(`App Shell surface ${id} missing SVG payload`);
        return;
      }
      if (parsed.rect) {
        const rx = Number(parsed.rect.rx ?? 0);
        const ry = Number(parsed.rect.ry ?? 0);
        if (rx > 0 || ry > 0) {
          errors.push(`Unintended SVG corner radius on App Shell surface ${id}: rx=${rx}, ry=${ry}`);
        }
        if (parsed.rect.stroke && parsed.rect.stroke !== 'none') {
          errors.push(`Unintended SVG border stroke on App Shell surface ${id}: ${parsed.rect.stroke}`);
        }
      } else if (allowOverlayRightRadius) {
        if (!/^<svg[^>]*><path d="M 0 0 /.test(parsed.svg) || !parsed.svg.includes(`L 0 ${el.h} Z"`)) {
          errors.push(`Overlay drawer ${id} left edge is not flush square`);
        }
      }
    }
  };

  for (const { name, frameId, sidebarId, allowOverlayRightRadius = false, surfaceIds = [] } of shellPairs) {
    const frame = elements[frameId];
    const sidebar = elements[sidebarId];
    if (!frame || !sidebar) {
      errors.push(`Missing shell surface pair for ${name}: ${frameId} / ${sidebarId}`);
      continue;
    }
    if (sidebar.x !== frame.x || sidebar.y !== frame.y || sidebar.h !== frame.h) {
      errors.push(`Non-flush seam in ${name}: sidebar (${sidebar.x},${sidebar.y},h=${sidebar.h}) vs frame (${frame.x},${frame.y},h=${frame.h})`);
    }
    if (sidebar.w <= 0 || sidebar.w >= frame.w) {
      errors.push(`Invalid sidebar width in ${name}: ${sidebar.w} inside frame ${frame.w}`);
    }
    checkSurface(frameId);
    checkSurface(sidebarId, { allowOverlayRightRadius });
    for (const id of surfaceIds) checkSurface(id);
  }

  for (const id of standaloneIds) checkSurface(id);
  return errors;
}

function estimateSingleLineWidth(text, size = 'body') {
  const clean = String(text ?? '').replace(/\*\*/g, '');
  const charW = size === 'small' ? 7 : 8.5;
  return clean.length * charW;
}

function estimateTextHeight(text, wrapWidth, size = 'body') {
  const lineH = size === 'small' ? 20 : 24;
  if (!wrapWidth || wrapWidth <= 0) return lineH;
  const approxWidth = estimateSingleLineWidth(text, size);
  const lines = Math.max(1, Math.ceil(approxWidth / wrapWidth));
  return lines * lineH;
}

/**
 * Validates loading skeleton rhythm and evaluated feedback geometry (#14):
 * - Loading skeletons mirror heading/stem/5-option/112x44 action rhythm, clear of sidebar, without overlaps.
 * - Evaluated feedback labels never collide horizontally or vertically with wrapped options or results.
 */
export function validateLoadingAndFeedbackGeometry(elements) {
  const errors = [];

  const frame = elements.question_loading_frame;
  const sidebar = elements.question_loading_sidebar;
  const h0 = elements.question_loading_heading0;
  const b0 = elements.question_loading_sk_button0;
  const h1 = elements.question_loading_heading1;
  if (!frame || !sidebar || !h0 || !b0 || !h1) {
    errors.push('Missing required question_loading skeleton elements');
  } else {
    const mainLeft = sidebar.x + sidebar.w;
    const skBlocks = [];
    if (elements.question_loading_s0) {
      skBlocks.push({ id: 'question_loading_s0', ...elements.question_loading_s0 });
    }
    for (const [id, el] of Object.entries(elements)) {
      if (/^question_loading_s0_/.test(id)) skBlocks.push({ id, ...el });
    }
    skBlocks.sort((a, b) => a.y - b.y);

    for (const row of [h0, ...skBlocks, b0, h1]) {
      if (row.x < mainLeft) {
        errors.push(`Skeleton element ${row.id ?? 'item'} intrudes into sidebar (${row.x} < ${mainLeft})`);
      }
      if (row.x + row.w > frame.x + frame.w || row.y + row.h > frame.y + frame.h) {
        errors.push(`Skeleton element ${row.id ?? 'item'} overflows loading frame`);
      }
    }
    if (b0.w !== 112 || b0.h !== 44) {
      errors.push(`question_loading_sk_button0 footprint ${b0.w}x${b0.h} does not match 112x44 Answer button`);
    }
    if (skBlocks.length > 0) {
      const lastRow = skBlocks[skBlocks.length - 1];
      if (b0.y < lastRow.y + lastRow.h) {
        errors.push(`question_loading_sk_button0 (y=${b0.y}) overlaps skeleton body (bottom=${lastRow.y + lastRow.h})`);
      }
    }
    if (h1.y < b0.y + b0.h + 12) {
      errors.push(`question_loading_heading1 (y=${h1.y}) collides with question_loading_sk_button0 (bottom=${b0.y + b0.h})`);
    }
    if (elements.question_loading_s1) {
      const s1 = elements.question_loading_s1;
      if (s1.y < h1.y + h1.h) {
        errors.push(`question_loading_s1 (y=${s1.y}) overlaps question_loading_heading1`);
      }
      if (s1.y + s1.h > frame.y + frame.h) {
        errors.push(`question_loading_s1 overflows loading frame bottom`);
      }
    }
  }

  for (const prefix of ['desktop_q', 'feedback_correct', 'anatomy_q']) {
    for (const [k, badgeSuffix] of [[1, 'correct'], [2, 'wrong']]) {
      const opt = elements[`${prefix}_option${k}`];
      const badge = elements[`${prefix}_${badgeSuffix}`];
      if (!opt || !badge) continue;
      const optHeight = estimateTextHeight(opt.text, opt.wrap, opt.size);
      const sameRow = Math.abs(badge.y - opt.y) < 16;
      if (sameRow) {
        const optWidth = Math.min(opt.wrap ?? 9999, estimateSingleLineWidth(opt.text, opt.size));
        if (badge.x < opt.x + optWidth + 8) {
          errors.push(`Inline feedback ${prefix}_${badgeSuffix} (x=${badge.x}) collides with ${prefix}_option${k} (right=${Math.round(opt.x + optWidth)})`);
        }
      } else if (badge.y < opt.y + optHeight) {
        errors.push(`Stacked feedback ${prefix}_${badgeSuffix} (y=${badge.y}) collides with ${prefix}_option${k} (bottom=${opt.y + optHeight})`);
      }
      const nextOpt = elements[`${prefix}_option${k + 1}`];
      if (nextOpt && !sameRow && nextOpt.y < badge.y + 20) {
        errors.push(`Next option ${prefix}_option${k + 1} (y=${nextOpt.y}) collides with ${prefix}_${badgeSuffix} (bottom=${badge.y + 20})`);
      }
    }
  }

  const checkLongBlock = (opt1Id, fb1Id, opt2Id, fb4Id, resultId, lockedId) => {
    const opt1 = elements[opt1Id];
    const fb1 = elements[fb1Id];
    const opt2 = elements[opt2Id];
    const fb4 = elements[fb4Id];
    const result = elements[resultId];
    const locked = elements[lockedId];
    if (!opt1 || !fb1 || !opt2 || !fb4 || !result || !locked) {
      errors.push(`Missing long-content feedback elements (${opt1Id}..${lockedId})`);
      return;
    }
    const opt1Bottom = opt1.y + estimateTextHeight(opt1.text, opt1.wrap, opt1.size);
    if (fb1.y < opt1Bottom) {
      errors.push(`${fb1Id} (y=${fb1.y}) overlaps wrapped ${opt1Id} (bottom=${opt1Bottom})`);
    }
    if (opt2.y < fb1.y + 20) {
      errors.push(`${opt2Id} (y=${opt2.y}) collides with ${fb1Id} (bottom=${fb1.y + 20})`);
    }
    if (result.y < fb4.y + 20) {
      errors.push(`${resultId} (y=${result.y}) collides with ${fb4Id} (bottom=${fb4.y + 20})`);
    }
    const resultHeight = estimateTextHeight(result.text, result.wrap, result.size);
    const resultRight = result.x + Math.min(result.wrap ?? 9999, estimateSingleLineWidth(result.text, result.size));
    if (Math.abs(locked.y - result.y) < 16) {
      if (locked.x < resultRight + 8) {
        errors.push(`${lockedId} (x=${locked.x}) collides with ${resultId} (right=${Math.round(resultRight)})`);
      }
    } else if (locked.y < result.y + resultHeight) {
      errors.push(`${lockedId} (y=${locked.y}) overlaps stacked ${resultId} (bottom=${result.y + resultHeight})`);
    }
  };

  checkLongBlock('long_option1', 'long_feedback1', 'long_option2', 'long_feedback4', 'long_result', 'long_locked');
  if (elements.long320_frame) {
    checkLongBlock('long320_o1', 'long320_f1', 'long320_o2', 'long320_f4', 'long320_result', 'long320_locked');
  }

  return errors;
}

test('coverage gate accepts valid state and catches missing obligations and specification criteria (#17, #18)', () => {
  const { state, ids } = loadBaselineFixture();
  assert.deepEqual(checkFidelityCoverage(state, ids), []);

  const missingObligation = structuredClone(state);
  missingObligation.highFidelity.coverageGate.obligations =
    missingObligation.highFidelity.coverageGate.obligations.filter((o) => o.id !== 'navigation-collapsed');
  assert.match(checkFidelityCoverage(missingObligation, ids).join('\n'), /Required obligation omitted navigation-collapsed/);

  const missingSpec = structuredClone(state);
  missingSpec.highFidelity.specificationGate.criteria =
    missingSpec.highFidelity.specificationGate.criteria.filter((c) => c.id !== 'responsive');
  assert.match(checkFidelityCoverage(missingSpec, ids).join('\n'), /Missing specification evidence: responsive/);

  const brokenTarget = structuredClone(state);
  brokenTarget.highFidelity.coverageGate.obligations[0].elementIds.push('nonexistent_element');
  assert.match(checkFidelityCoverage(brokenTarget, ids).join('\n'), /Missing target .* nonexistent_element/);

  const unblockedAdvance = structuredClone(state);
  unblockedAdvance.highFidelity.coverageGate.status = 'ready';
  assert.match(checkFidelityCoverage(unblockedAdvance, ids).join('\n'), /Coverage gate must remain blocked/);

  const missingStudy = structuredClone(state);
  missingStudy.highFidelity.supportingStudies = missingStudy.highFidelity.supportingStudies.filter((s) => s !== 'controls');
  assert.match(checkFidelityCoverage(missingStudy, ids).join('\n'), /Missing supporting study section/);

  const driftedSpec = structuredClone(state);
  driftedSpec.highFidelity.structuralSpec.surfaceRadius.shell = 12;
  assert.match(checkFidelityCoverage(driftedSpec, ids).join('\n'), /Missing or drifted structuralSpec/);

  const duplicateRailBrand = structuredClone(state);
  const dupIds = new Set([...ids, 'rail_brand1']);
  assert.match(checkFidelityCoverage(duplicateRailBrand, dupIds).join('\n'), /Duplicate collapsed rail brand element present: rail_brand1/);

  assert.deepEqual(checkCurrentFidelityCoverage(), []);
});

test('collapsed rail toggle validator accepts in-place swap and rejects 48px vertical offset or duplicate control (#11)', () => {
  const valid = {
    collapsed_sidebar: { type: 'image', x: 0, y: 48, w: 64, h: 900 },
    collapsed_brand: { type: 'image', x: 22, y: 68, w: 20, h: 20 },
    rail0: { type: 'image', x: 0, y: 344, w: 64, h: 248 },
    rail_brand0: { type: 'image', x: 22, y: 364, w: 20, h: 20 },
    rail1: { type: 'image', x: 104, y: 344, w: 64, h: 248 },
    rail_hover: { type: 'shape', kind: 'rounded', x: 114, y: 352, w: 44, h: 44 },
    rail_toggle1: { type: 'image', x: 126, y: 364, w: 20, h: 20 },
    rail2: { type: 'image', x: 208, y: 344, w: 64, h: 248 },
    rail_focus: { type: 'image', x: 213, y: 347, w: 54, h: 54 },
    rail_toggle2: { type: 'image', x: 230, y: 364, w: 20, h: 20 },
    rail3: { type: 'image', x: 312, y: 344, w: 64, h: 248 },
    rail_toggle3: { type: 'image', x: 334, y: 364, w: 20, h: 20 },
    rail4: { type: 'image', x: 416, y: 344, w: 64, h: 248 },
    rail_pressed: { type: 'shape', kind: 'rounded', x: 426, y: 352, w: 44, h: 44 },
    rail_toggle4: { type: 'image', x: 438, y: 364, w: 20, h: 20 },
  };
  assert.deepEqual(validateCollapsedRailToggle(valid, { requirePressed: true }), []);

  const offset48 = structuredClone(valid);
  offset48.rail_toggle1.y += 48;
  offset48.rail_hover.y += 48;
  assert.match(validateCollapsedRailToggle(offset48).join('\n'), /vertical offset mismatch/);

  const duplicate = structuredClone(valid);
  duplicate.rail_brand1 = { type: 'image', x: 126, y: 364, w: 20, h: 20 };
  assert.match(validateCollapsedRailToggle(duplicate).join('\n'), /Duplicate control: rail_brand1/);
});

test('App Shell validator accepts flush borderless square surfaces and rejects borders, radii, shapes, and non-flush seams (#19)', () => {
  const svgRect = (x, y, w, h, fill) => ({
    type: 'image',
    x,
    y,
    w,
    h,
    src: 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${fill}"/></svg>`),
  });
  const pairs = [{ name: 'desktop', frameId: 'desktop_frame', sidebarId: 'desktop_sidebar', surfaceIds: ['rail0'] }];
  const valid = {
    desktop_frame: svgRect(0, 48, 1280, 900, '#ffffff'),
    desktop_sidebar: svgRect(0, 48, 272, 900, '#f1f1f1'),
    rail0: svgRect(0, 344, 64, 248, '#f1f1f1'),
  };
  assert.deepEqual(validateAppShellSurfaces(valid, pairs), []);

  const shapeRect = structuredClone(valid);
  shapeRect.desktop_frame = { type: 'shape', kind: 'rect', x: 0, y: 48, w: 1280, h: 900 };
  assert.match(validateAppShellSurfaces(shapeRect, pairs).join('\n'), /uses shape \(rect\)/);

  const bordered = structuredClone(valid);
  bordered.desktop_sidebar.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg"><rect width="272" height="900" fill="#f1f1f1" stroke="#cccccc"/></svg>');
  assert.match(validateAppShellSurfaces(bordered, pairs).join('\n'), /Unintended SVG border stroke/);

  const roundedSvg = structuredClone(valid);
  roundedSvg.rail0.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg"><rect width="64" height="248" rx="12" fill="#f1f1f1"/></svg>');
  assert.match(validateAppShellSurfaces(roundedSvg, pairs).join('\n'), /Unintended SVG corner radius/);

  const nonFlush = structuredClone(valid);
  nonFlush.desktop_sidebar.x = 4;
  assert.match(validateAppShellSurfaces(nonFlush, pairs).join('\n'), /Non-flush seam/);
});

test('loading skeleton and feedback geometry validator accepts clean layout and rejects collisions (#14)', () => {
  const valid = {
    question_loading_frame: { x: 0, y: 80, w: 740, h: 400 },
    question_loading_sidebar: { x: 0, y: 80, w: 224, h: 400 },
    question_loading_heading0: { x: 248, y: 108, w: 116, h: 16 },
    question_loading_s0: { x: 248, y: 138, w: 468, h: 214 },
    question_loading_sk_button0: { x: 248, y: 364, w: 112, h: 44 },
    question_loading_heading1: { x: 248, y: 432, w: 116, h: 16 },
    question_loading_s1: { x: 248, y: 460, w: 468, h: 14 },
    desktop_q_option1: { x: 340, y: 177, text: 'B. GET', size: 'body', wrap: 600 },
    desktop_q_correct: { x: 340, y: 202, text: 'Correct', size: 'small', wrap: 600 },
    desktop_q_option2: { x: 340, y: 236, text: 'C. PATCH', size: 'body', wrap: 600 },
    long_option1: { x: 76, y: 217, text: 'Attach a unique operation identifier and ensure that retries with the same identifier do not create another record.', size: 'body', wrap: 900 },
    long_feedback1: { x: 76, y: 269, text: 'Correct', size: 'small', wrap: 900 },
    long_option2: { x: 76, y: 306, text: 'Disable all retries.', size: 'body', wrap: 900 },
    long_feedback4: { x: 76, y: 420, text: 'Your answer', size: 'small', wrap: 900 },
    long_result: { x: 24, y: 460, text: '**Incorrect answer**', size: 'body', wrap: 184 },
    long_locked: { x: 216, y: 462, text: 'Answer locked', size: 'small', wrap: 760 },
  };
  assert.deepEqual(validateLoadingAndFeedbackGeometry(valid), []);

  const skeletonOverlap = structuredClone(valid);
  skeletonOverlap.question_loading_heading1.y = 390;
  assert.match(validateLoadingAndFeedbackGeometry(skeletonOverlap).join('\n'), /collides with question_loading_sk_button0/);

  const wrongButtonSize = structuredClone(valid);
  wrongButtonSize.question_loading_sk_button0.h = 30;
  assert.match(validateLoadingAndFeedbackGeometry(wrongButtonSize).join('\n'), /does not match 112x44/);

  const feedbackCollision = structuredClone(valid);
  feedbackCollision.long_feedback1.y = 240;
  assert.match(validateLoadingAndFeedbackGeometry(feedbackCollision).join('\n'), /overlaps wrapped long_option1/);

  const inlineCollision = structuredClone(valid);
  inlineCollision.desktop_q_correct = { x: 410, y: 179, text: 'Correct', size: 'small', wrap: 600 };
  inlineCollision.desktop_q_option1.text = 'B. Attach a unique operation identifier before retrying';
  assert.match(validateLoadingAndFeedbackGeometry(inlineCollision).join('\n'), /Inline feedback desktop_q_correct .* collides/);
});

test('live High-Fidelity board satisfies element cap, App Shell geometry, rail swap, skeleton/feedback invariants, and required state coverage', () => {
  const hf = require('./high-fidelity-components.cjs');
  const { meta } = loadBaselineFixture();
  assert.ok(meta.order.length <= MAX_BOARD_ELEMENTS, `Element count ${meta.order.length} exceeds ${MAX_BOARD_ELEMENTS}`);
  assert.equal(meta.order.length, Object.keys(hf.elements).length, 'meta.json order out of sync with high-fidelity-components.cjs');

  assert.deepEqual(validateCollapsedRailToggle(hf.elements, { requirePressed: true }), []);

  const shellPairs = [
    { name: 'desktop', frameId: 'desktop_frame', sidebarId: 'desktop_sidebar' },
    { name: 'collapsed', frameId: 'collapsed_frame', sidebarId: 'collapsed_sidebar' },
    { name: 'drawer', frameId: 'drawer_frame', sidebarId: 'drawer_drawer', allowOverlayRightRadius: true },
    { name: 'narrow', frameId: 'narrow_frame', sidebarId: 'narrow_sidebar' },
    { name: 'desktop_risk', frameId: 'desktop_risk_frame', sidebarId: 'desktop_risk_sidebar' },
    { name: 'question_loading', frameId: 'question_loading_frame', sidebarId: 'question_loading_sidebar' },
    { name: 'question_empty', frameId: 'question_empty_frame', sidebarId: 'question_empty_sidebar' },
    { name: 'question_failure', frameId: 'question_failure_frame', sidebarId: 'question_failure_sidebar' },
    { name: 'navigation_empty', frameId: 'navigation_empty_frame', sidebarId: 'navigation_empty_sidebar' },
    { name: 'navigation_loading', frameId: 'navigation_loading_frame', sidebarId: 'navigation_loading_sidebar' },
    { name: 'navigation_failure', frameId: 'navigation_failure_frame', sidebarId: 'navigation_failure_sidebar' },
  ];
  const standaloneShellIds = [
    'phone_frame', 'phone_en_frame', 'phone320_frame', 'continuation_frame', 'long320_frame',
    'rail0', 'rail1', 'rail2', 'rail3', 'rail4', 'rail5',
    'redline_desktop', 'redline_sidebar', 'responsive_sidebar0', 'responsive_sidebar1',
  ];
  assert.deepEqual(validateAppShellSurfaces(hf.elements, shellPairs, standaloneShellIds), []);
  assert.deepEqual(validateLoadingAndFeedbackGeometry(hf.elements), []);

  // Verify phone open/close contextual glyphs at identical relative coordinates and EN/pt-BR parity
  assert.equal(hf.elements.phone_frame.w, hf.elements.phone_en_frame.w);
  assert.equal(hf.elements.drawer_toggle.x - hf.elements.drawer_frame.x, hf.elements.drawer_drawer_toggle.x - hf.elements.drawer_drawer.x);
  assert.equal(hf.elements.drawer_toggle.y - hf.elements.drawer_frame.y, hf.elements.drawer_drawer_toggle.y - hf.elements.drawer_drawer.y);
  assert.notEqual(hf.elements.drawer_toggle.src, hf.elements.drawer_drawer_toggle.src);

  // Verify Section 04/06/08/11 interaction studies exist
  for (const id of [
    'desktop_risk_warning',
    'pagination_state_rest', 'pagination_state_hover', 'pagination_state_pressed', 'pagination_state_focus', 'pagination_state_current', 'pagination_state_disabled',
    'nav_state_rest', 'nav_state_hover', 'nav_state_focus', 'nav_state_active', 'nav_state_active_hover', 'nav_state_active_focus',
    'option_state_selected_hover_row', 'option_state_locked_row', 'option_state_pending_row',
    'action_tip_bubble', 'action_tip_text',
  ]) {
    assert.ok(hf.elements[id], `Missing High-Fidelity study element: ${id}`);
  }
});
