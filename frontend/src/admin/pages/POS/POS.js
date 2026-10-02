import React, { useState, useEffect, useRef, useCallback } from "react";
import { Row, Col } from "react-bootstrap";
import {
  MdShoppingCart,
  MdPayment,
  MdSearch,
  MdDelete,
  MdAdd,
  MdRemove,
  MdTableRestaurant,
  MdClose,
  MdTrendingUp,
  MdReceipt,
  MdAttachMoney,
} from "react-icons/md";
import { menuAPI, ordersAPI, reservationsAPI } from "../../../api";
import { payBill, mountCardElement } from "../../../utils/stripePay";

const ADVANCE_AMOUNT = 200;

export default function POS() {
  const [menuItems, setMenuItems] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState("");
  const [selectedReservationData, setSelectedReservationData] = useState(null);
  const [reservationOrders, setReservationOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [upiVpa, setUpiVpa] = useState("");
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState("");
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const cardMountRef = useRef(null);
  const cardElementRef = useRef(null);

  // ── Today's Sales ──
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [todaySales, setTodaySales] = useState(null);
  const [salesLoading, setSalesLoading] = useState(false);
  const [liveStats, setLiveStats] = useState({ revenue: 0, orders: 0, pending: 0 });

  const loadTodaySales = useCallback(async () => {
    setSalesLoading(true);
    try {
      const res = await ordersAPI.getAll();
      const allOrders = Array.isArray(res.data) ? res.data : [];
      const todayStr = new Date().toISOString().split("T")[0];

      const todayOrders = allOrders.filter((o) => {
        const d = o.createdAt;
        return d && d.slice(0, 10) === todayStr;
      });

      // Use correct field: `amount` from Order model
      const totalRevenue = todayOrders
        .filter((o) => o.status === "Paid")
        .reduce((sum, o) => sum + Number(o.amount || 0), 0);

      const totalItems = todayOrders.reduce((sum, o) => {
        const items = Array.isArray(o.items) ? o.items : [];
        return sum + items.reduce((s, i) => s + (i.qty || 1), 0);
      }, 0);

      const pendingCount  = todayOrders.filter((o) => o.status === "Pending").length;
      const paidCount     = todayOrders.filter((o) => o.status === "Paid").length;
      const cancelledCount = todayOrders.filter((o) => o.status === "Cancelled").length;

      // Group by table (string field in Order model)
      const byTable = {};
      todayOrders.forEach((o) => {
        const label = o.table ? `Table ${o.table}` : "Walk-in";
        if (!byTable[label]) byTable[label] = { orders: 0, revenue: 0, paid: 0 };
        byTable[label].orders += 1;
        if (o.status === "Paid") {
          byTable[label].revenue += Number(o.amount || 0);
          byTable[label].paid += 1;
        }
      });

      // Top items sold today
      const itemCount = {};
      todayOrders.forEach((o) => {
        (o.items || []).forEach((item) => {
          if (!itemCount[item.name]) itemCount[item.name] = { qty: 0, revenue: 0 };
          itemCount[item.name].qty     += item.qty || 1;
          itemCount[item.name].revenue += (item.price || 0) * (item.qty || 1);
        });
      });
      const topItems = Object.entries(itemCount)
        .sort((a, b) => b[1].qty - a[1].qty)
        .slice(0, 5);

      const data = {
        orders:    todayOrders.length,
        paid:      paidCount,
        pending:   pendingCount,
        cancelled: cancelledCount,
        revenue:   totalRevenue,
        items:     totalItems,
        byTable:   Object.entries(byTable).sort((a, b) => b[1].revenue - a[1].revenue),
        topItems,
        date: new Date().toLocaleDateString("en-IN", {
          weekday: "long", day: "numeric", month: "long", year: "numeric",
        }),
      };

      setTodaySales(data);
      // Update live stats bar
      setLiveStats({ revenue: totalRevenue, orders: todayOrders.length, pending: pendingCount });
    } catch (err) {
      console.error("Error loading today's sales:", err);
      setTodaySales(null);
    } finally {
      setSalesLoading(false);
    }
  }, []);

  // Load live stats on mount
  useEffect(() => { loadTodaySales(); }, [loadTodaySales]);

  const handleTodaySales = () => {
    setShowSalesModal(true);
    loadTodaySales();
  };

  const [reservationsLoading, setReservationsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setReservationsLoading(true);
        const [menuRes, resRes] = await Promise.all([
          menuAPI.getAll(),
          reservationsAPI.getAll(),
        ]);

        setMenuItems(Array.isArray(menuRes.data) ? menuRes.data : []);

        const allReservations = Array.isArray(resRes.data) ? resRes.data : [];

        // Show all Confirmed reservations that haven't been fully paid yet.
        // No longer require all items to be Served — cashier needs to bill
        // the table as soon as it's confirmed, regardless of kitchen status.
        const eligible = allReservations.filter(
          (r) => r.status === "Confirmed" && !r.fullPaymentDone
        );

        setReservations(eligible);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setReservationsLoading(false);
      }
    };
 
    loadData();
  }, []);

  useEffect(() => {
    const loadOrdersForReservation = async () => {
      if (!selectedReservation) {
        setCart([]);
        setReservationOrders([]);
        setSelectedReservationData(null);
        return;
      }

      try {
        const res = await ordersAPI.getByReservationId(selectedReservation);
        const orders = Array.isArray(res.data) ? res.data : [];
        setReservationOrders(orders);

        const reservation = reservations.find(
          (r) => r._id === selectedReservation,
        );
        setSelectedReservationData(reservation || null);

        const combinedItems = [];
        orders.forEach((order) => {
          if (Array.isArray(order.items)) {
            order.items.forEach((item) => {
              const existing = combinedItems.find((i) => i.name === item.name);
              if (existing) {
                existing.qty += item.qty;
              } else {
                combinedItems.push({ ...item, id: item.name });
              }
            });
          }
        });
        setCart(combinedItems);
      } catch (error) {
        console.error("Error loading orders:", error);
      }
    };

    loadOrdersForReservation();
  }, [selectedReservation, reservations]);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = subtotal * 0.05;
  const grossTotal = subtotal + tax;
  const advanceDeducted = selectedReservationData?.advancePaid || 0;
  const total = Math.max(0, grossTotal - advanceDeducted);

  useEffect(() => {
    if (!selectedReservation || total <= 0 || paymentMethod !== "Card") {
      return undefined;
    }

    let active = true;
    let frameId = 0;

    const setupCard = async () => {
      if (!cardMountRef.current) {
        frameId = requestAnimationFrame(() => {
          if (active) setupCard();
        });
        return;
      }

      try {
        cardElementRef.current?.unmount();
        cardElementRef.current = null;
        setCardComplete(false);
        setCardError("");

        const { cardElement } = await mountCardElement(
          cardMountRef.current,
          (event) => {
            setCardComplete(event.complete);
            setCardError(event.error?.message || "");
          },
        );

        if (active) {
          cardElementRef.current = cardElement;
        } else {
          cardElement.unmount();
        }
      } catch (err) {
        if (active) {
          setCardError(err.message || "Could not load card payment form.");
        }
      }
    };

    setupCard();

    return () => {
      active = false;
      cancelAnimationFrame(frameId);
      cardElementRef.current?.unmount();
      cardElementRef.current = null;
    };
  }, [selectedReservation, total, paymentMethod]);

  const getTableLabel = (reservation) => {
    if (!reservation) return "";
    const t = reservation.table;
    if (!t) return "Table ?";
    // table is a populated object with virtuals included
    if (t.displayId)  return t.displayId;                         // "C-01" / "B-02"
    if (t.number)     return `${t.type === "Bar" ? "B" : "C"}-${String(t.number).padStart(2, "0")}`;
    return "Table ?";
  };

  const handlePayment = async () => {
    try {
      setPaying(true);
      setPaymentError("");

      if (!selectedReservation) {
        setPaymentError("Please select a reservation to pay");
        return;
      }

      const result = await payBill({
        paymentMethod,
        upiVpa,
        cardElement: cardElementRef.current,
        reservationId: selectedReservation,
        subtotal: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
        tax,
        orderIds: reservationOrders.map(order => order._id),
      });

      if (!result?.redirected) {
        await reservationsAPI.updateStatus(selectedReservation, "Completed");
      }

      console.log("Payment Success:", result);

      // Redirect to dashboard after successful payment
      window.location.href = "/admin/dashboard";
    } catch (err) {
      setPaymentError(err.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  const updateQty = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id || item._id === id
            ? { ...item, qty: Math.max(1, item.qty + delta) }
            : item,
        )
        .filter((item) => item.qty > 0),
    );
  };

  const removeFromCart = (id) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.id !== id && item._id !== id),
    );
  };

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdPayment /> POS & Billing
          </div>
          <div className="d-page-sub">
            Point of Sale terminal for Zest Café & Bar
          </div>
        </div>
        <div className="d-flex gap-2">
          <button className="d-btn-outline" onClick={handleTodaySales}>
            <MdTrendingUp /> Today's Sales
          </button>
        </div>
      </div>

      {/* ── LIVE STATS BAR ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "20px" }}>
        {[
          { label: "Today's Revenue", value: `₹${liveStats.revenue.toLocaleString("en-IN")}`, icon: <MdAttachMoney size={18} />, color: "#C9A84C" },
          { label: "Total Orders",    value: liveStats.orders,                                   icon: <MdReceipt size={18} />,      color: "#16302B" },
          { label: "Pending Orders",  value: liveStats.pending,                                  icon: <MdShoppingCart size={18} />, color: liveStats.pending > 0 ? "#e74c3c" : "#2ecc71" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid var(--d-border,#e2e0da)", borderRadius: "14px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ width: 36, height: 36, borderRadius: "10px", background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontFamily: "Cormorant Garamond,serif", fontSize: "1.3rem", fontWeight: 700, color: "var(--d-primary,#16302B)", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--d-text-muted,#6b7280)", marginTop: "3px" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <Row className="g-4">
        <Col xs={12} lg={8}>
          <div className="d-card mb-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div className="d-section-title mb-0">Quick Select Menu</div>
              <div className="d-flex gap-3 flex-wrap">
                <div
                  className="d-navbar-search-box m-0"
                  style={{ width: "250px" }}
                >
                  <MdSearch className="d-search-icon" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="d-pos-table-select">
                  <MdTableRestaurant className="text-gold" fontSize="1.2rem" />
                  <select
                    value={selectedReservation}
                    onChange={(e) => setSelectedReservation(e.target.value)}
                    style={{ minWidth: "200px" }}
                    disabled={reservationsLoading}
                  >
                    {reservationsLoading ? (
                      <option value="">Loading tables…</option>
                    ) : reservations.length === 0 ? (
                      <option value="">No confirmed tables pending billing</option>
                    ) : (
                      <>
                        <option value="">Select Table for Billing</option>
                        {reservations.map((r) => (
                          <option key={r._id} value={r._id}>
                            {getTableLabel(r)} — {r.customerName || r.name} ({r.guests} guests)
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="d-card">
            <div className="d-section-title">
              {selectedReservation
                ? "Active Order"
                : "Select a table to view bill"}
            </div>
            {selectedReservation && (
              <div className="d-table-wrap mt-3">
                <table className="d-table"> 
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center py-4"
                          style={{ color: "var(--d-text-muted)" }}
                        >
                          No items in this bill
                        </td>
                      </tr>
                    ) : (
                      cart.map((item) => (
                        <tr key={item.id || item._id || item.name}>
                          <td>
                            <strong>{item.name}</strong>
                          </td>
                          <td>₹{item.price}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <button
                                className="btn btn-sm btn-light p-1"
                                onClick={() =>
                                  updateQty(
                                    item.id || item._id || item.name,
                                    -1,
                                  )
                                }
                              >
                                <MdRemove />
                              </button>
                              <span>{item.qty}</span>
                              <button
                                className="btn btn-sm btn-light p-1"
                                onClick={() =>
                                  updateQty(item.id || item._id || item.name, 1)
                                }
                              >
                                <MdAdd />
                              </button>
                            </div>
                          </td>
                          <td>
                            <strong>₹{item.price * item.qty}</strong>
                          </td>
                          <td>
                            <button
                              className="text-danger border-0 bg-transparent"
                              onClick={() =>
                                removeFromCart(item.id || item._id || item.name)
                              }
                            >
                              <MdDelete />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Col>

        <Col xs={12} lg={4}>
          <div className="d-card h-100">
            <div className="d-section-title mb-4">Checkout Summary</div>
            {selectedReservation ? (
              <div className="d-checkout-details">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Tax (GST 5%)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                {advanceDeducted > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Reservation Advance</span>
                    <span style={{ color: "var(--d-green, #2ecc71)" }}>
                      − ₹{advanceDeducted.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-4">
                  <span className="text-muted">Service Charge</span>
                  <span>₹0.00</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-4 mt-4">
                  <strong
                    style={{
                      fontSize: "1.4rem",
                      fontFamily: "Playfair Display",
                    }}
                  >
                    Total
                  </strong>
                  <strong
                    style={{
                      fontSize: "1.4rem",
                      color: "var(--d-gold)",
                      fontFamily: "Playfair Display",
                    }}
                  >
                    ₹{total.toLocaleString()}
                  </strong>
                </div>

                {total > 0 && (
                  <>
                    <div className="d-payment-methods mb-3">
                      <div className="text-muted small mb-2">
                        Payment Method
                      </div>
                      <div className="d-flex gap-3">
                        <button
                          className={`d-btn-outline flex-grow-1 ${paymentMethod === "Card" ? "active" : ""}`}
                          style={{ fontSize: "0.75rem" }}
                          onClick={() => setPaymentMethod("Card")}
                        >
                          Card
                        </button>
                        <button
                          className={`d-btn-outline flex-grow-1 ${paymentMethod === "UPI" ? "active" : ""}`}
                          style={{ fontSize: "0.75rem" }}
                          onClick={() => setPaymentMethod("UPI")}
                        >
                          UPI
                        </button>
                      </div>
                    </div>

                    {paymentMethod === "Card" ? (
                      <div className="mb-3">
                        <div className="text-muted small mb-2">
                          Card Details
                        </div>
                        <div
                          ref={cardMountRef}
                          className="form-control"
                          style={{ minHeight: "42px", paddingTop: "10px" }}
                        />
                        {cardError && (
                          <div className="text-danger small mt-2">
                            {cardError}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mb-3">
                        <input
                          className="form-control"
                          placeholder="UPI ID (e.g. success@upi)"
                          value={upiVpa}
                          onChange={(e) => setUpiVpa(e.target.value)}
                        />
                      </div>
                    )}
                  </>
                )}

                {paymentError && (
                  <div className="alert alert-danger py-2 small mb-3">
                    {paymentError}
                  </div>
                )}

                <button
                  className="d-btn-gold w-100 "
                  style={{ justifyContent: "center", fontSize: "1rem" }}
                  onClick={handlePayment}
                  disabled={cart.length === 0 || paying}
                >
                  <MdPayment className="me-2" />
                  {paying
                    ? "Processing..."
                    : total === 0
                      ? "Settle Bill"
                      : "Complete Payment"}
                </button>
              </div>
            ) : (
              <div
                className="text-center py-5"
                style={{ color: "var(--d-text-muted)" }}
              >
                <MdShoppingCart
                  style={{
                    fontSize: "3rem",
                    marginBottom: "1rem",
                    opacity: 0.5,
                  }}
                />
                <p style={{ textWrap: "wrap" }}>
                  Select a table from the dropdown above to view and manage the
                  bill
                </p>
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* ── TODAY'S SALES MODAL ── */}
      {showSalesModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1055,
          background: "rgba(11,25,21,0.55)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
        }}
          onClick={(e) => e.target === e.currentTarget && setShowSalesModal(false)}
        >
          <div style={{
            background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "560px",
            maxHeight: "88vh", display: "flex", flexDirection: "column",
            boxShadow: "0 32px 80px rgba(11,25,21,0.2), 0 0 0 1px rgba(201,168,76,0.15)",
            overflow: "hidden",
          }}>
            {/* Top bar */}
            <div style={{ height: "4px", background: "linear-gradient(90deg,#16302B,#C9A84C,#16302B)", flexShrink: 0 }} />

            {/* Header */}
            <div style={{ padding: "18px 24px 16px", background: "linear-gradient(135deg,#16302B,#1f4238)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: 32, height: 32, borderRadius: "8px", background: "rgba(201,168,76,0.2)", border: "1px solid rgba(201,168,76,0.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C9A84C" }}>
                  <MdTrendingUp size={16} />
                </div>
                <div>
                  <div style={{ fontFamily: "Cormorant Garamond,serif", fontSize: "1.2rem", fontWeight: 600, color: "#fff" }}>Today's Sales</div>
                  <div style={{ fontSize: "0.65rem", color: "rgba(201,168,76,0.8)", letterSpacing: "0.5px" }}>{todaySales?.date || new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</div>
                </div>
              </div>
              <button
                onClick={() => setShowSalesModal(false)}
                style={{ width: 32, height: 32, borderRadius: "8px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.7)" }}
              >
                <MdClose size={16} />
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
              {salesLoading ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "var(--d-text-muted)" }}>
                  <div style={{ fontSize: "0.9rem" }}>Loading sales data…</div>
                </div>
              ) : !todaySales ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "var(--d-text-muted)" }}>
                  <MdReceipt style={{ fontSize: "3rem", opacity: 0.3 }} />
                  <div style={{ marginTop: "12px" }}>Could not load sales data</div>
                </div>
              ) : (
                <>
                  {/* Stat cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                    {[
                      { icon: <MdAttachMoney size={20} />, label: "Revenue (Paid)", value: `₹${todaySales.revenue.toLocaleString("en-IN")}`, color: "#C9A84C" },
                      { icon: <MdReceipt size={20} />,      label: "Total Orders",  value: todaySales.orders,  color: "#16302B" },
                      { icon: <MdShoppingCart size={20} />, label: "Items Sold",    value: todaySales.items,   color: "#2ecc71" },
                    ].map((s) => (
                      <div key={s.label} style={{ background: "var(--d-bg,#f5f4f0)", borderRadius: "14px", padding: "16px 14px", border: "1px solid var(--d-border,#e2e0da)", textAlign: "center" }}>
                        <div style={{ color: s.color, marginBottom: "6px" }}>{s.icon}</div>
                        <div style={{ fontFamily: "Cormorant Garamond,serif", fontSize: "1.6rem", fontWeight: 700, color: "var(--d-primary,#16302B)", lineHeight: 1 }}>{s.value}</div>
                        <div style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--d-text-muted,#6b7280)", marginTop: "4px" }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Order status pills */}
                  <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
                    {[
                      { label: "Paid",      count: todaySales.paid,      bg: "rgba(46,204,113,0.12)",  color: "#27ae60" },
                      { label: "Pending",   count: todaySales.pending,   bg: "rgba(201,168,76,0.12)",  color: "#C9A84C" },
                      { label: "Cancelled", count: todaySales.cancelled, bg: "rgba(231,76,60,0.10)",   color: "#e74c3c" },
                    ].map((s) => (
                      <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}30`, borderRadius: "20px", padding: "5px 14px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 800, color: s.color }}>{s.count}</span>
                        <span style={{ fontSize: "0.68rem", fontWeight: 600, color: s.color, textTransform: "uppercase", letterSpacing: "0.8px" }}>{s.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* By table breakdown */}
                  {todaySales.byTable.length > 0 && (
                    <>
                      <div style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--d-gold,#C9A84C)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.2)" }} />
                        By Table
                        <span style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.2)" }} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginBottom: "20px" }}>
                        {todaySales.byTable.map(([label, data]) => (
                          <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--d-bg,#f5f4f0)", borderRadius: "10px", padding: "10px 14px", border: "1px solid var(--d-border,#e2e0da)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div style={{ width: 30, height: 30, borderRadius: "8px", background: "rgba(201,168,76,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--d-gold,#C9A84C)" }}>
                                <MdTableRestaurant size={15} />
                              </div>
                              <div>
                                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--d-primary,#16302B)" }}>{label}</div>
                                <div style={{ fontSize: "0.68rem", color: "var(--d-text-muted,#6b7280)" }}>{data.orders} order{data.orders !== 1 ? "s" : ""} · {data.paid} paid</div>
                              </div>
                            </div>
                            <div style={{ fontFamily: "Cormorant Garamond,serif", fontSize: "1.15rem", fontWeight: 700, color: "var(--d-primary,#16302B)" }}>
                              ₹{data.revenue.toLocaleString("en-IN")}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Top items */}
                  {todaySales.topItems.length > 0 && (
                    <>
                      <div style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--d-gold,#C9A84C)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.2)" }} />
                        Top Items Today
                        <span style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.2)" }} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {todaySales.topItems.map(([name, data], idx) => (
                          <div key={name} style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--d-bg,#f5f4f0)", borderRadius: "10px", padding: "9px 14px", border: "1px solid var(--d-border,#e2e0da)" }}>
                            <div style={{ width: 22, height: 22, borderRadius: "50%", background: idx === 0 ? "rgba(201,168,76,0.25)" : "rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 800, color: idx === 0 ? "var(--d-gold,#C9A84C)" : "var(--d-text-muted,#6b7280)", flexShrink: 0 }}>
                              {idx + 1}
                            </div>
                            <div style={{ flex: 1, fontSize: "0.85rem", fontWeight: 600, color: "var(--d-primary,#16302B)" }}>{name}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--d-text-muted,#6b7280)", marginRight: "10px" }}>×{data.qty}</div>
                            <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--d-primary,#16302B)" }}>₹{data.revenue.toLocaleString("en-IN")}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {todaySales.orders === 0 && (
                    <div style={{ textAlign: "center", padding: "24px 0", color: "var(--d-text-muted)", fontSize: "0.9rem" }}>
                      No orders recorded today yet
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: "12px 24px 16px", borderTop: "1px solid rgba(201,168,76,0.1)", background: "var(--d-bg,#f5f4f0)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <button
                onClick={loadTodaySales}
                disabled={salesLoading}
                style={{ background: "transparent", border: "1.5px solid var(--d-border,#e2e0da)", borderRadius: "10px", padding: "8px 16px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", color: "var(--d-text-muted,#6b7280)" }}
              >
                ↻ Refresh
              </button>
              <button
                onClick={() => setShowSalesModal(false)}
                style={{ background: "linear-gradient(135deg,#C9A84C,#e4c47a)", border: "none", borderRadius: "10px", padding: "8px 20px", fontSize: "0.78rem", fontWeight: 800, cursor: "pointer", color: "#16302B" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .d-menu-item-pos:hover {
          border-color: var(--d-gold) !important;
          transform: translateY(-2px);
          box-shadow: var(--d-shadow-sm);
        }
        .text-gold {
          color: var(--d-gold);
        }
        .d-pos-table-select {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--d-bg);
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid var(--d-border);
        }
        .d-pos-table-select select {
          border: none;
          background: transparent;
          outline: none;
          font-size: 0.9rem;
        }
      `}</style>
    </>
  );
}
