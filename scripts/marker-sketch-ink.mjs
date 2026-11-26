// Project-owned, non-destructive visual ink pass. Native hit paths and board data stay unchanged.
export function seed(id) {
  let n = 2166136261;
  for (const c of String(id)) n = Math.imul(n ^ c.charCodeAt(0), 16777619);
  return (n >>> 0) / 4294967296;
}
const round = n => Math.round(n * 100) / 100 || 0;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export function inkProfile(id, span, width) {
  const micro = clamp(span / 25, 0.2, 1);
  return {
    amplitude: Math.min(2.5, Math.max(0.18, span * 0.046)) * (0.72 + seed(id + ':amp') * 0.28),
    width: round(width * (0.94 + seed(id + ':weight') * 0.12)),
    step: clamp(span / 12, 1.15, 20),
    micro,
  };
}
export function sketchPath(sample, length, span, id, width) {
  if (!Number.isFinite(length) || length < 2 || !Number.isFinite(span) || span < 1) return null;
  const p = inkProfile(id, span, width);
  const first = sample(0), last = sample(length);
  const closed = Math.hypot(first.x - last.x, first.y - last.y) < 0.7;
  const n = clamp(Math.ceil(length / p.step), 6, 320);
  const knots = Array.from({length: 7}, (_, i) => seed(id + ':drift:' + i) * 2 - 1);
  const points = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, s = length * t, q = sample(s);
    if (i === 0 || i === n) { points.push(i === n && closed ? first : q); continue; }
    const d = Math.min(p.step * 0.4, length / 80);
    const a = sample(Math.max(0, s - d)), b = sample(Math.min(length, s + d));
    const tx = b.x - a.x, ty = b.y - a.y, norm = Math.hypot(tx, ty) || 1;
    const k = t * (knots.length - 1), j = Math.min(knots.length - 2, Math.floor(k));
    const u = k - j, blend = u * u * (3 - 2 * u);
    const drift = knots[j] * (1 - blend) + knots[j + 1] * blend;
    // Protect endpoints and joins; use bounded, non-periodic, correlated drift.
    const fade = Math.min(1, t * 9, (1 - t) * 9);
    const offset = p.amplitude * drift * fade;
    points.push({ x: q.x - ty / norm * offset, y: q.y + tx / norm * offset });
  }
  // Quadratic midpoint smoothing retains hand-drawn curves without high-frequency jitter.
  let d = 'M ' + round(points[0].x) + ' ' + round(points[0].y);
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1];
    d += ' Q ' + round(a.x) + ' ' + round(a.y) + ' ' + round((a.x+b.x)/2) + ' ' + round((a.y+b.y)/2);
  }
  const end = points.at(-1);
  d += ' L ' + round(end.x) + ' ' + round(end.y);
  return { d, width: p.width, closed, points, amplitude: p.amplitude };
}
export function installSketchInk(root = document) {
  const html = root.documentElement;
  const cache = new WeakMap();
  let queued = false;
  function render() {
    queued = false;
    if (!html.hasAttribute('data-exam-marker-sketch')) return;
    for (const svg of root.querySelectorAll('svg.wb-stroke[data-wb-id]')) {
      const ink = svg.querySelector('.wb-stroke-ink'), hit = svg.querySelector('.wb-hit');
      if (!ink || !hit) continue;
      const d = hit.getAttribute('d'), currentWidth = Number(ink.getAttribute('stroke-width'));
      if (!d || !Number.isFinite(currentWidth) || currentWidth <= 0) continue;
      const prior = cache.get(ink);
      if (prior && prior.original === d && ink.getAttribute('d') === prior.rendered && currentWidth === prior.width) continue;
      const width = prior && currentWidth === prior.width ? prior.baseWidth : currentWidth;
      try {
        const length = hit.getTotalLength(), box = hit.getBBox(), span = Math.max(box.width, box.height);
        const result = sketchPath(s => hit.getPointAtLength(s), length, span, svg.getAttribute('data-wb-id'), width);
        if (!result) continue;
        cache.set(ink, {original:d, rendered:result.d, width:result.width, baseWidth:width});
        ink.setAttribute('d', result.d);
        ink.setAttribute('stroke-width', String(result.width));
        ink.setAttribute('data-exam-sketch-ink', 'true');
      } catch { /* Preserve native ink if a path is not measurable yet. */ }
    }
  }
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(render); } };
  const observer = new MutationObserver(schedule);
  observer.observe(html, {subtree:true, childList:true, attributes:true, attributeFilter:['d','stroke-width','data-exam-marker-sketch']});
  schedule();
  return () => observer.disconnect();
}
if (typeof document !== 'undefined') installSketchInk();
