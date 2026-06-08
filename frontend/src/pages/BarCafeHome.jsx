import { useState, useEffect, useRef } from "react";
import {
  FaCoffee,
  FaGlassCheers,
  FaClock,
  FaMapMarkerAlt,
  FaStar,
  FaArrowRight,
  FaPenNib,
  FaCocktail,
  FaLeaf,
  FaMusic,
  FaMobileAlt,
  FaBirthdayCake,
  FaBolt,
  FaCreditCard,
} from "react-icons/fa";
import { FiMenu, FiX } from "react-icons/fi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

/* ─── BRAND TOKENS ────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500;600&family=Cinzel:wght@400;600;700&display=swap');

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

/* ─── NAVBAR ─── */
.d_navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 1000;
  height: var(--d-navbar-height);
  transition: var(--d-transition);
}

.d_navbar.scrolled {
  background: rgba(14,31,28,0.96);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(201,168,76,0.2);
  box-shadow: var(--d-shadow-lg);
}

.d_nav_logo {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--d-gold);
  letter-spacing: 2px;
  text-decoration: none;
}
.d_nav_logo span { color: var(--d-white); }

.d_nav_link {
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  transition: var(--d-transition);
  position: relative;
  padding-bottom: 4px;
}

.d_nav_link:hover { color: var(--d-gold); }
.d_nav_link:hover::after { width: 100%; }

.d_nav_link::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0;
  width: 0; height: 1px;
  background: var(--d-gold);
  transition: width 0.3s ease;
}

/* ── HERO ── */
.d_hero {
  position: relative;
  background: var(--d-primary);
  display: flex;
  align-items: center;
  overflow: hidden;
  isolation: isolate;
  min-height: 100vh;
}

.d_hero_bg_pattern {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(ellipse 80% 60% at 78% 18%, rgba(201,168,76,0.12) 0%, transparent 44%),
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
  bottom: 32px;
  right: 32px;
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
    linear-gradient(to top, rgba(14,31,28,0.6) 0%, transparent 50%);
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

.d_hero_title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(52px, 7vw, 84px);
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

.d_hero_subtitle {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(18px, 3vw, 28px);
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
  margin-bottom: 36px;
}

.d_hero_actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
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

.d_hero_scroll_indicator {
  position: absolute;
  bottom: 32px;
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
  background: rgba(201,168,76,0.06);
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
  box-shadow: 0 10px 26px rgba(22,48,43,0.08);
}

.d_menu_card:hover {
  border-color: rgba(201,168,76,0.4);
  background: rgba(255,255,255,0.08);
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

.d_exp_card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  border: 1px solid transparent;
  transition: var(--d-transition);
}

.d_exp_card:hover::before {
  border-color: rgba(201,168,76,0.28);
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

/* ── GALLERY ── */
.d_gallery_section {
  background: var(--d-bg);
  overflow: hidden;
}

.d_gallery_grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto auto;
  gap: 12px;
}

.d_gallery_item {
  overflow: hidden;
  border-radius: var(--d-radius-md);
  cursor: pointer;
  position: relative;
}

.d_gallery_item.d_wide { grid-column: span 2; }
.d_gallery_item.d_tall { grid-row: span 2; }

.d_gallery_img {
  width: 100%;
  height: 100%;
  min-height: 200px;
  object-fit: cover;
  display: block;
  transition: var(--d-transition);
}

.d_gallery_item:hover .d_gallery_img {
  transform: scale(1.06);
  filter: brightness(0.85);
}

.d_gallery_item::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(22,48,43,0.0);
  transition: var(--d-transition);
}

.d_gallery_item:hover::after {
  background: rgba(22,48,43,0.2);
}

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
  box-shadow: 0 10px 26px rgba(22,48,43,0.08);
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

/* ── EVENTS ── */
.d_events_section {
  background: var(--d-white);
}

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
  box-shadow: 0 10px 26px rgba(22,48,43,0.08);
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
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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

/* ─── MOBILE MENU ─── */
.d_mobile_menu {
  position: fixed;
  inset: 0;
  background: rgba(14,31,28,0.98);
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
  transform: translateX(100%);
  transition: transform 0.4s cubic-bezier(0.4,0,0.2,1);
}

.d_mobile_menu.open { transform: translateX(0); }

.d_mobile_nav_link {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2.5rem;
  font-weight: 300;
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  letter-spacing: 2px;
  transition: var(--d-transition);
}

.d_mobile_nav_link:hover { color: var(--d-gold); }

/* ─── ANNOUNCEMENT BAR ─── */
.d_announcement {
  background: var(--d-gold);
  color: var(--d-primary-dark);
  text-align: center;
  padding: 10px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
}

/* ─── RESPONSIVE ─── */
@media (max-width: 1280px) {
  .d_hero_container { width: min(1160px, 100%); }
  .d_hero_title { font-size: clamp(52px, 6.8vw, 78px); }
}

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
  .d_menu_grid { grid-template-columns: repeat(2, 1fr); }
  .d_events_grid { grid-template-columns: repeat(2, 1fr); }
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
  .d_order_cta { grid-template-columns: 1fr; }
}

@media (max-width: 900px) {
  .d_hero_container { padding: 90px 5% 78px; }
  .d_hero_image_side { width: 100%; opacity: 0.34; }
  .d_hero_image_side::before {
    background:
      linear-gradient(180deg, rgba(14,31,28,0.62) 0%, rgba(22,48,43,0.84) 50%, var(--d-primary) 100%),
      linear-gradient(90deg, rgba(22,48,43,0.65) 0%, rgba(22,48,43,0.08) 100%);
  }
  .d_hero_title { font-size: clamp(48px, 9.3vw, 72px); }
  .d_about_img_main { aspect-ratio: 3 / 5; }
}

@media (max-width: 768px) {
  .d_stats_inner { grid-template-columns: repeat(2, 1fr); }
  .d_stat_item:nth-child(2) { border-right: none; }
  .d_menu_grid { grid-template-columns: 1fr; }
  .d_events_grid { grid-template-columns: 1fr; }
  .d_testi_grid { grid-template-columns: 1fr; }
  .d_res_grid { grid-template-columns: 1fr; }
  .d_hero_image_side { display: none; }
  .d_gallery_grid { grid-template-columns: repeat(2, 1fr); }
  .d_gallery_item.d_tall { grid-row: span 1; }
  .d_order_cta_left,
  .d_order_cta_right { padding: 40px 32px; }
  .d_menu_tabs { flex-wrap: wrap; }
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
  .d_hero_subtitle { font-size: clamp(16px, 3.5vw, 22px); }
  .d_hero_desc { max-width: 100%; margin-bottom: 30px; }
  .d_hero_glass_stats { padding: 18px 20px; border-radius: var(--d-radius-md); }
  .d_hero_scroll_indicator { bottom: 18px; }
  .d_section { padding: 48px 5%; }
}

@media (max-width: 700px) {
  .d_about_grid { grid-template-columns: 1fr; gap: 48px; }
  .d_about_img_main { aspect-ratio: 7 / 5; }
  .d_about_img_accent { width: 40%; aspect-ratio: 2 / 2; }
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
  .d_menu_tab { padding: 10px 15px; }
}

@media (max-width: 360px) {
  .d_hero_container { padding: 36px 5% 70px; }
  .d_hero_title { font-size: 34px; }
  .d_hero_subtitle { font-size: 14px; }
  .d_hero_desc { font-size: 13px; }
}
`;

/* ─── DATA ────────────────────────────────────────────────────── */
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
      img: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&q=80",
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
      name: "Velvet Noir",
      desc: "Dark rum, blackberry liqueur, fresh lime, activated charcoal",
      price: "₹420",
      tag: "Signature",
      img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80",
    },
    {
      name: "Smoked Negroni",
      desc: "Gin, Campari, sweet vermouth, cedar smoke",
      price: "₹420",
      tag: "Classic",
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

const testimonials = [
  { text: "The ambience at Velour is unlike anything in Vadodara. Every detail — from the lighting to the cocktail menu — speaks of genuine craftsmanship.", name: "Arjun Mehta", role: "Food Blogger, Barodaites", initials: "AM", rating: 5 },
  { text: "I celebrated my anniversary here and the staff went above and beyond. The reservation system made it so seamless — we felt like royalty.", name: "Priya Sharma", role: "Regular Patron", initials: "PS", rating: 5 },
  { text: "Their cold brew reserve is the best I've had anywhere in Gujarat. The bar menu is sophisticated without being pretentious. A true hidden gem.", name: "Rohan Desai", role: "Entrepreneur", initials: "RD", rating: 5 },
];

const events = [
  { day: "14", month: "Jun", name: "Jazz & Whiskey Evening", time: "8:00 PM – 11:00 PM", type: "Live Music", desc: "An intimate evening with the Bombay Jazz Collective, curated whiskey tastings from 12 single malts.", img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80" },
  { day: "21", month: "Jun", name: "Cocktail Masterclass", time: "6:00 PM – 9:00 PM", type: "Workshop", desc: "Learn signature cocktail techniques from our head bartender. Includes premium spirits kit and recipes.", img: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80" },
  { day: "28", month: "Jun", name: "Rooftop Full Moon Dinner", time: "7:30 PM – 10:30 PM", type: "Dining Experience", desc: "A special 5-course dinner under the stars, paired with moonlight cocktails and live acoustic music.", img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80" },
];

const heroImages = [
  "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&q=80",
  "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200&q=80",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80",
];

const navLinks = ["Home", "About", "Menu", "Experience", "Reservations", "Gallery", "Events"];

/* ─── COMPONENT ───────────────────────────────────────────────── */
export default function BarCafeHome() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenuTab, setActiveMenuTab] = useState("drinks");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", date: "", time: "", guests: "", occasion: "", note: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <>
      <style>{css}</style>

      {/* ANNOUNCEMENT BAR */}
      <div className="d_announcement">
        ✦ Now Open Sundays · Reserve Your Table · Live Jazz Every Friday Night ✦
      </div>

      {/* NAVBAR */}
      <nav className={`d_navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="container h-100">
          <div className="d-flex align-items-center justify-content-between h-100">
            <a className="d_nav_logo" href="#">
              VELOUR<span> BAR</span>
            </a>
            {/* Desktop Nav */}
            <div className="d-none d-lg-flex align-items-center gap-4">
              {navLinks.map(l => (
                <a key={l} className="d_nav_link" href="#" onClick={e => { e.preventDefault(); scrollTo(l.toLowerCase()); }}>
                  {l}
                </a>
              ))}
            </div>
            <div className="d-none d-lg-flex align-items-center gap-3">
              <a className="d_btn_primary" href="#" onClick={e => { e.preventDefault(); scrollTo("reservations"); }}>
                Reserve Now <FaArrowRight />
              </a>
            </div>
            {/* Mobile toggle */}
            <button
              className="d-lg-none btn p-0"
              style={{ background: "none", border: "none", color: "white", fontSize: "1.5rem" }}
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`d_mobile_menu ${mobileOpen ? "open" : ""}`}>
        <button
          style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "none", border: "none", color: "white", fontSize: "1.5rem", cursor: "pointer" }}
          onClick={() => setMobileOpen(false)}
        ><FiX /></button>
        {navLinks.map(l => (
          <a key={l} className="d_mobile_nav_link" href="#" onClick={e => { e.preventDefault(); scrollTo(l.toLowerCase()); }}>
            {l}
          </a>
        ))}
        <a className="d_btn_primary mt-2" href="#" onClick={e => { e.preventDefault(); scrollTo("reservations"); setMobileOpen(false); }}>
          Reserve Now <FaArrowRight />
        </a>
      </div>

      {/* ══════════════════════════════════════ */}
      {/* 1 · HERO SECTION                      */}
      {/* ══════════════════════════════════════ */}
      <section id="home" className="d_hero d_noise">
        <div className="d_hero_bg_pattern" />
        <div className="d_hero_lines" />

        <div className="d_hero_image_side">
          <Swiper
            modules={[Pagination, Autoplay, EffectFade]}
            effect="fade"
            loop={true}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true, el: '.d_hero_swiper .swiper-pagination' }}
            className="d_hero_swiper"
          >
            {heroImages.map((img, i) => (
              <SwiperSlide key={i}>
                <img src={img} alt="Velour Bar Ambiance" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="d_hero_container">
          <div className="d_hero_content_wrap">
            <div className="d_hero_content">
              <div className="d_hero_title_topline">Est. 2019 · Alkapuri, Vadodara</div>
              <div className="d_hero_eyebrow">Welcome to Velour</div>
              <h1 className="d_hero_title">
                Crafted for the <em>Curious</em>
              </h1>
              <p className="d_hero_subtitle">Bar · Café · Experiences</p>
              <p className="d_hero_desc">
                Where premium spirits meet specialty coffee. An intimate setting designed for memorable moments.
              </p>
              <div className="d_hero_actions">
                <a className="d_btn_primary" href="#" onClick={e => { e.preventDefault(); scrollTo("reservations"); }}>
                  Reserve a Table <FaArrowRight />
                </a>
                <a className="d_btn_outline" href="#" onClick={e => { e.preventDefault(); scrollTo("menu"); }}>
                  Explore Menu
                </a>
              </div>
            </div>

            <div className="d_hero_glass_stats">
              <div className="d_hero_glass_title">Why Velour?</div>
              <div className="d_hero_glass_list">
                <div className="d_hero_glass_item">
                  <span className="d_hero_glass_label">Premium Spirits</span>
                  <span className="d_hero_glass_value">600+</span>
                </div>
                <div className="d_hero_glass_item">
                  <span className="d_hero_glass_label">Happy Guests</span>
                  <span className="d_hero_glass_value">15K+</span>
                </div>
                <div className="d_hero_glass_item">
                  <span className="d_hero_glass_label">Google Rating</span>
                  <span className="d_hero_glass_value">4.9★</span>
                </div>
              </div>
            </div>
          </div>

          <div className="d_hero_scroll_indicator">
            <div className="d_scroll_line" />
            Scroll to explore
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* 2 · STATS BAR                        */}
      {/* ══════════════════════════════════════ */}
      <section className="d_stats_bar d_section_wide">
        <div className="d_stats_inner">
          <div className="d_stat_item">
            <div className="d_stat_num">5+</div>
            <div className="d_stat_label">Years of Excellence</div>
          </div>
          <div className="d_stat_item">
            <div className="d_stat_num">600+</div>
            <div className="d_stat_label">Premium Spirits</div>
          </div>
          <div className="d_stat_item">
            <div className="d_stat_num">15K+</div>
            <div className="d_stat_label">Happy Guests</div>
          </div>
          <div className="d_stat_item">
            <div className="d_stat_num">4.9★</div>
            <div className="d_stat_label">Google Rating</div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* 3 · ABOUT SECTION                     */}
      {/* ══════════════════════════════════════ */}
      <section id="about" className="d_light_section">
        <div className="d_light_section_decor">
          <div className="d_decor_icon d_decor_sm" style={{ top: "10%", left: "5%", "--decor-rotate": "15deg" }}><FaCoffee /></div>
          <div className="d_decor_icon d_decor_md" style={{ top: "60%", right: "8%", "--decor-rotate": "-10deg" }}><FaGlassCheers /></div>
          <div className="d_decor_icon d_decor_sm" style={{ bottom: "15%", left: "15%", "--decor-rotate": "5deg" }}><FaCocktail /></div>
        </div>
        <div className="d_light_section_dots" />
        <div className="d_section">
          <div className="d_about_grid">
            <div className="d_about_images">
              <img
                src="https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&q=80"
                alt="Velour Bar Interior"
                className="d_about_img_main"
              />
              <img
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80"
                alt="Coffee at Velour"
                className="d_about_img_accent"
              />
              <div className="d_about_badge">
                <span className="d_about_badge_num">5+</span>
                <span className="d_about_badge_text">Years</span>
              </div>
            </div>
            <div>
              <div className="d_section_tag">Our Story</div>
              <h2 className="d_section_title">
                More than a bar, it's a <em>destination</em>
              </h2>
              <p className="d_section_lead">
                Born in the heart of Vadodara in 2019, Velour was conceived as a sanctuary for those who seek more than just a drink. We curate experiences.
              </p>
              <div className="d_about_features">
                <div className="d_feature_pill">
                  <div className="d_feature_icon"><FaCocktail /></div>
                  <div className="d_feature_text">Craft Cocktails</div>
                </div>
                <div className="d_feature_pill">
                  <div className="d_feature_icon"><FaCoffee /></div>
                  <div className="d_feature_text">Specialty Coffee</div>
                </div>
                <div className="d_feature_pill">
                  <div className="d_feature_icon"><FaMusic /></div>
                  <div className="d_feature_text">Live Music</div>
                </div>
                <div className="d_feature_pill">
                  <div className="d_feature_icon"><FaLeaf /></div>
                  <div className="d_feature_text">Ambiance</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* 4 · MENU SHOWCASE                     */}
      {/* ══════════════════════════════════════ */}
      <section id="menu" className="d_menu_section">
        <div className="d_section">
          <div className="d_section_tag" style={{ color: "var(--d-gold)" }}>Our Menu</div>
          <h2 className="d_section_title" style={{ color: "var(--d-white)" }}>
            Curated for the <em>discerning</em> palate
          </h2>
          <p className="d_section_lead">
            From sunset cocktails to morning cold brews — every item is an expression of our commitment to quality.
          </p>

          <div className="d_menu_tabs">
            {[
              { key: "drinks", label: "Drinks", icon: <FaGlassCheers /> },
              { key: "food", label: "Food", icon: <FaLeaf /> },
              { key: "coffee", label: "Coffee", icon: <FaCoffee /> },
            ].map(tab => (
              <button
                key={tab.key}
                className={`d_menu_tab ${activeMenuTab === tab.key ? "d_active" : ""}`}
                onClick={() => setActiveMenuTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="d_menu_grid">
            {MENU_ITEMS[activeMenuTab].map((item, i) => (
              <div key={i} className="d_menu_card">
                <div className="d_menu_img_wrap">
                  <img src={item.img} alt={item.name} className="d_menu_img" />
                  {item.tag && <span className="d_menu_tag_badge">{item.tag}</span>}
                </div>
                <div className="d_menu_card_body">
                  <div className="d_menu_card_name">{item.name}</div>
                  <div className="d_menu_card_desc">{item.desc}</div>
                  <div className="d_menu_card_footer">
                    <div className="d_menu_price">{item.price}</div>
                    <button className="d_order_btn">Order</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* 5 · EXPERIENCE SECTION                */}
      {/* ══════════════════════════════════════ */}
      <section id="experience" className="d_exp_section">
        <div className="d_section">
          <div className="d_experience_grid">
            <div className="d_exp_visual_panel">
              <div className="d_exp_mosaic">
                <img
                  src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80"
                  alt="Bar Counter"
                  className="d_exp_img d_tall"
                />
                <img
                  src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80"
                  alt="Ambiance"
                  className="d_exp_img d_short"
                />
                <img
                  src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80"
                  alt="Coffee"
                  className="d_exp_img d_short"
                />
                <img
                  src="https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80"
                  alt="Cocktails"
                  className="d_exp_img d_short"
                />
              </div>
              <div className="d_exp_floating_badge">
                <span className="d_exp_badge_title">5+</span>
                <span className="d_exp_badge_sub">Years of Excellence</span>
              </div>
            </div>

            <div className="d_exp_content">
              <div className="d_section_tag" style={{ color: "var(--d-gold)" }}>The Experience</div>
              <h2 className="d_section_title" style={{ color: "var(--d-white)" }}>
                Every visit, <em>unforgettable</em>
              </h2>
              <p className="d_section_lead" style={{ color: "rgba(224,224,224,0.72)" }}>
                We've designed every corner of Velour to engage your senses and elevate every moment.
              </p>

              <div className="d_exp_meta_strip">
                <div className="d_exp_meta_item">
                  <div className="d_exp_meta_icon"><FaClock /></div>
                  <div className="d_exp_meta_label">Hours</div>
                  <div className="d_exp_meta_value">11am-1am</div>
                </div>
                <div className="d_exp_meta_item">
                  <div className="d_exp_meta_icon"><FaMapMarkerAlt /></div>
                  <div className="d_exp_meta_label">Location</div>
                  <div className="d_exp_meta_value">Alkapuri</div>
                </div>
                <div className="d_exp_meta_item">
                  <div className="d_exp_meta_icon"><FaMusic /></div>
                  <div className="d_exp_meta_label">Vibe</div>
                  <div className="d_exp_meta_value">Lounge</div>
                </div>
              </div>

              <div className="d_exp_cards">
                <div className="d_exp_card">
                  <div className="d_exp_icon"><FaGlassCheers /></div>
                  <div>
                    <div className="d_exp_card_title">Premium Bar</div>
                    <div className="d_exp_card_desc">600+ spirits from 40+ countries. Our head bartender curates a rotating seasonal menu.</div>
                  </div>
                </div>
                <div className="d_exp_card">
                  <div className="d_exp_icon"><FaCoffee /></div>
                  <div>
                    <div className="d_exp_card_title">Specialty Coffee</div>
                    <div className="d_exp_card_desc">Partnered with Coorg and Chikmagalur estates for single-origin beans.</div>
                  </div>
                </div>
                <div className="d_exp_card">
                  <div className="d_exp_icon"><FaMusic /></div>
                  <div>
                    <div className="d_exp_card_title">Live Music</div>
                    <div className="d_exp_card_desc">Jazz nights and acoustic sessions. Every week brings something new.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* 6 · GALLERY SECTION                   */}
      {/* ══════════════════════════════════════ */}
      <section id="gallery" className="d_gallery_section">
        <div className="d_section">
          <div className="d_section_tag">Gallery</div>
          <h2 className="d_section_title">
            A glimpse of <em>Velour</em>
          </h2>
          <p className="d_section_lead mb-5">
            From our bar counter to our cozy corners — every space tells a story.
          </p>
          <div className="d_gallery_grid">
            <div className="d_gallery_item d_wide">
              <img src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&q=80" alt="Bar Counter" className="d_gallery_img" />
            </div>
            <div className="d_gallery_item">
              <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80" alt="Ambiance" className="d_gallery_img" />
            </div>
            <div className="d_gallery_item">
              <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80" alt="Coffee" className="d_gallery_img" />
            </div>
            <div className="d_gallery_item">
              <img src="https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80" alt="Cocktails" className="d_gallery_img" />
            </div>
            <div className="d_gallery_item d_tall">
              <img src="https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80" alt="Lounge" className="d_gallery_img" />
            </div>
            <div className="d_gallery_item d_wide">
              <img src="https://images.unsplash.com/photo-1541014741259-de529411b96a?w=1200&q=80" alt="Food" className="d_gallery_img" />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* 7 · RESERVATION SECTION               */}
      {/* ══════════════════════════════════════ */}
      <section id="reservations" className="d_reservation_section">
        <div className="d_res_inner">
          <div className="d_section_tag" style={{ color: "var(--d-gold)" }}>Reservations</div>
          <h2 className="d_section_title">
            Secure your <em>table</em>
          </h2>
          <p className="d_section_lead">
            Walk-ins welcome, but reservations ensure your preferred table, time, and personalized setup.
          </p>

          <div className="d_res_form">
            {submitted ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", color: "var(--d-gold)", marginBottom: "0.5rem" }}>
                  Reservation Confirmed!
                </div>
                <div style={{ color: "rgba(224,224,224,0.6)", fontSize: "0.9rem" }}>
                  We'll send you a confirmation shortly. See you soon!
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="d_res_grid">
                  <div className="d_form_group">
                    <label className="d_form_label">Full Name *</label>
                    <input
                      className="d_form_input"
                      placeholder="Your name"
                      required
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className="d_form_group">
                    <label className="d_form_label">Phone *</label>
                    <input
                      className="d_form_input"
                      placeholder="+91 98765 43210"
                      required
                      value={formData.phone}
                      onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                    />
                  </div>
                  <div className="d_form_group">
                    <label className="d_form_label">Email</label>
                    <input
                      className="d_form_input"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                  <div className="d_form_group">
                    <label className="d_form_label">Date *</label>
                    <input
                      className="d_form_input"
                      type="date"
                      required
                      value={formData.date}
                      onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                    />
                  </div>
                  <div className="d_form_group">
                    <label className="d_form_label">Time *</label>
                    <select
                      className="d_form_input"
                      required
                      value={formData.time}
                      onChange={e => setFormData(p => ({ ...p, time: e.target.value }))}
                    >
                      <option value="">Select Time</option>
                      {["11:00 AM", "11:30 AM", "12:00 PM", "1:00 PM", "1:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM"].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="d_form_group">
                    <label className="d_form_label">Guests *</label>
                    <select
                      className="d_form_input"
                      required
                      value={formData.guests}
                      onChange={e => setFormData(p => ({ ...p, guests: e.target.value }))}
                    >
                      <option value="">Number of Guests</option>
                      {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"].map(g => (
                        <option key={g} value={g}>{g} {g === "1" ? "Guest" : "Guests"}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="d_form_group" style={{ gridColumn: "1 / -1" }}>
                  <label className="d_form_label">Occasion</label>
                  <select
                    className="d_form_input"
                    value={formData.occasion}
                    onChange={e => setFormData(p => ({ ...p, occasion: e.target.value }))}
                  >
                    <option value="">Select Occasion (Optional)</option>
                    {["Birthday", "Anniversary", "Business Dinner", "Date Night", "Friends Gathering", "Engagement", "Other"].map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div className="d_form_group" style={{ gridColumn: "1 / -1" }}>
                  <label className="d_form_label">Special Requests</label>
                  <textarea
                    className="d_form_input"
                    rows={3}
                    placeholder="Any dietary requirements, seating preferences, or special arrangements..."
                    value={formData.note}
                    onChange={e => setFormData(p => ({ ...p, note: e.target.value }))}
                    style={{ resize: "none" }}
                  />
                </div>
                <button type="submit" className="d_res_submit">
                  Confirm Reservation <FaArrowRight />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* 8 · TESTIMONIALS SECTION              */}
      {/* ══════════════════════════════════════ */}
      <section className="d_testi_section">
        <div className="d_testi_inner">
          <div className="text-center">
            <div className="d_section_tag" style={{ color: "var(--d-gold)" }}>Testimonials</div>
            <h2 className="d_section_title" style={{ color: "var(--d-white)" }}>
              What our <em>guests</em> say
            </h2>
          </div>

          <div className="d_testi_grid">
            {testimonials.map((t, i) => (
              <div key={i} className="d_testi_card">
                <span className="d_testi_quote_mark">"</span>
                <div className="d_testi_stars">
                  {[...Array(t.rating)].map((_, j) => <FaStar key={j} />)}
                </div>
                <div className="d_testi_text">{t.text}</div>
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

      {/* ══════════════════════════════════════ */}
      {/* 9 · EVENTS SECTION                    */}
      {/* ══════════════════════════════════════ */}
      <section id="events" className="d_events_section">
        <div className="d_section">
          <div className="d_section_tag">Upcoming</div>
          <h2 className="d_section_title">
            Events & <em>experiences</em>
          </h2>
          <p className="d_section_lead mb-5">
            From live jazz to cocktail masterclasses — there's always something happening at Velour.
          </p>

          <div className="d_events_grid">
            {events.map((ev, i) => (
              <div key={i} className="d_event_card">
                <div className="d_event_img_wrap">
                  <img src={ev.img} alt={ev.name} className="d_event_img" />
                  <div className="d_event_date_badge">
                    <span className="d_event_day">{ev.day}</span>
                    <span className="d_event_month">{ev.month}</span>
                  </div>
                </div>
                <div className="d_event_body">
                  <div>
                    <div className="d_event_type">{ev.type}</div>
                    <div className="d_event_name">{ev.name}</div>
                    <div className="d_event_meta">
                      <span><FaClock size={13} style={{ marginRight: 4 }} />{ev.time}</span>
                    </div>
                  </div>
                  <div className="d_event_footer">
                    <button className="d_event_register" onClick={() => scrollTo("reservations")}>
                      Reserve Spot <FaArrowRight />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* 10 · ONLINE ORDER CTA                  */}
      {/* ══════════════════════════════════════ */}
      <section className="d_light_section">
        <div className="d_section">
          <div className="d_order_cta">
            <div className="d_order_cta_left">
              <h3 className="d_order_cta_title">
                Order <em>online</em> & enjoy at home
              </h3>
              <p className="d_order_cta_desc">
                Can't make it to Velour? We bring the experience to you. Order your favorite drinks and food for delivery.
              </p>
              <button className="d_btn_primary" style={{ position: "relative", zIndex: 1 }}>
                Order Now <FaArrowRight />
              </button>
            </div>
            <div className="d_order_cta_right">
              <div className="d_order_feature">
                <div className="d_order_feature_icon"><FaMobileAlt /></div>
                <div>
                  <div className="d_order_feature_title">Easy Ordering</div>
                  <div className="d_order_feature_desc">Simple and intuitive online ordering system.</div>
                </div>
              </div>
              <div className="d_order_feature">
                <div className="d_order_feature_icon"><FaBolt /></div>
                <div>
                  <div className="d_order_feature_title">Fast Delivery</div>
                  <div className="d_order_feature_desc">Quick delivery to your doorstep.</div>
                </div>
              </div>
              <div className="d_order_feature">
                <div className="d_order_feature_icon"><FaCreditCard /></div>
                <div>
                  <div className="d_order_feature_title">Secure Payment</div>
                  <div className="d_order_feature_desc">Multiple secure payment options available.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
