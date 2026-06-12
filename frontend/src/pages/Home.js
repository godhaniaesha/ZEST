import { useState, useEffect } from "react";
import {
  FaCoffee,
  FaGlassCheers,
  FaClock,
  FaMapMarkerAlt,
  FaStar,
  FaArrowRight,
  FaPenNib,
  FaArrowDown,
} from "react-icons/fa";
import {
  FaCocktail,
  FaLeaf,
  FaMusic,
  FaMobileAlt,
  FaBirthdayCake,
} from "react-icons/fa";
import { FaBolt, FaCreditCard } from "react-icons/fa";
import { FaArrowRightLong } from "react-icons/fa6";
import { blogAPI } from "../api";
import { normalizeBlogPost } from "../utils/blogUtils";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────
    ROOT TOKENS  (mirrors your :root exactly)
  ───────────────────────────────────────────── */
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500;600&family=Cinzel:wght@400;600;700&display=swap');

  :root {
    --d-primary: #16302B;
    --d-primary-light: #1f4238;
    --d-primary-lighter: #254d40;
    --d-primary-dark: #0e1f1c;
    --d-accent: #E0E0E0;
    --d-accent-soft: #f0f0f0;
    --d-accent-muted: #c8c8c8;
    --d-gold: #C9A84C;
    --d-gold-light: #e4c47a;
    --d-gold-dark: #a8893a;
    --d-success: #2ecc71;
    --d-warning: #f39c12;
    --d-danger: #e74c3c;
    --d-info: #3498db;
    --d-white: #ffffff;
    --d-bg: #f5f4f0;
    --d-bg-card: #ffffff;
    --d-border: #e2e0da;
    --d-text: #1a1a1a;
    --d-text-muted: #6b7280;
    --d-text-light: #9ca3af;
    --d-sidebar-width: 260px;
    --d-sidebar-collapsed: 72px;
    --d-navbar-height: 64px;
    --d-shadow-sm: 0 1px 3px rgba(22,48,43,0.08);
    --d-shadow-md: 0 4px 16px rgba(22,48,43,0.12);
    --d-shadow-lg: 0 8px 32px rgba(22,48,43,0.18);
    --d-radius-sm: 6px;
    --d-radius-md: 12px;
    --d-radius-lg: 20px;
    --d-transition: all 0.28s cubic-bezier(0.4,0,0.2,1);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--d-bg);
    color: var(--d-text);
    overflow-x: hidden;
  }

  /* ── NOISE TEXTURE OVERLAY ── */
  .d_noise::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 1;
  }

  /* ── HERO ── */
  .d_hero {
    position: relative;
    background: var(--d-primary);
    display: flex;
    align-items: center;
    overflow: hidden;
    isolation: isolate;
  }

  .d_hero_bg_pattern {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(ellipse 80% 60% at 75% 50%, rgba(201,168,76,0.11) 0%, transparent 70%),
      radial-gradient(ellipse 40% 40% at 12% 82%, rgba(201,168,76,0.06) 0%, transparent 62%);
    pointer-events: none;
  }

  .d_hero_lines {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .d_hero_lines::before {
    content: '';
    position: absolute;
    top: -24%;
    right: -8%;
    width: 58%;
    height: 152%;
    border-left: 1px solid rgba(201,168,76,0.12);
    border-right: 1px solid rgba(201,168,76,0.06);
    transform: rotate(-10deg);
  }

  .d_hero_lines::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 80px,
      rgba(201,168,76,0.02) 80px,
      rgba(201,168,76,0.02) 81px
    );
  }

  .d_hero_image_side {
    position: absolute;
    right: 0;
    top: 0;
    width: 50%;
    height: 100%;
    overflow: hidden;
    clip-path: polygon(10% 0, 100% 0, 100% 100%, 0% 100%);
  }

  .d_hero_image_side .d_hero_swiper,
  .d_hero_image_side .swiper,
  .d_hero_image_side .swiper-wrapper,
  .d_hero_image_side .swiper-slide {
    width: 100%;
    height: 100%;
  }

  .d_hero_image_side img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 1;
    filter: saturate(0.85) contrast(1.05) brightness(0.95);
  }

  .d_hero_swiper .swiper-pagination {
    bottom: 28px;
    right: 28px;
    left: auto;
    width: auto;
    display: flex;
    gap: 8px;
  }

  .d_hero_swiper .swiper-pagination-bullet {
    width: 8px;
    height: 8px;
    background: rgba(201,168,76,0.35);
    opacity: 1;
    transition: var(--d-transition);
  }

  .d_hero_swiper .swiper-pagination-bullet-active {
    background: var(--d-gold);
    transform: scale(1.15);
  }

  .d_hero_image_side::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(to right, rgba(22,48,43,0.15) 0%, transparent 40%),
      linear-gradient(to top, rgba(14,31,28,0.5) 0%, transparent 44%);
    z-index: 1;
  }

  .d_hero_container {
    position: relative;
    z-index: 2;
    width: min(1240px, 100%);
    margin: 0 auto;
    padding: 108px 5% 92px;
  }

  .d_hero_content_wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: clamp(28px, 4vw, 56px);
    width: 100%;
  }

  .d_hero_content {
    width: min(690px, 100%);
  }

  .d_hero_title_topline {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
    color: rgba(224,224,224,0.64);
    font-size: 11px;
    letter-spacing: 0.24em;
    text-transform: uppercase;
  }

  .d_hero_title_topline::before {
    content: '';
    width: 40px;
    height: 1px;
    background: linear-gradient(90deg, rgba(201,168,76,0.25), rgba(201,168,76,0.8));
  }

  .d_hero_title_topline::after {
    content: '';
    width: 40px;
    height: 1px;
    background: linear-gradient(90deg, rgba(201,168,76,0.8), rgba(201,168,76,0.25));
  }

  .d_hero_eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: 'Cinzel', serif;
    font-size: 11px;
    letter-spacing: 0.3em;
    color: var(--d-gold);
    text-transform: uppercase;
    margin-bottom: 28px;
  }

  .d_hero_eyebrow::before,
  .d_hero_eyebrow::after {
    content: '';
    width: 32px;
    height: 1px;
    background: var(--d-gold);
    opacity: 0.6;
  }

  /* ============================================================
    HERO
    ============================================================ */
  .d_hero_wrapper {
  height: auto;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .d_hero_image_bg {
    position: absolute;
    inset: 0;
    background: url('https://images.unsplash.com/photo-1574096079513-d8259312b785?auto=format&fit=crop&w=1920&q=90') center/cover no-repeat;
  }

  .d_hero_dimmer {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg,
      rgba(14,31,28,0.25) 0%,
      rgba(14,31,28,0.50) 40%,
      rgba(14,31,28,0.90) 82%,
      var(--dk) 100%
    );
  }

  .d_hero_inner {
    position: relative;
    z-index: 3;
    max-width: 1000px;
    padding: 50px 20px 30px;
    width: 100%;
  }

  .d_hero_side_tag {
    position: absolute;
    left: 36px;
    bottom: 130px;
    z-index: 4;
    writing-mode: vertical-rl;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 4px;
    color: var(--dk-muted);
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .d_hero_side_tag::after {
    content: '';
    display: block;
    width: 1px;
    height: 56px;
    background: var(--gold);
    margin-top: 12px;
  }

  .d_hero_eyebrow_row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    margin-bottom: 30px;
  }

  .d_hero_dash {
    display: block;
    width: 44px;
    height: 1px;
    background: var(--gold);
    opacity: 0.6;
  }

  .d_hero_eyebrow {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 6px;
    color: var(--gold);
    text-transform: uppercase;
    animation: eyebrow_in 1.8s ease-out forwards;
  }

  @keyframes eyebrow_in {
    from { letter-spacing: 2px; opacity: 0; }
    to   { letter-spacing: 6px; opacity: 1; }
  }

  .d_hero_main_title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2.8rem, 2.5vw, 5.4rem);
    font-weight: 500;
    letter-spacing: 3px;
    line-height: 1.1;
    color: #fff;
    margin: 0 auto 30px;
  }

  .d_hero_em {
  font-family: 'Cinzel', serif;
    font-style: italic;
    font-weight: 300;
    color: var(--gold-lt);
    font-size: 1.05em;
    letter-spacing: 6px;
  }

  .d_hero_paragraph {
    font-size: clamp(0.95rem, 2.2vw, 1.1rem);
    font-weight: 300;
    line-height: 1.85;
    max-width: 680px;
    color: rgba(232,224,212,0.75);
    margin-bottom: 44px;
  }

  .d_hero_cta_row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    flex-wrap: wrap;
    margin-bottom: 45px;
  }

  .d_cta_gold {
    display: inline-flex;
    align-items: center;
    background: linear-gradient(135deg, var(--gold-dk), var(--gold), var(--gold-lt));
    color: var(--dk-deep) !important;
    font-weight: 800;
    font-size: 0.78rem;
    letter-spacing: 2.5px;
    border: none;
    border-radius: var(--r-sm);
    padding: 17px 44px;
    text-decoration: none;
    transition: var(--ease);
    box-shadow: var(--sh-gold);
  }
  .d_cta_gold:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(201,168,76,0.38); color: var(--dk-deep) !important; }

  .d_cta_ghost {
    display: inline-flex;
    align-items: center;
    background: transparent;
    color: #fff !important;
    border: 1px solid rgba(255,255,255,0.35);
    font-weight: 700;
    font-size: 0.78rem;
    letter-spacing: 2.5px;
    border-radius: var(--r-sm);
    padding: 17px 44px;
    text-decoration: none;
    transition: var(--ease);
  }
  .d_cta_ghost:hover { border-color: var(--gold); color: var(--gold) !important; transform: translateY(-2px); }

  /* Stat bar */
  .d_hero_stat_row {
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 480px;
    margin: 0 auto;
    border: 1px solid rgba(201,168,76,0.2);
    border-radius: var(--r-sm);
    background: rgba(14,31,28,0.55);
    backdrop-filter: blur(10px);
    overflow: hidden;
  }

  .d_hero_stat {
    flex: 1;
    padding: 18px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .d_stat_num {
    font-family: 'Cinzel', serif;
    font-size: 1.45rem;
    font-weight: 700;
    color: var(--gold);
    line-height: 1;
  }

  .d_stat_label {
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 1.5px;
    color: var(--dk-muted);
    text-transform: uppercase;
  }

  .d_hero_stat_divider {
    width: 1px;
    height: 42px;
    background: rgba(201,168,76,0.2);
  }

  .d_hero_scroll_hint {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.6rem;
    letter-spacing: 4px;
    text-align: center;
    color: var(--dk-muted);
    z-index: 4;
    display: flex;
    gap: 14px;
  }

  .d_arrow_bounce {
    animation: bounce_y 2.5s infinite;
    display: block;
    margin: -1px auto 0;
    color: var(--gold);
  }

  @keyframes bounce_y {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(8px); }
  }
  .d_hero_title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(56px, 7vw, 84px);
    font-weight: 300;
    line-height: 0.98;
    color: rgba(255,255,255,0.96);
    letter-spacing: -0.015em;
    margin-bottom: 14px;
    text-wrap: balance;
    text-shadow: 0 10px 24px rgba(0,0,0,0.26);
  }

  .d_hero_title em {
    font-style: italic;
    color: var(--d-gold-light);
    font-weight: 300;
  }

  .d_hero_title_highlight {
    background: linear-gradient(180deg, #fff8e3 8%, var(--d-gold-light) 50%, var(--d-gold) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
    padding-right: 2px;
  }

  .d_hero_subtitle {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(20px, 3vw, 32px);
    font-weight: 400;
    color: rgba(224,224,224,0.58);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 28px;
  }

  .d_hero_desc {
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    line-height: 1.8;
    color: rgba(224,224,224,0.65);
    max-width: 520px;
    margin-bottom: 44px;
  }

  .d_hero_actions {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  .d_hero_glass_stats {
    position: relative;
    z-index: 2;
    width: min(350px, 100%);
    background: linear-gradient(160deg, rgba(13,33,28,0.72) 0%, rgba(16,39,34,0.56) 100%);
    border: 1px solid rgba(201,168,76,0.26);
    border-radius: var(--d-radius-lg);
    backdrop-filter: blur(12px);
    padding: 24px 24px 22px;
    box-shadow: 0 18px 50px rgba(0,0,0,0.25);
  }

  .d_hero_glass_title {
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(224,224,224,0.74);
    margin-bottom: 14px;
  }

  .d_hero_glass_list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .d_hero_glass_item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid rgba(201,168,76,0.12);
  }

  .d_hero_glass_item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .d_hero_glass_label {
    font-size: 12px;
    color: rgba(224,224,224,0.65);
    letter-spacing: 0.04em;
  }

  .d_hero_glass_value {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    color: var(--d-gold-light);
    line-height: 1;
  }

  @media (max-width: 1280px) {
    .d_hero_container { width: min(1160px, 100%); }
    .d_hero_title { font-size: clamp(52px, 6.8vw, 86px); }
  }

  .d_btn_primary {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: var(--d-gold);
    color: var(--d-primary-dark);
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 16px 32px;
    border: none;
    border-radius: var(--d-radius-sm);
    cursor: pointer;
    transition: var(--d-transition);
    text-decoration: none;
  }

  .d_btn_primary:hover {
    background: var(--d-gold-light);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(201,168,76,0.3);
  }

  .d_btn_outline {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: transparent;
    color: var(--d-white);
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 15px 32px;
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: var(--d-radius-sm);
    cursor: pointer;
    transition: var(--d-transition);
    text-decoration: none;
  }

  .d_btn_outline:hover {
    border-color: var(--d-gold);
    color: var(--d-gold);
    background: rgba(201,168,76,0.06);
  }

  .d_hero_scroll_indicator {
    position: absolute;
    bottom: 34px;
    left: max(5%, calc((100% - 1240px) / 2 + 5%));
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 12px;
    color: rgba(224,224,224,0.4);
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .d_scroll_line {
    width: 40px;
    height: 1px;
    background: rgba(201,168,76,0.4);
    position: relative;
    overflow: hidden;
  }

  .d_scroll_line::after {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 100%; height: 100%;
    background: var(--d-gold);
    animation: d_scroll_anim 2s ease-in-out infinite;
  }

  @keyframes d_scroll_anim {
    0% { left: -100%; }
    100% { left: 100%; }
  }

  /* ── STATS BAR ── */
  .d_stats_bar {
    background: var(--d-primary-dark);
    border-top: 1px solid rgba(201,168,76,0.15);
    border-bottom: 1px solid rgba(201,168,76,0.15);
  }

  .d_stats_inner {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    max-width: 1200px;
    margin: 0 auto;
  }

  .d_stat_item {
    padding: 28px 32px;
    text-align: center;
    border-right: 1px solid rgba(201,168,76,0.1);
    transition: var(--d-transition);
  }

  .d_stat_item:last-child { border-right: none; }

  .d_stat_item:hover { background: rgba(201,168,76,0.03); }

  .d_stat_num {
    font-family: 'Cormorant Garamond', serif;
    font-size: 40px;
    font-weight: 600;
    color: var(--d-gold);
    line-height: 1;
    margin-bottom: 6px;
  }

  .d_stat_label {
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(224,224,224,0.45);
    font-family: 'DM Sans', sans-serif;
  }

  /* ── LIGHT SECTION BG DECOR ── */
  .d_light_section {
    position: relative;
    overflow: hidden;
    isolation: isolate;
  }

  .d_light_section::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 55% 45% at 8% 18%, rgba(201,168,76,0.07) 0%, transparent 68%),
      radial-gradient(ellipse 45% 40% at 92% 78%, rgba(22,48,43,0.05) 0%, transparent 65%);
    pointer-events: none;
    z-index: 0;
  }

  .d_light_section_decor {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }

  .d_light_section > .d_section,
  .d_light_section > div:not(.d_light_section_decor) {
    position: relative;
    z-index: 1;
  }

  .d_decor_icon {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--d-primary);
    opacity: 0.055;
    line-height: 1;
    --decor-rotate: 0deg;
    animation: d_decor_float 14s ease-in-out infinite;
  }

  .d_decor_icon.d_decor_sm { font-size: clamp(48px, 6vw, 72px); }
  .d_decor_icon.d_decor_md { font-size: clamp(64px, 8vw, 96px); }
  .d_decor_icon.d_decor_lg { font-size: clamp(80px, 10vw, 120px); }

  .d_decor_icon:nth-child(2) { animation-delay: -3s; }
  .d_decor_icon:nth-child(3) { animation-delay: -6s; }
  .d_decor_icon:nth-child(4) { animation-delay: -9s; }
  .d_decor_icon:nth-child(5) { animation-delay: -11s; }
  .d_decor_icon:nth-child(6) { animation-delay: -2s; }

  @keyframes d_decor_float {
    0%, 100% { transform: rotate(var(--decor-rotate)) translateY(0); }
    50% { transform: rotate(var(--decor-rotate)) translateY(-12px); }
  }

  .d_light_section_dots {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(22,48,43,0.06) 1px, transparent 1px);
    background-size: 28px 28px;
    opacity: 0.35;
    pointer-events: none;
    z-index: 0;
  }

  /* ── SECTION COMMON ── */
  .d_section {
    padding: 100px 5%;
    max-width: 1300px;
    margin: 0 auto;
  }

  .d_section_wide {
    padding: 70px 0;
  }

  .d_section_tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'Cinzel', serif;
    font-size: 11px;
    letter-spacing: 0.3em;
    color: var(--d-gold-dark);
    text-transform: uppercase;
    margin-bottom: 16px;
    font-weight: 600;
  }

  .d_section_tag::before {
    content: '';
    width: 24px;
    height: 1px;
    background: var(--d-gold);
  }

  .d_section_title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(36px, 4.5vw, 58px);
    font-weight: 300;
    line-height: 1.1;
    color: var(--d-primary);
    margin-bottom: 20px;
    text-wrap: balance;
  }

  .d_section_title em {
    font-style: italic;
    color: var(--d-gold-dark);
  }

  .d_section_lead {
    font-size: 16px;
    line-height: 1.8;
    color: var(--d-text-muted);
    max-width: 560px;
  }

  .d_menu_card,
  .d_event_card,
  .d_testi_card {
    box-shadow: 0 10px 26px rgba(22,48,43,0.08);
  }

  /* ── ABOUT / STORY ── */
  .d_about_grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
  }

  .d_about_images {
    position: relative;
  }

  .d_about_img_main {
    width: 100%;
    aspect-ratio: 4/5;
    object-fit: cover;
    border-radius: var(--d-radius-lg);
    display: block;
  }

  .d_about_img_accent {
    position: absolute;
    bottom: -32px;
    right: -32px;
    width: 55%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: var(--d-radius-md);
    border: 6px solid var(--d-bg);
    box-shadow: var(--d-shadow-lg);
  }

  .d_about_badge {
    position: absolute;
    top: 32px;
    left: -24px;
    background: var(--d-primary);
    color: var(--d-white);
    border-radius: var(--d-radius-md);
    padding: 20px 24px;
    text-align: center;
    box-shadow: var(--d-shadow-lg);
  }

  .d_about_badge_num {
    font-family: 'Cormorant Garamond', serif;
    font-size: 36px;
    font-weight: 600;
    color: var(--d-gold);
    line-height: 1;
    display: block;
  }

  .d_about_badge_text {
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(224,224,224,0.7);
    white-space: nowrap;
  }

  .d_about_features {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 40px;
  }

  .d_feature_pill {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: var(--d-bg-card);
    border-radius: var(--d-radius-md);
    border: 1px solid var(--d-border);
    transition: var(--d-transition);
  }

  .d_feature_pill:hover {
    border-color: var(--d-gold);
    box-shadow: var(--d-shadow-md);
    transform: translateY(-2px);
  }

  .d_event_card::before,
  .d_exp_card::before,
  .d_feature_pill::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    border: 1px solid transparent;
    transition: var(--d-transition);
  }

  .d_event_card:hover::before,
  .d_exp_card:hover::before,
  .d_feature_pill:hover::before {
    border-color: rgba(201,168,76,0.28);
  }

  .d_feature_icon {
    width: 40px;
    height: 40px;
    border-radius: var(--d-radius-sm);
    background: rgba(22,48,43,0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }

  .d_feature_text {
    font-size: 13px;
    font-weight: 500;
    color: var(--d-primary);
  }

  /* ── MENU SHOWCASE ── */
  .d_menu_section {
    background: var(--d-primary);
    position: relative;
    overflow: hidden;
  }

  .d_menu_section .d_section_title,
  .d_menu_section .d_section_tag {
    color: var(--d-gold);
  }

  .d_menu_section .d_section_lead {
    color: rgba(224,224,224,0.6);
  }

  .d_menu_tabs {
    display: flex;
    gap: 4px;
    margin: 40px 0 48px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(201,168,76,0.15);
    border-radius: var(--d-radius-md);
    padding: 4px;
    width: fit-content;
    flex-wrap: nowrap;
  }

  .d_menu_tab {
    padding: 10px 28px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border: none;
    border-radius: calc(var(--d-radius-md) - 4px);
    cursor: pointer;
    transition: var(--d-transition);
    color: rgba(224,224,224,0.5);
    background: transparent;
  }

  .d_menu_tab.d_active {
    background: var(--d-gold);
    color: var(--d-primary-dark);
    font-weight: 600;
  }

  .d_menu_tab:hover:not(.d_active) {
    color: var(--d-gold);
    background: rgba(201,168,76,0.08);
  }

  .d_menu_grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }

  .d_menu_card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(201,168,76,0.12);
    border-radius: var(--d-radius-lg);
    overflow: hidden;
    transition: var(--d-transition);
    cursor: pointer;
  }

  .d_menu_card:hover {
    border-color: rgba(201,168,76,0.4);
    background: rgba(255,255,255,0.07);
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.3);
  }

  .d_menu_img {
    width: 100%;
    aspect-ratio: 16/10;
    object-fit: cover;
    display: block;
    filter: saturate(0.85);
    transition: var(--d-transition);
  }

  .d_menu_card:hover .d_menu_img {
    filter: saturate(1);
    transform: scale(1.03);
  }

  .d_menu_img_wrap {
    overflow: hidden;
    position: relative;
  }

  .d_menu_tag_badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: var(--d-gold);
    color: var(--d-primary-dark);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 5px 12px;
    border-radius: var(--d-radius-sm);
  }

  .d_menu_card_body {
    padding: 20px 24px 24px;
  }

  .d_menu_card_name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 600;
    color: var(--d-white);
    margin-bottom: 6px;
  }

  .d_menu_card_desc {
    font-size: 13px;
    color: rgba(224,224,224,0.5);
    line-height: 1.6;
    margin-bottom: 16px;
  }

  .d_menu_card_footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .d_menu_price {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px;
    font-weight: 600;
    color: var(--d-gold);
  }

  .d_order_btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 18px;
    border: 1px solid rgba(201,168,76,0.4);
    border-radius: var(--d-radius-sm);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--d-gold);
    background: transparent;
    cursor: pointer;
    transition: var(--d-transition);
  }

  .d_order_btn:hover {
    background: var(--d-gold);
    color: var(--d-primary-dark);
  }

  /* ── EXPERIENCE / AMBIANCE ── */
  .d_exp_section {
    background:
      radial-gradient(circle at 78% 18%, rgba(201,168,76,0.12) 0%, transparent 44%),
      linear-gradient(145deg, var(--d-primary-dark) 0%, var(--d-primary) 55%, var(--d-primary-light) 100%);
  }

  .d_experience_grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 34px;
    align-items: stretch;
  }

  .d_exp_visual_panel {
    position: relative;
    padding: 18px;
    border-radius: var(--d-radius-lg);
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(201,168,76,0.2);
    backdrop-filter: blur(8px);
  }

  .d_exp_mosaic {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 180px 180px 140px;
    gap: 12px;
  }

  .d_exp_img {
    width: 100%;
    object-fit: cover;
    border-radius: var(--d-radius-md);
    display: block;
    box-shadow: 0 10px 24px rgba(0,0,0,0.24);
    transition: var(--d-transition);
  }

  .d_exp_visual_panel:hover .d_exp_img {
    transform: scale(1.02);
  }

  .d_exp_img.d_tall {
    grid-row: span 2;
    height: 100%;
  }

  .d_exp_img.d_short {
    height: 100%;
  }

  .d_exp_floating_badge {
    position: absolute;
    right: 26px;
    bottom: 26px;
    background: rgba(14,31,28,0.9);
    border: 1px solid rgba(201,168,76,0.4);
    border-radius: var(--d-radius-md);
    padding: 14px 16px;
    min-width: 150px;
    box-shadow: var(--d-shadow-lg);
  }

  .d_exp_badge_title {
    display: block;
    font-family: 'Cormorant Garamond', serif;
    font-size: 30px;
    color: var(--d-gold-light);
    line-height: 1;
    margin-bottom: 4px;
  }

  .d_exp_badge_sub {
    display: block;
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(224,224,224,0.62);
  }

  .d_exp_content {
    position: relative;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(201,168,76,0.2);
    border-radius: var(--d-radius-lg);
    padding: 34px 30px;
    box-shadow: 0 16px 36px rgba(0,0,0,0.2);
  }

  .d_exp_lead {
    max-width: 100%;
    margin-bottom: 24px;
    color: rgba(224,224,224,0.72);
  }

  .d_exp_meta_strip {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 24px;
  }

  .d_exp_meta_item {
    border: 1px solid rgba(201,168,76,0.2);
    border-radius: var(--d-radius-sm);
    background: rgba(255,255,255,0.04);
    padding: 12px 10px;
    text-align: center;
  }

  .d_exp_meta_icon {
    color: var(--d-gold-light);
    margin-bottom: 6px;
    font-size: 14px;
  }

  .d_exp_meta_label {
    font-size: 10px;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: rgba(224,224,224,0.58);
    margin-bottom: 4px;
  }

  .d_exp_meta_value {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    color: var(--d-white);
    line-height: 1;
  }

  .d_exp_cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 0;
  }

  .d_exp_card {
    display: flex;
    gap: 14px;
    padding: 15px 16px;
    background: rgba(255,255,255,0.05);
    border-radius: 10px;
    border: 1px solid rgba(201,168,76,0.18);
    transition: var(--d-transition);
    position: relative;
  }

  .d_exp_card:hover {
    border-color: var(--d-gold);
    box-shadow: var(--d-shadow-md);
    transform: translateY(-2px);
  }

  .d_exp_icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(201,168,76,0.14);
    color: var(--d-gold-light);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }

  .d_exp_card_title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 19px;
    font-weight: 600;
    color: var(--d-white);
    margin-bottom: 4px;
  }

  .d_exp_card_desc {
    font-size: 13px;
    color: rgba(224,224,224,0.66);
    line-height: 1.6;
  }

  /* ── RESERVATION ── */
  .d_reservation_section {
    background: var(--d-primary-dark);
    position: relative;
    overflow: hidden;
  }

  .d_reservation_section::before {
    content: '';
    position: absolute;
    top: -100px;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  .d_res_inner {
    max-width: 900px;
    margin: 0 auto;
    padding: 100px 5%;
    text-align: center;
  }

  .d_res_inner .d_section_title {
    color: var(--d-white);
  }

  .d_res_inner .d_section_lead {
    color: rgba(224,224,224,0.55);
    margin: 0 auto 48px;
  }

  .d_res_form {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(201,168,76,0.15);
    border-radius: var(--d-radius-lg);
    padding: 40px;
  }

  .d_res_grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 20px;
  }

  .d_form_group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-align: left;
  }

  .d_form_label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(224,224,224,0.5);
  }

  .d_form_input {
    width: 100%;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(201,168,76,0.18);
    border-radius: var(--d-radius-sm);
    padding: 14px 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: var(--d-white);
    transition: var(--d-transition);
    outline: none;
  }

  .d_form_input::placeholder { color: rgba(224,224,224,0.25); }

  .d_form_input:focus {
    border-color: var(--d-gold);
    background: rgba(201,168,76,0.04);
  }

  .d_form_input option { background: var(--d-primary-dark); color: var(--d-white); }

  .d_res_submit {
    width: 100%;
    padding: 18px;
    background: var(--d-gold);
    color: var(--d-primary-dark);
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border: none;
    border-radius: var(--d-radius-sm);
    cursor: pointer;
    transition: var(--d-transition);
    margin-top: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .d_res_submit:hover {
    background: var(--d-gold-light);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(201,168,76,0.3);
  }

  /* ── EVENTS ── */
  .d_events_grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
  }

  .d_event_card {
    background: var(--d-bg-card);
    border-radius: var(--d-radius-lg);
    border: 1px solid var(--d-border);
    overflow: hidden;
    transition: var(--d-transition);
    position: relative;
  }

  .d_event_card:hover {
    box-shadow: var(--d-shadow-lg);
    transform: translateY(-4px);
    border-color: var(--d-gold);
  }

  .d_event_img_wrap {
    position: relative;
    overflow: hidden;
  }

  .d_event_img {
    width: 100%;
    aspect-ratio: 16/9;
    object-fit: cover;
    display: block;
    transition: var(--d-transition);
  }

  .d_event_card:hover .d_event_img { transform: scale(1.05); }

  .d_event_date_badge {
    position: absolute;
    top: 16px;
    left: 16px;
    background: var(--d-primary);
    border: 1px solid rgba(201,168,76,0.3);
    border-radius: var(--d-radius-sm);
    padding: 8px 14px;
    text-align: center;
  }

  .d_event_day {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px;
    font-weight: 700;
    color: var(--d-gold);
    line-height: 1;
    display: block;
  }

  .d_event_month {
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(224,224,224,0.6);
  }

  .d_event_body {
    padding: 24px;
  }
    .d_event_body {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
  }

  .d_event_footer {
      position: relative;
      bottom: 6%;
  }
  .d_event_type {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--d-gold-dark);
    margin-bottom: 8px;
  }

  .d_event_name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 600;
    color: var(--d-primary);
    margin-bottom: 10px;
    line-height: 1.2;
  }

  .d_event_meta {
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: var(--d-text-muted);
    margin-bottom: 10px;
  }

  .d_event_meta span {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .d_event_register {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--d-primary);
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: var(--d-transition);
    background: none;
    border: none;
    padding: 0;
    text-transform: uppercase;
    font-family: 'DM Sans', sans-serif;
  }

  .d_event_register:hover { color: var(--d-gold-dark); gap: 10px; }

  /* ── TESTIMONIALS ── */
  .d_testi_section {
    background: linear-gradient(135deg, var(--d-primary) 0%, var(--d-primary-light) 100%);
    position: relative;
    overflow: hidden;
  }

  .d_testi_inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 100px 5%;
  }

  .d_testi_grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
    margin-top: 56px;
  }

  .d_testi_card {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(201,168,76,0.15);
    border-radius: var(--d-radius-lg);
    padding: 36px 32px;
    transition: var(--d-transition);
    position: relative;
  }

  .d_testi_card:hover {
    border-color: rgba(201,168,76,0.4);
    background: rgba(255,255,255,0.08);
  }

  .d_testi_quote_mark {
    font-family: 'Cormorant Garamond', serif;
    font-size: 80px;
    font-weight: 700;
    color: var(--d-gold);
    opacity: 0.25;
    line-height: 0.5;
    margin-bottom: 20px;
    display: block;
  }

  .d_testi_text {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    font-style: italic;
    line-height: 1.7;
    color: rgba(224,224,224,0.85);
    margin-bottom: 28px;
  }

  .d_testi_author {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .d_testi_avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 2px solid rgba(201,168,76,0.3);
    object-fit: cover;
    display: block;
    background: var(--d-primary-lighter);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px;
    font-weight: 600;
    color: var(--d-gold);
    flex-shrink: 0;
  }

  .d_testi_name {
    font-weight: 600;
    font-size: 15px;
    color: var(--d-white);
  }

  .d_testi_role {
    font-size: 12px;
    color: rgba(224,224,224,0.45);
    letter-spacing: 0.05em;
  }

  .d_testi_stars {
    display: flex;
    gap: 2px;
    color: var(--d-gold);
    font-size: 13px;
    margin-bottom: 16px;
  }

  /* ── ONLINE ORDER CTA ── */
  .d_order_cta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    background: var(--d-bg-card);
    border: 1px solid var(--d-border);
    border-radius: var(--d-radius-lg);
    overflow: hidden;
    box-shadow: var(--d-shadow-lg);
    max-width: 1100px;
    margin: 0 auto;
  }

  .d_order_cta_left {
    background: var(--d-primary);
    padding: 64px 56px;
    position: relative;
    overflow: hidden;
  }

  .d_order_cta_left::before {
    content: '';
    position: absolute;
    bottom: -40px;
    right: -40px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    border: 1px solid rgba(201,168,76,0.15);
  }

  .d_order_cta_left::after {
    content: '';
    position: absolute;
    bottom: -80px;
    right: -80px;
    width: 320px;
    height: 320px;
    border-radius: 50%;
    border: 1px solid rgba(201,168,76,0.07);
  }

  .d_order_cta_title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 44px;
    font-weight: 300;
    line-height: 1.1;
    color: var(--d-white);
    margin-bottom: 16px;
  }

  .d_order_cta_title em {
    font-style: italic;
    color: var(--d-gold-light);
  }

  .d_order_cta_desc {
    font-size: 15px;
    line-height: 1.7;
    color: rgba(224,224,224,0.6);
    margin-bottom: 36px;
  }

  .d_order_cta_right {
    padding: 64px 56px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .d_order_feature {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 20px 0;
    border-bottom: 1px solid var(--d-border);
  }

  .d_order_feature:last-child { border-bottom: none; }

  .d_order_feature_icon {
    width: 44px;
    height: 44px;
    border-radius: var(--d-radius-sm);
    background: rgba(22,48,43,0.07);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }

  .d_order_feature_title {
    font-weight: 600;
    font-size: 15px;
    color: var(--d-primary);
    margin-bottom: 4px;
  }

  .d_order_feature_desc {
    font-size: 13px;
    color: var(--d-text-muted);
    line-height: 1.5;
  }

  /* ── GALLERY ── */
  .d_gallery_section {
      position: relative;
    overflow: hidden;
  }

  .d_gallery_section::before {
    content: '';
    position: absolute;
    top: -200px;
    right: -200px;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%);
    pointer-events: none;
  }

  .d_gallery_grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: 250px 250px;
    gap: 16px;
  }

  .d_gallery_item {
    overflow: hidden;
    border-radius: var(--d-radius-md);
    cursor: pointer;
    position: relative;
    border: 1px solid rgba(201,168,76,0.15);
    transition: var(--d-transition);
  }

  .d_gallery_item:hover {
    border-color: rgba(201,168,76,0.4);
    box-shadow: 0 20px 50px rgba(0,0,0,0.4);
  }

  .d_gallery_item.d_wide { grid-column: span 2; }
  .d_gallery_item.d_tall { grid-row: span 2; }

  .d_gallery_img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: all 0.6s cubic-bezier(0.4,0,0.2,1);
  }

  .d_gallery_item:hover .d_gallery_img {
    transform: scale(1.1);
    filter: brightness(0.7);
  }

  .d_gallery_overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(14,31,28,0.9) 0%, rgba(22,48,43,0.2) 50%, transparent 100%);
    opacity: 0;
    transition: var(--d-transition);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 24px;
  }

  .d_gallery_item:hover .d_gallery_overlay {
    opacity: 1;
  }

  .d_gallery_caption {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    color: var(--d-gold-light);
    font-weight: 600;
    margin-bottom: 4px;
    transform: translateY(10px);
    transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
    opacity: 0;
  }

  .d_gallery_item:hover .d_gallery_caption {
    transform: translateY(0);
    opacity: 1;
  }

  .d_gallery_subcaption {
    font-size: 12px;
    color: rgba(224,224,224,0.7);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    transform: translateY(10px);
    transition: all 0.4s cubic-bezier(0.4,0,0.2,1) 0.1s;
    opacity: 0;
  }

  .d_gallery_item:hover .d_gallery_subcaption {
    transform: translateY(0);
    opacity: 1;
  }

  /* ── TOAST ── */
  .d_toast {
    position: fixed;
    bottom: 32px;
    right: 32px;
    background: var(--d-primary);
    color: var(--d-white);
    border: 1px solid rgba(201,168,76,0.3);
    border-radius: var(--d-radius-md);
    padding: 16px 24px;
    font-size: 14px;
    z-index: 9999;
    box-shadow: var(--d-shadow-lg);
    animation: d_toast_in 0.3s ease;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  @keyframes d_toast_in {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 1024px) {
    .d_hero { align-items: stretch; }
    .d_hero_container { padding: 92px 5% 82px; }
    .d_hero_image_side { width: 48%; opacity: 0.9; }
    .d_hero_content_wrap { flex-direction: column; align-items: center; text-align: center; }
    .d_hero_content { width: min(760px, 100%); }
    .d_hero_title_topline { justify-content: center; }
    .d_hero_desc { max-width: 660px; margin: 0 auto 36px; }
    .d_hero_actions { justify-content: center; }
    .d_hero_glass_stats { width: min(560px, 100%); }
    .d_hero_glass_item { text-align: left; }
    .d_hero_scroll_indicator { left: 50%; transform: translateX(-50%); }
    .d_menu_grid { grid-template-columns: repeat(3, 1fr); }
    .d_testi_grid { grid-template-columns: repeat(2, 1fr); }
    .d_about_images { max-width: 100%; }
    .d_about_img_accent { right: 0; }
    .d_experience_grid { grid-template-columns: 1fr; gap: 24px; }
    .d_exp_visual_panel { max-width: 760px; margin: 0 auto; }
    .d_exp_content { text-align: left; max-width: 760px; margin: 0 auto; padding: 28px 24px; }
    .d_exp_lead { margin: 0 0 22px; }
    .d_exp_cards { max-width: 760px; margin: 28px auto 0; }
    .d_gallery_grid { grid-template-columns: repeat(3, 1fr); }
    .d_gallery_item.d_wide { grid-column: span 2; }
  }

  @media (max-width: 900px) {
    .d_hero_container { padding: 90px 5% 78px; }
    .d_hero_image_side { width: 100%; opacity: 0.34; }
    .d_hero_image_side::before {
      background:
        linear-gradient(180deg, rgba(14,31,28,0.62) 0%, rgba(22,48,43,0.84) 50%, var(--d-primary) 100%),
        linear-gradient(90deg, rgba(22,48,43,0.65) 0%, rgba(22,48,43,0.08) 100%);
    }
    .d_hero_title { font-size: clamp(52px, 9.3vw, 78px); }
    .d_about_img_main { aspect-ratio: 3 / 5;  }
    
  }

  @media (max-width: 768px) {

    .d_stats_inner { grid-template-columns: repeat(2, 1fr); }
    .d_stat_item:nth-child(2) { border-right: none; }
    .d_menu_grid { grid-template-columns: repeat(2, 1fr); }
    .d_events_grid { grid-template-columns: repeat(2, 1fr); }
    .d_testi_grid { grid-template-columns: 1fr; }
    .d_res_grid { grid-template-columns: 1fr; }
    .d_hero_image_side { display: none; }
    .d_gallery_grid { grid-template-columns: repeat(2, 1fr); }
    .d_gallery_item.d_tall { grid-row: span 1; }
    .d_order_cta_left,
    .d_order_cta_right { padding: 40px 32px; }
    .d_exp_visual_panel { padding: 12px; }
    .d_exp_mosaic { gap: 10px; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto auto; }
    .d_exp_img.d_tall { grid-row: span 1; aspect-ratio: 4/3; height: auto; }
    .d_exp_img.d_short { aspect-ratio: 4/3; height: auto; }
    .d_exp_floating_badge { right: 16px; bottom: 16px; min-width: 132px; padding: 12px 12px; }
    .d_exp_badge_title { font-size: 22px; }
    .d_exp_content { padding: 22px 18px; }
    .d_exp_cards { margin-top: 8px; }
    .d_exp_meta_strip { grid-template-columns: 1fr; }
    .d_exp_card { align-items: flex-start; text-align: left; }
    .d_hero { min-height: auto; }
    .d_hero_container { padding: 48px 5% 78px; }
    .d_hero_title { font-size: clamp(44px, 11.4vw, 66px); }
    .d_hero_title_topline { font-size: 10px; letter-spacing: 0.2em; margin-bottom: 12px; }
    .d_hero_subtitle { font-size: clamp(18px, 4.5vw, 24px); }
    .d_hero_desc { max-width: 100%; margin-bottom: 30px; }
    .d_hero_glass_stats { padding: 18px 20px; border-radius: var(--d-radius-md); }
    .d_hero_scroll_indicator { bottom: 18px; }
    .d_section { padding: 48px 5%; }
    .d_order_cta { grid-template-columns: 1fr; }
  }
    @media (max-width:700px){
    .d_about_grid { grid-template-columns: 1fr; gap: 48px; }
    .d_about_img_main { aspect-ratio: 7 / 5;  }
      .d_about_img_accent {     width: 40%;
      aspect-ratio: 2 / 2; }
    }
  
  @media (max-width: 576px) {
    .d_menu_grid { grid-template-columns: 1fr; }
    .d_events_grid { grid-template-columns: 1fr; }
    .d_about_badge { left: -12px; }
  }

  @media (max-width: 480px) {
    .d_about_features { grid-template-columns: 1fr; }

    .d_section { padding: 64px 5%; }
    .d_stats_inner { grid-template-columns: repeat(2, 1fr); }
    .d_gallery_grid { grid-template-columns: 1fr; }
    .d_gallery_item.d_wide { grid-column: span 1; }
    .d_exp_mosaic { grid-template-columns: 1fr; grid-template-rows: auto; }
    .d_exp_img.d_tall,
    .d_exp_img.d_short { aspect-ratio: 4/3; grid-row: auto; height: auto; }
    .d_exp_floating_badge { position: static; margin-top: 12px; width: fit-content; }
    .d_exp_card { padding: 16px; gap: 12px; }
    .d_exp_card_title { font-size: 18px; }
    .d_exp_card_desc { font-size: 13px; }
    .d_hero_eyebrow { letter-spacing: 0.18em; font-size: 10px; }
    .d_hero_title { font-size: clamp(38px, 13vw, 54px); }
    .d_hero_title_topline::before { width: 28px; }
    .d_hero_subtitle { font-size: 16px; letter-spacing: 0.06em; }
    .d_hero_desc { font-size: 14px; line-height: 1.65; }
    .d_hero_actions { width: 100%; }
    .d_btn_primary, .d_btn_outline { width: 100%; justify-content: center; }
    .d_hero_glass_title { margin-bottom: 10px; }
    .d_hero_glass_item { padding: 8px 0; }
    .d_hero_glass_label { font-size: 11px; }
    .d_hero_glass_value { font-size: 20px; }
    .d_hero_scroll_indicator { display: none; }
    .d_menu_tab{ padding : 10px 15px }
  }

  @media (max-width: 360px) {
    .d_hero_container { padding: 36px 5% 70px; }
    .d_hero_title { font-size: 34px; }
    .d_hero_subtitle { font-size: 14px; }
    .d_hero_desc { font-size: 13px; }
  }
  `;

/* ─── DATA ──────────────────────────── */
const MENU_ITEMS = {
  food: [
    {
      name: "Saffron Risotto",
      desc: "Aged parmesan, wild mushrooms, truffle oil drizzle",
      price: "₹680",
      tag: "Chef's Pick",
      img: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&q=80",
    },
    {
      name: "Grilled Paneer Steak",
      desc: "Smoked paneer, herb butter, roasted vegetables, mint yogurt",
      price: "₹980",
      tag: "Signature",
      img: "https://i.pinimg.com/736x/c2/2d/e6/c22de692e1d328790389d5e179a35168.jpg",
    },
    {
      name: "Mezze Platter",
      desc: "House hummus, baba ganoush, pita, olives & pickles",
      price: "₹420",
      tag: "Sharing",
      img: "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=600&q=80",
    },
  ],
  drinks: [
    {
      name: "Dark & Stormy",
      desc: "Dark rum, ginger beer, fresh lime, bitters",
      price: "₹360",
      tag: "Classic",
      img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80",
    },
    {
      name: "Smoked Negroni",
      desc: "Gin, Campari, sweet vermouth, cedar smoke",
      price: "₹420",
      tag: "Signature",
      img: "https://images.unsplash.com/photo-1572096244012-63dfa5b6ae06?w=600&q=80",
    },
    {
      name: "Gold Rush",
      desc: "Bourbon, honey syrup, lemon juice, egg white foam",
      price: "₹390",
      tag: "House Fav",
      img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80",
    },
  ],
  coffee: [
    {
      name: "Reserve Pour-Over",
      desc: "Single-origin Ethiopian beans, notes of jasmine & berry",
      price: "₹280",
      tag: "Specialty",
      img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
    },
    {
      name: "Dalgona Cloud",
      desc: "Whipped espresso, vanilla cold foam, oat milk base",
      price: "₹220",
      tag: "Trending",
      img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&q=80",
    },
    {
      name: "Cardamom Latte",
      desc: "Double espresso, steamed milk, house cardamom blend",
      price: "₹240",
      tag: "Bestseller",
      img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80",
    },
  ],
};

const TESTIMONIALS = [
  {
    text: "The ambiance alone is worth the visit — warm, intimate, and refined. The cocktails are crafted with thoughtfulness, each sip tells a story.",
    name: "Priya Halmon",
    role: "Food Blogger",
    initials: "PH",
  },
  {
    text: "An evening that felt like a European escape without leaving the city. The lamb chops were transcendent and the service was genuinely attentive.",
    name: "Harshad Kaur",
    role: "Regular Guest",
    initials: "HK",
  },
  {
    text: "I've dined at many upscale venues, but the combination of coffee culture and bar here is truly unique. The Jazz Nights are unmissable events.",
    name: "Kavya Dair",
    role: "Food Critic",
    initials: "KD",
  },
];

const HERO_SLIDES = [
  {
    img: "https://imgmediagumlet.lbb.in/media/2026/01/695dd3702fc23c297f46882e_1767756656264.jpg",
    alt: "Café ambiance",
  },
  {
    img: "https://thepatriot.in/wp-content/uploads/2022/10/Cafe-Gumbad-2.jpg",
    alt: "Lounge interior",
  },
  {
    img: "https://ansainteriors.com/wp-content/uploads/2019/11/cafe-interior-design.jpg",
    alt: "Evening bar",
  },
  {
    img: "https://static.vecteezy.com/system/resources/thumbnails/052/183/531/small/cozy-coffee-shop-with-warm-lighting-and-big-window-creating-serene-atmosphere-photo.jpeg",
    alt: "Specialty coffee",
  },
];

const LIGHT_SECTION_DECOR = {
  about: [
    { Icon: FaCoffee, top: "6%", left: "4%", size: "d_decor_lg", rotate: -12 },
    { Icon: FaLeaf, top: "72%", left: "8%", size: "d_decor_md", rotate: 8 },
    {
      Icon: FaCocktail,
      top: "18%",
      right: "6%",
      size: "d_decor_md",
      rotate: 15,
    },
    { Icon: FaMusic, top: "58%", right: "4%", size: "d_decor_sm", rotate: -6 },
    {
      Icon: FaBirthdayCake,
      bottom: "8%",
      right: "12%",
      size: "d_decor_sm",
      rotate: 10,
    },
  ],
  order: [
    { Icon: FaBolt, top: "10%", right: "5%", size: "d_decor_lg", rotate: -8 },
    {
      Icon: FaMobileAlt,
      top: "55%",
      left: "3%",
      size: "d_decor_md",
      rotate: 12,
    },
    {
      Icon: FaCreditCard,
      bottom: "12%",
      right: "8%",
      size: "d_decor_sm",
      rotate: -14,
    },
    { Icon: FaCoffee, top: "28%", left: "6%", size: "d_decor_sm", rotate: 6 },
  ],
  blog: [
    { Icon: FaPenNib, top: "8%", left: "5%", size: "d_decor_md", rotate: -10 },
    { Icon: FaCoffee, top: "42%", right: "4%", size: "d_decor_lg", rotate: 8 },
    {
      Icon: FaCocktail,
      bottom: "10%",
      left: "7%",
      size: "d_decor_sm",
      rotate: 14,
    },
    { Icon: FaLeaf, top: "20%", right: "10%", size: "d_decor_sm", rotate: -5 },
  ],
  gallery: [
    {
      Icon: FaGlassCheers,
      top: "6%",
      right: "6%",
      size: "d_decor_lg",
      rotate: 12,
    },
    {
      Icon: FaCoffee,
      bottom: "14%",
      left: "5%",
      size: "d_decor_md",
      rotate: -8,
    },
    { Icon: FaStar, top: "38%", left: "4%", size: "d_decor_sm", rotate: 6 },
    {
      Icon: FaCocktail,
      top: "12%",
      left: "10%",
      size: "d_decor_sm",
      rotate: -12,
    },
    { Icon: FaMusic, bottom: "8%", right: "5%", size: "d_decor_md", rotate: 4 },
  ],
};

function LightSectionDecor({ variant = "about" }) {
  const items = LIGHT_SECTION_DECOR[variant] || LIGHT_SECTION_DECOR.about;
  return (
    <>
      <div className="d_light_section_dots" aria-hidden="true" />
      <div className="d_light_section_decor" aria-hidden="true">
        {items.map((item, i) => {
          const { Icon, top, left, right, bottom, size, rotate } = item;
          return (
            <span
              key={i}
              className={`d_decor_icon ${size}`}
              style={{
                top,
                left,
                right,
                bottom,
                "--decor-rotate": `${rotate}deg`,
              }}
            >
              <Icon />
            </span>
          );
        })}
      </div>
    </>
  );
}

/* ─── COMPONENT ─────────────────────── */
export default function Home() {
  const [activeTab, setActiveTab] = useState("food");
  const [toast, setToast] = useState(null);
  const [resForm, setResForm] = useState({
    name: "",
    date: "",
    time: "",
    guests: "",
    occasion: "",
  });
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();

  // Fetch blogs from backend
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await blogAPI.getAll();
        const data = Array.isArray(response.data) ? response.data : [];
        const transformedBlogs = data.map((blog) => {
          const normalized = normalizeBlogPost(blog);
          if (!normalized) return null;
          const date = new Date(normalized.createdAt);
          return {
            _id: normalized._id,
            day: date.getDate().toString(),
            month: date.toLocaleString('default', { month: 'short' }),
            category: normalized.category,
            title: normalized.title,
            author: normalized.author,
            readTime: `${normalized.readTime} min read`,
            img: normalized.image,
          };
        }).filter(Boolean);
        setBlogs(transformedBlogs);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };
    fetchBlogs();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleReserve = () => {
    if (!resForm.name || !resForm.date || !resForm.time) {
      showToast("⚠️ Please fill in all required fields");
      return;
    }
    showToast(
      "🎉 Reservation confirmed! We'll send a confirmation to your email.",
    );
    setResForm({ name: "", date: "", time: "", guests: "", occasion: "" });
  };
  const handlePostClick = (postId) => {
    navigate(`/blog/${postId}`);
  };
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />

      {/* ── 1. HERO ── */}
      <section className="d_hero d_noise">
        <div className="d_hero_bg_pattern" />
        <div className="d_hero_lines" />
        <div className="d_hero_image_side">
          <Swiper
            className="d_hero_swiper"
            modules={[Autoplay, Pagination, EffectFade]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            loop
            speed={900}
            autoplay={{ delay: 5200, disableOnInteraction: false }}
            pagination={{ clickable: true }}
          >
            {HERO_SLIDES.map((slide) => (
              <SwiperSlide key={slide.alt}>
                <img src={slide.img} alt={slide.alt} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="d_hero_container">
          <div className="d_hero_content_wrap">
            <div className="d_hero_content">
              <div className="d_hero_title_topline">Luxury Cafe Experience</div>
              <h1 className="d_hero_title">
                Where <span className="d_hero_title_highlight">Coffee</span>
                <br />
                Meets Crafted
                <br />
                <em>Evenings</em>
              </h1>
              <p className="d_hero_subtitle">Café · Bar · Dining Lounge</p>
              <p className="d_hero_desc">
                Discover a refined all-day destination where specialty brews,
                signature cocktails, and chef-curated plates come together in
                one timeless setting.
              </p>
              <div className="d_hero_actions">
                <a href="reservations" className="d_btn_primary">
                  Reserve a Table <FaArrowRightLong />
                </a>
                <a href="#menu" className="d_btn_outline">
                  Explore Menu
                </a>
              </div>
            </div>
            <div className="d_hero_glass_stats">
              <div className="d_hero_glass_title">Tonight at Zest</div>
              <div className="d_hero_glass_list">
                <div className="d_hero_glass_item">
                  <span className="d_hero_glass_label">Live Music Session</span>
                  <span className="d_hero_glass_value">8:30 PM</span>
                </div>
                <div className="d_hero_glass_item">
                  <span className="d_hero_glass_label">Chef's Degustation</span>
                  <span className="d_hero_glass_value">5 Course</span>
                </div>
                <div className="d_hero_glass_item">
                  <span className="d_hero_glass_label">Open Tables</span>
                  <span className="d_hero_glass_value">12 Left</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="d_hero_scroll_indicator">
          <div className="d_scroll_line" />
          Scroll to explore
        </div>
      </section>

      {/* ── 2. STATS BAR ── */}
      <div className="d_stats_bar">
        <div className="d_stats_inner">
          {[
            { num: "10+", label: "Years of Craft" },
            { num: "200+", label: "Menu Creations" },
            { num: "50K+", label: "Happy Guests" },
            { num: "4.9★", label: "Average Rating" },
          ].map((s) => (
            <div className="d_stat_item" key={s.label}>
              <div className="d_stat_num">{s.num}</div>
              <div className="d_stat_label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. ABOUT / STORY ── */}
      <section
        className="d_light_section"
        style={{ background: "var(--d-bg)", padding: "0" }}
      >
        <LightSectionDecor variant="about" />
        <div className="d_section">
          <div className="d_about_grid">
            <div className="d_about_images">
              <img
                className="d_about_img_main"
                src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=85"
                alt="Our café interior"
              />
              <img
                className="d_about_img_accent"
                src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80"
                alt="Coffee art"
              />
              <div className="d_about_badge">
                <span className="d_about_badge_num">10</span>
                <span className="d_about_badge_text">
                  Years of
                  <br />
                  Excellence
                </span>
              </div>
            </div>
            <div>
              <div className="d_section_tag">Our Story</div>
              <h2 className="d_section_title">
                Crafted With
                <br />
                <em>Passion</em>, Served
                <br />
                With Pride
              </h2>
              <p className="d_section_lead">
                Born from a love of authentic flavors and meaningful
                connections, we blend the ritual of fine coffee with the
                artistry of craft cocktails — creating a space that evolves
                through the day, from morning calm to evening revelry.
              </p>
              <div className="d_about_features">
                {[
                  { icon: <FaCoffee />, label: "Specialty Coffee" },
                  { icon: <FaCocktail />, label: "Craft Cocktails" },
                  { icon: <FaLeaf />, label: "Farm-Fresh Cuisine" },
                  { icon: <FaMusic />, label: "Live Entertainment" },
                  { icon: <FaMobileAlt />, label: "Online Ordering" },
                  { icon: <FaBirthdayCake />, label: "Private Events" },
                ].map((f) => (
                  <div className="d_feature_pill" key={f.label}>
                    <div className="d_feature_icon">{f.icon}</div>
                    <span className="d_feature_text">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. MENU SHOWCASE ── */}
      <section id="menu" className="d_menu_section d_section_wide d_noise">
        <div className="d_section" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className="d_section_tag" style={{ color: "var(--d-gold)" }}>
            Our Menu
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 24,
            }}
          >
            <div>
              <h2
                className="d_section_title"
                style={{ color: "var(--d-white)", marginBottom: 0 }}
              >
                Crafted for <em>Every</em>
                <br />
                Craving & Occasion
              </h2>
            </div>
            <p
              className="d_section_lead"
              style={{ color: "rgba(224,224,224,0.55)", maxWidth: 380 }}
            >
              From morning pour-overs to midnight nightcaps — our menu is a
              journey through flavour.
            </p>
          </div>
          <div className="d_menu_tabs">
            {["food", "drinks", "coffee"].map((t) => (
              <button
                key={t}
                className={`d_menu_tab ${activeTab === t ? "d_active" : ""}`}
                onClick={() => setActiveTab(t)}
              >
                {t === "food"
                  ? "🍽 Food"
                  : t === "drinks"
                    ? "🍸 Bar"
                    : "☕ Coffee"}
              </button>
            ))}
          </div>
          <div className="d_menu_grid">
            {MENU_ITEMS[activeTab].map((item) => (
              <div className="d_menu_card" key={item.name}>
                <div className="d_menu_img_wrap">
                  <img className="d_menu_img" src={item.img} alt={item.name} />
                  <span className="d_menu_tag_badge">{item.tag}</span>
                </div>
                <div className="d_menu_card_body">
                  <div className="d_menu_card_name">{item.name}</div>
                  <div className="d_menu_card_desc">{item.desc}</div>
                  <div className="d_menu_card_footer">
                    <span className="d_menu_price">{item.price}</span>
                    <button
                      className="d_order_btn"
                      onClick={() =>
                        showToast(`✓ "${item.name}" added to your order!`)
                      }
                    >
                      + Add to Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <button className="bg-transparent border-0"
              onClick={() => showToast("🧾 Full menu opening...")}
              href="menu"
            >
              <Link to="/menu"  className="d_btn_primary">View Full Menu →</Link>
            </button>
          </div>
        </div>
      </section>

      {/* ── 5. ONLINE ORDER CTA ── */}
      <section
        className="d_light_section"
        style={{ background: "var(--d-bg)", padding: "80px 5%" }}
      >
        <LightSectionDecor variant="order" />
        <div className="d_order_cta">
          <div className="d_order_cta_left">
            <div
              className="d_section_tag"
              style={{ color: "var(--d-gold)", marginBottom: 20 }}
            >
              Online Ordering
            </div>
            <h3 className="d_order_cta_title">
              Order <em>Ahead</em>,<br />
              Skip the Wait
            </h3>
            <p className="d_order_cta_desc">
              Pre-order your favourites for dine-in or takeaway. Freshly
              prepared at your preferred time — because your time is precious.
            </p>
            <button
              className="bg-transparent border-0"
              onClick={() => showToast("🛒 Online ordering coming soon!")}
            >
              <Link to="/reservations"  className="d_btn_primary">Reserve Table →</Link>
            </button>
          </div>
          <div className="d_order_cta_right">
            {[
              {
                icon: <FaBolt />,
                title: "Ready in 20 Minutes",
                desc: "Most orders prepared within 20 mins of confirmation",
              },
              {
                icon: <FaMapMarkerAlt />,
                title: "Dine-In or Takeaway",
                desc: "Choose your preference at checkout — we do both",
              },
              {
                icon: <FaCreditCard />,
                title: "Secure UPI & Card Payment",
                desc: "Pay via UPI, cards, or wallets — fully encrypted",
              },
            ].map((f) => (
              <div className="d_order_feature" key={f.title}>
                <div className="d_order_feature_icon">{f.icon}</div>

                <div>
                  <div className="d_order_feature_title">{f.title}</div>
                  <div className="d_order_feature_desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. EXPERIENCE / AMBIANCE ── */}
      {/* ── HERO (dark – full bleed image) ── */}
      <section id="home" className="d_hero_wrapper">
        <div className="d_hero_image_bg" />
        <div className="d_hero_dimmer" />
        <div className="d_hero_side_tag d-none d-lg-flex">
          SURAT · INDIA · 2026
        </div>

        <div className="container d_hero_inner text-center">
          <div className="d_hero_eyebrow_row">
            <span className="d_hero_dash" />
            <span className="d_hero_eyebrow">ESTABLISHED 2026</span>
            <span className="d_hero_dash" />
          </div>

          <h1 className="d_hero_main_title">
            Where Refinement
            <br />
            <em className="d_hero_em">MEETS</em>
            <br />
            Master Mixology
          </h1>

          <p className="d_hero_paragraph mx-auto">
            Surat's premiere high-end lounge destination for true connoisseurs.
            Experience bespoke craft spirits and Michelin-grade culinary
            curation in an architectural masterpiece.
          </p>

          <div className="d_hero_cta_row">
            <a href="#menu" className="d_cta_gold">
              EXPLORE THE MENU <FaArrowRight className="ms-2" />
            </a>
            <a href="reservations" className="d_cta_ghost">
              BOOK PRIVATE VAULT
            </a>
          </div>

          {/* <div className="d_hero_stat_row">
                  <div className="d_hero_stat"><span className="d_stat_num">200+</span><span className="d_stat_label">Rare Spirits</span></div>
                  <div className="d_hero_stat_divider" />
                  <div className="d_hero_stat"><span className="d_stat_num">18</span><span className="d_stat_label">Signature Cocktails</span></div>
                  <div className="d_hero_stat_divider" />
                  <div className="d_hero_stat"><span className="d_stat_num">7★</span><span className="d_stat_label">Service Standard</span></div>
                </div> */}
        </div>
      </section>

      {/* ── 7. RESERVATION ── */}
      {/* <section id="reservation" className="d_reservation_section">
          <div className="d_res_inner">
            <div className="d_section_tag" style={{ color: "var(--d-gold)", justifyContent: "center", display: "flex" }}>Reservations</div>
            <h2 className="d_section_title" style={{ color: "var(--d-white)" }}>
              Reserve Your <em style={{ color: "var(--d-gold-light)" }}>Perfect</em> Evening
            </h2>
            <p className="d_section_lead">
              Secure your table for an unforgettable experience.
              Reservation confirmed within minutes — we'll keep a seat warm for you.
            </p>
            <div className="d_res_form">
              <div className="d_res_grid">
                <div className="d_form_group">
                  <label className="d_form_label">Full Name *</label>
                  <input
                    className="d_form_input"
                    type="text"
                    placeholder="Your name"
                    value={resForm.name}
                    onChange={(e) => setResForm({ ...resForm, name: e.target.value })}
                  />
                </div>
                <div className="d_form_group">
                  <label className="d_form_label">Date *</label>
                  <input
                    className="d_form_input"
                    type="date"
                    value={resForm.date}
                    onChange={(e) => setResForm({ ...resForm, date: e.target.value })}
                  />
                </div>
                <div className="d_form_group">
                  <label className="d_form_label">Time *</label>
                  <select
                    className="d_form_input"
                    value={resForm.time}
                    onChange={(e) => setResForm({ ...resForm, time: e.target.value })}
                  >
                    <option value="">Select time</option>
                    {["8:00 AM", "9:00 AM", "10:00 AM", "12:00 PM", "1:00 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM", "10:00 PM"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="d_form_group">
                  <label className="d_form_label">Number of Guests</label>
                  <select
                    className="d_form_input"
                    value={resForm.guests}
                    onChange={(e) => setResForm({ ...resForm, guests: e.target.value })}
                  >
                    <option value="">Select guests</option>
                    {["1", "2", "3", "4", "5", "6", "7", "8+"].map(n => (
                      <option key={n} value={n}>{n} {n === "1" ? "Guest" : "Guests"}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="d_form_group" style={{ marginBottom: 24 }}>
                <label className="d_form_label">Special Occasion (optional)</label>
                <select
                  className="d_form_input"
                  value={resForm.occasion}
                  onChange={(e) => setResForm({ ...resForm, occasion: e.target.value })}
                >
                  <option value="">No special occasion</option>
                  {["Birthday", "Anniversary", "Business Dinner", "Date Night", "Family Gathering", "Proposal", "Other"].map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <button className="d_res_submit" onClick={handleReserve}>
                Confirm Reservation ✦
              </button>
            </div>
          </div>
        </section> */}

      {/* ── 8a. BLOGS ── */}
      <section
        className="d_light_section"
        style={{ background: "var(--d-bg)" }}
      >
        <LightSectionDecor variant="blog" />
        <div className="d_section">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 20,
              marginBottom: 48,
            }}
          >
            <div>
              <div className="d_section_tag">Latest Articles</div>

              <h2 className="d_section_title" style={{ marginBottom: 0 }}>
                From Our <em>Blog</em>
              </h2>
            </div>

            <button
              className="d_btn_outline"
              style={{
                color: "var(--d-primary)",
                borderColor: "var(--d-border)",
              }}
              onClick={() => navigate("/blog")}
            >
              View All Blogs →
            </button>
          </div>

          <div className="d_events_grid">
            {blogs.map((blog) => (

              <div className="d_event_card" key={blog._id}>
                <div className="d_event_img_wrap">
                  <img
                    className="d_event_img"
                    src={blog.img}
                    alt={blog.title}
                  />

                  <div className="d_event_date_badge">
                    <span className="d_event_day">{blog.day}</span>
                    <span className="d_event_month">{blog.month}</span>
                  </div>
                </div>

                <div className="d_event_body">
                  {/* Top Content */}
                  <div>
                    <div className="d_event_type">{blog.category}</div>

                    <div className="d_event_name">{blog.title}</div>
                  </div>

                  {/* Footer */}
                  <div className="d_event_footer">
                    <div className="d_event_meta">
                      <span>
                        <FaPenNib style={{ marginRight: 6 }} />
                        {blog.author}
                      </span>

                      <span>
                        <FaClock style={{ marginRight: 6 }} />
                        {blog.readTime}
                      </span>
                    </div>
                    <button
                      className="d_event_register"
                      onClick={() => handlePostClick(blog._id)}>
                      Read More <FaArrowRight style={{ marginLeft: 8 }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8b. TESTIMONIALS ── */}
      <section className="d_testi_section">
        <div className="d_testi_inner">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 24,
            }}
          >
            <div>
              <div className="d_section_tag" style={{ color: "var(--d-gold)" }}>
                Guest Reviews
              </div>
              <h2
                className="d_section_title"
                style={{ color: "var(--d-white)", marginBottom: 0 }}
              >
                Stories of <em>Unforgettable</em>
                <br />
                Evenings
              </h2>
            </div>
            <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} style={{ color: "var(--d-gold)", fontSize: 20 }}>
                  ★
                </span>
              ))}
              <span
                style={{
                  color: "rgba(224,224,224,0.5)",
                  fontSize: 14,
                  marginLeft: 8,
                  alignSelf: "center",
                }}
              >
                4.9 / 5 · 2,400+ reviews
              </span>
            </div>
          </div>
          <div className="d_testi_grid">
            {TESTIMONIALS.map((t) => (
              <div className="d_testi_card" key={t.name}>
                <div className="d_testi_stars">★★★★★</div>
                <span className="d_testi_quote_mark">"</span>
                <p className="d_testi_text">{t.text}</p>
                <div className="d_testi_author">
                  <div className="d_testi_avatar">{t.initials}</div>
                  <div>
                    <div className="d_testi_name">{t.name}</div>
                    <div className="d_testi_role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section className="d_gallery_section" style={{ padding: "100px 5%" }}>
        <LightSectionDecor variant="gallery"></LightSectionDecor>
        <div
          style={{
            maxWidth: 1300,
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              marginBottom: 48,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 20,
            }}
          >
            <div>
              <div className="d_section_tag" style={{ color: "var(--d-gold)" }}>
                Gallery
              </div>
              <h2
                className="d_section_title"
                style={{ marginBottom: 0, color: "var(--d-text)" }}
              >
                A Glimpse of{" "}
                <em style={{ color: "var(--d-gold-light)" }}>Our World</em>
              </h2>
            </div>
            <button
              className="d_btn_outline "
              style={{
                color: "var(--d-text)",
                borderColor: "rgba(201,168,76,0.3)",
              }}
              onClick={() => showToast("📸 Full gallery opening...")}
            >
              <Link to="/gallery" className="text-decoration-none" style={{ color: "var(--d-text)" }}>
                View All →
              </Link>
            </button>
          </div>
          <div className="d_gallery_grid">
            <div className="d_gallery_item d_wide d_tall">
              <img
                className="d_gallery_img"
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=85"
                alt="Interior"
              />
              <div className="d_gallery_overlay">
                <div className="d_gallery_caption">The Main Lounge</div>
                <div className="d_gallery_subcaption">Interior Design</div>
              </div>
            </div>
            <div className="d_gallery_item">
              <img
                className="d_gallery_img"
                src="https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&q=80"
                alt="Coffee"
              />
              <div className="d_gallery_overlay">
                <div className="d_gallery_caption">Artisan Coffee</div>
                <div className="d_gallery_subcaption">Beverages</div>
              </div>
            </div>
            <div className="d_gallery_item">
              <img
                className="d_gallery_img"
                src="https://images.unsplash.com/photo-1560512823-829485b8bf24?w=400&q=80"
                alt="Cocktail"
              />
              <div className="d_gallery_overlay">
                <div className="d_gallery_caption">Signature Cocktails</div>
                <div className="d_gallery_subcaption">Mixology</div>
              </div>
            </div>
            <div className="d_gallery_item">
              <img
                className="d_gallery_img"
                src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=400&q=80"
                alt="Food"
              />
              <div className="d_gallery_overlay">
                <div className="d_gallery_caption">Michelin Grade</div>
                <div className="d_gallery_subcaption">Cuisine</div>
              </div>
            </div>
            <div className="d_gallery_item">
              <img
                className="d_gallery_img"
                src="https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=400&q=80"
                alt="Ambiance"
              />
              <div className="d_gallery_overlay">
                <div className="d_gallery_caption">Night Vibes</div>
                <div className="d_gallery_subcaption">Ambiance</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Toast */}
      {toast && <div className="d_toast">{toast}</div>}
    </>
  );
}
