import React from "react";
import { Row, Col } from "react-bootstrap";
import {
  MdTrendingUp,
  MdShowChart,
  MdPieChart,
  MdFileDownload,
  MdDateRange,
  MdLocalCafe,
  MdLocalBar,
} from "react-icons/md";

const WEEKLY = [
  { day: "Mon", rev: 68000 },
  { day: "Tue", rev: 82000 },
  { day: "Wed", rev: 75000 },
  { day: "Thu", rev: 91000 },
  { day: "Fri", rev: 124000 },
  { day: "Sat", rev: 138000 },
  { day: "Sun", rev: 110000 },
];

const MAX = Math.max(...WEEKLY.map((w) => w.rev));

export default function Reports() {
  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdShowChart /> Analytics & Reports
          </div>
          <div className="d-page-sub">
            Comprehensive overview of your business performance
          </div>
        </div>
        <div className="d-flex gap-2">
          <button className="d-btn-outline">
            <MdDateRange /> Last 7 Days
          </button>
          <button className="d-btn-gold">
            <MdFileDownload /> Export Data
          </button>
        </div>
      </div>

      <Row className="g-3 mb-4">
        {[
          {
            label: "Net Revenue",
            value: "₹6,88,000",
            change: "+14%",
            icon: <MdTrendingUp />,
            color: "d-gold",
          },
          {
            label: "Avg Order Value",
            value: "₹1,420",
            change: "+5%",
            icon: <MdShowChart />,
            color: "d-blue",
          },
          {
            label: "Customer Growth",
            value: "240",
            change: "+12%",
            icon: <MdPieChart />,
            color: "d-green",
          },
        ].map((s, i) => (
          <Col key={i} xs={12} sm={4}>
            <div className="d-stat-card">
              <div
                className={`d-stat-icon ${s.color}`}
                style={{ width: "42px", height: "42px", fontSize: "1.1rem" }}
              >
                {s.icon}
              </div>
              <div className="flex-grow-1">
                <div className="d-stat-value" style={{ fontSize: "1.4rem" }}>
                  {s.value}
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="d-stat-label">{s.label}</span>
                  <span
                    className="text-success"
                    style={{ fontSize: "0.75rem", fontWeight: 700 }}
                  >
                    {s.change}
                  </span>
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        {/* Revenue Analytics */}
        <Col xs={12} lg={8}>
          <div className="d_chart_card position-relative overflow-hidden">
            {/* Decorative Blurs */}
            <div className="d_chart_glow d_chart_glow_gold"></div>
            <div className="d_chart_glow d_chart_glow_green"></div>

            {/* Header */}
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
              <div>
                <div className="d-section-title">Revenue Analytics</div>

                <div className="d-section-sub">
                  Weekly café & bar sales overview
                </div>
              </div>

              <div className="d-flex gap-2 flex-wrap">
                <div className="d_badge d_badge_success">↑ 18.4%</div>

                <div className="d_badge">Updated Live</div>
              </div>
            </div>

            {/* Stats */}
            <div className="row g-3 mt-2">
              {[
                {
                  title: "Total Revenue",
                  value: "₹8.4L",
                  sub: "This Week",
                  color: "var(--d-primary)",
                },
                {
                  title: "Average Daily",
                  value: "₹1.2L",
                  sub: "Per Day",
                  color: "var(--d-gold)",
                },
                {
                  title: "Top Day",
                  value: "Saturday",
                  sub: "Highest Orders",
                  color: "var(--d-success)",
                },
              ].map((item, i) => (
                <div className="col-12 col-md-4" key={i}>
                  <div className="d_stat_card">
                    <div className="d_stat_sub">{item.title}</div>

                    <div className="d_stat_value" style={{ color: item.color }}>
                      {item.value}
                    </div>

                    <div className="d_stat_desc">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chart */}
            {/* Chart */}
            <div className="d_chart_wrapper">
              {/* Left Axis */}
              <div className="d_chart_axis">
                {[150, 120, 90, 60, 30, 0].map((value, i) => (
                  <div key={i} className="d_chart_axis_label">
                    ₹{value}k
                  </div>
                ))}
              </div>

              {/* Main Chart */}
              <div className="d_chart_main">
                {/* Grid */}
                {[0, 1, 2, 3, 4, 5].map((_, i) => (
                  <div
                    key={i}
                    className="d_chart_grid_line"
                    style={{
                      top: `${i * 20}%`,
                    }}
                  />
                ))}

                {/* Bars */}
                <div className="d_chart_bars">
                  {WEEKLY.map((w) => {
                    const percentage = (w.rev / 150000) * 100;

                    return (
                      <div key={w.day} className="d_chart_bar_item">
                        {/* Value */}
                        <div className="d_chart_bar_value">
                          ₹{Math.round(w.rev / 1000)}k
                        </div>

                        {/* Bar */}
                        <div className="d_chart_bar_container">
                          <div
                            className={`d_chart_bar ${
                              w.day === "Fri" || w.day === "Sat"
                                ? "d_chart_bar_gold"
                                : ""
                            }`}
                            style={{
                              height: `${percentage}%`,
                            }}
                          >
                            <div className="d_chart_bar_shine"></div>
                            <div className="d_chart_bar_overlay"></div>
                            <div className="d_chart_bar_dot"></div>
                          </div>
                        </div>

                        {/* Day */}
                        <div
                          className={`d_chart_day ${
                            w.day === "Fri" || w.day === "Sat"
                              ? "d_chart_day_active"
                              : ""
                          }`}
                        >
                          {w.day}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </Col>

        {/* Right Panel */}
        <Col xs={12} lg={4}>
          <div className="d_chart_card h-100">
            <div className="d-section-title">Revenue Sources</div>

            <div className="d-section-sub">
              Department contribution insights
            </div>

            {/* Category */}
            <div className="d_category_list">
              {[
                {
                  label: "Bar & Spirits",
                  value: 58,
                  growth: "+12%",
                  icon: <MdLocalBar />,
                  color: "var(--d-info)",
                },
                {
                  label: "Café & Kitchen",
                  value: 32,
                  growth: "+8%",
                  icon: <MdLocalCafe />,
                  color: "var(--d-success)",
                },
                {
                  label: "Desserts",
                  value: 10,
                  growth: "+4%",
                  icon: <MdTrendingUp />,
                  color: "var(--d-gold)",
                },
              ].map((cat, i) => (
                <div className="d_category_item" key={i}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="d_category_icon"
                        style={{
                          background: `${cat.color}15`,
                          color: cat.color,
                        }}
                      >
                        {cat.icon}
                      </div>

                      <div>
                        <div className="d_category_title">{cat.label}</div>

                        <div className="d_category_growth">
                          Growth {cat.growth}
                        </div>
                      </div>
                    </div>

                    <div
                      className="d_category_percent"
                      style={{ color: cat.color }}
                    >
                      {cat.value}%
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="d_progress_track">
                    <div
                      className="d_progress_fill"
                      style={{
                        width: `${cat.value}%`,
                        background: `linear-gradient(
                    90deg,
                    ${cat.color},
                    ${cat.color}cc
                  )`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Card */}
            <div className="d_insight_card">
              <div className="d_insight_glow"></div>

              <div className="d_insight_label">Peak Revenue Window</div>

              <div className="d_insight_title">Saturday Night</div>

              <div className="d_insight_revenue">Avg Revenue ₹1.38L</div>

              {/* Bottom Stats */}
              <div className="d_insight_stats">
                <div>
                  <div className="d_insight_stat_label">Orders</div>

                  <div className="d_insight_stat_value">1,284</div>
                </div>

                <div>
                  <div className="d_insight_stat_label">Customers</div>

                  <div className="d_insight_stat_value">846</div>
                </div>

                <div>
                  <div className="d_insight_stat_label">Growth</div>

                  <div className="d_insight_stat_value">+22%</div>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
}
