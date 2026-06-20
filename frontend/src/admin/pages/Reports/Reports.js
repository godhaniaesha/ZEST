import React, { useState, useEffect, useCallback, useRef } from "react";
import { Row, Col } from "react-bootstrap";
import {
  MdTrendingUp,
  MdShowChart,
  MdPieChart,
  MdFileDownload,
  MdLocalCafe,
  MdLocalBar,
} from "react-icons/md";
import { reportsAPI } from "../../../api";

const RANGE_LABELS = {
  "7days": "Last 7 Days",
  "30days": "Last 30 Days",
  "90days": "Last 90 Days",
  "1year": "Last 12 Months",
  all: "All Time",
};

const getChartMax = (chartData) => {
  const maxRev = Math.max(...chartData.map((w) => w.rev), 0);
  if (maxRev === 0) return 1000;
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxRev)));
  return Math.ceil(maxRev / magnitude) * magnitude;
};

const getAxisLabels = (chartMax) => {
  const steps = 5;
  return Array.from({ length: steps + 1 }, (_, i) =>
    Math.round((chartMax * (steps - i)) / steps / 1000)
  );
};

export default function Reports() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState("7days");
  const [summary, setSummary] = useState(null);
  const [chartMeta, setChartMeta] = useState({ chartSubtitle: "", periodLabel: "" });
  const [chartData, setChartData] = useState([]);
  const [sourcesData, setSourcesData] = useState([]);
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);
  const [peakData, setPeakData] = useState(null);

  const isFirstLoad = useRef(true);

  const fetchAllData = useCallback(async (range, isInitial = false) => {
    if (isInitial) setInitialLoading(true);
    else setRefreshing(true);

    try {
      const [summaryRes, weeklyRes, sourcesRes, revenueRes, peakRes] =
        await Promise.all([
          reportsAPI.getSummary(range),
          reportsAPI.getWeekly(range),
          reportsAPI.getSources(range),
          reportsAPI.getRevenue(range),
          reportsAPI.getPeak(range),
        ]);

      const weeklyPayload = weeklyRes.data;
      const weeklyItems = Array.isArray(weeklyPayload)
        ? weeklyPayload
        : weeklyPayload?.data || [];

      setSummary(summaryRes.data);
      setChartData(weeklyItems);
      setChartMeta({
        chartSubtitle: weeklyPayload?.chartSubtitle || "",
        periodLabel: weeklyPayload?.periodLabel || RANGE_LABELS[range],
      });
      setSourcesData(sourcesRes.data);
      setRevenueAnalytics(revenueRes.data);
      setPeakData(peakRes.data);
    } catch (error) {
      console.error("Error fetching reports data:", error);
      setSummary({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        avgOrderValue: 0,
        growth: 0,
        periodLabel: RANGE_LABELS[range],
      });
      setChartData([]);
      setChartMeta({
        chartSubtitle: "No data available",
        periodLabel: RANGE_LABELS[range],
      });
      setSourcesData([]);
      setRevenueAnalytics(null);
      setPeakData(null);
    } finally {
      if (isInitial) setInitialLoading(false);
      else setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData(dateRange, isFirstLoad.current);
    isFirstLoad.current = false;
  }, [dateRange, fetchAllData]);

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
  };

  const handleExport = () => {
    const exportData = {
      summary,
      chartData,
      chartMeta,
      sourcesData,
      revenueAnalytics,
      peakData,
      exportDate: new Date().toISOString(),
      dateRange,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reports-export-${dateRange}-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return "₹0";
    }
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}k`;
    }
    return `₹${value.toFixed(0)}`;
  };

  const formatGrowth = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "+0%";
    return `${value >= 0 ? "+" : ""}${value}%`;
  };

  const chartMax = getChartMax(chartData);
  const axisLabels = getAxisLabels(chartMax);
  const topRevenueBars = [...chartData]
    .sort((a, b) => b.rev - a.rev)
    .slice(0, 2)
    .map((w) => w.label);

  if (initialLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .d_chart_wrapper::-webkit-scrollbar {
          height: 6px;
        }
        .d_chart_wrapper::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 3px;
        }
        .d_chart_wrapper::-webkit-scrollbar-thumb {
          background: rgba(201, 168, 76, 0.3);
          border-radius: 3px;
        }
        .d_chart_wrapper::-webkit-scrollbar-thumb:hover {
          background: rgba(201, 168, 76, 0.5);
        }
        @media (max-width: 768px) {
          .d_chart_wrapper {
            gap: 12px;
          }
          .d_chart_axis {
            width: 40px;
          }
        }
      `}</style>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdShowChart /> Analytics & Reports
          </div>
          <div className="d-page-sub">
            {chartMeta.periodLabel || RANGE_LABELS[dateRange]} overview
          </div>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <select
            className="d-btn-outline"
            style={{ cursor: "pointer" }}
            value={dateRange}
            onChange={handleDateRangeChange}
            disabled={refreshing}
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
            <option value="all">All Time</option>
          </select>
          {refreshing && (
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Refreshing...</span>
            </div>
          )}
          <button className="d-btn-gold" onClick={handleExport} disabled={refreshing}>
            <MdFileDownload /> Export Data
          </button>
        </div>
      </div>

      <Row className="g-3 mb-4">
        {[
          {
            label: "Net Revenue",
            value: formatCurrency(summary?.totalRevenue || 0),
            change: formatGrowth(summary?.growth),
            icon: <MdTrendingUp />,
            color: "d-gold",
          },
          {
            label: "Avg Order Value",
            value: formatCurrency(summary?.avgOrderValue || 0),
            change: `${summary?.totalOrders || 0} orders`,
            icon: <MdShowChart />,
            color: "d-blue",
          },
          {
            label: "Customers",
            value: String(summary?.totalCustomers || 0),
            change: formatGrowth(summary?.growth),
            icon: <MdPieChart />,
            color: "d-green",
          },
        ].map((s, i) => (
          <Col key={`${dateRange}-stat-${i}`} xs={12} sm={4}>
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
                    className={summary?.growth >= 0 ? "text-success" : "text-danger"}
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
        <Col xs={12} lg={8}>
          <div className="d_chart_card position-relative overflow-hidden" key={`chart-${dateRange}`}>
            <div className="d_chart_glow d_chart_glow_gold"></div>
            <div className="d_chart_glow d_chart_glow_green"></div>

            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
              <div>
                <div className="d-section-title">Revenue Analytics</div>
                <div className="d-section-sub">
                  {chartMeta.chartSubtitle || "Sales overview for selected period"}
                </div>
              </div>

              <div className="d-flex gap-2 flex-wrap">
                <div className="d_badge d_badge_success">
                  {formatGrowth(revenueAnalytics?.growth)}
                </div>
                <div className="d_badge">{chartMeta.periodLabel || RANGE_LABELS[dateRange]}</div>
              </div>
            </div>

            <div className="row g-3 mt-2">
              {[
                {
                  title: "Total Revenue",
                  value: formatCurrency(revenueAnalytics?.totalRevenue || 0),
                  sub: chartMeta.periodLabel || "This Period",
                  color: "var(--d-primary)",
                },
                {
                  title: "Average Daily",
                  value: formatCurrency(revenueAnalytics?.avgDailyRevenue || 0),
                  sub: "Per Day",
                  color: "var(--d-gold)",
                },
                {
                  title: "Top Day",
                  value: revenueAnalytics?.topDay || "N/A",
                  sub: "Highest Revenue",
                  color: "var(--d-success)",
                },
              ].map((item, i) => (
                <div className="col-12 col-md-4" key={`${dateRange}-rev-${i}`}>
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

            <div className="d_chart_wrapper" style={{ overflowX: 'auto', overflowY: 'hidden' }}>
              <div className="d_chart_axis">
                {axisLabels.map((value, i) => (
                  <div key={i} className="d_chart_axis_label">
                    ₹{value}k
                  </div>
                ))}
              </div>

              <div className="d_chart_main" style={{ minWidth: `${Math.max(chartData.length * 60, 300)}px` }}>
                {[0, 1, 2, 3, 4, 5].map((_, i) => (
                  <div
                    key={i}
                    className="d_chart_grid_line"
                    style={{ top: `${i * 20}%` }}
                  />
                ))}

                <div
                  className="d_chart_bars"
                  style={{
                    gap: chartData.length > 12 ? "4px" : undefined,
                    minWidth: `${Math.max(chartData.length * 50, 300)}px`,
                  }}
                >
                  {chartData.length > 0 ? (
                    chartData.map((bar, index) => {
                      const percentage = chartMax > 0 ? (bar.rev / chartMax) * 100 : 0;
                      const isTopBar = topRevenueBars.includes(bar.label) && bar.rev > 0;

                      return (
                        <div
                          key={`${dateRange}-${bar.label}-${index}`}
                          className="d_chart_bar_item"
                          style={{ minWidth: chartData.length > 12 ? '40px' : undefined }}
                        >
                          <div className="d_chart_bar_value">
                            {bar.rev > 0 ? formatCurrency(bar.rev) : "—"}
                          </div>

                          <div className="d_chart_bar_container">
                            <div
                              className={`d_chart_bar ${isTopBar ? "d_chart_bar_gold" : ""}`}
                              style={{ height: `${percentage}%` }}
                            >
                              <div className="d_chart_bar_shine"></div>
                              <div className="d_chart_bar_overlay"></div>
                              {bar.rev > 0 && <div className="d_chart_bar_dot"></div>}
                            </div>
                          </div>

                          <div
                            className={`d_chart_day ${isTopBar ? "d_chart_day_active" : ""}`}
                            title={bar.sublabel || bar.label}
                            style={{ fontSize: chartData.length > 12 ? "0.65rem" : undefined }}
                          >
                            {bar.label}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-muted w-100 text-center py-5">
                      No revenue data for {RANGE_LABELS[dateRange]}.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Col>

        <Col xs={12} lg={4}>
          <div className="d_chart_card h-100" key={`sources-${dateRange}`}>
            <div className="d-section-title">Revenue Sources</div>
            <div className="d-section-sub">
              {chartMeta.periodLabel || RANGE_LABELS[dateRange]} breakdown
            </div>

            <div className="d_category_list">
              {sourcesData.length > 0 ? (
                sourcesData.map((cat, i) => (
                  <div className="d_category_item" key={`${dateRange}-src-${i}`}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="d_category_icon"
                          style={{
                            background: `${cat.color || "var(--d-info)"}15`,
                            color: cat.color || "var(--d-info)",
                          }}
                        >
                          {cat.label.includes("Bar") ? (
                            <MdLocalBar />
                          ) : cat.label.includes("Café") ? (
                            <MdLocalCafe />
                          ) : (
                            <MdTrendingUp />
                          )}
                        </div>

                        <div>
                          <div className="d_category_title">{cat.label}</div>
                          <div className="d_category_growth">
                            Growth {cat.growth || "+0%"}
                          </div>
                        </div>
                      </div>

                      <div
                        className="d_category_percent"
                        style={{ color: cat.color || "var(--d-info)" }}
                      >
                        {cat.value}%
                      </div>
                    </div>

                    <div className="d_progress_track">
                      <div
                        className="d_progress_fill"
                        style={{
                          width: `${cat.value}%`,
                          background: `linear-gradient(90deg, ${cat.color || "var(--d-info)"}, ${cat.color || "var(--d-info)"}cc)`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted py-3">
                  No revenue data for {RANGE_LABELS[dateRange]}.
                </div>
              )}
            </div>

            <div className="d_insight_card">
              <div className="d_insight_glow"></div>
              <div className="d_insight_label">Peak Revenue Window</div>
              <div className="d_insight_title">
                {peakData?.peakWindow || "No data yet"}
              </div>
              <div className="d_insight_revenue">
                Avg Revenue {formatCurrency(peakData?.avgRevenue || 0)}
              </div>

              <div className="d_insight_stats">
                <div>
                  <div className="d_insight_stat_label">Orders</div>
                  <div className="d_insight_stat_value">
                    {peakData?.orders ?? 0}
                  </div>
                </div>
                <div>
                  <div className="d_insight_stat_label">Customers</div>
                  <div className="d_insight_stat_value">
                    {peakData?.customers ?? 0}
                  </div>
                </div>
                <div>
                  <div className="d_insight_stat_label">Growth</div>
                  <div className="d_insight_stat_value">
                    {peakData?.growth || "+0%"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
}
