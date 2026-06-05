import { useState, useRef, useEffect } from "react";
import { reservationsAPI, tablesAPI } from "../api";
import { useAuth } from "../contexts/AuthContext";
import {
  FiChevronRight,
  FiClock,
  FiCalendar,
  FiUsers,
  FiCreditCard,
  FiCheck,
  FiMapPin,
  FiShield,
  FiUser,
  FiMail,
  FiPhone,
} from "react-icons/fi";

const h_res_css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --z-gold: #C9A84C;
    --z-emerald: #112923;
    --z-dark: #0B1915;
    --z-glass: rgba(255, 255, 255, 0.55);
    --z-border: rgba(255, 255, 255, 0.65);
    --z-blur: blur(25px);
    --z-transition: all 0.45s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ── WRAPPER ── */
  .h_res_wrapper {
    min-height: 100vh;
    background: #FAF7F2;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: var(--z-dark);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 2rem;
    position: relative;
    overflow-x: hidden;
  }

  /* ── GLOWS ── */
  .h_res_glows { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
  .h_res_glow_1 {
    position: absolute; top: -10%; left: -10%;
    width: 60vw; height: 60vw;
    background: radial-gradient(circle, rgba(201,168,76,0.14) 0%, transparent 70%);
    filter: blur(80px);
  }
  .h_res_glow_2 {
    position: absolute; bottom: -10%; right: -10%;
    width: 50vw; height: 50vw;
    background: radial-gradient(circle, rgba(17,41,35,0.08) 0%, transparent 70%);
    filter: blur(80px);
  }

  /* ── MASTER CARD ── */
  .h_res_card {
    position: relative; z-index: 10;
    width: 100%; max-width: 1200px;
    background: var(--z-glass);
    backdrop-filter: var(--z-blur);
    -webkit-backdrop-filter: var(--z-blur);
    border: 1px solid var(--z-border);
    border-radius: 40px;
    box-shadow: 0 40px 100px -20px rgba(0,0,0,0.04);
    display: grid;
    grid-template-columns: 360px 1fr;
    min-height: 820px;
    overflow: hidden;
    margin: auto;
  }

  /* ── SIDEBAR ── */
  .h_res_sidebar {
    background: rgba(255,255,255,0.18);
    border-right: 1px solid rgba(255,255,255,0.35);
    padding: 3.5rem 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .h_res_brand {
    font-size: 0.68rem; font-weight: 800;
    text-transform: uppercase; letter-spacing: 4px;
    color: var(--z-gold); margin-bottom: 1.5rem;
  }

  .h_res_title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 3.2rem; line-height: 1.02; font-weight: 400;
    margin-bottom: 3rem;
  }
  .h_res_title span { display: block; font-weight: 600; color: var(--z-emerald); }

  .h_res_steps {
    display: flex; flex-direction: column; gap: 0.6rem;
    padding: 1.2rem;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(201,168,76,0.12);
    border-radius: 28px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.04);;
  }

  .h_res_step_node {
    display: flex; gap: 1.2rem;
    padding: 1rem 1.1rem;
    border-radius: 18px;
    transition: var(--z-transition);
    cursor: pointer;
  }
  .h_res_step_node.active {
    background: rgba(255,255,255,0.65);
    box-shadow: 0 10px 25px rgba(0,0,0,0.04);
    transform: translateX(6px);
    border: 1px solid #dcc78c;
  }

  .h_res_step_icon {
    width: 42px; height: 42px; border-radius: 11px; flex-shrink: 0;
    background: rgba(255,255,255,0.45);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem; color: rgba(11,25,21,0.2);
    transition: var(--z-transition);
  }
  .h_res_step_node.active .h_res_step_icon { background: var(--z-emerald); color: var(--z-gold); }

  .h_res_step_info h4 {
    font-size: 0.62rem; text-transform: uppercase;
    letter-spacing: 1px; color: rgba(11,25,21,0.35);
    margin-bottom: 2px;
  }
  .h_res_step_node.active .h_res_step_info h4 { color: rgba(11,25,21,0.5); }
  .h_res_step_info p { font-size: 0.82rem; font-weight: 600; color: rgba(11,25,21,0.2); margin-bottom: 0; }
  .h_res_step_node.active .h_res_step_info p { color: var(--z-dark); }

  /* ── MAIN PANEL ── */
  .h_res_main {
    padding: 3.5rem;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 100%);
  }

  .h_error_msg {
    color: #C0392B; font-size: 0.78rem; font-weight: 700;
    background: rgba(192,57,43,0.08); border: 1px solid rgba(192,57,43,0.15);
    padding: 0.9rem 1.4rem; border-radius: 14px; margin-bottom: 1.5rem;
    animation: fadeIn 0.3s ease;
  }

  /* ── CONTENT CARD ── */
  .h_content_card {
    border: 1px solid rgba(255,255,255,0.65);
    border-radius: 30px;
    padding: 2.5rem;
    box-shadow: 0 15px 45px rgba(0,0,0,0.03);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    margin-bottom: 1.5rem;
    animation: fadeIn 0.5s ease-out;
    flex: 1;
  }

  .h_content_card h2 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2.2rem; margin-bottom: 2rem;
    color: var(--z-emerald);
  }

  /* ── STEP 1: SCHEDULE LAYOUT ── */
  .h_schedule_layout {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 3rem;
    align-items: start;
  }

  .h_schedule_right {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    justify-content: center;
    padding-top: 1rem;
  }

  /* ── CLOCK ── */
  .h_clock_wrap { position: relative; }

  .h_clock_display {
    display: flex; justify-content: center; align-items: baseline;
    gap: 8px; margin-bottom: 1.5rem;
  }

  .h_clock_time {
    font-family: 'Cormorant Garamond', serif;
    font-size: 3.5rem; font-weight: 300;
    color: rgba(11,25,21,0.18); cursor: pointer;
    transition: var(--z-transition);
    line-height: 1;
  }
  .h_clock_time.active { color: var(--z-emerald); font-weight: 500; }

  .h_clock_period {
    display: flex; flex-direction: column; gap: 4px; padding-bottom: 4px;
  }
  .h_clock_period button {
    background: none; border: none; font-size: 0.75rem;
    font-weight: 800; cursor: pointer;
    color: rgba(11,25,21,0.2); font-family: 'Plus Jakarta Sans', sans-serif;
    letter-spacing: 0.5px; transition: var(--z-transition); padding: 0;
  }
  .h_clock_period button.active { color: var(--z-gold); }

  .h_clock_face {
    width: 240px; height: 240px;
    background: rgba(255,255,255,0.35);
    border: 1px solid rgba(255,255,255,0.55);
    border-radius: 50%;
    margin: 0 auto;
    position: relative;
    touch-action: none;
    cursor: pointer;
    box-shadow: inset 0 2px 8px rgba(0,0,0,0.04);
  }

  .h_clock_center_dot {
    position: absolute; width: 8px; height: 8px;
    background: var(--z-emerald); border-radius: 50%;
    top: 50%; left: 50%; transform: translate(-50%, -50%);
    z-index: 6;
  }

  .h_clock_hand {
    position: absolute;
    bottom: 50%; left: 50%;
    width: 2px; margin-left: -1px;
    background: var(--z-emerald);
    transform-origin: bottom center;
    z-index: 5;
    border-radius: 2px 2px 0 0;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .h_clock_num {
    position: absolute;
    transform: translate(-50%, -50%);
    width: 34px; height: 34px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.82rem; font-weight: 600; color: var(--z-dark);
    border: none; background: transparent; cursor: pointer;
    border-radius: 50%; transition: var(--z-transition);
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .h_clock_num:hover { background: rgba(17,41,35,0.08); }
  .h_clock_num.selected { background: var(--z-emerald); color: white; box-shadow: 0 6px 16px rgba(17,41,35,0.25); }

  /* ── GUEST CAPSULE ── */
  .h_guest_capsule {
    background: white;
    border: 1px solid rgba(255,255,255,0.8);
    border-radius: 100px;
    padding: 0.6rem 0.7rem;
    display: flex; justify-content: space-between; align-items: center;
    box-shadow: 0 8px 24px rgba(0,0,0,0.07);
    width: 100%;
  }
  .h_capsule_btn {
    width: 48px; height: 48px; border-radius: 50%;
    background: #F5F2EC; border: none;
    font-size: 1.4rem; cursor: pointer;
    transition: var(--z-transition);
    display: flex; align-items: center; justify-content: center;
    color: var(--z-dark); font-weight: 300;
    box-shadow: 0 3px 10px rgba(0,0,0,0.06);
  }
  .h_capsule_btn:hover { background: var(--z-emerald); color: var(--z-gold); }
  .h_capsule_val {
    font-size: 1.4rem; font-weight: 700;
    font-family: 'Cormorant Garamond', serif;
    text-align: center; flex: 1;
    color: var(--z-dark);
  }

  /* ── DATE INPUT ── */
  .h_input_box {
    background: rgba(255,255,255,0.5);
    border: 1px solid rgba(201,168,76,0.18);
    border-radius: 22px; padding: 1rem 1.5rem;
    margin-bottom: 1.5rem;
    transition: var(--z-transition);
    display: flex; flex-direction: column; gap: 0.4rem;
    box-shadow: 0 6px 18px rgba(0,0,0,0.02);
  }
  .h_input_box:focus-within {
    border-color: var(--z-gold); background: white;
    box-shadow: 0 12px 30px rgba(201,168,76,0.1);
    transform: translateY(-2px);
  }
  .h_input_box label {
    display: block; font-size: 0.65rem; font-weight: 800;
    text-transform: uppercase; color: var(--z-gold);
    letter-spacing: 1.5px;
  }
  .h_input_field_wrap { display: flex; align-items: center; gap: 0.9rem; }
  .h_input_icon { font-size: 1.1rem; color: rgba(11,25,21,0.28); transition: var(--z-transition); flex-shrink: 0; }
  .h_input_box:focus-within .h_input_icon { color: var(--z-emerald); }
  .h_input_box input {
    width: 100%; border: none; background: transparent;
    outline: none; font-size: 1rem; color: var(--z-dark);
    font-weight: 600; font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .h_input_box select,
  .h_input_box textarea {
    width: 100%;
    border: none;
    background: transparent;
    outline: none;
    font-size: 1rem;
    color: var(--z-dark);
    font-weight: 600;
    font-family: 'Plus Jakarta Sans', sans-serif;
    resize: vertical;
  }
  .h_input_box textarea {
    min-height: 90px;
    line-height: 1.5;
  }
  .h_input_box input::placeholder { color: rgba(11,25,21,0.22); font-weight: 400; }
  .h_input_box textarea::placeholder { color: rgba(11,25,21,0.22); font-weight: 400; }
  .h_input_box.mb0 { margin-bottom: 0; }

  .h_two_col_grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .h_policy_box {
    background: rgba(255, 255, 255, 0.42);
    border: 1px solid rgba(201,168,76,0.22);
    border-radius: 16px;
    padding: 0.9rem 1rem;
    margin-top: 0.2rem;
  }

  .h_policy_check {
    display: flex;
    align-items: flex-start;
    gap: 0.65rem;
    font-size: 0.82rem;
    line-height: 1.5;
    color: rgba(11,25,21,0.75);
  }

  .h_policy_check input {
    width: 16px;
    height: 16px;
    margin-top: 0.2rem;
    accent-color: var(--z-emerald);
    flex-shrink: 0;
  }

  /* ── TABLE MAP ── */
  .h_table_grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1.2rem;
    background: rgba(255,255,255,0.15);
    border-radius: 26px;
    border: 1px solid rgba(255,255,255,0.3);
  }

  .h_table_node {
    aspect-ratio: 1;
    background: rgba(255,255,255,0.35);
    border: 1px solid rgb(195 195 195 / 47%);
    border-radius: 14px;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    cursor: pointer; transition: var(--z-transition);
    gap: 4px;
  }
  .h_table_node:hover:not(.occupied):not(.unavailable) {
    transform: translateY(-4px); background: rgba(255,255,255,0.6);
    box-shadow: 0 12px 24px rgba(0,0,0,0.06);
  }
  .h_table_node.selected { background: var(--z-emerald); color: var(--z-gold); border-color: var(--z-emerald); box-shadow: 0 10px 24px rgba(17,41,35,0.2); }
  .h_table_node.occupied { opacity: 0.15; cursor: not-allowed; }
  .h_table_node.unavailable { opacity: 0.4; cursor: not-allowed; border-style: dashed; }

  .h_table_node .t_num { font-size: 1rem; font-weight: 800; }
  .h_table_node .t_cap { font-size: 0.58rem; font-weight: 700; text-transform: uppercase; opacity: 0.55; letter-spacing: 0.5px; }
  .h_table_node.selected .t_cap { opacity: 0.7; }

  .h_table_legend {
    margin-top: 1.5rem;
    display: flex; gap: 1.2rem; justify-content: center;
    font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.5px; opacity: 0.55; flex-wrap: wrap;
  }
  .h_table_legend_item { display: flex; align-items: center; gap: 0.45rem; }
  .h_legend_dot { width: 8px; height: 8px; border-radius: 50%; }

  /* ── PAYMENT ROW ── */
  .h_payment_row { display: flex; gap: 1.2rem; }

  /* ── SUMMARY ── */
  .h_summary_glass {
    background: rgba(255,255,255,0.28);
    border: 1px solid rgba(255,255,255,0.5);
    border-radius: 28px;
    position: relative; overflow: hidden;
  }
  .h_summary_glass h3 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2.2rem; margin-bottom: 1.8rem; color: var(--z-emerald);
  }
  .h_summary_row {
    display: flex; justify-content: space-between; align-items: flex-start;
    padding: 0.9rem 0; border-bottom: 1px solid rgba(11,25,21,0.05);
  }
  .h_summary_row:last-child { border-bottom: none; }
  .h_summary_row label { font-size: 0.68rem; font-weight: 800; text-transform: uppercase; opacity: 0.38; letter-spacing: 1px; }
  .h_summary_row span { font-weight: 600; font-size: 0.92rem; text-align: right; max-width: 60%; }

  /* ── FOOTER / BUTTONS ── */
  .h_footer {
    margin-top: auto;
    display: flex; justify-content: space-between; align-items: center;
    padding-top: 2rem; flex-shrink: 0;
  }

  .h_btn_back {
    background: none; border: none; cursor: pointer;
    font-size: 0.78rem; font-weight: 700;
    color: rgba(11,25,21,0.38); transition: var(--z-transition);
    font-family: 'Plus Jakarta Sans', sans-serif;
    letter-spacing: 0.3px;
  }
  .h_btn_back:hover { color: var(--z-dark); }

  .h_btn_next {
    background: var(--z-emerald); color: var(--z-gold);
    border: none; padding: 1.1rem 2.8rem;
    border-radius: 60px; font-size: 0.75rem; font-weight: 800;
    text-transform: uppercase; letter-spacing: 2px; cursor: pointer;
    display: flex; align-items: center; gap: 0.7rem;
    transition: var(--z-transition);
    box-shadow: 0 16px 36px rgba(17,41,35,0.15);
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .h_btn_next:hover { transform: translateY(-3px); box-shadow: 0 22px 44px rgba(17,41,35,0.25); }

  /* ── CONFIRMED ── */
  .h_confirm_wrap {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center; padding: 3rem 2rem;
    flex: 1;
  }
  .h_confirm_icon {
    width: 90px; height: 90px;
    background: var(--z-emerald); color: var(--z-gold);
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    margin-bottom: 2.2rem; font-size: 2.8rem;
    box-shadow: 0 20px 40px rgba(17,41,35,0.2);
  }

  /* ── ANIMATIONS ── */
  @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

  /* ══════════════════════════════════════
     RESPONSIVE — TABLET (≤ 1024px)
  ══════════════════════════════════════ */
  @media (max-width: 1024px) {
    .h_res_card { grid-template-columns: 300px 1fr; }
    .h_res_sidebar { padding: 2.5rem 1.8rem; }
    .h_res_main { padding: 2.5rem 2rem; }
    .h_res_title { font-size: 2.6rem; }
    .h_schedule_layout { gap: 2rem; }
    .h_clock_face { width: 200px; height: 200px; }
    .h_clock_time { font-size: 2.8rem; }
    .h_table_grid { grid-template-columns: repeat(4, 1fr); gap: 1rem; }
  }

  /* ══════════════════════════════════════
     RESPONSIVE — MOBILE (≤ 768px)
     Sidebar collapses to TOP horizontal strip
  ══════════════════════════════════════ */
/* MOBILE SCROLL FIX */
@media (max-width: 768px) {

  .h_guest_field { margin-bottom: 0 !important; }

  .h_res_steps_main_box {
    width: 100%;
    overflow: hidden;
  }

  .h_res_steps_wrap {
    width: 100vw;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .h_res_steps_wrap::-webkit-scrollbar {
    display: none;
  }

  .h_res_step_node {
    flex: 0 0 auto;
  }
}
  @media (max-width: 768px) {
    .h_res_wrapper { padding: 0; align-items: flex-start; }

    .h_res_card {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
      border-radius: 0;
      min-height: 100dvh;
      height: 100dvh;
      overflow: visible;
    }

    /* SIDEBAR → compact top header */
    .h_res_sidebar {
      border-right: none;
      border-bottom: 1px solid rgba(255,255,255,0.25);
      padding: 1rem 1rem 0.8rem;
      gap: 0.7rem;
      flex-direction: column;
      background: rgba(255,255,255,0.25);
      overflow: visible;
      z-index: 2;
    }

    .h_res_brand {
      display: none;
    }

    .h_res_title {
      font-size: 1.5rem;
      margin-bottom: 0;
      line-height: 1;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-wrap: wrap;
    }
    .h_res_title span {
      display: inline;
      font-size: 1.5rem;
    }
    .h_res_title::before {
      content: '✦';
      font-size: 0.7rem;
      color: var(--z-gold);
      font-style: normal;
    }

    /* Horizontal scrollable steps row */
    .h_res_steps_main_box { max-width: 100%; overflow: visible; }
    .h_res_steps_wrap {
      width: 90vw;
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
      -ms-overflow-style: -ms-autohiding-scrollbar;
      scrollbar-width: thin;
      scrollbar-color: rgba(17,41,35,0.3) rgba(255,255,255,0.18);
      touch-action: pan-x;
      overscroll-behavior-x: contain;
      padding-bottom: 10px;
      display: block;
    }
    .h_res_steps {
      display: inline-flex;
      flex-direction: row;
      width: max-content;
      padding: 0.5rem;
      gap: 0.5rem;
      border-radius: 16px;
      flex-wrap: nowrap;
      white-space: nowrap;
    }
    .h_res_steps_wrap::-webkit-scrollbar { height: 10px; }
    .h_res_steps_wrap::-webkit-scrollbar-track { background: rgba(255,255,255,0.18); border-radius: 999px; }
    .h_res_steps_wrap::-webkit-scrollbar-thumb { background: rgba(17,41,35,0.45); border-radius: 999px; }

    .h_res_step_node {
      flex: 0 0 auto;
      flex-shrink: 0;
      min-width: 120px;
      padding: 0.65rem 0.75rem;
      gap: 0.6rem;
      transform: none !important;
      border-radius: 12px;
    }
    .h_res_step_icon { width: 32px; height: 32px; font-size: 0.9rem; border-radius: 9px; }
    .h_res_step_info h4 { font-size: 0.56rem; }
    .h_res_step_info p { font-size: 0.7rem; }

    /* MAIN → scrollable */
    .h_res_main {
      padding: 1.2rem;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .h_content_card {
      padding: 1.5rem 1.2rem;
      border-radius: 22px;
      margin-bottom: 1rem;
    }
    .h_content_card h2 { font-size: 1.7rem; margin-bottom: 1.2rem; }

    /* ── STEP 1 MOBILE: stack vertically, clock centred ── */
    .h_schedule_layout {
      grid-template-columns: 1fr;
      gap: 1.5rem;
      justify-items: center;
    }
    .h_schedule_right {
      width: 100%;
      padding-top: 0;
      gap: 1rem;
    }

    .h_clock_wrap { width: 100%; display: flex; flex-direction: column; align-items: center; }
    .h_clock_display { margin-bottom: 1.2rem; gap: 6px; }
    .h_clock_time { font-size: 3rem; }
    .h_clock_face { width: 230px; height: 230px; }
    .h_clock_num { width: 32px; height: 32px; font-size: 0.78rem; }

    /* guest + date side by side on mobile */
    .h_inline_fields {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.8rem;
      width: 100%;
    }
    .h_guest_capsule { max-width: none; width: 100%; }
    .h_capsule_btn { width: 42px; height: 42px; font-size: 1.2rem; }
    .h_capsule_val { font-size: 0.95rem; }

    /* Table grid */
    .h_table_grid { grid-template-columns: repeat(5, 1fr); gap: 0.75rem; }

    /* Payment */
    .h_payment_row { flex-direction: column; gap: 0; }
    .h_two_col_grid { grid-template-columns: 1fr; gap: 0; }

    /* Summary */
    .h_summary_glass { border-radius: 20px; }
    .h_summary_glass h3 { font-size: 1.8rem; margin-bottom: 1.2rem; }
    .h_summary_row { flex-direction: row; flex-wrap: wrap; }

    /* Footer */
    .h_footer { flex-direction: column-reverse; gap: 0.8rem; padding-top: 1.2rem; }
    .h_btn_next { width: 100%; justify-content: center; padding: 1rem 1.5rem; font-size: 0.7rem; }
    .h_btn_back { align-self: center; }

    /* Input */
    .h_input_box { margin-bottom: 1rem; border-radius: 18px; padding: 0.9rem 1.1rem; }
  }

  /* ══════════════════════════════════════
     RESPONSIVE — SMALL MOBILE (≤ 480px)
  ══════════════════════════════════════ */
  @media (max-width: 480px) {
    .h_res_main { padding: 0.9rem; }
    .h_content_card { padding: 1.2rem 1rem; border-radius: 18px; }
    .h_content_card h2 { font-size: 1.5rem; margin-bottom: 1rem; }

    .h_clock_face { width: 210px; height: 210px; }
    .h_clock_time { font-size: 2.6rem; }
    .h_clock_num { width: 29px; height: 29px; font-size: 0.72rem; }

    .h_table_grid { grid-template-columns: repeat(3, 1fr); gap: 0.55rem; }

    .h_inline_fields { grid-template-columns: 1fr; }
    .h_policy_check { font-size: 0.75rem; }

    .h_res_step_node { min-width: 118px; }

    .h_summary_glass h3 { font-size: 1.55rem; }
  }

  /* ══════════════════════════════════════
     RESPONSIVE — TINY (≤ 360px)
  ══════════════════════════════════════ */
  @media (max-width: 360px) {
    .h_res_title { font-size: 1.3rem; }
    .h_clock_face { width: 185px; height: 185px; }
    .h_clock_time { font-size: 2.2rem; }
    .h_res_step_node { min-width: 128px; padding: 0.55rem 0.6rem; }
    .h_res_step_info p { font-size: 0.65rem; }
    .h_capsule_btn { width: 38px; height: 38px; }
  }
`;

const STEPS = [
  { id: 1, label: "Schedule", sub: "Time & Party", icon: <FiClock /> },
  { id: 2, label: "Placement", sub: "Select Table", icon: <FiMapPin /> },
  { id: 3, label: "Details", sub: "Guest Info", icon: <FiUsers /> },
  { id: 4, label: "Payment", sub: "Secure Checkout", icon: <FiCreditCard /> },
  { id: 5, label: "Review", sub: "Final Check", icon: <FiShield /> },
];

const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export default function ZestReservation() {
  const { user } = useAuth();
  const [tables, setTables] = useState([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    guests: 2,
    date: new Date().toISOString().split("T")[0],
    table: null,
    name: "",
    email: "",
    phone: "",
    seatingArea: "",
    specialOccasion: "none",
    specialRequests: "",
    agreePolicy: false,
    card: "",
    expiry: "",
    cvv: "",
  });
  const [selHour, setSelHour] = useState(7);
  const [selMin, setSelMin] = useState(30);
  const [selPeriod, setSelPeriod] = useState("PM");
  const [activeView, setActiveView] = useState("hour");
  const [clockSize, setClockSize] = useState(240);
  const clockRef = useRef(null);

  useEffect(() => {
    const loadTables = async () => {
      try {
        setTablesLoading(true);
        const res = await tablesAPI.getPublic();
        const mapped = (res.data || []).map((t) => {
          const status = String(t.status || "").trim();
          const isFree = status.toLowerCase() === "free";
          return {
            id: t.number,
            _id: t._id,
            number: t.number,
            cap: t.capacity,
            isFree,
            occ: !isFree,
            status,
            location: t.location,
            displayId:
              t.displayId || `C-${String(t.number).padStart(2, "0")}`,
          };
        });
        console.log(
          "[Reservation] Tables loaded from MongoDB (zest-cafe):",
          mapped.length,
          mapped,
        );
        setTables(mapped);
      } catch (err) {
        console.error("[Reservation] Tables API error:", err);
        setTables([]);
      } finally {
        setTablesLoading(false);
      }
    };
    loadTables();
  }, []);

  const update = (k, v) => {
    setError("");
    setForm((p) => ({ ...p, [k]: v }));
  };
  const updateGuests = (n) => {
    const s = Math.max(1, Math.min(20, n));
    setError("");
    setForm((p) => ({
      ...p,
      guests: s,
      table:
        p.table && tables.find((t) => t.id === p.table && t.isFree)
          ? p.table
          : null,
    }));
  };

  const onNameChange = (v) =>
    update("name", v.replace(/\s+/g, " ").trimStart());
  const onPhoneChange = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 10);
    update(
      "phone",
      d.length <= 3
        ? d
        : d.length <= 6
          ? `${d.slice(0, 3)} ${d.slice(3)}`
          : `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`,
    );
  };
  const onCardChange = (v) =>
    update(
      "card",
      v
        .replace(/\D/g, "")
        .slice(0, 16)
        .replace(/(\d{4})(?=\d)/g, "$1 "),
    );
  const onExpiryChange = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    update("expiry", d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
  };
  const onCvvChange = (v) => update("cvv", v.replace(/\D/g, "").slice(0, 3));

  const selectHour = (h) => {
    setSelHour(h === 0 ? 12 : h);
    setActiveView("minute");
  };

  const selectMinute = (m) => {
    setSelMin(m);
  };

  const handleClockInput = (cx, cy, view = activeView) => {
    if (!clockRef.current) return;
    const rect = clockRef.current.getBoundingClientRect();
    const x = cx - (rect.left + rect.width / 2);
    const y = cy - (rect.top + rect.height / 2);
    let deg = (Math.atan2(y, x) * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;
    if (view === "hour") {
      const h = Math.round(deg / 30) % 12;
      setSelHour(h === 0 ? 12 : h);
    } else {
      setSelMin(Math.round(deg / 6) % 60);
    }
  };

  const onClockPointerDown = (e) => {
    e.preventDefault();
    const dragView = activeView;
    handleClockInput(e.clientX, e.clientY, dragView);
    const move = (me) => handleClockInput(me.clientX, me.clientY, dragView);
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      if (dragView === "hour") setActiveView("minute");
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  useEffect(() => {
    const sync = () => {
      if (clockRef.current)
        setClockSize(clockRef.current.getBoundingClientRect().width || 240);
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [step]);

  useEffect(() => {
    if (!form.table || !tables.length) return;
    const t = tables.find((tbl) => tbl.id === form.table);
    if (!t || !t.isFree) {
      setForm((p) => ({ ...p, table: null }));
    }
  }, [form.guests, form.table, tables]);

  const handleNext = async () => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    const phoneDigits = form.phone.replace(/\D/g, "");
    const cardDigits = form.card.replace(/\D/g, "");
    const expiryOk = /^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiry);
    const cvvOk = /^\d{3}$/.test(form.cvv);

    if (step === 1 && !form.date) return setError("Please select a date.");
    if (step === 2 && !form.table) return setError("Please select a table.");
    if (
      step === 3 &&
      (!form.name.trim() ||
        !emailOk ||
        phoneDigits.length < 10 ||
        !form.seatingArea ||
        !form.agreePolicy)
    )
      return setError(
        "Complete guest info, seating details and accept reservation policy.",
      );
    if (step === 4 && (cardDigits.length !== 16 || !expiryOk || !cvvOk))
      return setError("Enter valid card number, expiry (MM/YY), and CVV.");

    if (step === 5) {
      setLoading(true);
      try {
        await reservationsAPI.createPublic({
          customerName: form.name.trim(),
          phone: form.phone.replace(/\D/g, ""),
          email: form.email.trim(),
          date: form.date,
          time: formattedTime,
          guests: form.guests,
          tableNumber: form.table,
          status: "Pending",
          userId: user?._id || user?.id,
        });
        setStep(6);
      } catch (err) {
        setError(err.response?.data?.message || "Could not complete reservation.");
      } finally {
        setLoading(false);
      }
      return;
    } else setStep((p) => p + 1);
  };

  const formattedTime = `${String(selHour).padStart(2, "0")}:${String(selMin).padStart(2, "0")} ${selPeriod}`;
  const clockRadius = Math.max(
    55,
    clockSize / 2 - (activeView === "hour" ? 32 : 22),
  );
  const handHeight =
    activeView === "hour"
      ? Math.max(46, clockRadius - 22)
      : Math.max(60, clockRadius - 6);

  return (
    <>
      <style>{h_res_css}</style>
      <div className="h_res_wrapper">
        <div className="h_res_glows">
          <div className="h_res_glow_1" />
          <div className="h_res_glow_2" />
        </div>

        <div className="h_res_card">
          {/* ── SIDEBAR ── */}
          <div className="h_res_sidebar">
            <div className="h_res_brand">✦ Zest Premium</div>
            <h1 className="h_res_title">
              The <span>Experience</span>
            </h1>
            <div className="h_res_steps_main_box">
              <div className="h_res_steps_wrap">
                <div className="h_res_steps">
                  {STEPS.map((s) => (
                    <div
                      key={s.id}
                      className={`h_res_step_node ${step === s.id ? "active" : ""}`}
                      onClick={() => s.id < step && setStep(s.id)}
                    >
                      <div className="h_res_step_icon">{s.icon}</div>
                      <div className="h_res_step_info">
                        <h4>Step 0{s.id}</h4>
                        <p>{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── MAIN ── */}
          <div className="h_res_main">
            {error && <div className="h_error_msg">⚠ {error}</div>}

            {/* STEP 1: SCHEDULE */}
            {step === 1 && (
              <div className="h_content_card">
                <h2>Select Schedule</h2>
                <div className="h_schedule_layout">
                  {/* Clock */}
                  <div className="h_clock_wrap">
                    <div className="h_clock_display">
                      <span
                        className={`h_clock_time ${activeView === "hour" ? "active" : ""}`}
                        onClick={() => setActiveView("hour")}
                      >
                        {String(selHour).padStart(2, "0")}
                      </span>
                      <span
                        style={{
                          fontSize: "2rem",
                          opacity: 0.18,
                          fontFamily: "Cormorant Garamond",
                        }}
                      >
                        :
                      </span>
                      <span
                        className={`h_clock_time ${activeView === "minute" ? "active" : ""}`}
                        onClick={() => setActiveView("minute")}
                      >
                        {String(selMin).padStart(2, "0")}
                      </span>
                      <div className="h_clock_period">
                        <button
                          className={selPeriod === "AM" ? "active" : ""}
                          onClick={() => setSelPeriod("AM")}
                        >
                          AM
                        </button>
                        <button
                          className={selPeriod === "PM" ? "active" : ""}
                          onClick={() => setSelPeriod("PM")}
                        >
                          PM
                        </button>
                      </div>
                    </div>
                    <div
                      className="h_clock_face"
                      ref={clockRef}
                      onPointerDown={onClockPointerDown}
                    >
                      <div className="h_clock_center_dot" />
                      <div
                        className="h_clock_hand"
                        style={{
                          height: `${handHeight}px`,
                          transform: `rotate(${activeView === "hour" ? (selHour % 12) * 30 : selMin * 6}deg)`,
                        }}
                      />
                      {(activeView === "hour" ? hours : minutes).map(
                        (num, i) => {
                          const angle = (i * 30 - 90) * (Math.PI / 180);
                          return (
                            <button
                              key={num}
                              className={`h_clock_num ${(activeView === "hour" ? selHour : selMin) === num ? "selected" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (activeView === "hour") selectHour(num);
                                else selectMinute(num);
                              }}
                              style={{
                                left: `calc(50% + ${clockRadius * Math.cos(angle)}px)`,
                                top: `calc(50% + ${clockRadius * Math.sin(angle)}px)`,
                              }}
                            >
                              {activeView === "hour"
                                ? num
                                : String(num).padStart(2, "0")}
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>

                  {/* Right: Guests + Date */}
                  <div className="h_schedule_right">
                    <div className="h_inline_fields">
                      <div className="h_guest_field"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                          margin: "0 0 1.5rem 0",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.65rem",
                            fontWeight: 800,
                            textTransform: "uppercase",
                            color: "var(--z-gold)",
                            letterSpacing: "1.5px",
                          }}
                        >
                          Party Size
                        </div>
                        <div className="h_guest_capsule">
                          <button
                            className="h_capsule_btn"
                            onClick={() => updateGuests(form.guests - 1)}
                          >
                            −
                          </button>
                          <div className="h_capsule_val">
                            {form.guests} Guests
                          </div>
                          <button
                            className="h_capsule_btn"
                            onClick={() => updateGuests(form.guests + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div
                        className="h_input_box mb0"
                        style={{ marginBottom: 0 }}
                      >
                        <label>Arrival Date</label>
                        <div className="h_input_field_wrap">
                          <FiCalendar className="h_input_icon" />
                          <input
                            type="date"
                            value={form.date}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => update("date", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        background: "rgba(255,255,255,0.35)",
                        border: "1px solid rgba(201,168,76,0.15)",
                        borderRadius: "18px",
                        padding: "1.2rem 1.5rem",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.62rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          color: "var(--z-gold)",
                          letterSpacing: "1.5px",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Selected Time
                      </div>
                      <div
                        style={{
                          fontFamily: "Cormorant Garamond, serif",
                          fontSize: "2rem",
                          fontWeight: 500,
                          color: "var(--z-emerald)",
                        }}
                      >
                        {formattedTime}
                      </div>
                      <div
                        style={{
                          fontSize: "0.72rem",
                          opacity: 0.45,
                          marginTop: "0.3rem",
                        }}
                      >
                        Tap hour or minute to adjust
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: TABLE */}
            {step === 2 && (
              <div className="h_content_card">
                <h2>Pick your Table</h2>
                {tablesLoading ? (
                  <p>Loading tables from database...</p>
                ) : tables.length === 0 ? (
                  <p>No tables available. Please try again later.</p>
                ) : (
                <div className="h_table_grid">
                  {tables.map((t) => (
                    <div
                      key={t._id || t.id}
                      className={`h_table_node ${t.occ ? "occupied" : ""} ${form.table === t.id ? "selected" : ""}`}
                      onClick={() => t.isFree && update("table", t.id)}
                      title={`${t.displayId} · ${t.location} · ${t.status}`}
                    >
                      <span className="t_num">{t.displayId || t.id}</span>
                      <span className="t_cap">{t.cap} pax</span>
                    </div>
                  ))}
                </div>
                )}
                <div className="h_table_legend">
                  <div className="h_table_legend_item">
                    <div
                      className="h_legend_dot"
                      style={{ background: "rgba(0,0,0,0.1)" }}
                    />
                    Free (Available)
                  </div>
                  <div className="h_table_legend_item">
                    <div
                      className="h_legend_dot"
                      style={{ background: "var(--z-emerald)" }}
                    />
                    Selected
                  </div>
                  <div className="h_table_legend_item">
                    <div
                      className="h_legend_dot"
                      style={{ background: "rgba(0,0,0,0.06)" }}
                    />
                    Occupied / Reserved
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: DETAILS */}
            {step === 3 && (
              <div className="h_content_card">
                <h2>Guest Details & Reservation Preferences</h2>
                <div className="h_input_box">
                  <label>Full Name</label>
                  <div className="h_input_field_wrap">
                    <FiUser className="h_input_icon" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => onNameChange(e.target.value)}
                    />
                  </div>
                </div>
                <div className="h_input_box">
                  <label>Email Address</label>
                  <div className="h_input_field_wrap">
                    <FiMail className="h_input_icon" />
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value.trim())}
                    />
                  </div>
                </div>
                <div className="h_input_box">
                  <label>Phone Number</label>
                  <div className="h_input_field_wrap">
                    <FiPhone className="h_input_icon" />
                    <input
                      type="tel"
                      placeholder="987 654 3210"
                      value={form.phone}
                      onChange={(e) => onPhoneChange(e.target.value)}
                    />
                  </div>
                </div>
                <div className="h_two_col_grid">
                  <div className="h_input_box">
                    <label>Seating Area</label>
                    <div className="h_input_field_wrap">
                      <FiMapPin className="h_input_icon" />
                      <select
                        value={form.seatingArea}
                        onChange={(e) => update("seatingArea", e.target.value)}
                      >
                        <option value="">Select seating area</option>
                        <option value="indoor-main">Indoor Main Hall</option>
                        <option value="window-side">Window Side</option>
                        <option value="private-lounge">Private Lounge</option>
                        <option value="outdoor-patio">Outdoor Patio</option>
                      </select>
                    </div>
                  </div>
                  <div className="h_input_box">
                    <label>Special Occasion</label>
                    <div className="h_input_field_wrap">
                      <FiCalendar className="h_input_icon" />
                      <select
                        value={form.specialOccasion}
                        onChange={(e) =>
                          update("specialOccasion", e.target.value)
                        }
                      >
                        <option value="none">None</option>
                        <option value="birthday">Birthday</option>
                        <option value="anniversary">Anniversary</option>
                        <option value="business">Business Dinner</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="h_input_box">
                  <label>Special Requests</label>
                  <div className="h_input_field_wrap">
                    <textarea
                      placeholder="Any dietary preferences, accessibility needs, decor request, etc."
                      value={form.specialRequests}
                      onChange={(e) => update("specialRequests", e.target.value)}
                      maxLength={280}
                    />
                  </div>
                </div>
                <div className="h_policy_box">
                  <label className="h_policy_check">
                    <input
                      type="checkbox"
                      checked={form.agreePolicy}
                      onChange={(e) => update("agreePolicy", e.target.checked)}
                    />
                    <span>
                      I agree to the Reservation Policy and understand
                      cancellations must be made 24 hours in advance.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 4: PAYMENT */}
            {step === 4 && (
              <div className="h_content_card">
                <h2>Secure Checkout</h2>
                <div className="h_input_box">
                  <label>Card Number</label>
                  <div className="h_input_field_wrap">
                    <FiCreditCard className="h_input_icon" />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="19"
                      placeholder="0000 0000 0000 0000"
                      value={form.card}
                      onChange={(e) => onCardChange(e.target.value)}
                    />
                  </div>
                </div>
                <div className="h_payment_row">
                  <div className="h_input_box" style={{ flex: 1 }}>
                    <label>Expiry</label>
                    <div className="h_input_field_wrap">
                      <FiCalendar className="h_input_icon" />
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="MM/YY"
                        maxLength="5"
                        value={form.expiry}
                        onChange={(e) => onExpiryChange(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="h_input_box" style={{ flex: 1 }}>
                    <label>CVV</label>
                    <div className="h_input_field_wrap">
                      <FiShield className="h_input_icon" />
                      <input
                        type="password"
                        inputMode="numeric"
                        placeholder="***"
                        maxLength="3"
                        value={form.cvv}
                        onChange={(e) => onCvvChange(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: "0.68rem",
                    opacity: 0.38,
                    textAlign: "center",
                    marginTop: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "5px",
                  }}
                >
                  <FiShield /> Your payment is encrypted and secure.
                </p>
              </div>
            )}

            {/* STEP 5: REVIEW */}
            {step === 5 && (
              <div className="h_content_card">
                <div className="h_summary_glass">
                  <h3>Review Details</h3>
                  <div className="h_summary_row">
                    <label>Date & Time</label>
                    <span>
                      {form.date} at {formattedTime}
                    </span>
                  </div>
                  <div className="h_summary_row">
                    <label>Party Size</label>
                    <span>
                      {form.guests} {form.guests === 1 ? "Person" : "People"}
                    </span>
                  </div>
                  <div className="h_summary_row">
                    <label>Table</label>
                    <span>Table #{form.table}</span>
                  </div>
                  <div className="h_summary_row">
                    <label>Patron</label>
                    <span>{form.name}</span>
                  </div>
                  <div className="h_summary_row">
                    <label>Contact</label>
                    <span>{form.email}</span>
                  </div>
                  <div className="h_summary_row">
                    <label>Seating Area</label>
                    <span>{form.seatingArea || "Not selected"}</span>
                  </div>
                  <div className="h_summary_row">
                    <label>Occasion</label>
                    <span>{form.specialOccasion || "None"}</span>
                  </div>
                  <div className="h_summary_row">
                    <label>Requests</label>
                    <span>{form.specialRequests || "No special requests"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: CONFIRMED */}
            {step === 6 && (
              <div className="h_content_card">
                <div className="h_confirm_wrap">
                  <div className="h_confirm_icon">
                    <FiCheck />
                  </div>
                  <h2
                    style={{
                      fontSize: "3rem",
                      marginBottom: "1rem",
                      color: "var(--z-emerald)",
                    }}
                  >
                    Confirmed
                  </h2>
                  <p
                    style={{
                      opacity: 0.55,
                      maxWidth: "360px",
                      lineHeight: 1.7,
                      fontSize: "0.95rem",
                    }}
                  >
                    Your table is reserved. A confirmation has been sent to{" "}
                    <strong>{form.email}</strong>.
                  </p>
                  <button
                    className="h_btn_next"
                    style={{ marginTop: "3rem" }}
                    onClick={() => {
                      setStep(1);
                      setForm({
                        guests: 2,
                        date: new Date().toISOString().split("T")[0],
                        table: null,
                        name: "",
                        email: "",
                        phone: "",
                        seatingArea: "",
                        specialOccasion: "none",
                        specialRequests: "",
                        agreePolicy: false,
                        card: "",
                        expiry: "",
                        cvv: "",
                      });
                    }}
                  >
                    New Reservation
                  </button>
                </div>
              </div>
            )}

            {/* FOOTER */}
            {step < 6 && (
              <div className="h_footer">
                {step > 1 ? (
                  <button
                    className="h_btn_back"
                    onClick={() => setStep((p) => p - 1)}
                  >
                    ← Return to previous
                  </button>
                ) : (
                  <span />
                )}
                <button
                  className="h_btn_next"
                  onClick={handleNext}
                  disabled={loading}
                >
                  {loading
                    ? "Processing..."
                    : step === 5
                      ? "Confirm Now"
                      : "Continue"}
                  {step < 5 && !loading && <FiChevronRight />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
