// Visão de features do Board Mestre. Lê feature-links.json (gerado por build_feature_links.py).
// Fluxo de retorno: Feature -> Evidência / Grupo -> Board Mestre (#grp-<bloco>) -> Mapa.
(function () {
  const LINKS_URL = 'feature-links.json', MERMAID_URL = 'vendor/mermaid-11.4.1.min.js';
  let FL = null, mermaidP = null, fstatus = '';
  const $$ = id => document.getElementById(id);
  const e = s => esc(s);
  const STATUS_LABEL = { implementado: 'Implementado', parcial: 'Parcial' };
  const badge = (t, cls) => '<span class="tag' + (cls ? ' ' + cls : '') + '">' + e(t) + '</span>';
  const link = (href, text, ext) => '<a href="' + e(href) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + e(text) + '</a>';

  function loadMermaid() {
    if (!mermaidP) mermaidP = new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = MERMAID_URL; s.onload = () => {
        try { window.mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default' }); res(window.mermaid); } catch (x) { rej(x); }
      }; s.onerror = () => rej(new Error('cdn')); document.head.appendChild(s);
    });
    return mermaidP;
  }
  function setStatus(t, err) { const el = $$('status'); el.className = err ? 'err' : 'empty'; el.textContent = t; }
  function filtered() {
    const q = ($$('q').value || '').trim().toLowerCase();
    return FL.features.filter(f => !window.__fstat || f.status === window.__fstat).filter(f => !q || [f.title, f.id, f.status, ...f.sintese].join(' ').toLowerCase().includes(q));
  }

  function renderList() {
    const main = $$('main'); main.className = '';
    const all = FL.features;
    const statuses = [...new Set(all.map(f => f.status))];
    const filters = '<div class="area-actions" role="group" aria-label="Filtrar por estado"><button type="button" data-fs="" aria-pressed="' + (!window.__fstat) + '">Todos os estados</button>' + statuses.map(s => '<button type="button" data-fs="' + e(s) + '" aria-pressed="' + (window.__fstat === s) + '">' + e(STATUS_LABEL[s] || s) + '</button>').join('') + '</div>';
    const cards = filtered().map(f => {
      const ev = f.evidencias.length, imgs = f.evidencias.filter(x => x.src).length;
      return '<article class="card"><h3><a href="#feature/' + e(f.id) + '">' + e(f.title) + '</a></h3><div class="meta">' + badge(STATUS_LABEL[f.status] || f.status) + badge(ev + ' evidência(s)') + badge(imgs + ' imagem(ns)') + badge(f.testes.length + ' teste(s)') + '</div><p class="summary">' + e(f.sintese[0] || '') + '</p><div class="card-links"><a class="btn" href="#feature/' + e(f.id) + '">Abrir feature</a></div></article>';
    }).join('');
    main.innerHTML = '<section class="map-intro"><h2>Features do Exam App</h2><p>Vínculos vêm dos índices por ID (features-index.json e catalog.json). Itens inferidos aparecem marcados como "não verificado".</p></section>' + filters + '<div class="grid">' + (cards || '<p class="empty">Nenhuma feature com esses filtros.</p>') + '</div>';
    setStatus(filtered().length + ' de ' + all.length + ' features');
  }

  function evidenceHtml(f) {
    const imgs = f.evidencias.filter(x => x.src);
    const other = f.evidencias.filter(x => !x.src);
    const thumbs = imgs.map(x => '<figure class="ev"><a href="' + e(x.src) + '" target="_blank" rel="noopener" aria-label="Ampliar evidência ' + e(x.id) + '"><img src="' + e(x.src) + '" alt="Evidência ' + e(x.id) + ' (' + e(x.tipo) + (x.estado ? ', ' + e(x.estado) : '') + ')" loading="lazy"></a><figcaption>' + e(x.id) + ' · ' + e(x.tipo) + (x.estado ? ' · ' + e(x.estado) : '') + (x.data ? ' · ' + e(x.data) : '') + (x.issue ? ' · issue #' + x.issue : '') + '</figcaption></figure>').join('');
    const rows = other.map(x => '<li>' + link(x.repo_url, x.caminho, true) + ' <span class="meta">' + e(x.id) + ' · ' + e(x.tipo) + (x.data ? ' · ' + e(x.data) : '') + '</span></li>').join('');
    return '<div class="ev-grid">' + (thumbs || '<p class="empty">Sem imagens vinculadas.</p>') + '</div>' + (other.length ? '<details class="docs"><summary>Outras evidências (' + other.length + ')</summary><ul>' + rows + '</ul></details>' : '');
  }

  function renderDetail(id) {
    const f = FL.features.find(x => x.id === id);
    const main = $$('main'); main.className = 'feature';
    if (!f) { main.innerHTML = '<p class="err">Feature não encontrada. <a href="#features">Voltar às features</a></p>'; setStatus('Feature não encontrada', true); return; }
    const sint = '<ul>' + f.sintese.map(l => '<li>' + e(l.replace(/^- /, '').replace(/`/g, '')) + '</li>').join('') + '</ul>';
    const diagrams = FL.diagramas.map(d => '<figure class="diagram"><figcaption>' + e(d.title) + ' <span class="meta">' + e(d.page) + ' · contexto global, não específico desta feature</span></figcaption><div class="mermaid-box" data-mermaid="' + e(d.id) + '" aria-live="polite">Renderizando diagrama…</div><details><summary>Código Mermaid</summary><pre><code>' + e(d.mermaid) + '</code></pre></details></figure>').join('');
    const adrs = f.adrs.length ? '<ul>' + f.adrs.map(a => '<li>ADR ' + e(a.id) + ' — ' + e(a.title) + ' ' + badge(a.status) + ' <span class="meta">' + e(a.fonte) + '</span></li>').join('') + '</ul>' : '<p class="empty">Nenhum ADR citado no documento desta feature (vínculo por ID, não inferido).</p>';
    const groups = f.grupos.length ? '<ul>' + f.grupos.map(g => '<li><a href="#grp-' + e(g.blocks[0]) + '">' + e(g.name) + '</a> <span class="meta">Board ' + e(g.board) + ' · ' + badge('não verificado') + '</span></li>').join('') + '</ul>' : '<p class="empty">Nenhum grupo do Board Mestre ligado.</p>';
    const issues = f.issues.length ? f.issues.map(i => link(i.url, '#' + i.numero, true)).join(' · ') : 'Nenhuma issue vinculada.';
    const prs = f.prs.length ? f.prs.map(p => link(p.url, '#' + p.numero, true)).join(' · ') : 'Nenhum PR vinculado no índice.';
    const tests = f.testes.length ? '<ul>' + f.testes.map(t => '<li>' + link(t.repo_url, t.caminho, true) + ' <span class="meta">' + e(t.id) + ' · ' + e(t.data || '') + ' · resultado: não verificado neste índice</span></li>').join('') + '</ul>' : '<p class="empty">Nenhum teste executado vinculado.</p>';
    main.innerHTML =
      '<nav class="crumbs" aria-label="Trilha"><a href="#features">Features</a> / <span>' + e(f.title) + '</span> · <a href="#">Board Mestre</a></nav>' +
      '<header class="feat-head"><h2>' + e(f.title) + '</h2><div class="meta">' + badge(STATUS_LABEL[f.status] || f.status) + badge('id ' + f.id) + '</div></header>' +
      '<section class="sec" id="sec-sintese"><h3>Síntese</h3>' + sint + '<p class="meta">Fonte: ' + link(f.doc.url, f.doc.path, true) + '</p></section>' +
      '<section class="sec" id="sec-release"><h3>Estado de release</h3><p>' + badge(f.release.estado) + ' ' + e(f.release.observacao) + '</p></section>' +
      '<section class="sec" id="sec-diagramas"><h3>Arquitetura (diagramas)</h3>' + diagrams + '</section>' +
      '<section class="sec" id="sec-adrs"><h3>Decisões (ADRs)</h3>' + adrs + '</section>' +
      '<section class="sec" id="sec-issues"><h3>Issues e PRs</h3><p>Issues: ' + issues + '</p><p>PRs: ' + prs + '</p></section>' +
      '<section class="sec" id="sec-testes"><h3>Testes</h3>' + tests + '</section>' +
      '<section class="sec" id="sec-evidencias"><h3>Evidências (' + f.evidencias.length + ')</h3>' + evidenceHtml(f) + '</section>' +
      '<section class="sec" id="sec-grupos"><h3>Grupos do Board Mestre</h3>' + groups + '<p class="meta">Vínculo curado por nome de grupo: não verificado pelos índices.</p></section>' +
      '<p><a class="btn" href="#features">Voltar às features</a> <a class="btn" href="#">Voltar ao Board Mestre</a></p>';
    setStatus(f.title + ' · ' + f.evidencias.length + ' evidências · ' + f.testes.length + ' testes');
    drawDiagrams();
  }

  function drawDiagrams() {
    const boxes = [...document.querySelectorAll('[data-mermaid]')];
    if (!boxes.length) return;
    loadMermaid().then(m => Promise.all(boxes.map((box, i) => {
      const d = FL.diagramas.find(x => x.id === box.dataset.mermaid);
      return m.render('mmd-' + i + '-' + Date.now(), d.mermaid).then(r => { box.innerHTML = r.svg; }).catch(() => { box.textContent = 'Diagrama não renderizado; código disponível abaixo.'; });
    }))).catch(() => boxes.forEach(b => { b.textContent = 'Mermaid indisponível (CDN); código disponível abaixo.'; }));
  }

  function route() {
    const h = location.hash || '';
    if (!FL) return;
    document.body.classList.toggle('feat-mode', h.startsWith('#feature') || h === '#features');
    const vs = ['vm', 'vl', 'vg'];
    if (h.startsWith('#feature/')) { view = 'features'; renderDetail(decodeURIComponent(h.slice(9))); markFeatureBtn(); return; }
    if (h === '#features') { view = 'features'; renderList(); markFeatureBtn(); return; }
    if (h.startsWith('#grp-')) {
      const id = h.slice(5); view = 'grid'; area = ''; kind = ''; q = ''; $$('q').value = ''; $$('kind').value = '';
      render(); markFeatureBtn(false);
      const el = document.getElementById('grp-' + id); if (el) { el.setAttribute('tabindex', '-1'); el.scrollIntoView({ block: 'center' }); el.focus(); }
      return;
    }
    if (view === 'features') { view = 'map'; }
    markFeatureBtn(false); render();
  }
  function markFeatureBtn(on = true) {
    const b = $$('vf'); if (!b) return; b.setAttribute('aria-pressed', String(on));
    ['vm', 'vl', 'vg'].forEach(i => $$(i) && $$(i).setAttribute('aria-pressed', String(!on && $$(i).getAttribute('aria-pressed') === 'true')));
  }

  // Liga a barra e o campo de busca às duas visões.
  const tryInit = setInterval(() => {
    if (typeof M === 'undefined' || !M || !$$('vf')) return;
    clearInterval(tryInit);
    fetch(LINKS_URL).then(r => { if (!r.ok) throw 0; return r.json(); }).then(d => {
      FL = d;
      $$('vf').onclick = () => { location.hash = '#features'; };
      $$('q').addEventListener('input', () => { if (view === 'features' && (!location.hash || location.hash === '#features')) renderList(); });
      $$('main').addEventListener('click', ev => {
        const b = ev.target.closest('[data-fs]'); if (!b) return;
        window.__fstat = b.dataset.fs || ''; renderList();
      });
      ['vm', 'vl', 'vg'].forEach(i => $$(i).addEventListener('click', () => { if (location.hash.startsWith('#feature') || location.hash === '#features') location.hash = ''; }));
      window.addEventListener('hashchange', route);
      route();
    }).catch(() => setStatus('Não foi possível carregar feature-links.json', true));
  }, 50);
})();
