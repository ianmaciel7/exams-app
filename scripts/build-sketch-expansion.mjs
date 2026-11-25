import { writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'docs/releases/v0.1.0/sketch/db/elements';
const metaPath = 'docs/releases/v0.1.0/sketch/db/board/meta.json';

const elements = [];

function add(id, obj) {
  writeFileSync(join(dir, id + '.json'), JSON.stringify(obj));
  elements.push(id);
}

function hStroke(id, x, y, len, color = '#b8b8b8', width = 1.4) {
  add(id, {
    type: 'stroke',
    x, y,
    points: [0, 0, len * 0.25, 0.4, len * 0.5, 0.6, len * 0.75, 0.3, len, 0],
    width,
    color
  });
}

function vStroke(id, x, y, h, color = '#b8b8b8', width = 1.4) {
  add(id, {
    type: 'stroke',
    x, y,
    points: [0, 0, 0.4, h * 0.25, 0.6, h * 0.5, 0.3, h * 0.75, 0, h],
    width,
    color
  });
}

function box(prefix, x, y, w, h, color = '#b8b8b8', width = 1.4) {
  hStroke(`${prefix}_t`, x, y, w, color, width);
  vStroke(`${prefix}_r`, x + w, y, h, color, width);
  hStroke(`${prefix}_b`, x, y + h, w, color, width);
  vStroke(`${prefix}_l`, x, y, h, color, width);
}

function card(prefix, x, y, w, h, title = '', color = '#b8b8b8') {
  box(prefix, x, y, w, h, color, 1.5);
  if (title) {
    add(`${prefix}_title`, {
      type: 'text',
      x: x + 18,
      y: y + 20,
      text: title,
      size: 'large',
      color: '#ffffff'
    });
  }
}

function text(id, x, y, str, size = 'body', color = '#e0e0e0', wrap = null) {
  const obj = { type: 'text', x, y, text: str, size, color };
  if (wrap) obj.wrap = wrap;
  add(id, obj);
}

console.log('Regenerating Question — States & Variants with polished layout...');

// ==========================================
// SECTION HEADER & LEGEND
// ==========================================
text('sec_title', 1650, 60, 'Question — States & Variants', 'title', '#ffffff');
text('sec_subtitle', 1650, 110, 'Exhaustive exploration of the individual Question component: anatomy, interaction taxonomy, answer states, content variations, expanded drawers & interaction rules.', 'large', '#b0b0b0', 1600);

box('legend_box', 1650, 195, 1260, 75, '#555555', 1.2);
text('legend_t1', 1670, 210, 'LEGEND & STATUS CONVENTIONS:', 'body', '#ffeb3b');
text('legend_t2', 1670, 235, '[Confirmed] Project baseline decision   ·   [Reference] QConcursos/ExamTopics empirical pattern   ·   [Proposed] Open proposal pending review', 'body', '#d0d0d0');

const topY = 310;

// ==========================================
// COLUMN 1: ANATOMY & INTERACTIVE TAXONOMY
// (x: 1650 .. 2530, w: 880)
// ==========================================
const col1 = 1650;
let y1 = topY;

// 1. QUESTION ANATOMY
card('g1_box', col1, y1, 880, 800, '1. Question Anatomy & Structural Regions');
text('g1_desc', col1 + 20, y1 + 55, 'Detailed decomposition of every structural zone in the Question card [Reference: QConcursos live question layout].', 'body', '#a0a0a0', 840);

const qbY = y1 + 95;
box('qb_frame', col1 + 25, qbY, 830, 310, '#888888', 1.5);
// Header
text('qb_h1', col1 + 45, qbY + 20, '[1] Number: 01    [2] ID: Q4445036 (Link/Copy)    [3] Subject › [4] Topic (Links)', 'body', '#88aaff');
text('qb_h2', col1 + 45, qbY + 45, '[5] Year: 2026 · [6] Board: SELECON · [7] Org: Pref. Nova Mutum · [8] Exam: Aux. Biblioteca', 'body', '#a0a0a0');
text('qb_h3', col1 + 45, qbY + 70, '[9] Disclosure: + Associated text (Click to expand context passage)', 'body', '#88aaff');
hStroke('qb_div1', col1 + 45, qbY + 95, 790, '#444444', 1.0);

// Statement & Options
text('qb_stmt', col1 + 45, qbY + 110, '[10] Statement: Question prompt text (static markdown/typography)...', 'body', '#e0e0e0');
text('qb_optA', col1 + 45, qbY + 138, '[11] ( ) A   Option text description...                              [12] [X] Strike', 'body', '#c0c0c0');
text('qb_optB', col1 + 45, qbY + 162, '[11] (*) B   Correct answer text...               [Correct badge]     [12] [X] Strike', 'body', '#4caf50');
text('qb_optC', col1 + 45, qbY + 186, '[11] ( ) C   Option text description...                              [12] [X] Strike', 'body', '#c0c0c0');
text('qb_optD', col1 + 45, qbY + 210, '[11] ( ) D   Eliminated alternative text...       [Struck option]     [12] [X] Restore', 'body', '#777777');
hStroke('qb_div2', col1 + 45, qbY + 235, 790, '#444444', 1.0);

// Footer
text('qb_foot1', col1 + 45, qbY + 248, '[13] Action: [ Answer ] / [ Verify ]      Feedback: Correct answer        [14] Action: [ Report error ]', 'body', '#ffffff');
hStroke('qb_div3', col1 + 45, qbY + 272, 790, '#444444', 1.0);
text('qb_tabs', col1 + 45, qbY + 285, '[15] Resource Tabs:  Commented key  |  Lessons (3)  |  Comments  |  Statistics  |  Notebooks  |  Notes', 'body', '#88aaff');

// Anatomy Mapping Table
const atY = qbY + 330;
text('at_title', col1 + 25, atY, 'Anatomy Element Map & Functional Types:', 'body', '#ffeb3b');
const anatomyRows = [
  '1. Question Number: Static text indicating list index. [Confirmed]',
  '2. Question ID: Interactive link / Copy action to clipboard. [Reference]',
  '3. Subject: Link navigating to filtered questions list in subject. [Confirmed]',
  '4. Topic: Link navigating to filtered questions list in topic. [Confirmed]',
  '5-8. Provenance: Year (static), Board (link), Org (link), Exam (link to booklet). [Confirmed]',
  '9. Associated Text: Disclosure control expanding reading passage inline. [Confirmed]',
  '10. Statement: Static textual & rich media exam prompt. [Confirmed]',
  '11. Alternatives: Single-choice exclusive radio group (options A-E). [Confirmed]',
  '12. Strike alternative: Icon button toggling elimination of distracted choice. [Reference]',
  '13. Answer / Verify: Primary button confirming choice; triggers evaluation. [Confirmed]',
  '14. Report Error: Contextual action link opening error notification modal. [Reference]',
  '15. Resource Tabs: Mutually exclusive region switchers below divider. [Reference]'
];
anatomyRows.forEach((r, idx) => {
  text(`at_r${idx}`, col1 + 25, atY + 26 + (idx * 26), r, 'body', '#d0d0d0');
});

// 2. INTERACTIVE ELEMENTS TAXONOMY
y1 += 830;
card('g2_box', col1, y1, 880, 890, '2. Interactive Elements Taxonomy');
text('g2_desc', col1 + 20, y1 + 55, 'Visual legend and behavioral semantics of all 12 control types found in the Question component.', 'body', '#a0a0a0', 840);

const taxonomy = [
  { type: 'Static text', repr: 'Ano: 2026 · Questão 01', note: 'Non-clickable information text without interactive affordance.' },
  { type: 'Link', repr: 'Português  (underlined text)', note: 'Navigates to filtered destination or opens reference source.' },
  { type: 'Button', repr: '[ Answer ]  /  [ Verify ]', note: 'Outlined primary action container triggering command or modal.' },
  { type: 'Icon button', repr: '[X] (Strike)  ·  [+] (Expand)', note: 'Compact icon-only control with tooltip explaining specific action.' },
  { type: 'Radio button', repr: '( ) Unselected   ·   (*) Selected', note: 'Mutually exclusive option selector; only one choice active per question.' },
  { type: 'Checkbox', repr: '[ ] Unchecked   ·   [v] Checked', note: 'Independent toggle selector (used in Notebooks tab and bulk filters).' },
  { type: 'Toggle switch', repr: '( O ) Auto-check ON / OFF', note: 'Two-state persistent setting governing answer verification mode.' },
  { type: 'Tab control', repr: '[ Commented key ]  |  Comments', note: 'Switches visibility of drawer regions without page reloading.' },
  { type: 'Dropdown', repr: 'Subject ▾  ·  Status ▾', note: 'Filter trigger displaying contextual selection menu on click.' },
  { type: 'Disclosure', repr: '+ Associated text  /  - Collapse', note: 'Accordions/drawers revealing hidden contextual content inline.' },
  { type: 'Badge', repr: '[ Q4445036 ]  ·  [ Correct ]', note: 'Visual status or metadata pill (can be static or copy-enabled).' },
  { type: 'Tooltip', repr: 'Hover bubble: "Eliminate alternative"', note: 'Transient contextual hint shown on hover or keyboard focus.' }
];

taxonomy.forEach((item, idx) => {
  const rowY = y1 + 90 + (idx * 65);
  box(`tax_b${idx}`, col1 + 25, rowY, 830, 56, '#444444', 1.0);
  text(`tax_t${idx}`, col1 + 40, rowY + 12, `${item.type}:`, 'body', '#88aaff');
  text(`tax_r${idx}`, col1 + 175, rowY + 12, item.repr, 'body', '#ffffff');
  text(`tax_n${idx}`, col1 + 40, rowY + 34, item.note, 'body', '#a0a0a0');
});


// ==========================================
// COLUMN 2: ANSWER STATES (14 STATES)
// (x: 2580 .. 3490, w: 910)
// ==========================================
const col2 = 2580;
let y2 = topY;

card('g3_box', col2, y2, 910, 1720, '3. Question Answer & Verification States');
text('g3_desc', col2 + 20, y2 + 55, 'Complete visual lifecycle of question answering across manual verification and auto-check modes.', 'body', '#a0a0a0', 870);

let stateY = y2 + 95;

function answerStateCard(prefix, title, tag, optA, optB, optC, optD, btnText, btnColor, statusMsg, statusColor, extraNote = '') {
  box(prefix, col2 + 25, stateY, 860, 210, '#666666', 1.2);
  text(`${prefix}_head`, col2 + 40, stateY + 15, title, 'large', '#ffffff');
  text(`${prefix}_tag`, col2 + 620, stateY + 15, `[ ${tag} ]`, 'body', '#ffeb3b');
  
  text(`${prefix}_a`, col2 + 45, stateY + 45, optA.text, 'body', optA.color || '#d0d0d0');
  text(`${prefix}_b`, col2 + 45, stateY + 68, optB.text, 'body', optB.color || '#d0d0d0');
  text(`${prefix}_c`, col2 + 45, stateY + 91, optC.text, 'body', optC.color || '#d0d0d0');
  text(`${prefix}_d`, col2 + 45, stateY + 114, optD.text, 'body', optD.color || '#d0d0d0');
  
  hStroke(`${prefix}_div`, col2 + 40, stateY + 140, 830, '#444444', 1.0);
  text(`${prefix}_btn`, col2 + 45, stateY + 155, btnText, 'body', btnColor);
  if (statusMsg) {
    text(`${prefix}_msg`, col2 + 220, stateY + 155, statusMsg, 'body', statusColor);
  }
  text(`${prefix}_rep`, col2 + 730, stateY + 155, 'Report error', 'body', '#888888');
  if (extraNote) {
    text(`${prefix}_note`, col2 + 45, stateY + 182, extraNote, 'body', '#88aaff');
  }
  stateY += 230;
}

// 3.1 Default / Unanswered
answerStateCard('st_def', '3.1 Default / Unanswered', 'Manual Verify Mode',
  { text: '( ) A  First proposed alternative description' },
  { text: '( ) B  Second proposed alternative description' },
  { text: '( ) C  Third proposed alternative description' },
  { text: '( ) D  Fourth proposed alternative description' },
  '[ Answer ] (Disabled)', '#666666', 'Select an alternative to enable verification', '#888888',
  'Rule: In manual mode, Answer button remains disabled until a radio button is selected.'
);

// 3.2 Selected Alternative
answerStateCard('st_sel', '3.2 Selected Alternative', 'Selection Active',
  { text: '( ) A  First proposed alternative description' },
  { text: '(*) B  Second proposed alternative description [Active Selection]', color: '#88aaff' },
  { text: '( ) C  Third proposed alternative description' },
  { text: '( ) D  Fourth proposed alternative description' },
  '[ Answer ] (Active)', '#ffffff', 'Ready to submit attempt', '#88aaff',
  'Behavior: Learner can switch between A, B, C, D freely without committing.'
);

// 3.3 Checking Answer / In-Flight
answerStateCard('st_chk', '3.3 Checking Answer', 'In-Flight Request',
  { text: '( ) A  First proposed alternative description', color: '#888888' },
  { text: '(*) B  Second proposed alternative description', color: '#88aaff' },
  { text: '( ) C  Third proposed alternative description', color: '#888888' },
  { text: '( ) D  Fourth proposed alternative description', color: '#888888' },
  '[ Verifying... ] (Loading)', '#ffeb3b', 'Evaluating response against exam answer key...', '#ffeb3b',
  'Non-blocking UI: Radio inputs locked during evaluation to prevent race conditions.'
);

// 3.4 Correct Answer
answerStateCard('st_cor', '3.4 Correct Answer', 'Evaluated: Success',
  { text: '( ) A  First proposed alternative description', color: '#888888' },
  { text: '● B  Second proposed alternative description               [Correct]', color: '#4caf50' },
  { text: '( ) C  Third proposed alternative description', color: '#888888' },
  { text: '( ) D  Fourth proposed alternative description', color: '#888888' },
  '[ Solved ]', '#4caf50', 'Correct answer! Attempt logged to study metrics.', '#4caf50',
  'Rule: Instant feedback reveals green badge; option locked; attempt stored.'
);

// 3.5 Incorrect Answer
answerStateCard('st_inc', '3.5 Incorrect Answer', 'Evaluated: Failed',
  { text: '( ) A  First proposed alternative description', color: '#888888' },
  { text: '● B  Second proposed alternative description               [Correct key]', color: '#4caf50' },
  { text: 'X C  Third proposed alternative description [Your Choice]   [Incorrect]', color: '#ff6b6b' },
  { text: '( ) D  Fourth proposed alternative description', color: '#888888' },
  '[ Retry Question ]', '#ffffff', 'Incorrect answer. Added to "Errei" (Missed questions) filter.', '#ff6b6b',
  'Rule: Learner choice highlighted in red; official answer key revealed in green.'
);

// 3.6 Previously Answered / Returning Session
answerStateCard('st_prev', '3.6 Previously Answered', 'Historic Attempt',
  { text: '( ) A  First proposed alternative description' },
  { text: '● B  Second proposed alternative description               [Correct]', color: '#4caf50' },
  { text: '( ) C  Third proposed alternative description' },
  { text: '( ) D  Fourth proposed alternative description' },
  '[ Retry ]', '#88aaff', 'Last attempted: 2026-11-24 · Result: Correct (1/1 attempts)', '#a0a0a0',
  'Rule: Returning to a previously answered question shows previous outcome and attempt count.'
);

// 3.7 Struck & Restored Alternatives
answerStateCard('st_strk', '3.7 Struck Alternatives (Elimination)', 'Focus Tool Active',
  { text: '( ) A  First proposed alternative description' },
  { text: '( ) B  Second proposed alternative description [Candidate focus]' },
  { text: '( ) C  ~~Third alternative description (ruled out by candidate)~~   [Struck]', color: '#777777' },
  { text: '( ) D  ~~Fourth alternative description (ruled out by candidate)~~  [Struck]', color: '#777777' },
  '[ Answer ] (Disabled)', '#666666', 'Options C and D struck out. Click [Restore] to undo elimination.', '#888888',
  'Rule: Struck alternatives cannot be selected by radio click until restored.'
);


// ==========================================
// COLUMN 3: CONTENT VARIANTS (16 VARIANTS)
// (x: 3540 .. 4610, w: 1070)
// ==========================================
const col3 = 3540;
let y3 = topY;

card('g4_box', col3, y3, 1070, 1850, '4. Question Content Variants & Real Exam Formats');
text('g4_desc', col3 + 20, y3 + 55, 'Accommodation of varied competition question architectures without layout breakage.', 'body', '#a0a0a0', 1030);

let varY = y3 + 95;

function contentVariantBox(prefix, title, formatTag, bodyRows, note = '') {
  box(prefix, col3 + 25, varY, 1020, 205, '#666666', 1.2);
  text(`${prefix}_head`, col3 + 40, varY + 15, title, 'large', '#ffffff');
  text(`${prefix}_tag`, col3 + 830, varY + 15, `[ ${formatTag} ]`, 'body', '#88aaff');
  
  bodyRows.forEach((r, idx) => {
    text(`${prefix}_r${idx}`, col3 + 45, varY + 44 + (idx * 21), r.text, 'body', r.color || '#d0d0d0');
  });
  
  if (note) {
    hStroke(`${prefix}_div`, col3 + 40, varY + 172, 990, '#444444', 1.0);
    text(`${prefix}_note`, col3 + 45, varY + 185, note, 'body', '#ffeb3b');
  }
  varY += 218;
}

// 4.1 Multiple Choice - 5 Alternatives (Dataprev / FGV)
contentVariantBox('v_5opt', '4.1 Five Alternatives Format (FGV Standard)', '5 Alternatives', [
  { text: 'Statement: Under Federal Law 14.133/2021, public software bidding requires...' },
  { text: '( ) A  Prior authorization from the Ministry of Management' },
  { text: '( ) B  Technical viability study and risk management matrix' },
  { text: '( ) C  Exclusive adoption of open-source repository licensing' },
  { text: '( ) D  Exemption from preliminary technical study for cloud migration' },
  { text: '( ) E  Mandatory arbitration clause in contractual disputes' }
], 'Dataprev 2026 IT Analyst official booklet standard: 5 options A-E, single correct key.');

// 4.2 Multiple Choice - 4 Alternatives (Selecon)
contentVariantBox('v_4opt', '4.2 Four Alternatives Format (Selecon Standard)', '4 Alternatives', [
  { text: 'Statement: In relational database normalization, a relation is in 3NF if...' },
  { text: '( ) A  Every non-prime attribute is fully functionally dependent on candidate key' },
  { text: '( ) B  It is in 2NF and has no transitive dependencies for non-prime attributes' },
  { text: '( ) C  Multi-valued dependencies are eliminated across all composite keys' },
  { text: '( ) D  Every determinant is a superkey within the schema relation' }
], 'Selecon municipal competition standard: 4 options A-D, single correct key.');

// 4.3 True or False Format (Cebraspe / Cespe)
contentVariantBox('v_cebraspe', '4.3 Right or Wrong (Certo / Errado — Cebraspe)', '2 Alternatives', [
  { text: 'Statement: Regarding ACID transaction properties in distributed databases, assess:' },
  { text: '"Two-phase commit (2PC) guarantees atomic commitment across all participating nodes."' },
  { text: '( ) CERTO   (Right / True)' },
  { text: '( ) ERRADO  (Wrong / False)' }
], 'Cebraspe format: Binary evaluation with negative penalty scoring (1 wrong cancels 1 right).');

// 4.4 Long Multiline Statement
contentVariantBox('v_longstmt', '4.4 Long Passage Statement with Reading Guidance', 'Long Text', [
  { text: 'Paragraph 1: In microservice architecture, distributed tracing propagates correlation...' },
  { text: 'Paragraph 2: OpenTelemetry unifies traces, metrics and logs into a single telemetry SDK...' },
  { text: 'Question prompt: Based on the architectural scenario above, the span exporter should...' },
  { text: '( ) A  Buffer telemetry asynchronously in memory before batch exporting to collector' },
  { text: '( ) B  Block HTTP request threads synchronously until backend ingest confirms write' }
], 'Accommodates multi-paragraph prompts with clear visual separation from alternatives.');

// 4.5 Expanded Associated Text Disclosure
contentVariantBox('v_assoc', '4.5 Associated Text Expanded Inline', 'Disclosure Open', [
  { text: '- Associated text [Collapse text]:' },
  { text: '| "The National Cloud Computing Strategy establishes sovereignty guidelines for' },
  { text: '| federal public data storage, mandating cryptographic boundary isolation..."' },
  { text: 'Statement: According to the guideline excerpted above, cryptographic isolation requires...' },
  { text: '( ) A  Hardware security module (HSM) FIPS 140-3 Level 3 certification' }
], 'Expanded text passage renders with left vertical accent bar and distinct background tone.');

// 4.6 Rich Media: Source Code Block
contentVariantBox('v_code', '4.6 Code Snippet Content (IT Analyst Exam)', 'Source Code', [
  { text: 'Statement: Consider the following TypeScript function executing under Node.js:' },
  { text: '  const stream = fs.createReadStream("dump.bin", { highWaterMark: 64 * 1024 });' },
  { text: '  stream.on("data", (chunk) => { bufferPool.push(chunk); });' },
  { text: 'Question: If backpressure is not handled, the memory impact will be:' },
  { text: '( ) A  Unbounded heap allocation leading to Process OOM crash' }
], 'Monospace font styling with preserved indentation and subtle background tint.');

// 4.7 Rich Media: Data Table in Statement
contentVariantBox('v_table', '4.7 Data Table in Question Statement', 'Tabular Data', [
  { text: 'Statement: The following table records sprint velocity and defect counts:' },
  { text: '  Sprint   Story Points   Defects Found   Escape Defect Rate' },
  { text: '  S1       42             3               7.1%' },
  { text: '  S2       48             1               2.0%' },
  { text: '( ) A  Sprint 2 showed a 71.8% reduction in escape defect rate relative to S1' }
], 'Clean tabular layout ensuring column alignment without overflow.');

// 4.8 Missing Optional Metadata (Graceful Degradation)
contentVariantBox('v_missing', '4.8 Missing Optional Metadata (Graceful Degradation)', 'Sparse Meta', [
  { text: '04   Q9812731   Engenharia de Software › Arquitetura' },
  { text: 'Ano: 2025 · Prova: Concurso Público 2025   [Banca and Órgão missing in source data]' },
  { text: 'Statement: Clean Architecture defines use cases as pure application business rules...' },
  { text: '( ) A  Use cases orchestrate flow of data to and from entities' },
  { text: '( ) B  Use cases directly import database repository drivers' }
], 'Strict adherence to AGENTS.md: Never fabricate missing metadata; only display existing fields.');


// ==========================================
// COLUMN 4: EXPANDED TABS DRAWERS (6 TABS)
// (x: 4660 .. 5760, w: 1100)
// ==========================================
const col4 = 4660;
let y4 = topY;

card('g5_box', col4, y4, 1100, 1850, '5. Question Tabs — Expanded Drawer Regions');
text('g5_desc', col4 + 20, y4 + 55, 'Interactive content rendered when a footer tab is toggled open below the question divider.', 'body', '#a0a0a0', 1060);

let tabY = y4 + 95;

function tabDrawerBox(prefix, tabName, stateName, contentLines, footerControls = '') {
  box(prefix, col4 + 25, tabY, 1050, 275, '#555555', 1.2);
  text(`${prefix}_head`, col4 + 40, tabY + 15, `Tab: [ ${tabName} ]`, 'large', '#88aaff');
  text(`${prefix}_state`, col4 + 750, tabY + 15, `[ ${stateName} ]`, 'body', '#ffeb3b');
  
  hStroke(`${prefix}_hdiv`, col4 + 40, tabY + 42, 1010, '#444444', 1.0);
  
  contentLines.forEach((r, idx) => {
    text(`${prefix}_c${idx}`, col4 + 45, tabY + 58 + (idx * 22), r.text, 'body', r.color || '#d0d0d0');
  });
  
  if (footerControls) {
    hStroke(`${prefix}_bdiv`, col4 + 40, tabY + 238, 1010, '#444444', 1.0);
    text(`${prefix}_ctrl`, col4 + 45, tabY + 252, footerControls, 'body', '#88aaff');
  }
  tabY += 295;
}

// 5.1 Commented Key (Gabarito Comentado)
tabDrawerBox('tab_key', 'Commented key', 'Active: Teacher Solution', [
  { text: 'Teacher Solution by Prof. Rodrigo Silva (IT & Software Engineering):', color: '#ffffff' },
  { text: '"The correct alternative is B. Under Federal Law 14.133/2021 (New Bidding Law),"' },
  { text: '"the preliminary technical study (ETP) and risk matrix are mandatory instruments."' },
  { text: 'Alternative analysis:' },
  { text: '  - A is incorrect: Prior ministerial authorization is not required for standard procurement.' },
  { text: '  - C is incorrect: Law encourages but does not mandate open-source exclusively.' },
  { text: '[ Video Solution Available: 14 min explanation ]   Click to play inline video', color: '#88aaff' }
], '[ Close Tab ]   ·   Was this explanation helpful? [ Yes (142) ] [ No (3) ]');

// 5.2 Lessons (Aulas Relacionadas)
tabDrawerBox('tab_less', 'Lessons (3)', 'Active: Related Modules', [
  { text: 'Mapped video lessons covering this question\'s topic [Interpretação de Textos]:', color: '#ffffff' },
  { text: '  1. Fundamentos da Nova Lei de Licitações (Lei 14.133) — Prof. Marcos (28 min)    [ Watch ]' },
  { text: '  2. Estudo Técnico Preliminar e Matriz de Riscos — Prof. Marcos (34 min)         [ Watch ]' },
  { text: '  3. Questões Comentadas FGV 2026: Tecnologia da Informação — Profa. Ana (45 min) [ Watch ]' },
  { text: 'Course: Dataprev 2026 — Reta Final Analista de TI Software (Progress: 12/48 aulas)', color: '#a0a0a0' }
], '[ Close Tab ]   ·   [ Open Course Syllabus ]');

// 5.3 Comments (Comentários da Comunidade)
tabDrawerBox('tab_comm', 'Comments', 'Active: Community Discussion', [
  { text: 'Write a comment: [ Type your comment, mnemonic, or study tip here... ]', color: '#ffffff' },
  { text: '  [ Post comment ]    [ Format: Bold, Code, Quote ]' },
  { text: 'Community comments (18 comments):' },
  { text: '  Candidate_42 (Nov 24): "Mnemonic: ETP + RISCO = CONTRATO SEGURO. Não confunda com 8.666!"' },
  { text: '  Upvotes: 38 ▲ | Reply | Report | Edit' },
  { text: '    ↳ DevConcurseiro (Nov 25): "Caiu exatamente igual na prova da Dataprev tipo 1 questão 4."' }
], '[ Close Tab ]   ·   Sort by: [ Top rated ▾ ]  [ Most recent ]');

// 5.4 Statistics (Estatísticas & Desempenho)
tabDrawerBox('tab_stat', 'Statistics', 'Active: Distribution & Metrics', [
  { text: 'Performance statistics across 4,821 candidates who solved this question:', color: '#ffffff' },
  { text: '  Overall Accuracy: 68% Correct  ·  32% Incorrect  ·  Difficulty: Medium' },
  { text: '  Option Distribution:' },
  { text: '    A: [===           ]  12%     (Common distractor)' },
  { text: '    B: [=================]  68%  * (Correct Answer)' },
  { text: '    C: [==            ]   8% ' },
  { text: '    D: [===           ]  12% ' },
  { text: 'Your Personal Stats: 2 attempts (Attempt 1: Incorrect, Attempt 2: Correct). Accuracy: 50%.', color: '#4caf50' }
], '[ Close Tab ]   ·   Metrics updated hourly from candidate attempts.');

// 5.5 Notebooks (Gerenciamento de Cadernos)
tabDrawerBox('tab_book', 'Notebooks', 'Active: Notebook Collections', [
  { text: 'Save this question to your personal study notebooks (cadernos):', color: '#ffffff' },
  { text: '  [v] Dataprev — Questões Prioritárias (Saved on Nov 24)' },
  { text: '  [v] Revisão: Licitações e Contratos (Saved on Nov 24)' },
  { text: '  [ ] Questões Difíceis — Revisar na Véspera' },
  { text: '  [ ] Simulado FGV — Erros Frequentes' },
  { text: '+ Create new notebook: [ Enter notebook name... ] [ Add notebook ]', color: '#88aaff' }
], '[ Close Tab ]   ·   Changes are saved automatically.');

// 5.6 Personal Notes (Anotações Privadas)
tabDrawerBox('tab_note', 'Notes', 'Active: Personal Notes Editor', [
  { text: 'Your Private Study Note for Question Q4445036 (Only visible to you):', color: '#ffffff' },
  { text: '| "Atenção: a FGV adora cobrar a diferença entre o Estudo Técnico Preliminar (ETP)' },
  { text: '| e o Termo de Referência (TR). No ETP avalia-se a viabilidade; no TR detalha-se' },
  { text: '| a execução do objeto contratual. Rever art. 18 da Lei 14.133."' },
  { text: 'Last modified: 2026-11-25 19:42   ·   Character count: 248', color: '#a0a0a0' }
], '[ Save Note ]   ·   [ Delete Note ]   ·   [ Close Tab ]');


// ==========================================
// COLUMN 5: ACTIONS, STATES & RULES MATRIX
// (x: 5810 .. 7000, w: 1160)
// ==========================================
const col5 = 5810;
let y5 = topY;

card('g6_box', col5, y5, 1160, 580, '6. Question Actions & Trigger-Consequence Map');
text('g6_desc', col5 + 20, y5 + 55, 'Behavioral specification of all user triggers, state mutations, and rollback mechanisms.', 'body', '#a0a0a0', 1120);

const actionRows = [
  { trigger: 'Click Alternative Radio', consequence: 'Marks radio; unmarks previous; enables [Answer] button.', undo: 'Click another alternative.' },
  { trigger: 'Click [Answer] / [Verify]', consequence: 'Freezes options; evaluates answer; shows feedback & answer key.', undo: 'Click [Retry] to attempt again.' },
  { trigger: 'Click [Retry Question]', consequence: 'Clears current selection; re-enables radios; logs prior attempt.', undo: 'None (prior attempt stays in history).' },
  { trigger: 'Click [X] Strike button', consequence: 'Dims alternative; draws strike line; disables radio selection.', undo: 'Click [X] again to Restore option.' },
  { trigger: 'Click [Q4445036] ID badge', consequence: 'Copies ID to clipboard; shows "Copied!" transient tooltip.', undo: 'Transient tooltip auto-dismisses.' },
  { trigger: 'Click Subject / Topic link', consequence: 'Filters current questions list by selected taxonomy term.', undo: 'Clear filter pill in filter bar.' },
  { trigger: 'Click + Associated text', consequence: 'Expands reading passage accordion inline above question prompt.', undo: 'Click - Collapse text.' },
  { trigger: 'Click Resource Tab (e.g. Key)', consequence: 'Toggles tab drawer open; collapses any previously open tab.', undo: 'Click active tab again to close.' },
  { trigger: 'Click [Report error]', consequence: 'Opens error report modal (question statement, key, or typo).', undo: 'Click Cancel in modal.' }
];

actionRows.forEach((act, idx) => {
  const aY = y5 + 90 + (idx * 52);
  box(`act_b${idx}`, col5 + 25, aY, 1110, 44, '#444444', 1.0);
  text(`act_t${idx}`, col5 + 35, aY + 14, `${act.trigger} ──>`, 'body', '#ffeb3b');
  text(`act_c${idx}`, col5 + 270, aY + 14, act.consequence, 'body', '#ffffff');
  text(`act_u${idx}`, col5 + 800, aY + 14, `Undo: ${act.undo}`, 'body', '#a0a0a0');
});

// 7. FEEDBACK MESSAGES & ALERTS
y5 += 610;
card('g7_box', col5, y5, 1160, 420, '7. Feedback Messages & System Alerts');
text('g7_desc', col5 + 20, y5 + 55, 'Visual representations of outcome badges, system banners and operational warnings.', 'body', '#a0a0a0', 1120);

const alerts = [
  { title: 'Success Feedback (Correct Answer)', style: '[ Correct answer! Well done ]', color: '#4caf50', note: 'Displayed inline adjacent to the Answer button; option turns green with checkmark.' },
  { title: 'Error Feedback (Incorrect Answer)', style: '[ Incorrect answer. Added to "Errei" filter ]', color: '#ff6b6b', note: 'Selected radio turns red; official answer key highlighted in green.' },
  { title: 'Annulled Question Alert', style: '[ Notice: Annulled by Board — Points Awarded ]', color: '#ffeb3b', note: 'Official board justification provided in Commented key tab.' },
  { title: 'Outdated Question Alert', style: '[ Warning: Outdated Law — Superseded ]', color: '#ff9800', note: 'Prevents candidate from studying repealed legal devices.' },
  { title: 'Persistence / Network Failure', style: '[ Error: Sync Failed — Saved Offline ]', color: '#ff5252', note: 'Attempt saved locally in offline storage with retry prompt.' }
];

alerts.forEach((alt, idx) => {
  const altY = y5 + 90 + (idx * 62);
  box(`alt_b${idx}`, col5 + 25, altY, 1110, 54, '#444444', 1.0);
  text(`alt_t${idx}`, col5 + 35, altY + 12, alt.title, 'body', '#88aaff');
  text(`alt_s${idx}`, col5 + 340, altY + 12, alt.style, 'body', alt.color);
  text(`alt_n${idx}`, col5 + 35, altY + 32, alt.note, 'body', '#a0a0a0');
});

// 8. CONTROL INTERACTION STATES
y5 += 445;
card('g8_box', col5, y5, 1160, 270, '8. Component Micro-Interaction States');
text('g8_desc', col5 + 20, y5 + 55, 'Atomic button and radio states under user pointer and keyboard interactions.', 'body', '#a0a0a0', 1120);

const states = [
  { name: 'Default', radio: '( ) Option text', btn: '[ Answer ] (white outline)' },
  { name: 'Hover', radio: '( ) Option text (glow outline)', btn: '[ Answer ] (highlight background)' },
  { name: 'Focus', radio: '( ) Option text [dashed ring]', btn: '[ Answer ] [focus ring for a11y]' },
  { name: 'Pressed', radio: '(*) Option text (active scale)', btn: '[ Answer ] (pressed depth)' },
  { name: 'Disabled', radio: '( ) Option text (dimmed)', btn: '[ Answer ] (dimmed #666666)' },
  { name: 'Loading', radio: 'Locked during verification', btn: '[ Verifying... (spinner) ]' }
];

states.forEach((st, idx) => {
  const stY = y5 + 90 + (idx * 27);
  text(`st_lbl${idx}`, col5 + 40, stY, `${st.name}:`, 'body', '#ffeb3b');
  text(`st_rad${idx}`, col5 + 130, stY, `Radio: ${st.radio}`, 'body', '#ffffff');
  text(`st_btn${idx}`, col5 + 520, stY, `Button: ${st.btn}`, 'body', '#88aaff');
});

// 9. INTERACTION RULES & DECISIONS MATRIX
y5 += 295;
card('g9_box', col5, y5, 1160, 480, '9. Interaction Rules & Behavioral Matrix');
text('g9_desc', col5 + 20, y5 + 55, 'Strict explicit behavioral decisions resolving open design questions [Documented Baseline].', 'body', '#a0a0a0', 1120);

const rules = [
  'Rule 1 [Tab Exclusivity]: Opening any footer tab collapses the previously open tab. Tabs are mutually exclusive drawers.',
  'Rule 2 [List Independence]: Opening a tab on Question 1 does NOT affect Question 2 or collapse other question cards.',
  'Rule 3 [Option Flexibility]: Learner can switch between alternatives freely before clicking Answer / Verify.',
  'Rule 4 [Struck Alternative]: Clicking a struck option does NOT select it; learner must click Restore first.',
  'Rule 5 [Immutability on Attempt]: Once verified, options cannot be changed on the same attempt; must click Retry.',
  'Rule 6 [History Preservation]: Retrying a question always creates a new attempt; historical attempts remain in metrics.',
  'Rule 7 [Auto-check Mode]: With Auto-check ON, clicking a radio immediately triggers verification without Verify button.',
  'Rule 8 [Manual Verify Mode]: With Auto-check OFF, clicking a radio enables [Verify]; feedback only appears after click.',
  'Rule 9 [Navigation Scope]: Breadcrumb links (Subject/Topic) filter the current list within the active competition.',
  'Rule 10 [Session Memory]: Expanded tabs and disclosure states are preserved in memory during current study session.'
];

rules.forEach((rl, idx) => {
  const rlY = y5 + 90 + (idx * 37);
  box(`rl_b${idx}`, col5 + 25, rlY, 1110, 32, '#444444', 1.0);
  text(`rl_t${idx}`, col5 + 40, rlY + 7, rl, 'body', '#ffffff');
});

// ==========================================
// UPDATE META.JSON
// ==========================================
const files = readdirSync(dir)
  .filter(f => f.endsWith('.json'))
  .map(f => f.replace('.json', ''));

const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
meta.order = files;
writeFileSync(metaPath, JSON.stringify(meta, null, 2));

console.log(`Successfully regenerated all Question expansion elements! Total elements on whiteboard: ${files.length}`);
