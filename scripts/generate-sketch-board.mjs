// Script to restructure and generate the low-fidelity Sketch board for v0.1.0
// Adheres strictly to AGENTS.md, marker-sketch standards, and prompt requirements.

import { writeFileSync, mkdirSync, rmSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { markerElement } from './marker-sketch.mjs';

const ROOT_DIR = 'docs/releases/v0.1.0/sketch';
const DB_DIR = join(ROOT_DIR, 'db');
const ELEMS_DIR = join(DB_DIR, 'elements');
const BOARD_DIR = join(DB_DIR, 'board');

// Helpers for shapes and strokes
function line(x0, y0, x1, y1, color = 'ink', width = 2.2) {
  return {
    type: 'stroke',
    x: x0,
    y: y0,
    points: [0, 0, x1 - x0, y1 - y0],
    width,
    color
  };
}

function rect(x, y, w, h, color = 'ink', width = 2.2) {
  return {
    type: 'stroke',
    x,
    y,
    points: [0, 0, w, 0, w, h, 0, h, 0, 0],
    width,
    color
  };
}

function circle(cx, cy, r, color = 'ink', width = 2.2) {
  const points = [];
  const n = 16;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    points.push(Math.round(r + Math.cos(a) * r * 100) / 100, Math.round(r + Math.sin(a) * r * 100) / 100);
  }
  return {
    type: 'stroke',
    x: cx - r,
    y: cy - r,
    points,
    width,
    color
  };
}

function text(x, y, str, size = 'medium', color = 'ink') {
  return {
    type: 'text',
    x,
    y,
    text: str,
    size,
    color
  };
}

function note(x, y, w, h, str, color = 'yellow') {
  return {
    type: 'note',
    x,
    y,
    w,
    h,
    text: str,
    color,
    tilt: 0,
    size: 'small'
  };
}

// Icon builders
function searchIcon(x, y, color = 'ink') {
  // Lens circle + handle
  return [
    {
      type: 'stroke',
      x,
      y,
      points: [6, 0, 11, 2, 13, 6, 12, 10, 9, 13, 5, 13, 2, 11, 0, 7, 1, 3, 4, 1, 6, 0],
      width: 2.2,
      color
    },
    {
      type: 'stroke',
      x: x + 9,
      y: y + 9,
      points: [0, 0, 5, 5],
      width: 2.4,
      color
    }
  ];
}

function collapseIcon(x, y, color = 'ink') {
  // Box with split rail
  return [
    rect(x, y, 22, 22, color, 1.8),
    line(x + 7, y, x + 7, y + 22, color, 2.0)
  ];
}

function expandIcon(x, y, color = 'ink') {
  // Chevron pointing right >
  return [
    rect(x, y, 24, 24, color, 1.8),
    {
      type: 'stroke',
      x: x + 8,
      y: y + 6,
      points: [0, 0, 6, 6, 0, 12],
      width: 2.2,
      color
    }
  ];
}

function terminalIcon(x, y, color = '#194f9b') {
  // Prompt >_ inside small frame
  return [
    rect(x, y, 18, 15, color, 1.8),
    {
      type: 'stroke',
      x: x + 3,
      y: y + 4,
      points: [0, 0, 4, 3.5, 0, 7],
      width: 2.0,
      color
    },
    line(x + 9, y + 11, x + 14, y + 11, color, 2.0)
  ];
}

function briefcaseIcon(x, y, color = 'ink') {
  // Briefcase box + handle
  return [
    rect(x, y + 4, 18, 12, color, 1.8),
    {
      type: 'stroke',
      x: x + 5,
      y: y + 4,
      points: [0, 0, 0, -3, 8, -3, 8, 0],
      width: 1.8,
      color
    },
    line(x + 7, y + 8, x + 11, y + 8, color, 1.8)
  ];
}

function clockIcon(x, y, color = '#194f9b') {
  // Circle + hands
  return [
    circle(x + 9, y + 9, 8, color, 2.0),
    {
      type: 'stroke',
      x: x + 9,
      y: y + 9,
      points: [0, -5, 0, 0, 4, 2],
      width: 2.0,
      color
    }
  ];
}

function kebabIcon(x, y, color = 'ink') {
  // 3 dots
  return {
    type: 'stroke',
    x,
    y,
    points: [
      1.5, 0, 3, 1.5, 1.5, 3, 0, 1.5, 1.5, 0,
      1.5, 7, 3, 8.5, 1.5, 10, 0, 8.5, 1.5, 7,
      1.5, 14, 3, 15.5, 1.5, 17, 0, 15.5, 1.5, 14
    ],
    width: 2.2,
    color
  };
}

function checkmark(x, y, color = '#166534') {
  return {
    type: 'stroke',
    x,
    y,
    points: [0, 5, 4, 9, 11, 0],
    width: 2.4,
    color
  };
}

function crossmark(x, y, color = '#a12b20') {
  return [
    line(x, y, x + 9, y + 9, color, 2.2),
    line(x + 9, y, x, y + 9, color, 2.2)
  ];
}

export function buildBoard() {
  const elements = {};
  const order = [];

  function add(id, el) {
    if (elements[id]) throw new Error(`Duplicate element ID: ${id}`);
    elements[id] = markerElement(el, id);
    order.push(id);
  }

  // Board Master Header (at top left)
  add('board_title', text(100, -80, 'Exam App — Desktop Multi-Screen Architecture & Workspace Exploration', 'title', 'ink'));
  add('board_subtitle', text(100, -45, 'v0.1.0 · Low-fidelity Exploratory UI Sketch · 5 core screen states with 250px spacing', 'medium', '#545454'));

  // -------------------------------------------------------------
  // SCREEN 1: Home Screen (x: 100 to 1500, y: 100 to 1100)
  // -------------------------------------------------------------
  const S1_X = 100;
  const S1_W = 1400;
  const S1_Y = 100;
  const S1_H = 1000;

  // Header Banner above Screen 1
  add('s1_banner', text(S1_X, 40, 'Screen 1: Home (Entry Point & Competition Selection)', 'large', 'ink'));

  // Outer Frame
  add('s1_frame_top', line(S1_X, S1_Y, S1_X + S1_W, S1_Y, 'ink', 2.8));
  add('s1_frame_bottom', line(S1_X, S1_Y + S1_H, S1_X + S1_W, S1_Y + S1_H, 'ink', 2.8));
  add('s1_frame_left', line(S1_X, S1_Y, S1_X, S1_Y + S1_H, 'ink', 2.8));
  add('s1_frame_right', line(S1_X + S1_W, S1_Y, S1_X + S1_W, S1_Y + S1_H, 'ink', 2.8));

  // Unified Sidebar (Width 260)
  add('s1_sb_div', line(S1_X + 260, S1_Y, S1_X + 260, S1_Y + S1_H, '#545454', 2.0));
  add('s1_sb_title', text(S1_X + 20, S1_Y + 28, 'Exam App', 'large', 'ink'));
  const [s1_lens, s1_handle] = searchIcon(S1_X + 175, S1_Y + 30);
  add('s1_sb_search_lens', s1_lens);
  add('s1_sb_search_handle', s1_handle);
  const [s1_col_box, s1_col_bar] = collapseIcon(S1_X + 215, S1_Y + 26);
  add('s1_sb_col_box', s1_col_box);
  add('s1_sb_col_bar', s1_col_bar);
  add('s1_sb_hdr_div', line(S1_X, S1_Y + 65, S1_X + 260, S1_Y + 65, '#545454', 1.8));

  // Sidebar Competitions
  // DATAPREV (active)
  add('s1_sb_c1_box', rect(S1_X + 15, S1_Y + 85, 230, 54, '#194f9b', 2.2));
  const [s1_t_box, s1_t_p, s1_t_l] = terminalIcon(S1_X + 28, S1_Y + 102);
  add('s1_sb_c1_ico_box', s1_t_box);
  add('s1_sb_c1_ico_p', s1_t_p);
  add('s1_sb_c1_ico_l', s1_t_l);
  add('s1_sb_c1_name', text(S1_X + 55, S1_Y + 98, 'DATAPREV', 'medium', '#194f9b'));
  add('s1_sb_c1_sub', line(S1_X + 55, S1_Y + 124, S1_X + 210, S1_Y + 124, '#545454', 1.6));

  // PPSA
  add('s1_sb_c2_box', rect(S1_X + 15, S1_Y + 150, 230, 54, '#545454', 1.8));
  const [s1_b_box, s1_b_h, s1_b_l] = briefcaseIcon(S1_X + 28, S1_Y + 167);
  add('s1_sb_c2_ico_box', s1_b_box);
  add('s1_sb_c2_ico_h', s1_b_h);
  add('s1_sb_c2_ico_l', s1_b_l);
  add('s1_sb_c2_name', text(S1_X + 55, S1_Y + 163, 'PPSA', 'medium', 'ink'));
  add('s1_sb_c2_sub', line(S1_X + 55, S1_Y + 189, S1_X + 195, S1_Y + 189, '#545454', 1.6));
  add('s1_sb_comp_div', line(S1_X, S1_Y + 220, S1_X + 260, S1_Y + 220, '#545454', 1.6));

  // Screen 1 Content Area (x: S1_X + 260 to S1_X + S1_W)
  add('s1_hdr_title', text(S1_X + 295, S1_Y + 30, 'Home', 'title', 'ink'));
  add('s1_hdr_stroke', line(S1_X + 295, S1_Y + 58, S1_X + 620, S1_Y + 58, '#545454', 1.8));
  add('s1_hdr_div', line(S1_X + 260, S1_Y + 75, S1_X + S1_W, S1_Y + 75, '#545454', 1.8));

  // Quick Progress Summary Card
  add('s1_sum_box', rect(S1_X + 295, S1_Y + 100, 1045, 150, '#545454', 2.0));
  add('s1_sum_title', text(S1_X + 320, S1_Y + 115, 'Overview', 'medium', 'ink'));
  add('s1_sum_t_stroke', line(S1_X + 320, S1_Y + 138, S1_X + 480, S1_Y + 138, '#545454', 1.6));

  // Metric 1: Accuracy
  add('s1_m1_box', rect(S1_X + 320, S1_Y + 155, 305, 55, '#545454', 1.6));
  add('s1_m1_val', text(S1_X + 335, S1_Y + 165, '74.2%', 'large', '#166534'));
  add('s1_m1_lbl', text(S1_X + 430, S1_Y + 172, 'Accuracy', 'small', '#545454'));
  add('s1_m1_bar', line(S1_X + 335, S1_Y + 198, S1_X + 590, S1_Y + 198, '#545454', 1.6));

  // Metric 2: Questions
  add('s1_m2_box', rect(S1_X + 655, S1_Y + 155, 315, 55, '#545454', 1.6));
  add('s1_m2_val', text(S1_X + 670, S1_Y + 165, '1,420', 'large', 'ink'));
  add('s1_m2_lbl', text(S1_X + 760, S1_Y + 172, 'Questions Solved', 'small', '#545454'));
  add('s1_m2_bar', line(S1_X + 670, S1_Y + 198, S1_X + 940, S1_Y + 198, '#545454', 1.6));

  // Metric 3: Mocks
  add('s1_m3_box', rect(S1_X + 1000, S1_Y + 155, 315, 55, '#545454', 1.6));
  add('s1_m3_val', text(S1_X + 1015, S1_Y + 165, '6', 'large', '#194f9b'));
  add('s1_m3_lbl', text(S1_X + 1060, S1_Y + 172, 'Mock Exams Completed', 'small', '#545454'));
  add('s1_m3_bar', line(S1_X + 1015, S1_Y + 198, S1_X + 1280, S1_Y + 198, '#545454', 1.6));

  // Summary progress track & fill
  add('s1_sum_track', line(S1_X + 320, S1_Y + 230, S1_X + 1315, S1_Y + 230, '#545454', 2.0));
  add('s1_sum_fill', line(S1_X + 320, S1_Y + 230, S1_X + 1055, S1_Y + 230, '#166534', 3.4));

  // Active Competition Cards
  // Card 1: DATAPREV
  add('s1_c1_card', rect(S1_X + 295, S1_Y + 275, 510, 370, '#194f9b', 2.2));
  const [s1_c1_tbox, s1_c1_tp, s1_c1_tl] = terminalIcon(S1_X + 320, S1_Y + 298);
  add('s1_c1_ico_box', s1_c1_tbox);
  add('s1_c1_ico_p', s1_c1_tp);
  add('s1_c1_ico_l', s1_c1_tl);
  add('s1_c1_title', text(S1_X + 350, S1_Y + 295, 'DATAPREV', 'large', '#194f9b'));
  add('s1_c1_l1', line(S1_X + 320, S1_Y + 340, S1_X + 760, S1_Y + 340, '#545454', 1.8));
  add('s1_c1_l2', line(S1_X + 320, S1_Y + 365, S1_X + 720, S1_Y + 365, '#545454', 1.8));
  add('s1_c1_l3', line(S1_X + 320, S1_Y + 390, S1_X + 680, S1_Y + 390, '#545454', 1.8));
  add('s1_c1_trk', line(S1_X + 320, S1_Y + 430, S1_X + 760, S1_Y + 430, '#545454', 2.0));
  add('s1_c1_fil', line(S1_X + 320, S1_Y + 430, S1_X + 630, S1_Y + 430, '#194f9b', 3.4));
  add('s1_c1_btn1_box', rect(S1_X + 320, S1_Y + 580, 210, 42, '#194f9b', 2.2));
  add('s1_c1_btn1_txt', text(S1_X + 395, S1_Y + 592, 'Practice', 'medium', '#194f9b'));
  add('s1_c1_btn2_box', rect(S1_X + 550, S1_Y + 580, 210, 42, '#545454', 2.0));
  add('s1_c1_btn2_txt', text(S1_X + 610, S1_Y + 592, 'Mock Exam', 'medium', 'ink'));

  // Card 2: PPSA
  add('s1_c2_card', rect(S1_X + 830, S1_Y + 275, 510, 370, '#545454', 2.0));
  const [s1_c2_bbox, s1_c2_bh, s1_c2_bl] = briefcaseIcon(S1_X + 855, S1_Y + 298);
  add('s1_c2_ico_box', s1_c2_bbox);
  add('s1_c2_ico_h', s1_c2_bh);
  add('s1_c2_ico_l', s1_c2_bl);
  add('s1_c2_title', text(S1_X + 885, S1_Y + 295, 'PPSA', 'large', 'ink'));
  add('s1_c2_l1', line(S1_X + 855, S1_Y + 340, S1_X + 1295, S1_Y + 340, '#545454', 1.8));
  add('s1_c2_l2', line(S1_X + 855, S1_Y + 365, S1_X + 1255, S1_Y + 365, '#545454', 1.8));
  add('s1_c2_l3', line(S1_X + 855, S1_Y + 390, S1_X + 1200, S1_Y + 390, '#545454', 1.8));
  add('s1_c2_trk', line(S1_X + 855, S1_Y + 430, S1_X + 1295, S1_Y + 430, '#545454', 2.0));
  add('s1_c2_fil', line(S1_X + 855, S1_Y + 430, S1_X + 1040, S1_Y + 430, '#194f9b', 3.4));
  add('s1_c2_btn1_box', rect(S1_X + 855, S1_Y + 580, 230, 42, '#545454', 2.0));
  add('s1_c2_btn1_txt', text(S1_X + 935, S1_Y + 592, 'Practice', 'medium', 'ink'));

  // Recent Activity section
  add('s1_rec_box', rect(S1_X + 295, S1_Y + 670, 1045, 300, '#545454', 1.8));
  add('s1_rec_title', text(S1_X + 320, S1_Y + 690, 'Recent Activity', 'medium', 'ink'));
  add('s1_rec_div0', line(S1_X + 320, S1_Y + 720, S1_X + 1315, S1_Y + 720, '#545454', 1.6));

  // Activity Row 1
  add('s1_r1_chk', checkmark(S1_X + 325, S1_Y + 740));
  add('s1_r1_l1', line(S1_X + 355, S1_Y + 742, S1_X + 880, S1_Y + 742, 'ink', 1.8));
  add('s1_r1_l2', line(S1_X + 355, S1_Y + 762, S1_X + 680, S1_Y + 762, '#545454', 1.6));
  add('s1_r1_div', line(S1_X + 320, S1_Y + 790, S1_X + 1315, S1_Y + 790, '#545454', 1.4));

  // Activity Row 2
  const [s1_r2_c1, s1_r2_c2] = crossmark(S1_X + 325, S1_Y + 810);
  add('s1_r2_c1', s1_r2_c1);
  add('s1_r2_c2', s1_r2_c2);
  add('s1_r2_l1', line(S1_X + 355, S1_Y + 812, S1_X + 920, S1_Y + 812, 'ink', 1.8));
  add('s1_r2_l2', line(S1_X + 355, S1_Y + 832, S1_X + 710, S1_Y + 832, '#545454', 1.6));
  add('s1_r2_div', line(S1_X + 320, S1_Y + 860, S1_X + 1315, S1_Y + 860, '#545454', 1.4));

  // Activity Row 3
  add('s1_r3_chk', checkmark(S1_X + 325, S1_Y + 880));
  add('s1_r3_l1', line(S1_X + 355, S1_Y + 882, S1_X + 860, S1_Y + 882, 'ink', 1.8));
  add('s1_r3_l2', line(S1_X + 355, S1_Y + 902, S1_X + 650, S1_Y + 902, '#545454', 1.6));

  // Note below Screen 1
  add('s1_note', note(S1_X, 1250, 460, 140, 'Screen 1: Home Dashboard\n- Entry point & competition selector (DATAPREV & PPSA)\n- High-level progress summary & active study targets\n- Quick resumption into questions or mock exam'));

  // -------------------------------------------------------------
  // SCREEN 2: Questions Workspace (x: 1750 to 3150, y: 100 to 1100)
  // -------------------------------------------------------------
  const S2_X = 1750;
  const S2_W = 1400;
  const S2_Y = 100;
  const S2_H = 1000;

  // Header Banner above Screen 2
  add('s2_banner', text(S2_X, 40, 'Screen 2: Questions Workspace (Active Competition Practice)', 'large', 'ink'));

  // Outer Frame
  add('s2_frame_top', line(S2_X, S2_Y, S2_X + S2_W, S2_Y, 'ink', 2.8));
  add('s2_frame_bottom', line(S2_X, S2_Y + S2_H, S2_X + S2_W, S2_Y + S2_H, 'ink', 2.8));
  add('s2_frame_left', line(S2_X, S2_Y, S2_X, S2_Y + S2_H, 'ink', 2.8));
  add('s2_frame_right', line(S2_X + S2_W, S2_Y, S2_X + S2_W, S2_Y + S2_H, 'ink', 2.8));

  // Unified Sidebar (Width 260)
  add('s2_sb_div', line(S2_X + 260, S2_Y, S2_X + 260, S2_Y + S2_H, '#545454', 2.0));
  add('s2_sb_title', text(S2_X + 20, S2_Y + 28, 'Exam App', 'large', 'ink'));
  const [s2_lens, s2_handle] = searchIcon(S2_X + 175, S2_Y + 30);
  add('s2_sb_search_lens', s2_lens);
  add('s2_sb_search_handle', s2_handle);
  const [s2_col_box, s2_col_bar] = collapseIcon(S2_X + 215, S2_Y + 26);
  add('s2_sb_col_box', s2_col_box);
  add('s2_sb_col_bar', s2_col_bar);
  add('s2_sb_hdr_div', line(S2_X, S2_Y + 65, S2_X + 260, S2_Y + 65, '#545454', 1.8));

  // Sidebar Competitions
  // DATAPREV (active)
  add('s2_sb_c1_box', rect(S2_X + 15, S2_Y + 85, 230, 54, '#194f9b', 2.2));
  const [s2_t_box, s2_t_p, s2_t_l] = terminalIcon(S2_X + 28, S2_Y + 102);
  add('s2_sb_c1_ico_box', s2_t_box);
  add('s2_sb_c1_ico_p', s2_t_p);
  add('s2_sb_c1_ico_l', s2_t_l);
  add('s2_sb_c1_name', text(S2_X + 55, S2_Y + 98, 'DATAPREV', 'medium', '#194f9b'));
  add('s2_sb_c1_sub', line(S2_X + 55, S2_Y + 124, S2_X + 210, S2_Y + 124, '#545454', 1.6));

  // PPSA
  add('s2_sb_c2_box', rect(S2_X + 15, S2_Y + 150, 230, 54, '#545454', 1.8));
  const [s2_b_box, s2_b_h, s2_b_l] = briefcaseIcon(S2_X + 28, S2_Y + 167);
  add('s2_sb_c2_ico_box', s2_b_box);
  add('s2_sb_c2_ico_h', s2_b_h);
  add('s2_sb_c2_ico_l', s2_b_l);
  add('s2_sb_c2_name', text(S2_X + 55, S2_Y + 163, 'PPSA', 'medium', 'ink'));
  add('s2_sb_c2_sub', line(S2_X + 55, S2_Y + 189, S2_X + 195, S2_Y + 189, '#545454', 1.6));
  add('s2_sb_comp_div', line(S2_X, S2_Y + 220, S2_X + 260, S2_Y + 220, '#545454', 1.6));

  // Questions Workspace Header (x: S2_X + 260 to S2_X + S2_W)
  add('s2_hdr_title', text(S2_X + 295, S2_Y + 28, 'DATAPREV', 'large', '#194f9b'));
  add('s2_hdr_mock_btn', rect(S2_X + 1140, S2_Y + 20, 150, 36, '#194f9b', 2.0));
  add('s2_hdr_mock_lbl', text(S2_X + 1165, S2_Y + 30, 'Mock Exam', 'medium', '#194f9b'));
  add('s2_hdr_kebab', kebabIcon(S2_X + 1330, S2_Y + 28));
  add('s2_hdr_div', line(S2_X + 260, S2_Y + 68, S2_X + S2_W, S2_Y + 68, '#545454', 1.8));

  // Question Card (x: S2_X + 295 to S2_X + 1355)
  add('s2_q_card', rect(S2_X + 295, S2_Y + 95, 1060, 860, '#545454', 2.0));

  // Metadata link affordances
  add('s2_m_id', text(S2_X + 325, S2_Y + 120, 'Q-1042', 'small', '#194f9b'));
  add('s2_m_id_u', line(S2_X + 325, S2_Y + 138, S2_X + 375, S2_Y + 138, '#194f9b', 1.6));
  add('s2_m_sep1', text(S2_X + 390, S2_Y + 120, '·', 'small', '#545454'));
  add('s2_m_subj', text(S2_X + 405, S2_Y + 120, 'Banco de Dados', 'small', '#194f9b'));
  add('s2_m_subj_u', line(S2_X + 405, S2_Y + 138, S2_X + 515, S2_Y + 138, '#194f9b', 1.6));
  add('s2_m_sep2', text(S2_X + 530, S2_Y + 120, '·', 'small', '#545454'));
  add('s2_m_top', text(S2_X + 545, S2_Y + 120, 'Modelagem Relacional', 'small', '#194f9b'));
  add('s2_m_top_u', line(S2_X + 545, S2_Y + 138, S2_X + 700, S2_Y + 138, '#194f9b', 1.6));
  add('s2_m_sep3', text(S2_X + 715, S2_Y + 120, '·', 'small', '#545454'));
  add('s2_m_yr', text(S2_X + 730, S2_Y + 120, '2024', 'small', '#194f9b'));
  add('s2_m_yr_u', line(S2_X + 730, S2_Y + 138, S2_X + 765, S2_Y + 138, '#194f9b', 1.6));
  add('s2_m_sep4', text(S2_X + 780, S2_Y + 120, '·', 'small', '#545454'));
  add('s2_m_bca', text(S2_X + 795, S2_Y + 120, 'CEBRASPE', 'small', '#194f9b'));
  add('s2_m_bca_u', line(S2_X + 795, S2_Y + 138, S2_X + 875, S2_Y + 138, '#194f9b', 1.6));
  add('s2_m_sep5', text(S2_X + 890, S2_Y + 120, '·', 'small', '#545454'));
  add('s2_m_org', text(S2_X + 905, S2_Y + 120, 'DATAPREV', 'small', '#194f9b'));
  add('s2_m_org_u', line(S2_X + 905, S2_Y + 138, S2_X + 985, S2_Y + 138, '#194f9b', 1.6));

  // Abstract Question Statement strokes (y: 260 to 380)
  add('s2_stmt_1', line(S2_X + 325, S2_Y + 175, S2_X + 1315, S2_Y + 175, 'ink', 2.2));
  add('s2_stmt_2', line(S2_X + 325, S2_Y + 205, S2_X + 1290, S2_Y + 205, 'ink', 2.2));
  add('s2_stmt_3', line(S2_X + 325, S2_Y + 235, S2_X + 1240, S2_Y + 235, 'ink', 2.2));
  add('s2_stmt_4', line(S2_X + 325, S2_Y + 265, S2_X + 1050, S2_Y + 265, 'ink', 2.2));
  add('s2_stmt_div', line(S2_X + 325, S2_Y + 295, S2_X + 1315, S2_Y + 295, '#545454', 1.6));

  // 5 Answer Options (A, B, C, D, E)
  // Option A
  add('s2_opt_a_r', circle(S2_X + 340, S2_Y + 340, 10, 'ink', 2.0));
  add('s2_opt_a_txt', text(S2_X + 365, S2_Y + 332, 'A', 'medium', 'ink'));
  add('s2_opt_a_l1', line(S2_X + 395, S2_Y + 340, S2_X + 1250, S2_Y + 340, 'ink', 2.0));

  // Option B (Selected with dot)
  add('s2_opt_b_r', circle(S2_X + 340, S2_Y + 410, 10, '#194f9b', 2.2));
  add('s2_opt_b_dot', circle(S2_X + 340, S2_Y + 410, 4, '#194f9b', 2.4));
  add('s2_opt_b_txt', text(S2_X + 365, S2_Y + 402, 'B', 'medium', '#194f9b'));
  add('s2_opt_b_l1', line(S2_X + 395, S2_Y + 410, S2_X + 1200, S2_Y + 410, '#194f9b', 2.2));

  // Option C (Eliminated with strike line)
  add('s2_opt_c_r', circle(S2_X + 340, S2_Y + 480, 10, '#545454', 1.8));
  add('s2_opt_c_txt', text(S2_X + 365, S2_Y + 472, 'C', 'medium', '#545454'));
  add('s2_opt_c_l1', line(S2_X + 395, S2_Y + 480, S2_X + 1150, S2_Y + 480, '#545454', 1.8));
  add('s2_opt_c_strike', line(S2_X + 360, S2_Y + 480, S2_X + 1160, S2_Y + 480, '#a12b20', 1.6));

  // Option D
  add('s2_opt_d_r', circle(S2_X + 340, S2_Y + 550, 10, 'ink', 2.0));
  add('s2_opt_d_txt', text(S2_X + 365, S2_Y + 542, 'D', 'medium', 'ink'));
  add('s2_opt_d_l1', line(S2_X + 395, S2_Y + 550, S2_X + 1180, S2_Y + 550, 'ink', 2.0));

  // Option E
  add('s2_opt_e_r', circle(S2_X + 340, S2_Y + 620, 10, 'ink', 2.0));
  add('s2_opt_e_txt', text(S2_X + 365, S2_Y + 612, 'E', 'medium', 'ink'));
  add('s2_opt_e_l1', line(S2_X + 395, S2_Y + 620, S2_X + 1220, S2_Y + 620, 'ink', 2.0));

  // Action / Verification Area
  add('s2_act_div', line(S2_X + 325, S2_Y + 680, S2_X + 1315, S2_Y + 680, '#545454', 1.6));
  add('s2_btn_verify', rect(S2_X + 325, S2_Y + 720, 160, 48, '#194f9b', 2.4));
  add('s2_btn_verify_txt', text(S2_X + 375, S2_Y + 734, 'Verify', 'large', '#194f9b'));

  // Feedback Card (Correct answer)
  add('s2_fb_card', rect(S2_X + 520, S2_Y + 718, 480, 52, '#166534', 2.0));
  add('s2_fb_chk', checkmark(S2_X + 540, S2_Y + 736));
  add('s2_fb_txt', text(S2_X + 575, S2_Y + 734, 'Correct Answer', 'medium', '#166534'));
  add('s2_fb_stroke', line(S2_X + 725, S2_Y + 744, S2_X + 975, S2_Y + 744, '#166534', 1.8));

  // Next Question Button
  add('s2_btn_next', rect(S2_X + 1165, S2_Y + 720, 150, 48, '#545454', 2.0));
  add('s2_btn_next_txt', text(S2_X + 1215, S2_Y + 734, 'Next', 'large', 'ink'));

  // Note below Screen 2
  add('s2_note', note(S2_X, 1250, 460, 140, 'Screen 2: Questions Workspace\n- Unified competition-scoped sidebar (DATAPREV active)\n- Metadata link affordances (ID, subject, topic, year, board)\n- Abstract question statement & lettered option radios (A-E)\n- Immediate verification feedback & retry flow'));

  // -------------------------------------------------------------
  // SCREEN 2.B: Questions with Collapsed Rail (x: 3400 to 4800, y: 100 to 1100)
  // -------------------------------------------------------------
  const S2B_X = 3400;
  const S2B_W = 1400;
  const S2B_Y = 100;
  const S2B_H = 1000;

  // Header Banner above Screen 2.B
  add('s2b_banner', text(S2B_X, 40, 'Screen 2.B: Questions with Collapsed Rail (Focus Practice)', 'large', 'ink'));

  // Outer Frame
  add('s2b_frame_top', line(S2B_X, S2B_Y, S2B_X + S2B_W, S2B_Y, 'ink', 2.8));
  add('s2b_frame_bottom', line(S2B_X, S2B_Y + S2B_H, S2B_X + S2B_W, S2B_Y + S2B_H, 'ink', 2.8));
  add('s2b_frame_left', line(S2B_X, S2B_Y, S2B_X, S2B_Y + S2B_H, 'ink', 2.8));
  add('s2b_frame_right', line(S2B_X + S2B_W, S2B_Y, S2B_X + S2B_W, S2B_Y + S2B_H, 'ink', 2.8));

  // Collapsed Sidebar Rail (Width 70)
  add('s2b_rail_div', line(S2B_X + 70, S2B_Y, S2B_X + 70, S2B_Y + S2B_H, '#545454', 2.0));
  add('s2b_rail_logo', text(S2B_X + 25, S2B_Y + 28, 'E', 'large', 'ink'));
  const [s2b_lens, s2b_handle] = searchIcon(S2B_X + 24, S2B_Y + 70);
  add('s2b_rail_search_lens', s2b_lens);
  add('s2b_rail_search_handle', s2b_handle);
  const [s2b_exp_box, s2b_exp_chv] = expandIcon(S2B_X + 22, S2B_Y + 115);
  add('s2b_rail_exp_box', s2b_exp_box);
  add('s2b_rail_exp_chv', s2b_exp_chv);
  add('s2b_rail_sep1', line(S2B_X, S2B_Y + 160, S2B_X + 70, S2B_Y + 160, '#545454', 1.8));

  // Rail icons for DATAPREV and PPSA
  add('s2b_rail_c1_bg', rect(S2B_X + 15, S2B_Y + 180, 40, 36, '#194f9b', 2.0));
  const [s2b_t_box, s2b_t_p, s2b_t_l] = terminalIcon(S2B_X + 26, S2B_Y + 190);
  add('s2b_rail_c1_ico_box', s2b_t_box);
  add('s2b_rail_c1_ico_p', s2b_t_p);
  add('s2b_rail_c1_ico_l', s2b_t_l);

  const [s2b_b_box, s2b_b_h, s2b_b_l] = briefcaseIcon(S2B_X + 26, S2B_Y + 240);
  add('s2b_rail_c2_ico_box', s2b_b_box);
  add('s2b_rail_c2_ico_h', s2b_b_h);
  add('s2b_rail_c2_ico_l', s2b_b_l);
  add('s2b_rail_sep2', line(S2B_X, S2B_Y + 290, S2B_X + 70, S2B_Y + 290, '#545454', 1.8));

  // Expanded Reading Workspace (x: S2B_X + 70 to S2B_X + S2B_W)
  add('s2b_hdr_title', text(S2B_X + 105, S2B_Y + 28, 'DATAPREV', 'large', '#194f9b'));
  add('s2b_hdr_mock_btn', rect(S2B_X + 1140, S2B_Y + 20, 150, 36, '#194f9b', 2.0));
  add('s2b_hdr_mock_lbl', text(S2B_X + 1165, S2B_Y + 30, 'Mock Exam', 'medium', '#194f9b'));
  add('s2b_hdr_kebab', kebabIcon(S2B_X + 1330, S2B_Y + 28));
  add('s2b_hdr_div', line(S2B_X + 70, S2B_Y + 68, S2B_X + S2B_W, S2B_Y + 68, '#545454', 1.8));

  // Expanded Question Card (Width 1250)
  add('s2b_q_card', rect(S2B_X + 105, S2B_Y + 95, 1250, 860, '#545454', 2.0));

  // Metadata link affordances
  add('s2b_m_id', text(S2B_X + 135, S2B_Y + 120, 'Q-1042', 'small', '#194f9b'));
  add('s2b_m_id_u', line(S2B_X + 135, S2B_Y + 138, S2B_X + 185, S2B_Y + 138, '#194f9b', 1.6));
  add('s2b_m_sep1', text(S2B_X + 200, S2B_Y + 120, '·', 'small', '#545454'));
  add('s2b_m_subj', text(S2B_X + 215, S2B_Y + 120, 'Banco de Dados', 'small', '#194f9b'));
  add('s2b_m_subj_u', line(S2B_X + 215, S2B_Y + 138, S2B_X + 325, S2B_Y + 138, '#194f9b', 1.6));
  add('s2b_m_sep2', text(S2B_X + 340, S2B_Y + 120, '·', 'small', '#545454'));
  add('s2b_m_top', text(S2B_X + 355, S2B_Y + 120, 'Modelagem Relacional', 'small', '#194f9b'));
  add('s2b_m_top_u', line(S2B_X + 355, S2B_Y + 138, S2B_X + 510, S2B_Y + 138, '#194f9b', 1.6));
  add('s2b_m_sep3', text(S2B_X + 525, S2B_Y + 120, '·', 'small', '#545454'));
  add('s2b_m_yr', text(S2B_X + 540, S2B_Y + 120, '2024', 'small', '#194f9b'));
  add('s2b_m_yr_u', line(S2B_X + 540, S2B_Y + 138, S2B_X + 575, S2B_Y + 138, '#194f9b', 1.6));
  add('s2b_m_sep4', text(S2B_X + 590, S2B_Y + 120, '·', 'small', '#545454'));
  add('s2b_m_bca', text(S2B_X + 605, S2B_Y + 120, 'CEBRASPE', 'small', '#194f9b'));
  add('s2b_m_bca_u', line(S2B_X + 605, S2B_Y + 138, S2B_X + 685, S2B_Y + 138, '#194f9b', 1.6));
  add('s2b_m_sep5', text(S2B_X + 700, S2B_Y + 120, '·', 'small', '#545454'));
  add('s2b_m_org', text(S2B_X + 715, S2B_Y + 120, 'DATAPREV', 'small', '#194f9b'));
  add('s2b_m_org_u', line(S2B_X + 715, S2B_Y + 138, S2B_X + 795, S2B_Y + 138, '#194f9b', 1.6));

  // Expanded Statement strokes
  add('s2b_stmt_1', line(S2B_X + 135, S2_Y + 175, S2B_X + 1315, S2_Y + 175, 'ink', 2.2));
  add('s2b_stmt_2', line(S2B_X + 135, S2_Y + 205, S2B_X + 1285, S2_Y + 205, 'ink', 2.2));
  add('s2b_stmt_3', line(S2B_X + 135, S2_Y + 235, S2B_X + 1220, S2_Y + 235, 'ink', 2.2));
  add('s2b_stmt_4', line(S2B_X + 135, S2_Y + 265, S2B_X + 1090, S2_Y + 265, 'ink', 2.2));
  add('s2b_stmt_div', line(S2B_X + 135, S2_Y + 295, S2B_X + 1315, S2_Y + 295, '#545454', 1.6));

  // 5 Answer Options (A, B, C, D, E)
  add('s2b_opt_a_r', circle(S2B_X + 150, S2_Y + 340, 10, 'ink', 2.0));
  add('s2b_opt_a_txt', text(S2B_X + 175, S2_Y + 332, 'A', 'medium', 'ink'));
  add('s2b_opt_a_l1', line(S2B_X + 205, S2_Y + 340, S2B_X + 1250, S2_Y + 340, 'ink', 2.0));

  add('s2b_opt_b_r', circle(S2B_X + 150, S2_Y + 410, 10, '#194f9b', 2.2));
  add('s2b_opt_b_dot', circle(S2B_X + 150, S2_Y + 410, 4, '#194f9b', 2.4));
  add('s2b_opt_b_txt', text(S2B_X + 175, S2_Y + 402, 'B', 'medium', '#194f9b'));
  add('s2b_opt_b_l1', line(S2B_X + 205, S2_Y + 410, S2B_X + 1210, S2_Y + 410, '#194f9b', 2.2));

  add('s2b_opt_c_r', circle(S2B_X + 150, S2_Y + 480, 10, '#545454', 1.8));
  add('s2b_opt_c_txt', text(S2B_X + 175, S2_Y + 472, 'C', 'medium', '#545454'));
  add('s2b_opt_c_l1', line(S2B_X + 205, S2_Y + 480, S2B_X + 1180, S2_Y + 480, '#545454', 1.8));

  add('s2b_opt_d_r', circle(S2B_X + 150, S2_Y + 550, 10, 'ink', 2.0));
  add('s2b_opt_d_txt', text(S2B_X + 175, S2_Y + 542, 'D', 'medium', 'ink'));
  add('s2b_opt_d_l1', line(S2B_X + 205, S2_Y + 550, S2B_X + 1200, S2_Y + 550, 'ink', 2.0));

  add('s2b_opt_e_r', circle(S2B_X + 150, S2_Y + 620, 10, 'ink', 2.0));
  add('s2b_opt_e_txt', text(S2B_X + 175, S2_Y + 612, 'E', 'medium', 'ink'));
  add('s2b_opt_e_l1', line(S2B_X + 205, S2_Y + 620, S2B_X + 1230, S2_Y + 620, 'ink', 2.0));

  // Verification & Feedback
  add('s2b_act_div', line(S2B_X + 135, S2_Y + 680, S2B_X + 1315, S2_Y + 680, '#545454', 1.6));
  add('s2b_btn_verify', rect(S2B_X + 135, S2_Y + 720, 160, 48, '#194f9b', 2.4));
  add('s2b_btn_verify_txt', text(S2B_X + 185, S2_Y + 734, 'Verify', 'large', '#194f9b'));

  add('s2b_fb_card', rect(S2B_X + 330, S2_Y + 718, 480, 52, '#166534', 2.0));
  add('s2b_fb_chk', checkmark(S2B_X + 350, S2_Y + 736));
  add('s2b_fb_txt', text(S2B_X + 385, S2_Y + 734, 'Correct Answer', 'medium', '#166534'));
  add('s2b_fb_stroke', line(S2B_X + 535, S2_Y + 744, S2B_X + 785, S2_Y + 744, '#166534', 1.8));

  add('s2b_btn_next', rect(S2B_X + 1165, S2_Y + 720, 150, 48, '#545454', 2.0));
  add('s2b_btn_next_txt', text(S2B_X + 1215, S2_Y + 734, 'Next', 'large', 'ink'));

  // Note below Screen 2.B
  add('s2b_note', note(S2B_X, 1250, 460, 140, 'Screen 2.B: Collapsed Sidebar / Icon Rail\n- 70px compact rail maximizes reading width to 1330px\n- Icon anchors preserve instant switching between DATAPREV and PPSA\n- Fast single-click expand toggle restores full sidebar'));

  // -------------------------------------------------------------
  // SCREEN 3: Mock Exam Flow (x: 5050 to 6450, y: 100 to 1100)
  // -------------------------------------------------------------
  const S3_X = 5050;
  const S3_W = 1400;
  const S3_Y = 100;
  const S3_H = 1000;

  // Header Banner above Screen 3
  add('s3_banner', text(S3_X, 40, 'Screen 3: Mock Exam (Setup Dialog & Timed Focus Session)', 'large', 'ink'));

  // Outer Frame
  add('s3_frame_top', line(S3_X, S3_Y, S3_X + S3_W, S3_Y, 'ink', 2.8));
  add('s3_frame_bottom', line(S3_X, S3_Y + S3_H, S3_X + S3_W, S3_Y + S3_H, 'ink', 2.8));
  add('s3_frame_left', line(S3_X, S3_Y, S3_X, S3_Y + S3_H, 'ink', 2.8));
  add('s3_frame_right', line(S3_X + S3_W, S3_Y, S3_X + S3_W, S3_Y + S3_H, 'ink', 2.8));

  // Timed Focus Session Header (x: S3_X to S3_X + S3_W)
  add('s3_hdr_title', text(S3_X + 25, S3_Y + 28, 'DATAPREV — Simulado 01', 'large', 'ink'));
  add('s3_hdr_meta_line', line(S3_X + 25, S3_Y + 54, S3_X + 420, S3_Y + 54, '#545454', 1.6));

  // Countdown timer box
  add('s3_timer_box', rect(S3_X + 600, S3_Y + 18, 240, 38, '#194f9b', 2.2));
  const [s3_clk_c, s3_clk_h] = clockIcon(S3_X + 615, S3_Y + 26);
  add('s3_timer_ico_c', s3_clk_c);
  add('s3_timer_ico_h', s3_clk_h);
  add('s3_timer_txt', text(S3_X + 645, S3_Y + 28, '03:45:12 remaining', 'medium', '#194f9b'));

  // Finish exam button
  add('s3_btn_finish', rect(S3_X + 1220, S3_Y + 18, 150, 38, '#a12b20', 2.2));
  add('s3_btn_finish_txt', text(S3_X + 1250, S3_Y + 28, 'Finish Exam', 'medium', '#a12b20'));
  add('s3_hdr_div', line(S3_X, S3_Y + 68, S3_X + S3_W, S3_Y + 68, '#545454', 1.8));

  // Focus Session Body
  // Left Area: Question Card (x: S3_X + 25 to S3_X + 930)
  add('s3_q_card', rect(S3_X + 25, S3_Y + 85, 905, 880, '#545454', 2.0));
  add('s3_q_num', text(S3_X + 50, S3_Y + 110, 'Question 12 of 50', 'large', 'ink'));
  add('s3_q_badge', line(S3_X + 50, S3_Y + 138, S3_X + 380, S3_Y + 138, '#545454', 1.8));

  // Statement lines
  add('s3_stmt_1', line(S3_X + 50, S3_Y + 170, S3_X + 890, S3_Y + 170, 'ink', 2.2));
  add('s3_stmt_2', line(S3_X + 50, S3_Y + 198, S3_X + 860, S3_Y + 198, 'ink', 2.2));
  add('s3_stmt_3', line(S3_X + 50, S3_Y + 226, S3_X + 810, S3_Y + 226, 'ink', 2.2));
  add('s3_stmt_4', line(S3_X + 50, S3_Y + 254, S3_X + 720, S3_Y + 254, 'ink', 2.2));
  add('s3_stmt_div', line(S3_X + 50, S3_Y + 280, S3_X + 890, S3_Y + 280, '#545454', 1.6));

  // Options A-E
  add('s3_opt_a_r', circle(S3_X + 65, S3_Y + 315, 10, 'ink', 2.0));
  add('s3_opt_a_txt', text(S3_X + 90, S3_Y + 307, 'A', 'medium', 'ink'));
  add('s3_opt_a_l1', line(S3_X + 115, S3_Y + 315, S3_X + 850, S3_Y + 315, 'ink', 2.0));

  add('s3_opt_b_r', circle(S3_X + 65, S3_Y + 375, 10, '#194f9b', 2.2));
  add('s3_opt_b_dot', circle(S3_X + 65, S3_Y + 375, 4, '#194f9b', 2.4));
  add('s3_opt_b_txt', text(S3_X + 90, S3_Y + 367, 'B', 'medium', '#194f9b'));
  add('s3_opt_b_l1', line(S3_X + 115, S3_Y + 375, S3_X + 820, S3_Y + 375, '#194f9b', 2.2));

  add('s3_opt_c_r', circle(S3_X + 65, S3_Y + 435, 10, 'ink', 2.0));
  add('s3_opt_c_txt', text(S3_X + 90, S3_Y + 427, 'C', 'medium', 'ink'));
  add('s3_opt_c_l1', line(S3_X + 115, S3_Y + 435, S3_X + 790, S3_Y + 435, 'ink', 2.0));

  add('s3_opt_d_r', circle(S3_X + 65, S3_Y + 495, 10, 'ink', 2.0));
  add('s3_opt_d_txt', text(S3_X + 90, S3_Y + 487, 'D', 'medium', 'ink'));
  add('s3_opt_d_l1', line(S3_X + 115, S3_Y + 495, S3_X + 830, S3_Y + 495, 'ink', 2.0));

  add('s3_opt_e_r', circle(S3_X + 65, S3_Y + 555, 10, 'ink', 2.0));
  add('s3_opt_e_txt', text(S3_X + 90, S3_Y + 547, 'E', 'medium', 'ink'));
  add('s3_opt_e_l1', line(S3_X + 115, S3_Y + 555, S3_X + 800, S3_Y + 555, 'ink', 2.0));

  // Focus Navigation Controls
  add('s3_ctrl_div', line(S3_X + 50, S3_Y + 610, S3_X + 890, S3_Y + 610, '#545454', 1.6));
  add('s3_btn_prev', rect(S3_X + 50, S3_Y + 640, 130, 42, '#545454', 2.0));
  add('s3_btn_prev_txt', text(S3_X + 80, S3_Y + 652, 'Previous', 'medium', 'ink'));
  add('s3_btn_next', rect(S3_X + 200, S3_Y + 640, 130, 42, '#194f9b', 2.2));
  add('s3_btn_next_txt', text(S3_X + 245, S3_Y + 652, 'Next', 'medium', '#194f9b'));
  add('s3_btn_flag', rect(S3_X + 350, S3_Y + 640, 160, 42, '#80530b', 2.0));
  add('s3_btn_flag_txt', text(S3_X + 375, S3_Y + 652, 'Flag for Review', 'medium', '#80530b'));
  add('s3_btn_clear', rect(S3_X + 740, S3_Y + 640, 150, 42, '#545454', 1.8));
  add('s3_btn_clear_txt', text(S3_X + 765, S3_Y + 652, 'Clear Answer', 'medium', '#545454'));

  // Right Area: 5x10 Question Palette (x: S3_X + 950 to S3_X + 1375)
  add('s3_pal_card', rect(S3_X + 950, S3_Y + 85, 425, 880, '#545454', 2.0));
  add('s3_pal_title', text(S3_X + 975, S3_Y + 110, 'Question Palette', 'medium', 'ink'));
  add('s3_pal_stats', line(S3_X + 975, S3_Y + 138, S3_X + 1340, S3_Y + 138, '#545454', 1.6));

  // Legend
  add('s3_leg_a_box', rect(S3_X + 975, S3_Y + 155, 14, 14, '#194f9b', 2.0));
  add('s3_leg_a_lbl', text(S3_X + 998, S3_Y + 155, 'Answered', 'small', '#545454'));
  add('s3_leg_c_box', rect(S3_X + 1105, S3_Y + 155, 14, 14, '#166534', 2.4));
  add('s3_leg_c_lbl', text(S3_X + 1128, S3_Y + 155, 'Current', 'small', '#166534'));
  add('s3_leg_f_box', rect(S3_X + 1225, S3_Y + 155, 14, 14, '#80530b', 2.0));
  add('s3_leg_f_lbl', text(S3_X + 1248, S3_Y + 155, 'Flagged', 'small', '#80530b'));
  add('s3_pal_div', line(S3_X + 975, S3_Y + 185, S3_X + 1345, S3_Y + 185, '#545454', 1.6));

  // 5x10 Palette Grid (50 chips)
  const chipW = 58;
  const chipH = 46;
  const chipGapX = 16;
  const chipGapY = 16;
  const startX = S3_X + 975;
  const startY = S3_Y + 205;

  for (let i = 1; i <= 50; i++) {
    const col = (i - 1) % 5;
    const row = Math.floor((i - 1) / 5);
    const cx = startX + col * (chipW + chipGapX);
    const cy = startY + row * (chipH + chipGapY);

    let color = '#545454';
    let weight = 1.8;
    if (i === 12) {
      color = '#166534'; // current
      weight = 2.4;
    } else if (i === 7 || i === 23) {
      color = '#80530b'; // flagged
      weight = 2.2;
    } else if (i < 35) {
      color = '#194f9b'; // answered
      weight = 2.0;
    }

    add(`s3_chip_${i}_b`, rect(cx, cy, chipW, chipH, color, weight));
    add(`s3_chip_${i}_t`, text(cx + (i < 10 ? 22 : 16), cy + 14, String(i), 'small', color));
  }

  // 3.A Setup Modal Dialog Overlay (centered in left region: x: S3_X + 140 to S3_X + 800)
  const M_X = S3_X + 140;
  const M_Y = S3_Y + 220;
  const M_W = 660;
  const M_H = 560;

  add('s3_modal_backdrop', rect(M_X - 6, M_Y - 6, M_W + 12, M_H + 12, '#545454', 1.8));
  add('s3_modal_card', rect(M_X, M_Y, M_W, M_H, 'ink', 2.8));
  add('s3_modal_title', text(M_X + 35, M_Y + 30, '3.A Mock Exam Setup Dialog', 'large', 'ink'));
  add('s3_modal_hdr_div', line(M_X + 35, M_Y + 68, M_X + M_W - 35, M_Y + 68, '#545454', 1.8));

  // Scope Section
  add('s3_m_scope_lbl', text(M_X + 35, M_Y + 95, 'Scope Selection:', 'medium', 'ink'));
  add('s3_m_scope_r1', circle(M_X + 50, M_Y + 135, 9, '#194f9b', 2.2));
  add('s3_m_scope_r1_dot', circle(M_X + 50, M_Y + 135, 4, '#194f9b', 2.4));
  add('s3_m_scope_r1_txt', text(M_X + 75, M_Y + 127, 'Single Competition (DATAPREV)', 'medium', '#194f9b'));

  add('s3_m_scope_r2', circle(M_X + 50, M_Y + 180, 9, '#545454', 1.8));
  add('s3_m_scope_r2_txt', text(M_X + 75, M_Y + 172, 'Mixed Competitions (DATAPREV + PPSA)', 'medium', 'ink'));

  // Questions Count Section
  add('s3_m_cnt_lbl', text(M_X + 35, M_Y + 230, 'Questions Count:', 'medium', 'ink'));
  add('s3_m_cnt_box', rect(M_X + 35, M_Y + 260, 260, 44, '#194f9b', 2.0));
  add('s3_m_cnt_val', text(M_X + 55, M_Y + 272, '50 Questions', 'medium', '#194f9b'));

  // Timer Limit Section
  add('s3_m_time_lbl', text(M_X + 340, M_Y + 230, 'Timer Limit:', 'medium', 'ink'));
  add('s3_m_time_box', rect(M_X + 340, M_Y + 260, 260, 44, '#194f9b', 2.0));
  add('s3_m_time_val', text(M_X + 360, M_Y + 272, '180 min (03:00:00)', 'medium', '#194f9b'));

  // Abstract settings description lines
  add('s3_m_desc_l1', line(M_X + 35, M_Y + 340, M_X + M_W - 35, M_Y + 340, '#545454', 1.6));
  add('s3_m_desc_l2', line(M_X + 35, M_Y + 370, M_X + M_W - 80, M_Y + 370, '#545454', 1.6));

  // Modal Action Buttons
  add('s3_m_div_bot', line(M_X + 35, M_Y + 420, M_X + M_W - 35, M_Y + 420, '#545454', 1.8));
  add('s3_m_btn_cancel', rect(M_X + 280, M_Y + 450, 140, 46, '#545454', 2.0));
  add('s3_m_btn_cancel_txt', text(M_X + 320, M_Y + 464, 'Cancel', 'medium', '#545454'));
  add('s3_m_btn_start', rect(M_X + 440, M_Y + 450, 180, 46, '#194f9b', 2.4));
  add('s3_m_btn_start_txt', text(M_X + 475, M_Y + 464, 'Start Exam', 'large', '#194f9b'));

  // Note below Screen 3
  add('s3_note', note(S3_X, 1250, 460, 140, 'Screen 3: Mock Exam Flow\n- 3.A Setup Dialog: exam scope (Single vs Mixed), count, timer limit\n- 3.B Focus Session: persistent countdown timer & distraction-free header\n- 5x10 question navigation palette with answered/flagged states'));

  // -------------------------------------------------------------
  // SCREEN 4: Performance & Analytics (x: 6700 to 8100, y: 100 to 1100)
  // -------------------------------------------------------------
  const S4_X = 6700;
  const S4_W = 1400;
  const S4_Y = 100;
  const S4_H = 1000;

  // Header Banner above Screen 4
  add('s4_banner', text(S4_X, 40, 'Screen 4: Performance & Analytics (Study Metrics)', 'large', 'ink'));

  // Outer Frame
  add('s4_frame_top', line(S4_X, S4_Y, S4_X + S4_W, S4_Y, 'ink', 2.8));
  add('s4_frame_bottom', line(S4_X, S4_Y + S4_H, S4_X + S4_W, S4_Y + S4_H, 'ink', 2.8));
  add('s4_frame_left', line(S4_X, S4_Y, S4_X, S4_Y + S4_H, 'ink', 2.8));
  add('s4_frame_right', line(S4_X + S4_W, S4_Y, S4_X + S4_W, S4_Y + S4_H, 'ink', 2.8));

  // Unified Sidebar (Width 260)
  add('s4_sb_div', line(S4_X + 260, S4_Y, S4_X + 260, S4_Y + S4_H, '#545454', 2.0));
  add('s4_sb_title', text(S4_X + 20, S4_Y + 28, 'Exam App', 'large', 'ink'));
  const [s4_lens, s4_handle] = searchIcon(S4_X + 175, S4_Y + 30);
  add('s4_sb_search_lens', s4_lens);
  add('s4_sb_search_handle', s4_handle);
  const [s4_col_box, s4_col_bar] = collapseIcon(S4_X + 215, S4_Y + 26);
  add('s4_sb_col_box', s4_col_box);
  add('s4_sb_col_bar', s4_col_bar);
  add('s4_sb_hdr_div', line(S4_X, S4_Y + 65, S4_X + 260, S4_Y + 65, '#545454', 1.8));

  // Sidebar Competitions
  add('s4_sb_c1_box', rect(S4_X + 15, S4_Y + 85, 230, 54, '#194f9b', 2.2));
  const [s4_t_box, s4_t_p, s4_t_l] = terminalIcon(S4_X + 28, S4_Y + 102);
  add('s4_sb_c1_ico_box', s4_t_box);
  add('s4_sb_c1_ico_p', s4_t_p);
  add('s4_sb_c1_ico_l', s4_t_l);
  add('s4_sb_c1_name', text(S4_X + 55, S4_Y + 98, 'DATAPREV', 'medium', '#194f9b'));
  add('s4_sb_c1_sub', line(S4_X + 55, S4_Y + 124, S4_X + 210, S4_Y + 124, '#545454', 1.6));

  add('s4_sb_c2_box', rect(S4_X + 15, S4_Y + 150, 230, 54, '#545454', 1.8));
  const [s4_b_box, s4_b_h, s4_b_l] = briefcaseIcon(S4_X + 28, S4_Y + 167);
  add('s4_sb_c2_ico_box', s4_b_box);
  add('s4_sb_c2_ico_h', s4_b_h);
  add('s4_sb_c2_ico_l', s4_b_l);
  add('s4_sb_c2_name', text(S4_X + 55, S4_Y + 163, 'PPSA', 'medium', 'ink'));
  add('s4_sb_c2_sub', line(S4_X + 55, S4_Y + 189, S4_X + 195, S4_Y + 189, '#545454', 1.6));
  add('s4_sb_comp_div', line(S4_X, S4_Y + 220, S4_X + 260, S4_Y + 220, '#545454', 1.6));

  // Workspace Header
  add('s4_hdr_title', text(S4_X + 295, S4_Y + 28, 'Performance & Analytics', 'large', 'ink'));
  add('s4_f1_box', rect(S4_X + 830, S4_Y + 22, 140, 34, '#545454', 1.8));
  add('s4_f1_txt', text(S4_X + 850, S4_Y + 30, 'DATAPREV', 'small', 'ink'));
  add('s4_f2_box', rect(S4_X + 990, S4_Y + 22, 140, 34, '#545454', 1.8));
  add('s4_f2_txt', text(S4_X + 1010, S4_Y + 30, 'Last 30 Days', 'small', 'ink'));
  add('s4_f3_box', rect(S4_X + 1150, S4_Y + 22, 140, 34, '#545454', 1.8));
  add('s4_f3_txt', text(S4_X + 1170, S4_Y + 30, 'All Modes', 'small', 'ink'));
  add('s4_hdr_div', line(S4_X + 260, S4_Y + 68, S4_X + S4_W, S4_Y + 68, '#545454', 1.8));

  // Overall Accuracy Summary Card (x: S4_X + 295 to S4_X + 1355)
  add('s4_kpi_card', rect(S4_X + 295, S4_Y + 95, 1060, 135, '#545454', 2.0));

  // 4 KPI Blocks
  // KPI 1: Accuracy
  add('s4_k1_box', rect(S4_X + 320, S4_Y + 115, 230, 95, '#545454', 1.6));
  add('s4_k1_lbl', text(S4_X + 335, S4_Y + 125, 'Overall Accuracy', 'small', '#545454'));
  add('s4_k1_val', text(S4_X + 335, S4_Y + 148, '76.4%', 'large', '#166534'));
  add('s4_k1_sub', line(S4_X + 335, S4_Y + 188, S4_X + 520, S4_Y + 188, '#166534', 1.8));

  // KPI 2: Total Questions
  add('s4_k2_box', rect(S4_X + 580, S4_Y + 115, 230, 95, '#545454', 1.6));
  add('s4_k2_lbl', text(S4_X + 595, S4_Y + 125, 'Questions Solved', 'small', '#545454'));
  add('s4_k2_val', text(S4_X + 595, S4_Y + 148, '1,842', 'large', 'ink'));
  add('s4_k2_sub', line(S4_X + 595, S4_Y + 188, S4_X + 780, S4_Y + 188, '#545454', 1.6));

  // KPI 3: Mock Exams
  add('s4_k3_box', rect(S4_X + 840, S4_Y + 115, 230, 95, '#545454', 1.6));
  add('s4_k3_lbl', text(S4_X + 855, S4_Y + 125, 'Mock Exams Done', 'small', '#545454'));
  add('s4_k3_val', text(S4_X + 855, S4_Y + 148, '8', 'large', '#194f9b'));
  add('s4_k3_sub', line(S4_X + 855, S4_Y + 188, S4_X + 1040, S4_Y + 188, '#194f9b', 1.6));

  // KPI 4: Pace
  add('s4_k4_box', rect(S4_X + 1100, S4_Y + 115, 230, 95, '#545454', 1.6));
  add('s4_k4_lbl', text(S4_X + 1115, S4_Y + 125, 'Average Pace', 'small', '#545454'));
  add('s4_k4_val', text(S4_X + 1115, S4_Y + 148, '42s', 'large', 'ink'));
  add('s4_k4_sub', line(S4_X + 1115, S4_Y + 188, S4_X + 1300, S4_Y + 188, '#545454', 1.6));

  // Middle Panels (y: 360 to 730)
  // Panel 1: Subject Proficiency (x: S4_X + 295 to S4_X + 805)
  add('s4_subj_card', rect(S4_X + 295, S4_Y + 255, 510, 380, '#545454', 2.0));
  add('s4_subj_title', text(S4_X + 320, S4_Y + 275, 'Accuracy by Subject', 'medium', 'ink'));
  add('s4_subj_div', line(S4_X + 320, S4_Y + 305, S4_X + 780, S4_Y + 305, '#545454', 1.6));

  // 5 Subject bars
  const subjects = [
    { name: 'Língua Portuguesa', score: '84%', pct: 0.84, color: '#166534' },
    { name: 'Engenharia de Software', score: '78%', pct: 0.78, color: '#166534' },
    { name: 'Banco de Dados & SQL', score: '72%', pct: 0.72, color: '#194f9b' },
    { name: 'Redes de Computadores', score: '65%', pct: 0.65, color: '#80530b' },
    { name: 'Legislação e Governança', score: '68%', pct: 0.68, color: '#80530b' }
  ];

  subjects.forEach((subj, idx) => {
    const sy = S4_Y + 330 + idx * 56;
    add(`s4_sbj_${idx}_lbl`, text(S4_X + 320, sy, subj.name, 'small', 'ink'));
    add(`s4_sbj_${idx}_val`, text(S4_X + 740, sy, subj.score, 'small', subj.color));
    add(`s4_sbj_${idx}_trk`, line(S4_X + 320, sy + 22, S4_X + 780, sy + 22, '#545454', 2.0));
    add(`s4_sbj_${idx}_fil`, line(S4_X + 320, sy + 22, S4_X + 320 + Math.round(460 * subj.pct), sy + 22, subj.color, 3.4));
  });

  // Panel 2: Comparison & Weak points (x: S4_X + 835 to S4_X + 1355)
  add('s4_comp_card', rect(S4_X + 835, S4_Y + 255, 520, 380, '#545454', 2.0));
  add('s4_comp_title', text(S4_X + 860, S4_Y + 275, 'Practice vs Mock Exams', 'medium', 'ink'));
  add('s4_comp_div', line(S4_X + 860, S4_Y + 305, S4_X + 1330, S4_Y + 305, '#545454', 1.6));

  // Practice Mode bar
  add('s4_c_prac_lbl', text(S4_X + 860, S4_Y + 330, 'Ordinary Practice Mode', 'small', 'ink'));
  add('s4_c_prac_val', text(S4_X + 1280, S4_Y + 330, '78.2%', 'small', '#194f9b'));
  add('s4_c_prac_trk', line(S4_X + 860, S4_Y + 352, S4_X + 1330, S4_Y + 352, '#545454', 2.0));
  add('s4_c_prac_fil', line(S4_X + 860, S4_Y + 352, S4_X + 860 + Math.round(470 * 0.782), S4_Y + 352, '#194f9b', 3.4));

  // Mock Exam bar
  add('s4_c_mock_lbl', text(S4_X + 860, S4_Y + 386, 'Timed Mock Exams', 'small', 'ink'));
  add('s4_c_mock_val', text(S4_X + 1280, S4_Y + 386, '71.5%', 'small', '#80530b'));
  add('s4_c_mock_trk', line(S4_X + 860, S4_Y + 408, S4_X + 1330, S4_Y + 408, '#545454', 2.0));
  add('s4_c_mock_fil', line(S4_X + 860, S4_Y + 408, S4_X + 860 + Math.round(470 * 0.715), S4_Y + 408, '#80530b', 3.4));

  // Revision priorities title
  add('s4_c_weak_div', line(S4_X + 860, S4_Y + 440, S4_X + 1330, S4_Y + 440, '#545454', 1.6));
  add('s4_c_weak_title', text(S4_X + 860, S4_Y + 460, 'Priority Revision Topics', 'medium', 'ink'));
  add('s4_w1_line', line(S4_X + 860, S4_Y + 500, S4_X + 1300, S4_Y + 500, '#a12b20', 2.0));
  add('s4_w2_line', line(S4_X + 860, S4_Y + 540, S4_X + 1250, S4_Y + 540, '#a12b20', 2.0));
  add('s4_w3_line', line(S4_X + 860, S4_Y + 580, S4_X + 1200, S4_Y + 580, '#a12b20', 2.0));

  // Bottom Panel: Attempt History (x: S4_X + 295 to S4_X + 1355)
  add('s4_hist_card', rect(S4_X + 295, S4_Y + 660, 1060, 295, '#545454', 1.8));
  add('s4_hist_title', text(S4_X + 320, S4_Y + 680, 'Recent Attempt History', 'medium', 'ink'));
  add('s4_hist_div', line(S4_X + 320, S4_Y + 710, S4_X + 1330, S4_Y + 710, '#545454', 1.6));

  // History Row 1
  add('s4_h1_badge', rect(S4_X + 320, S4_Y + 730, 90, 32, '#194f9b', 1.8));
  add('s4_h1_b_txt', text(S4_X + 338, S4_Y + 738, 'MOCK', 'small', '#194f9b'));
  add('s4_h1_title', line(S4_X + 430, S4_Y + 740, S4_X + 850, S4_Y + 740, 'ink', 2.0));
  add('s4_h1_meta', line(S4_X + 430, S4_Y + 758, S4_X + 720, S4_Y + 758, '#545454', 1.6));
  add('s4_h1_score', text(S4_X + 1100, S4_Y + 738, '78.5%', 'medium', '#166534'));
  add('s4_h1_btn', rect(S4_X + 1220, S4_Y + 730, 100, 32, '#545454', 1.8));
  add('s4_h1_btn_txt', text(S4_X + 1245, S4_Y + 738, 'Review', 'small', 'ink'));
  add('s4_h1_div', line(S4_X + 320, S4_Y + 780, S4_X + 1330, S4_Y + 780, '#545454', 1.4));

  // History Row 2
  add('s4_h2_badge', rect(S4_X + 320, S4_Y + 800, 90, 32, '#545454', 1.8));
  add('s4_h2_b_txt', text(S4_X + 330, S4_Y + 808, 'PRACTICE', 'small', '#545454'));
  add('s4_h2_title', line(S4_X + 430, S4_Y + 810, S4_X + 880, S4_Y + 810, 'ink', 2.0));
  add('s4_h2_meta', line(S4_X + 430, S4_Y + 828, S4_X + 750, S4_Y + 828, '#545454', 1.6));
  add('s4_h2_score', text(S4_X + 1100, S4_Y + 808, '82.0%', 'medium', '#166534'));
  add('s4_h2_btn', rect(S4_X + 1220, S4_Y + 800, 100, 32, '#545454', 1.8));
  add('s4_h2_btn_txt', text(S4_X + 1245, S4_Y + 808, 'Review', 'small', 'ink'));
  add('s4_h2_div', line(S4_X + 320, S4_Y + 850, S4_X + 1330, S4_Y + 850, '#545454', 1.4));

  // History Row 3
  add('s4_h3_badge', rect(S4_X + 320, S4_Y + 870, 90, 32, '#194f9b', 1.8));
  add('s4_h3_b_txt', text(S4_X + 338, S4_Y + 878, 'MOCK', 'small', '#194f9b'));
  add('s4_h3_title', line(S4_X + 430, S4_Y + 880, S4_X + 820, S4_Y + 880, 'ink', 2.0));
  add('s4_h3_meta', line(S4_X + 430, S4_Y + 898, S4_X + 700, S4_Y + 898, '#545454', 1.6));
  add('s4_h3_score', text(S4_X + 1100, S4_Y + 878, '71.0%', 'medium', '#80530b'));
  add('s4_h3_btn', rect(S4_X + 1220, S4_Y + 870, 100, 32, '#545454', 1.8));
  add('s4_h3_btn_txt', text(S4_X + 1245, S4_Y + 878, 'Review', 'small', 'ink'));

  // Note below Screen 4
  add('s4_note', note(S4_X, 1250, 460, 140, 'Screen 4: Performance & Analytics\n- Unified sidebar preserves competition context\n- Overall accuracy KPIs (percentage, volume, mocks, pace)\n- Subject proficiency bars & practice vs. mock comparison\n- Targeted topic revision priorities'));

  return { meta: { v: 1, title: 'Sketch — v0.1.0', order }, elements };
}

export function writeBoardToDisk(dryRun = false) {
  const { meta, elements } = buildBoard();
  console.log(`Generated ${meta.order.length} elements for Sketch board.`);

  if (dryRun) return { meta, elements };

  mkdirSync(ELEMS_DIR, { recursive: true });
  mkdirSync(BOARD_DIR, { recursive: true });

  // Clean obsolete elements from db/elements
  const existingFiles = readdirSync(ELEMS_DIR).filter(f => f.endsWith('.json'));
  const currentSet = new Set(meta.order.map(id => `${id}.json`));
  let removed = 0;
  for (const file of existingFiles) {
    if (!currentSet.has(file)) {
      rmSync(join(ELEMS_DIR, file), { force: true });
      removed++;
    }
  }
  console.log(`Removed ${removed} obsolete element files.`);

  // Write element JSONs
  for (const id of meta.order) {
    writeFileSync(join(ELEMS_DIR, `${id}.json`), JSON.stringify(elements[id]) + '\n');
  }

  // Write meta.json
  writeFileSync(join(BOARD_DIR, 'meta.json'), JSON.stringify(meta) + '\n');

  // Also write consolidated board.json
  writeFileSync(join(ROOT_DIR, 'board.json'), JSON.stringify({ meta, elements }, null, 2) + '\n');

  console.log(`Successfully wrote ${meta.order.length} elements, meta.json and board.json.`);
  return { meta, elements };
}

if (process.argv[1] && process.argv[1].endsWith('generate-sketch-board.mjs')) {
  writeBoardToDisk(process.argv.includes('--dry-run'));
}
