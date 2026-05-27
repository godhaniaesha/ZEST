import { useState } from "react";

/* ─────────────────────────────────────────────
   ZEST Café & Bar — Reservation Page v3
   Prefix: h_res_  |  Concept: Immersive Dark
───────────────────────────────────────────── */

const h_res_css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,600&family=Inter:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── PAGE ── */
  .h_res_page {
    min-height: 100vh;
    background: #fff;
    font-family: 'Inter', sans-serif;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow-x: hidden;
  }

  .h_res_page::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 55% at 75% 15%, rgba(201,168,76,0.06) 0%, transparent 65%),
      radial-gradient(ellipse 50% 50% at 20% 85%, rgba(22,48,43,0.6) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }

  /* ── NOISE TEXTURE OVERLAY ── */
  .h_res_page::after {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
    opacity: 0.4;
  }

  /* ── NAV BAR ── */
  .h_res_navbar {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2rem 4rem;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }

  .h_res_logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.6rem;
    font-weight: 700;
    letter-spacing: 8px;
    text-transform: uppercase;
    color: #0b1a17;
  }

  .h_res_logo span { color: #C9A84C; }

  .h_res_nav_tag {
    font-size: 0.62rem;
    font-weight: 500;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    border: 1px solid rgba(255,255,255,0.1);
    padding: 0.5rem 1.2rem;
    border-radius: 99px;
  }

  /* ── MAIN BODY ── */
  .h_res_body {
    position: relative;
    z-index: 2;
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1.1fr;
    max-width: 1280px;
    margin: 0 auto;
    width: 100%;
    padding: 5rem 4rem;
    gap: 6rem;
    align-items: start;
  }

  /* ── LEFT COLUMN ── */
  .h_res_left_col {
    position: sticky;
    top: 5rem;
  }

  .h_res_eyebrow {
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #C9A84C;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  .h_res_eyebrow::before {
    content: '';
    display: block;
    width: 28px;
    height: 1px;
    background: #C9A84C;
  }

  .h_res_hero_title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 4.8rem;
    font-weight: 300;
    line-height: 1.05;
    color: #0b1a17;
    margin-bottom: 2rem;
    letter-spacing: -1px;
  }

  .h_res_hero_title em {
    font-style: italic;
    color: #C9A84C;
    font-weight: 300;
  }

  .h_res_hero_desc {
    font-size: 0.88rem;
    color: rgba(255,255,255,0.35);
    line-height: 1.9;
    font-weight: 300;
    max-width: 340px;
    margin-bottom: 4rem;
  }

  /* Step trail */
  .h_res_trail {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .h_res_trail_item {
    display: flex;
    align-items: flex-start;
    gap: 1.2rem;
    padding-bottom: 2.2rem;
    position: relative;
    opacity: 0.28;
    transition: opacity 0.4s;
  }

  .h_res_trail_item.h_res_t_active { opacity: 1; }
  .h_res_trail_item.h_res_t_done { opacity: 0.55; }

  .h_res_trail_item::before {
    content: '';
    position: absolute;
    left: 16px;
    top: 36px;
    bottom: 0;
    width: 1px;
    background: rgba(255,255,255,0.08);
  }

  .h_res_trail_item:last-child::before { display: none; }

  .h_res_trail_dot {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.15);
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-family: 'Cormorant Garamond', serif;
    font-size: 1rem;
    color: rgba(255,255,255,0.4);
    transition: all 0.4s;
  }

  .h_res_trail_item.h_res_t_active .h_res_trail_dot {
    background: #C9A84C;
    border-color: #C9A84C;
    color: #0b1a17;
    font-weight: 700;
    box-shadow: 0 0 20px rgba(201,168,76,0.35);
  }

  .h_res_trail_item.h_res_t_done .h_res_trail_dot {
    background: rgba(201,168,76,0.15);
    border-color: rgba(201,168,76,0.3);
    color: #C9A84C;
  }

  .h_res_trail_text { padding-top: 0.4rem; }

  .h_res_trail_title {
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: rgba(11, 26, 23, 0.23);
    margin-bottom: 0.25rem;
  }

  .h_res_trail_item.h_res_t_active .h_res_trail_title { color: #fff; }

  .h_res_trail_sub {
    font-size: 0.75rem;
    color: #16302b;
    font-weight: 300;
  }

  /* ── RIGHT COLUMN — FORM CARD ── */
  .h_res_form_card {
    background: #0b1a17;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 28px;
    padding: 3.5rem;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  /* Step header */
  .h_res_step_hd {
    margin-bottom: 3rem;
    padding-bottom: 2.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  .h_res_step_num {
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #C9A84C;
    margin-bottom: 0.9rem;
  }

  .h_res_step_title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2.6rem;
    font-weight: 300;
    color: #fff;
    line-height: 1.1;
    letter-spacing: -0.5px;
  }

  /* ── ALERT ── */
  .h_res_alert {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 1rem 1.4rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
    margin-bottom: 2rem;
    animation: h_res_fadeUp 0.3s ease;
  }

  @keyframes h_res_fadeUp {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .h_res_alert_error {
    background: rgba(231,76,60,0.12);
    border: 1px solid rgba(231,76,60,0.25);
    color: #ff8a80;
  }

  .h_res_alert_success {
    background: rgba(46,204,113,0.1);
    border: 1px solid rgba(46,204,113,0.2);
    color: #69f0ae;
  }

  /* ── LABEL ── */
  .h_res_lbl {
    display: block;
    font-size: 0.6rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 2.5px;
    color: rgba(255,255,255,0.35);
    margin-bottom: 1rem;
  }

  /* ── SEGMENT ── */
  .h_res_seg {
    margin-bottom: 2.8rem;
  }

  /* ── GUEST COUNTER ── */
  .h_res_counter_row {
    display: flex;
    align-items: center;
    gap: 0;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    overflow: hidden;
    width: fit-content;
  }

  .h_res_counter_btn {
    width: 52px;
    height: 52px;
    background: none;
    border: none;
    color: rgba(255,255,255,0.5);
    font-size: 1.4rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 300;
  }

  .h_res_counter_btn:hover { background: rgba(201,168,76,0.1); color: #C9A84C; }

  .h_res_counter_val {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2rem;
    font-weight: 600;
    color: #fff;
    min-width: 60px;
    text-align: center;
    border-left: 1px solid rgba(255,255,255,0.06);
    border-right: 1px solid rgba(255,255,255,0.06);
    padding: 0 1rem;
  }

  .h_res_counter_suffix {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.3);
    padding: 0 1.2rem;
    font-weight: 300;
  }

  /* Large group note */
  .h_res_lg_note {
    margin-top: 1rem;
    font-size: 0.72rem;
    color: rgba(201,168,76,0.7);
    font-weight: 300;
  }

  /* ── SETTING CARDS ── */
  .h_res_setting_grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.8rem;
  }

  .h_res_setting_card {
    padding: 1.4rem 0.8rem 1.2rem;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: rgba(255,255,255,0.02);
    user-select: none;
  }

  .h_res_setting_card:hover {
    border-color: rgba(201,168,76,0.4);
    background: rgba(201,168,76,0.05);
    transform: translateY(-3px);
  }

  .h_res_setting_card.h_res_picked {
    border-color: #C9A84C;
    background: rgba(201,168,76,0.1);
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(201,168,76,0.12);
  }

  .h_res_setting_icon {
    font-size: 1.6rem;
    margin-bottom: 0.6rem;
    display: block;
  }

  .h_res_setting_name {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: rgba(255,255,255,0.7);
    display: block;
    margin-bottom: 0.25rem;
  }

  .h_res_setting_card.h_res_picked .h_res_setting_name { color: #C9A84C; }

  .h_res_setting_hint {
    font-size: 0.62rem;
    color: rgba(255,255,255,0.25);
    display: block;
  }

  /* ── DATE INPUT ── */
  .h_res_date_inp {
    width: 100%;
    padding: 1.1rem 1.5rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 14px;
    font-family: 'Inter', sans-serif;
    font-size: 0.95rem;
    color: #fff;
    outline: none;
    transition: all 0.25s;
    color-scheme: dark;
  }

  .h_res_date_inp:focus {
    border-color: rgba(201,168,76,0.5);
    background: rgba(201,168,76,0.05);
  }

  /* ── TIME CHIPS ── */
  .h_res_time_row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.7rem;
  }

  .h_res_time_chip {
    padding: 0.7rem 1.3rem;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    font-size: 0.8rem;
    font-weight: 500;
    color: rgba(255,255,255,0.45);
    cursor: pointer;
    transition: all 0.22s;
    background: rgba(255,255,255,0.03);
    user-select: none;
    letter-spacing: 0.3px;
  }

  .h_res_time_chip:hover { border-color: rgba(201,168,76,0.4); color: rgba(255,255,255,0.8); }

  .h_res_time_chip.h_res_picked {
    background: #C9A84C;
    border-color: #C9A84C;
    color: #0b1a17;
    font-weight: 600;
    box-shadow: 0 4px 18px rgba(201,168,76,0.3);
  }

  /* ── TEXT INPUTS ── */
  .h_res_inp_group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.4rem;
    margin-bottom: 0;
  }

  .h_res_inp_full { grid-column: 1 / -1; }

  .h_res_field_wrap { display: flex; flex-direction: column; gap: 0.7rem; }

  .h_res_text_inp {
    width: 100%;
    padding: 1.1rem 1.4rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 14px;
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    color: #fff;
    outline: none;
    transition: all 0.25s;
  }

  .h_res_text_inp::placeholder { color: rgba(255,255,255,0.2); }

  .h_res_text_inp:focus {
    border-color: rgba(201,168,76,0.45);
    background: rgba(201,168,76,0.04);
  }

  /* ── SELECT ── */
  .h_res_sel_inp {
    width: 100%;
    padding: 1.1rem 1.4rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 14px;
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    color: rgba(255,255,255,0.75);
    outline: none;
    transition: all 0.25s;
    cursor: pointer;
    color-scheme: dark;
  }

  .h_res_sel_inp:focus { border-color: rgba(201,168,76,0.45); }

  /* ── TEXTAREA ── */
  .h_res_ta_inp {
    width: 100%;
    padding: 1.1rem 1.4rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 14px;
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    color: #fff;
    outline: none;
    transition: all 0.25s;
    resize: vertical;
    min-height: 90px;
  }

  .h_res_ta_inp::placeholder { color: rgba(255,255,255,0.2); }
  .h_res_ta_inp:focus { border-color: rgba(201,168,76,0.45); }

  /* ── SUMMARY TABLE ── */
  .h_res_summary_box {
    background: rgba(201,168,76,0.04);
    border: 1px solid rgba(201,168,76,0.15);
    border-radius: 18px;
    padding: 2rem;
    margin-top: 2.5rem;
  }

  .h_res_summary_head {
    font-size: 0.6rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 3px;
    color: #C9A84C;
    margin-bottom: 1.5rem;
  }

  .h_res_sum_row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0.9rem 0;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }

  .h_res_sum_row:last-child { border-bottom: none; }

  .h_res_sum_k {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: rgba(255,255,255,0.28);
    font-weight: 500;
  }

  .h_res_sum_v {
    font-size: 0.85rem;
    color: rgba(255,255,255,0.85);
    font-weight: 500;
    text-align: right;
    max-width: 55%;
  }

  /* ── NAVIGATION ── */
  .h_res_foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 3rem;
    padding-top: 2.5rem;
    border-top: 1px solid rgba(255,255,255,0.06);
  }

  .h_res_btn_back {
    background: none;
    border: none;
    font-family: 'Inter', sans-serif;
    font-size: 0.68rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: rgba(255,255,255,0.3);
    cursor: pointer;
    transition: color 0.2s;
    padding: 0;
  }

  .h_res_btn_back:hover { color: rgba(255,255,255,0.7); }

  .h_res_btn_cta {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 2.8rem;
    background: linear-gradient(135deg, #C9A84C 0%, #a8893a 100%);
    color: #0b1a17;
    border: none;
    border-radius: 99px;
    font-family: 'Inter', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 6px 30px rgba(201,168,76,0.25);
  }

  .h_res_btn_cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(201,168,76,0.4);
    background: linear-gradient(135deg, #d4b560, #C9A84C);
  }

  .h_res_btn_cta:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

  .h_res_btn_arrow {
    width: 26px;
    height: 26px;
    background: rgba(0,0,0,0.15);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
  }

  /* ── LOADER ── */
  .h_res_loader {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(0,0,0,0.2);
    border-top-color: #0b1a17;
    border-radius: 50%;
    animation: h_res_spin 0.65s linear infinite;
    display: inline-block;
  }

  @keyframes h_res_spin { to { transform: rotate(360deg); } }

  /* ── STEP ANIMATION ── */
  .h_res_step_body {
    animation: h_res_stepIn 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  }

  @keyframes h_res_stepIn {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── SUCCESS ── */
  .h_res_success_wrap {
    text-align: center;
    padding: 3rem 1rem 2rem;
    animation: h_res_stepIn 0.5s ease;
  }

  .h_res_success_icon_wrap {
    position: relative;
    width: 100px;
    height: 100px;
    margin: 0 auto 3rem;
  }

  .h_res_success_ring1 {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1px solid rgba(201,168,76,0.25);
    animation: h_res_pulse 2.5s ease-in-out infinite;
  }

  .h_res_success_ring2 {
    position: absolute;
    inset: 12px;
    border-radius: 50%;
    border: 1px solid rgba(201,168,76,0.35);
  }

  .h_res_success_core {
    position: absolute;
    inset: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #C9A84C, #a8893a);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: #0b1a17;
    font-weight: 700;
    box-shadow: 0 8px 30px rgba(201,168,76,0.4);
    animation: h_res_popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s both;
  }

  @keyframes h_res_pulse {
    0%, 100% { transform: scale(1); opacity: 0.4; }
    50% { transform: scale(1.08); opacity: 0.8; }
  }

  @keyframes h_res_popIn {
    from { transform: scale(0); }
    to { transform: scale(1); }
  }

  .h_res_success_title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 3.5rem;
    font-weight: 300;
    color: #fff;
    margin-bottom: 1.2rem;
    line-height: 1;
  }

  .h_res_success_sub {
    font-size: 0.85rem;
    color: rgba(255,255,255,0.4);
    line-height: 1.9;
    max-width: 360px;
    margin: 0 auto 2.5rem;
    font-weight: 300;
  }

  .h_res_ref_badge {
    display: inline-block;
    background: rgba(201,168,76,0.08);
    border: 1px solid rgba(201,168,76,0.2);
    border-radius: 10px;
    padding: 0.8rem 2rem;
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #C9A84C;
    margin-bottom: 3rem;
  }

  /* ── TOAST ── */
  .h_res_toast_stack {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }

  .h_res_toast {
    background: rgba(22,48,43,0.95);
    border: 1px solid rgba(201,168,76,0.3);
    color: #fff;
    padding: 1rem 1.8rem;
    border-radius: 14px;
    font-size: 0.82rem;
    font-weight: 500;
    box-shadow: 0 8px 30px rgba(0,0,0,0.4);
    backdrop-filter: blur(10px);
    animation: h_res_toastIn 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  }

  @keyframes h_res_toastIn {
    from { transform: translateX(20px) scale(0.95); opacity: 0; }
    to   { transform: translateX(0) scale(1); opacity: 1; }
  }

  /* ── DIVIDER ── */
  .h_res_divider {
    height: 1px;
    background: rgba(255,255,255,0.05);
    margin: 2rem 0;
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 1100px) {
    .h_res_body { grid-template-columns: 1fr; gap: 3rem; padding: 3rem 2.5rem; }
    .h_res_left_col { position: static; }
    .h_res_trail { flex-direction: row; overflow-x: auto; padding-bottom: 1rem; }
    .h_res_trail_item { flex-direction: column; align-items: center; padding-bottom: 0; padding-right: 2rem; min-width: 80px; text-align: center; }
    .h_res_trail_item::before { display: none; }
    .h_res_trail_sub { display: none; }
    .h_res_hero_title { font-size: 3.2rem; }
  }

  @media (max-width: 768px) {
    .h_res_navbar { padding: 1.5rem 2rem; }
    .h_res_nav_tag { display: none; }
    .h_res_body { padding: 2rem 1.5rem; }
    .h_res_form_card { padding: 2rem 1.5rem; }
    .h_res_setting_grid { grid-template-columns: repeat(2, 1fr); }
    .h_res_inp_group { grid-template-columns: 1fr; }
    .h_res_inp_full { grid-column: 1; }
    .h_res_step_title { font-size: 2rem; }
    .h_res_hero_title { font-size: 2.8rem; }
    .h_res_hero_desc { display: none; }
  }

  @media (max-width: 480px) {
    .h_res_body { padding: 1.5rem 1rem; }
    .h_res_form_card { padding: 1.8rem 1.2rem; border-radius: 20px; }
    .h_res_setting_grid { grid-template-columns: repeat(2, 1fr); gap: 0.6rem; }
    .h_res_btn_cta { padding: 1rem 2rem; }
    .h_res_hero_title { font-size: 2.2rem; }
  }
`;

const STEP_META = [
  { id: 1, title: "Party",    sub: "Guests & ambiance" },
  { id: 2, title: "When",     sub: "Date & time slot"  },
  { id: 3, title: "You",      sub: "Contact details"   },
  { id: 4, title: "Confirm",  sub: "Review & book"     },
];

const SETTINGS = [
  { id: "Indoor",  icon: "🏛️",  name: "Interiors",  hint: "Curated indoor" },
  { id: "Garden",  icon: "🌿",  name: "Garden",     hint: "Al-fresco patio" },
  { id: "Rooftop", icon: "🌃",  name: "Rooftop",    hint: "Open sky bar" },
  { id: "Bar",     icon: "🍸",  name: "Bar Seating", hint: "Counter side" },
];

const TIMES = [
  { v: "19:00", l: "7:00 PM" }, { v: "19:30", l: "7:30 PM" },
  { v: "20:00", l: "8:00 PM" }, { v: "20:30", l: "8:30 PM" },
  { v: "21:00", l: "9:00 PM" }, { v: "21:30", l: "9:30 PM" },
  { v: "22:00", l: "10:00 PM"},
];

const genRef = () => "ZST-" + Math.random().toString(36).slice(2,7).toUpperCase();
const fmtDate = d => {
  if (!d) return "—";
  try { return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" }); }
  catch { return d; }
};

export default function ZestReservation() {
  const [step, setStep]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert]   = useState(null);
  const [toasts, setToasts] = useState([]);
  const [animKey, setAnimKey] = useState(0);
  const [bookingRef]        = useState(genRef);

  const [form, setForm] = useState({
    guests: 2, location: "Indoor",
    date: "", time: "",
    fullName: "", email: "", phone: "",
    occasion: "None", requests: "",
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const addToast = msg => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const goNext = () => {
    if (step === 1 && !form.guests) return setAlert({ type:"error", msg:"Please set the number of guests." });
    if (step === 2 && (!form.date || !form.time)) return setAlert({ type:"error", msg:"Please choose a date and time slot." });
    if (step === 3) {
      if (!form.fullName || !form.email || !form.phone)
        return setAlert({ type:"error", msg:"Please fill in all contact fields." });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        return setAlert({ type:"error", msg:"Please enter a valid email address." });
    }
    setAlert(null);
    setAnimKey(k => k + 1);
    setStep(p => p + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goPrev = () => {
    setAlert(null);
    setAnimKey(k => k + 1);
    setStep(p => p - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addToast("🥂 Table reserved — we look forward to your visit!");
      setAnimKey(k => k + 1);
      setStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 2200);
  };

  const reset = () => {
    setStep(1); setAlert(null); setAnimKey(k => k + 1);
    setForm({ guests:2, location:"Indoor", date:"", time:"", fullName:"", email:"", phone:"", occasion:"None", requests:"" });
  };

  return (
    <>
      <style>{h_res_css}</style>

      <div className="h_res_page">

        {/* NAV */}
        <nav className="h_res_navbar">
          <div className="h_res_logo">Z<span>E</span>ST</div>
          <div className="h_res_nav_tag">Table Reservation</div>
        </nav>

        {/* BODY */}
        <div className="h_res_body">

          {/* LEFT */}
          <aside className="h_res_left_col">
            <div className="h_res_eyebrow">Reserve a Table</div>
            <h1 className="h_res_hero_title">
              An Evening<br />
              <em>Worth</em><br />
              Remembering.
            </h1>
            <p className="h_res_hero_desc">
              ZEST brings together the finest ingredients, craft cocktails, and a setting designed to elevate every occasion. Let us take care of the rest.
            </p>

            {step < 5 && (
              <div className="h_res_trail">
                {STEP_META.map(s => (
                  <div
                    key={s.id}
                    className={`h_res_trail_item ${step === s.id ? "h_res_t_active" : ""} ${step > s.id ? "h_res_t_done" : ""}`}
                  >
                    <div className="h_res_trail_dot">
                      {step > s.id ? "✓" : s.id}
                    </div>
                    <div className="h_res_trail_text">
                      <div className="h_res_trail_title">{s.title}</div>
                      <div className="h_res_trail_sub">{s.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>

          {/* RIGHT — FORM CARD */}
          <div className="h_res_form_card">

            {/* Alert */}
            {alert && step < 5 && (
              <div className={`h_res_alert h_res_alert_${alert.type}`}>
                {alert.type === "error" ? "✕" : "✓"} {alert.msg}
              </div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <div className="h_res_step_body" key={`s1_${animKey}`}>
                <div className="h_res_step_hd">
                  <div className="h_res_step_num">Step 01 / 04</div>
                  <div className="h_res_step_title">Party Size<br />&amp; Setting</div>
                </div>

                <div className="h_res_seg">
                  <label className="h_res_lbl">Number of Guests</label>
                  <div className="h_res_counter_row">
                    <button
                      className="h_res_counter_btn"
                      onClick={() => set("guests", Math.max(1, form.guests - 1))}
                    >−</button>
                    <div className="h_res_counter_val">{form.guests}</div>
                    <button
                      className="h_res_counter_btn"
                      onClick={() => set("guests", Math.min(20, form.guests + 1))}
                    >+</button>
                    <div className="h_res_counter_suffix">
                      {form.guests === 1 ? "Guest" : "Guests"}
                    </div>
                  </div>
                  {form.guests >= 9 && (
                    <div className="h_res_lg_note">
                      ✦ For large parties, our team will reach out to confirm details.
                    </div>
                  )}
                </div>

                <div className="h_res_seg">
                  <label className="h_res_lbl">Preferred Setting</label>
                  <div className="h_res_setting_grid">
                    {SETTINGS.map(s => (
                      <div
                        key={s.id}
                        className={`h_res_setting_card ${form.location === s.id ? "h_res_picked" : ""}`}
                        onClick={() => set("location", s.id)}
                      >
                        <span className="h_res_setting_icon">{s.icon}</span>
                        <span className="h_res_setting_name">{s.name}</span>
                        <span className="h_res_setting_hint">{s.hint}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="h_res_step_body" key={`s2_${animKey}`}>
                <div className="h_res_step_hd">
                  <div className="h_res_step_num">Step 02 / 04</div>
                  <div className="h_res_step_title">Date &amp;<br />Time Slot</div>
                </div>

                <div className="h_res_seg">
                  <label className="h_res_lbl">Reservation Date</label>
                  <input
                    className="h_res_date_inp"
                    type="date"
                    value={form.date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={e => set("date", e.target.value)}
                  />
                </div>

                <div className="h_res_seg">
                  <label className="h_res_lbl">Available Time Slots</label>
                  <div className="h_res_time_row">
                    {TIMES.map(t => (
                      <div
                        key={t.v}
                        className={`h_res_time_chip ${form.time === t.v ? "h_res_picked" : ""}`}
                        onClick={() => set("time", t.v)}
                      >{t.l}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="h_res_step_body" key={`s3_${animKey}`}>
                <div className="h_res_step_hd">
                  <div className="h_res_step_num">Step 03 / 04</div>
                  <div className="h_res_step_title">Contact<br />Details</div>
                </div>

                <div className="h_res_seg">
                  <div className="h_res_inp_group">
                    <div className="h_res_field_wrap h_res_inp_full">
                      <label className="h_res_lbl">Full Name</label>
                      <input className="h_res_text_inp" type="text" placeholder="e.g. Rahul Sharma"
                        value={form.fullName} onChange={e => set("fullName", e.target.value)} />
                    </div>
                    <div className="h_res_field_wrap">
                      <label className="h_res_lbl">Mobile Number</label>
                      <input className="h_res_text_inp" type="tel" placeholder="+91 98765 43210"
                        value={form.phone} onChange={e => set("phone", e.target.value)} />
                    </div>
                    <div className="h_res_field_wrap">
                      <label className="h_res_lbl">Email Address</label>
                      <input className="h_res_text_inp" type="email" placeholder="you@example.com"
                        value={form.email} onChange={e => set("email", e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="h_res_step_body" key={`s4_${animKey}`}>
                <div className="h_res_step_hd">
                  <div className="h_res_step_num">Step 04 / 04</div>
                  <div className="h_res_step_title">Review &amp;<br />Confirm</div>
                </div>

                <div className="h_res_seg">
                  <div className="h_res_inp_group">
                    <div className="h_res_field_wrap h_res_inp_full">
                      <label className="h_res_lbl">Special Occasion</label>
                      <select className="h_res_sel_inp" value={form.occasion} onChange={e => set("occasion", e.target.value)}>
                        <option value="None">Regular Dining</option>
                        <option value="Birthday">🎂 Birthday Celebration</option>
                        <option value="Anniversary">💍 Anniversary</option>
                        <option value="Date Night">🕯️ Date Night</option>
                        <option value="Business">💼 Business Dinner</option>
                        <option value="Family">👨‍👩‍👧 Family Gathering</option>
                      </select>
                    </div>
                    <div className="h_res_field_wrap h_res_inp_full">
                      <label className="h_res_lbl">Additional Requests</label>
                      <textarea className="h_res_ta_inp"
                        placeholder="Dietary requirements, table preferences, surprise setups..."
                        value={form.requests} onChange={e => set("requests", e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="h_res_summary_box">
                  <div className="h_res_summary_head">✦ Booking Summary</div>
                  {[
                    ["Guests",   `${form.guests} ${form.guests === 1 ? "Guest" : "Guests"}`],
                    ["Setting",  form.location],
                    ["Date",     fmtDate(form.date)],
                    ["Time",     TIMES.find(t => t.v === form.time)?.l || form.time],
                    ["Reserved for", form.fullName],
                    ["Contact",  form.email],
                    ["Occasion", form.occasion],
                  ].map(([k, v]) => (
                    <div className="h_res_sum_row" key={k}>
                      <span className="h_res_sum_k">{k}</span>
                      <span className="h_res_sum_v">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUCCESS */}
            {step === 5 && (
              <div className="h_res_success_wrap" key="success">
                <div className="h_res_success_icon_wrap">
                  <div className="h_res_success_ring1" />
                  <div className="h_res_success_ring2" />
                  <div className="h_res_success_core">✓</div>
                </div>
                <div className="h_res_success_title">Table Reserved</div>
                <p className="h_res_success_sub">
                  Welcome, {form.fullName.split(" ")[0]}. Your table is confirmed and a
                  confirmation has been sent to <strong style={{color:"rgba(255,255,255,0.7)"}}>{form.email}</strong>.
                  We look forward to an extraordinary evening.
                </p>
                <div className="h_res_ref_badge">Booking Ref: {bookingRef}</div>
                <button className="h_res_btn_cta" onClick={reset}>
                  New Reservation
                  <span className="h_res_btn_arrow">→</span>
                </button>
              </div>
            )}

            {/* FOOTER NAV */}
            {step < 5 && (
              <div className="h_res_foot">
                {step > 1
                  ? <button className="h_res_btn_back" onClick={goPrev}>← Back</button>
                  : <span />
                }
                {step < 4
                  ? (
                    <button className="h_res_btn_cta" onClick={goNext}>
                      Continue
                      <span className="h_res_btn_arrow">→</span>
                    </button>
                  ) : (
                    <button className="h_res_btn_cta" disabled={loading} onClick={submit}>
                      {loading
                        ? <><span className="h_res_loader" /> Confirming…</>
                        : <>Confirm Reservation <span className="h_res_btn_arrow">✓</span></>
                      }
                    </button>
                  )
                }
              </div>
            )}

          </div>
        </div>
      </div>

      {/* TOASTS */}
      <div className="h_res_toast_stack">
        {toasts.map(t => (
          <div key={t.id} className="h_res_toast">{t.msg}</div>
        ))}
      </div>
    </>
  );
}