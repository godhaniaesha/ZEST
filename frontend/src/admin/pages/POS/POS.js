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
  MdPrint,
} from "react-icons/md";
import { menuAPI, ordersAPI, reservationsAPI } from "../../../api";
import { payBill, mountCardElement } from "../../../utils/stripePay";

const ADVANCE_AMOUNT = 200;
const GST_RATE = 0.05;
const POS_PAYMENT_METHOD_KEY = "zest-pos-payment-method";
const POS_RESERVATION_KEY = "zest-pos-selected-reservation";
const POS_ORDER_KEY = "zest-pos-selected-order";
const roundUpPrice = (price) => Math.ceil(Number(price) || 0);
const roundRupees = (amount) => Math.round(Number(amount) || 0);
const formatRupees = (amount) => roundRupees(amount).toLocaleString("en-IN");
const getSavedPaymentMethod = () => {
  const savedMethod = sessionStorage.getItem(POS_PAYMENT_METHOD_KEY);
  return ["Card", "UPI", "Cash"].includes(savedMethod) ? savedMethod : "Card";
};

const getTableLabel = (reservation) => {
  if (!reservation) return "";
  const t = reservation.table;
  if (!t) return "Table ?";
  if (t.displayId) return t.displayId;
  if (t.number) {
    return `${t.type === "Bar" ? "B" : "C"}-${String(t.number).padStart(2, "0")}`;
  }
  return "Table ?";
};

const orderMatchesTable = (order, tableLabel) => {
  if (!order?.table || !tableLabel || tableLabel === "Table ?") return false;
  const normalized = String(order.table).replace(/^Table\s*/i, "");
  return (
    normalized === tableLabel ||
    order.table === tableLabel ||
    order.table === `Table ${tableLabel}`
  );
};

const ordersForReservation = (reservation, allOrders) => {
  if (!reservation) return [];
  const byReservation = allOrders.filter(
    (o) =>
      o.reservationId && String(o.reservationId) === String(reservation._id),
  );
  if (byReservation.length > 0) return byReservation;

  const tableLabel = getTableLabel(reservation);
  return allOrders.filter((o) => orderMatchesTable(o, tableLabel));
};

const isUnpaidOrder = (order) =>
  order?.status !== "Paid" && order?.status !== "Cancelled";

const buildBillFromOrders = (orders, advancePaid = 0) => {
  const combinedItems = [];
  (orders || []).forEach((order) => {
    if (!isUnpaidOrder(order) || !Array.isArray(order.items)) return;
    order.items.forEach((item) => {
      const existing = combinedItems.find((i) => i.name === item.name);
      if (existing) {
        existing.qty += item.qty;
      } else {
        combinedItems.push({
          ...item,
          price: roundUpPrice(item.price),
          id: item.name,
        });
      }
    });
  });

  const subtotal = combinedItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0,
  );
  const tax = roundRupees(subtotal * GST_RATE);
  const grossTotal = subtotal + tax;
  const advanceDeducted = roundRupees(advancePaid);
  const total = Math.max(0, roundRupees(grossTotal - advanceDeducted));

  return {
    items: combinedItems,
    subtotal,
    tax,
    grossTotal,
    advanceDeducted,
    total,
  };
};

const reservationHasPendingPayment = (reservation, allOrders) => {
  if (!reservation) return false;
  if (
    reservation.status !== "Confirmed" &&
    reservation.status !== "Completed"
  ) {
    return false;
  }

  const orders = ordersForReservation(reservation, allOrders);
  const unpaidOrders = orders.filter(isUnpaidOrder);

  if (unpaidOrders.length === 0) {
    return false;
  }

  const bill = buildBillFromOrders(orders, reservation.advancePaid);
  if (bill.items.length > 0) return true;

  return unpaidOrders.some((o) => (o.items || []).length > 0);
};

export default function POS() {
  const [menuItems, setMenuItems] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(
    () => sessionStorage.getItem(POS_RESERVATION_KEY) || "",
  );
  const [selectedReservationData, setSelectedReservationData] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(
    () => sessionStorage.getItem(POS_ORDER_KEY) || "",
  );
  const [reservationOrders, setReservationOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState(getSavedPaymentMethod);
  const [upiVpa, setUpiVpa] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState("");
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const cardMountRef = useRef(null);
  const cardElementRef = useRef(null);
  const stripeRef = useRef(null);

  // ── Today's Sales ──
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [todaySales, setTodaySales] = useState(null);
  const [salesLoading, setSalesLoading] = useState(false);
  const [liveStats, setLiveStats] = useState({
    revenue: 0,
    orders: 0,
    pending: 0,
  });

  const loadTodaySales = useCallback(async (silent = false) => {
    if (!silent) setSalesLoading(true);
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

      const pendingCount = todayOrders.filter(
        (o) => o.status === "Pending",
      ).length;
      const paidCount = todayOrders.filter((o) => o.status === "Paid").length;
      const cancelledCount = todayOrders.filter(
        (o) => o.status === "Cancelled",
      ).length;

      // Group by table (string field in Order model)
      const byTable = {};
      todayOrders.forEach((o) => {
        const label = o.table ? `Table ${o.table}` : "Walk-in";
        if (!byTable[label])
          byTable[label] = { orders: 0, revenue: 0, paid: 0 };
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
          if (!itemCount[item.name])
            itemCount[item.name] = { qty: 0, revenue: 0 };
          itemCount[item.name].qty += item.qty || 1;
          itemCount[item.name].revenue += (item.price || 0) * (item.qty || 1);
        });
      });
      const topItems = Object.entries(itemCount)
        .sort((a, b) => b[1].qty - a[1].qty)
        .slice(0, 5);

      const data = {
        orders: todayOrders.length,
        paid: paidCount,
        pending: pendingCount,
        cancelled: cancelledCount,
        revenue: totalRevenue,
        items: totalItems,
        byTable: Object.entries(byTable).sort(
          (a, b) => b[1].revenue - a[1].revenue,
        ),
        topItems,
        date: new Date().toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      };

      setTodaySales(data);
      // Update live stats bar
      setLiveStats({
        revenue: totalRevenue,
        orders: todayOrders.length,
        pending: pendingCount,
      });
    } catch (err) {
      console.error("Error loading today's sales:", err);
      setTodaySales(null);
    } finally {
      if (!silent) setSalesLoading(false);
    }
  }, []);

  // Load live stats on mount
  useEffect(() => {
    loadTodaySales();
  }, [loadTodaySales]);

  const handleTodaySales = () => {
    setShowSalesModal(true);
    loadTodaySales();
  };

  const [reservationsLoading, setReservationsLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  const lastSignatureRef = useRef("");

  const loadPosData = useCallback(async (silent = false) => {
    try {
      if (!silent) setReservationsLoading(true);
      const [menuRes, resRes, ordersRes] = await Promise.all([
        menuAPI.getAll(),
        reservationsAPI.getAll(),
        ordersAPI.getAll(),
      ]);

      setMenuItems(Array.isArray(menuRes.data) ? menuRes.data : []);

      const allReservations = Array.isArray(resRes.data) ? resRes.data : [];
      const ordersList = Array.isArray(ordersRes.data) ? ordersRes.data : [];

      // Filter reservations with pending payments
      const eligibleReservations = allReservations.filter((r) =>
        reservationHasPendingPayment(r, ordersList),
      );

      // Also include completed/served orders from KitchenDisplay that are unpaid
      const completedUnpaidOrders = ordersList.filter((o) => {
        if (!isUnpaidOrder(o)) return false;
        // Include if status is Completed OR if all items are Served
        if (o.status === "Completed") return true;
        const allServed = (o.items || []).every(
          (item) => item.status === "Served",
        );
        return allServed;
      });

      const signature = JSON.stringify([
        eligibleReservations.map((r) => [r._id, r.status, r.advancePaid]),
        ordersList.map((o) => [o._id, o.status, (o.items || []).length]),
      ]);
      if (signature !== lastSignatureRef.current) {
        lastSignatureRef.current = signature;
        setAllOrders(ordersList);
        setReservations(eligibleReservations);
        setCompletedOrders(completedUnpaidOrders);
      }
      return { ordersList, eligibleReservations, completedUnpaidOrders };
    } catch (error) {
      console.error("Error loading data:", error);
      return null;
    } finally {
      if (!silent) setReservationsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosData();
  }, [loadPosData]);

  useEffect(() => {
    sessionStorage.setItem(POS_PAYMENT_METHOD_KEY, paymentMethod);
  }, [paymentMethod]);

  useEffect(() => {
    if (selectedReservation) {
      sessionStorage.setItem(POS_RESERVATION_KEY, selectedReservation);
    } else {
      sessionStorage.removeItem(POS_RESERVATION_KEY);
    }
  }, [selectedReservation]);

  useEffect(() => {
    if (selectedOrderId) {
      sessionStorage.setItem(POS_ORDER_KEY, selectedOrderId);
    } else {
      sessionStorage.removeItem(POS_ORDER_KEY);
    }
  }, [selectedOrderId]);

  useEffect(() => {
    if (!selectedOrderId || reservationsLoading) return;
    const matchingOrder = completedOrders.find(
      (order) => String(order._id) === String(selectedOrderId),
    );
    if (matchingOrder) {
      setSelectedOrder(matchingOrder);
      return;
    }
    setSelectedOrderId("");
  }, [completedOrders, selectedOrderId, reservationsLoading]);

  // ── Dynamic: pending payment tables automatic refresh (every 10s) ──
  useEffect(() => {
    const id = setInterval(() => {
      if (paying) return;
      loadPosData(true);
      if (!showSalesModal) loadTodaySales(true);
    }, 10000);
    return () => clearInterval(id);
  }, [loadPosData, loadTodaySales, paying, showSalesModal]);

  // Selected table nu payment bija thi thai gayu hoy to selection clear karo
  useEffect(() => {
    if (
      selectedReservation &&
      !reservationsLoading &&
      !reservations.some((r) => r._id === selectedReservation)
    ) {
      setSelectedReservation("");
    }
  }, [reservations, selectedReservation, reservationsLoading]);

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
        let orders = Array.isArray(res.data) ? res.data : [];

        const reservation = reservations.find(
          (r) => r._id === selectedReservation,
        );
        setSelectedReservationData(reservation || null);

        if (orders.length === 0 && reservation) {
          orders = ordersForReservation(reservation, allOrders);
        }

        setReservationOrders(orders);
        const bill = buildBillFromOrders(orders, reservation?.advancePaid || 0);
        setCart(bill.items);
      } catch (error) {
        console.error("Error loading orders:", error);
      }
    };

    loadOrdersForReservation();
  }, [selectedReservation, reservations, allOrders]);

  // Handle completed order selection from KitchenDisplay
  useEffect(() => {
    if (!selectedOrder) {
      if (!selectedReservation) {
        setCart([]);
        setSelectedReservationData(null);
        setReservationOrders([]);
      }
      return;
    }

    // Load completed order data
    const bill = buildBillFromOrders([selectedOrder], 0);
    setCart(bill.items);
    setReservationOrders([selectedOrder]);
    setSelectedReservationData({
      table: { displayId: selectedOrder.table || "Walk-in" },
      customerName: selectedOrder.waiter || "Guest",
      advancePaid: 0,
    });
  }, [selectedOrder]);

  // Totals cart parthi calculate thay chhe, etle qty / item delete karo to total live change thase
  const subtotal = cart.reduce(
    (acc, item) => acc + roundUpPrice(item.price) * item.qty,
    0,
  );
  const tax = roundRupees(subtotal * GST_RATE);
  const grossTotal = subtotal + tax;
  const advanceDeducted = roundRupees(selectedReservationData?.advancePaid);
  const total = Math.max(0, roundRupees(grossTotal - advanceDeducted));

  useEffect(() => {
    if (
      (!selectedReservation && !selectedOrder) ||
      total <= 0 ||
      paymentMethod !== "Card"
    ) {
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
        stripeRef.current = null;
        setCardComplete(false);
        setCardError("");

        const { stripe, cardElement } = await mountCardElement(
          cardMountRef.current,
          (event) => {
            setCardComplete(event.complete);
            setCardError(event.error?.message || "");
          },
        );

        if (active) {
          stripeRef.current = stripe;
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
      stripeRef.current = null;
    };
  }, [selectedReservation, selectedOrder, total > 0, paymentMethod]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePrintBill = () => {
    if ((!selectedReservation && !selectedOrder) || cart.length === 0) return;
    const printWindow = window.open("", "_blank", "width=420,height=640");
    if (!printWindow) return;

    const tableNo = getTableLabel(selectedReservationData);
    const customer =
      selectedReservationData?.customerName ||
      selectedReservationData?.name ||
      "Guest";
    const printedAt = new Date().toLocaleString("en-IN");

    const rows = cart
      .map(
        (item) => `
        <tr>
          <td>${item.name}</td>
          <td style="text-align:center">${item.qty}</td>
          <td style="text-align:right">₹${formatRupees(roundUpPrice(item.price))}</td>
          <td style="text-align:right">₹${formatRupees(roundUpPrice(item.price) * item.qty)}</td>
        </tr>`,
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill — Table ${tableNo}</title>
          <style>
            body { font-family: Georgia, serif; color: #16302B; padding: 24px; max-width: 360px; margin: 0 auto; }
            h1 { font-size: 1.4rem; margin: 0 0 4px; text-align: center; }
            .meta { font-size: 0.85rem; color: #555; text-align: center; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
            th { border-bottom: 1px solid #ccc; padding: 6px 4px; text-align: left; font-size: 0.75rem; text-transform: uppercase; }
            td { padding: 6px 4px; border-bottom: 1px solid #eee; }
            .totals { margin-top: 12px; font-size: 0.9rem; }
            .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
            .grand { font-size: 1.15rem; font-weight: bold; border-top: 2px solid #16302B; margin-top: 8px; padding-top: 8px; }
            .gold { color: #C9A84C; }
          </style>
        </head>
        <body>
          <h1>Zest Café &amp; Bar</h1>
          <div class="meta">
            Table <strong>${tableNo}</strong> · ${customer}<br/>
            ${printedAt}
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align:center">Qty</th>
                <th style="text-align:right">Rate</th>
                <th style="text-align:right">Amt</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="totals">
            <div><span>Subtotal</span><span>₹${formatRupees(subtotal)}</span></div>
            <div><span>GST (5%)</span><span>₹${formatRupees(tax)}</span></div>
            ${
              advanceDeducted > 0
                ? `<div><span>Advance paid</span><span>− ₹${formatRupees(advanceDeducted)}</span></div>`
                : ""
            }
            <div class="grand"><span>Amount due</span><span class="gold">₹${formatRupees(total)}</span></div>
          </div>
          <p style="text-align:center;font-size:0.75rem;color:#888;margin-top:20px">Thank you for dining with us</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handlePayment = async () => {
    try {
      setPaying(true);
      setPaymentError("");

      if (!selectedReservation && !selectedOrder) {
        setPaymentError("Please select a reservation or order to pay");
        return;
      }

      if (paymentMethod === "Cash") {
        if (!cashAmount || Number(cashAmount) < total) {
          setPaymentError(
            `Insufficient cash amount. Required: ₹${formatRupees(total)}`,
          );
          return;
        }
      }

      const unpaidOrderIds = reservationOrders
        .filter(isUnpaidOrder)
        .map((order) => order._id);

      const result = await payBill({
        paymentMethod,
        upiVpa,
        cashAmount,
        stripe:
          total > 0 && paymentMethod === "Card" ? stripeRef.current : null,
        cardElement:
          total > 0 && paymentMethod === "Card" ? cardElementRef.current : null,
        reservationId: selectedReservation || null,
        subtotal: cart.reduce(
          (sum, item) => sum + roundUpPrice(item.price) * item.qty,
          0,
        ),
        tax,
        orderIds: unpaidOrderIds,
        tableLabel: getTableLabel(selectedReservationData),
      });

      if (result?.redirected) {
        return;
      }

      const tableLabel = getTableLabel(selectedReservationData);
      setPaymentSuccess(
        result?.message ||
          `Payment recorded for ${tableLabel}. Orders updated: ${result?.ordersUpdated ?? unpaidOrderIds.length}.`,
      );

      setSelectedReservation("");
      setSelectedOrder(null);
      setSelectedOrderId("");
      setCart([]);
      setReservationOrders([]);
      setSelectedReservationData(null);
      setCashAmount("");
      setUpiVpa("");

      await Promise.all([loadPosData(), loadTodaySales()]);
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {[
          {
            label: "Today's Revenue",
            value: `₹${formatRupees(liveStats.revenue)}`,
            icon: <MdAttachMoney size={18} />,
            color: "#C9A84C",
          },
          {
            label: "Total Orders",
            value: liveStats.orders,
            icon: <MdReceipt size={18} />,
            color: "#16302B",
          },
          {
            label: "Pending Orders",
            value: liveStats.pending,
            icon: <MdShoppingCart size={18} />,
            color: liveStats.pending > 0 ? "#e74c3c" : "#2ecc71",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "#fff",
              border: "1px solid var(--d-border,#e2e0da)",
              borderRadius: "14px",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                background: `${s.color}18`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: s.color,
                flexShrink: 0,
              }}
            >
              {s.icon}
            </div>
            <div>
              <div
                style={{
                  fontFamily: "Cormorant Garamond,serif",
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  color: "var(--d-primary,#16302B)",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "var(--d-text-muted,#6b7280)",
                  marginTop: "3px",
                }}
              >
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Row className="g-4">
        <Col xs={12} lg={8}>
          {/* ── PENDING PAYMENT TABLES (dynamic) ── */}
          <div className="d-card mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-section-title mb-0">
                Pending Payments
                <span
                  style={{
                    marginLeft: "10px",
                    padding: "2px 10px",
                    borderRadius: "999px",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    background:
                      reservations.length > 0
                        ? "rgba(231,76,60,0.12)"
                        : "rgba(46,204,113,0.12)",
                    color: reservations.length > 0 ? "#e74c3c" : "#27ae60",
                  }}
                >
                  {reservations.length}
                </span>
              </div>
              <button
                type="button"
                className="d-btn-outline"
                style={{ fontSize: "0.72rem", padding: "4px 12px" }}
                onClick={() => loadPosData(true)}
              >
                ↻ Refresh
              </button>
            </div>

            {reservationsLoading ? (
              <div className="text-muted small">Loading tables…</div>
            ) : reservations.length === 0 && completedOrders.length === 0 ? (
              <div className="text-muted small">No Payment Avilable.</div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))",
                  gap: "10px",
                }}
              >
                {reservations.map((r) => {
                  const due = buildBillFromOrders(
                    ordersForReservation(r, allOrders),
                    r.advancePaid,
                  ).total;
                  const active = r._id === selectedReservation;
                  return (
                    <button
                      key={r._id}
                      type="button"
                      onClick={() => {
                        setSelectedReservation(r._id);
                        setSelectedOrder(null);
                        setSelectedOrderId("");
                      }}
                      style={{
                        textAlign: "left",
                        background: active
                          ? "rgba(201,168,76,0.12)"
                          : "var(--d-bg,#f5f4f0)",
                        border: active
                          ? "1.5px solid var(--d-gold,#C9A84C)"
                          : "1px solid var(--d-border,#e2e0da)",
                        borderRadius: "12px",
                        padding: "10px 12px",
                        cursor: "pointer",
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <strong style={{ color: "var(--d-primary,#16302B)" }}>
                          <MdTableRestaurant className="text-gold me-1" />
                          {getTableLabel(r)}
                        </strong>
                        <span
                          style={{
                            fontSize: "0.62rem",
                            fontWeight: 700,
                            color:
                              r.status === "Completed" ? "#27ae60" : "#C9A84C",
                          }}
                        >
                          {r.status === "Completed" ? "Served" : "Occupied"}
                        </span>
                      </div>
                      <div
                        className="text-muted small"
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {r.customerName || r.name}
                      </div>
                      <div
                        style={{
                          fontFamily: "Cormorant Garamond,serif",
                          fontSize: "1.15rem",
                          fontWeight: 700,
                          color: "var(--d-gold,#C9A84C)",
                        }}
                      >
                        Due ₹{formatRupees(due)}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── COMPLETED ORDERS FROM KITCHEN DISPLAY ── */}
          {completedOrders.length > 0 && (
            <div className="d-card mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-section-title mb-0">
                  Completed Orders
                  <span
                    style={{
                      marginLeft: "10px",
                      padding: "2px 10px",
                      borderRadius: "999px",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      background: "rgba(52,152,219,0.12)",
                      color: "#3498db",
                    }}
                  >
                    {completedOrders.length}
                  </span>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))",
                  gap: "10px",
                }}
              >
                {completedOrders.map((order) => {
                  const bill = buildBillFromOrders([order], 0);
                  const active = selectedOrder?._id === order._id;
                  return (
                    <button
                      key={order._id}
                      type="button"
                      onClick={() => {
                        setSelectedOrder(order);
                        setSelectedOrderId(order._id);
                        setSelectedReservation("");
                      }}
                      style={{
                        textAlign: "left",
                        background: active
                          ? "rgba(52,152,219,0.12)"
                          : "var(--d-bg,#f5f4f0)",
                        border: active
                          ? "1.5px solid #3498db"
                          : "1px solid var(--d-border,#e2e0da)",
                        borderRadius: "12px",
                        padding: "10px 12px",
                        cursor: "pointer",
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <strong style={{ color: "var(--d-primary,#16302B)" }}>
                          <MdReceipt className="text-primary me-1" />
                          {order.id}
                        </strong>
                        <span
                          style={{
                            fontSize: "0.62rem",
                            fontWeight: 700,
                            color: "#3498db",
                          }}
                        >
                          Kitchen Done
                        </span>
                      </div>
                      <div
                        className="text-muted small"
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {order.table}
                      </div>
                      <div
                        style={{
                          fontFamily: "Cormorant Garamond,serif",
                          fontSize: "1.15rem",
                          fontWeight: 700,
                          color: "var(--d-gold,#C9A84C)",
                        }}
                      >
                        Due ₹{formatRupees(bill.total)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="d-card">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-0">
              <div className="d-section-title mb-0">
                {selectedReservation || selectedOrder
                  ? "Bill Summary"
                  : "Select a table or order to view bill"}
              </div>
              {selectedReservationData && (
                <div className="d-flex gap-2 flex-wrap align-items-center">
                  {cart.length > 0 && (
                    <button
                      type="button"
                      className="d-btn-outline"
                      style={{ fontSize: "0.72rem", padding: "4px 12px" }}
                      onClick={handlePrintBill}
                    >
                      <MdPrint className="me-1" /> Print Bill
                    </button>
                  )}
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      background: selectedOrder
                        ? "rgba(52,152,219,0.12)"
                        : selectedReservationData.status === "Completed"
                          ? "rgba(46,204,113,0.12)"
                          : "rgba(201,168,76,0.15)",
                      color: selectedOrder
                        ? "#3498db"
                        : selectedReservationData.status === "Completed"
                          ? "#27ae60"
                          : "#C9A84C",
                    }}
                  >
                    {selectedOrder
                      ? "Kitchen Done"
                      : selectedReservationData.status === "Completed"
                        ? "Items Served"
                        : "Table Occupied"}
                  </span>
                  {selectedReservationData.fullPaymentDone && (
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        background: "rgba(22,48,43,0.08)",
                        color: "#16302B",
                      }}
                    >
                      ✓ Marked Paid
                    </span>
                  )}
                  {reservationOrders.length > 0 && (
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        background: "rgba(107,114,128,0.1)",
                        color: "#6b7280",
                      }}
                    >
                      {reservationOrders.length} order
                      {reservationOrders.length !== 1 ? "s" : ""} linked
                    </span>
                  )}
                </div>
              )}
            </div>
            {(selectedReservation || selectedOrder) && (
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
                          {reservationOrders.length === 0
                            ? "No orders linked to this reservation yet"
                            : selectedReservationData?.fullPaymentDone
                              ? "All items paid — nothing pending."
                              : "No items pending in this bill (all linked orders are already settled)"}
                        </td>
                      </tr>
                    ) : (
                      cart.map((item) => (
                        <tr key={item.id || item._id || item.name}>
                          <td>
                            <strong>{item.name}</strong>
                          </td>
                          <td>₹{roundUpPrice(item.price)}</td>
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
                            <strong>₹{roundUpPrice(item.price) * item.qty}</strong>
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
            {selectedReservation || selectedOrder ? (
              <div className="d-checkout-details">
                {selectedReservationData && (
                  <div
                    className="mb-3 pb-2"
                    style={{
                      borderBottom: "1px solid var(--d-border,#e2e0da)",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "Cormorant Garamond,serif",
                        fontSize: "1.35rem",
                        fontWeight: 700,
                        color: "var(--d-primary,#16302B)",
                      }}
                    >
                      Table {getTableLabel(selectedReservationData)}
                    </div>
                    <div className="text-muted small">
                      {selectedReservationData.customerName ||
                        selectedReservationData.name}
                    </div>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal</span>
                  <span>₹{formatRupees(subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Tax (GST 5%)</span>
                  <span>₹{formatRupees(tax)}</span>
                </div>
                {advanceDeducted > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Reservation Advance</span>
                    <span style={{ color: "var(--d-green, #2ecc71)" }}>
                      − ₹{formatRupees(advanceDeducted)}
                    </span>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-4">
                  <span className="text-muted">Service Charge</span>
                  <span>₹0</span>
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
                    ₹{formatRupees(total)}
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
                          type="button"
                          aria-pressed={paymentMethod === "Card"}
                          style={{
                            fontSize: "0.75rem",
                            ...(paymentMethod === "Card"
                              ? {
                                  background: "var(--d-primary)",
                                  color: "var(--d-accent)",
                                  borderColor: "var(--d-gold)",
                                  boxShadow: "0 0 0 2px rgba(201,168,76,0.2)",
                                }
                              : {}),
                          }}
                          onClick={() => setPaymentMethod("Card")}
                        >
                          Card
                        </button>
                        <button
                          className={`d-btn-outline flex-grow-1 ${paymentMethod === "UPI" ? "active" : ""}`}
                          type="button"
                          aria-pressed={paymentMethod === "UPI"}
                          style={{
                            fontSize: "0.75rem",
                            ...(paymentMethod === "UPI"
                              ? {
                                  background: "var(--d-primary)",
                                  color: "var(--d-accent)",
                                  borderColor: "var(--d-gold)",
                                  boxShadow: "0 0 0 2px rgba(201,168,76,0.2)",
                                }
                              : {}),
                          }}
                          onClick={() => setPaymentMethod("UPI")}
                        >
                          UPI
                        </button>
                        <button
                          className={`d-btn-outline flex-grow-1 ${paymentMethod === "Cash" ? "active" : ""}`}
                          type="button"
                          aria-pressed={paymentMethod === "Cash"}
                          style={{
                            fontSize: "0.75rem",
                            ...(paymentMethod === "Cash"
                              ? {
                                  background: "var(--d-primary)",
                                  color: "var(--d-accent)",
                                  borderColor: "var(--d-gold)",
                                  boxShadow: "0 0 0 2px rgba(201,168,76,0.2)",
                                }
                              : {}),
                          }}
                          onClick={() => setPaymentMethod("Cash")}
                        >
                          Cash
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
                    ) : paymentMethod === "UPI" ? (
                      <div className="mb-3">
                        <input
                          className="form-control"
                          placeholder="UPI ID (e.g. success@upi)"
                          value={upiVpa}
                          onChange={(e) => setUpiVpa(e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="mb-3">
                        <div className="text-muted small mb-2">Cash Amount</div>
                        <input
                          className="form-control"
                          type="number"
                          placeholder="Enter cash amount"
                          value={cashAmount}
                          onChange={(e) => setCashAmount(e.target.value)}
                        />
                        {cashAmount && Number(cashAmount) >= total && (
                          <div className="text-success small mt-2">
                            Change to return: ₹
                            {formatRupees(Number(cashAmount) - total)}
                          </div>
                        )}
                        {cashAmount && Number(cashAmount) < total && (
                          <div className="text-danger small mt-2">
                            Insufficient amount. Need ₹
                            {formatRupees(total - Number(cashAmount))}{" "}
                            more.
                          </div>
                        )}
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
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1055,
            background: "rgba(11,25,21,0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={(e) =>
            e.target === e.currentTarget && setShowSalesModal(false)
          }
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "560px",
              maxHeight: "88vh",
              display: "flex",
              flexDirection: "column",
              boxShadow:
                "0 32px 80px rgba(11,25,21,0.2), 0 0 0 1px rgba(201,168,76,0.15)",
              overflow: "hidden",
            }}
          >
            {/* Top bar */}
            <div
              style={{
                height: "4px",
                background: "linear-gradient(90deg,#16302B,#C9A84C,#16302B)",
                flexShrink: 0,
              }}
            />

            {/* Header */}
            <div
              style={{
                padding: "18px 24px 16px",
                background: "linear-gradient(135deg,#16302B,#1f4238)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    background: "rgba(201,168,76,0.2)",
                    border: "1px solid rgba(201,168,76,0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#C9A84C",
                  }}
                >
                  <MdTrendingUp size={16} />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "Cormorant Garamond,serif",
                      fontSize: "1.2rem",
                      fontWeight: 600,
                      color: "#fff",
                    }}
                  >
                    Today's Sales
                  </div>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      color: "rgba(201,168,76,0.8)",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {todaySales?.date ||
                      new Date().toLocaleDateString("en-IN", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowSalesModal(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                <MdClose size={16} />
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
              {salesLoading ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 0",
                    color: "var(--d-text-muted)",
                  }}
                >
                  <div style={{ fontSize: "0.9rem" }}>Loading sales data…</div>
                </div>
              ) : !todaySales ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 0",
                    color: "var(--d-text-muted)",
                  }}
                >
                  <MdReceipt style={{ fontSize: "3rem", opacity: 0.3 }} />
                  <div style={{ marginTop: "12px" }}>
                    Could not load sales data
                  </div>
                </div>
              ) : (
                <>
                  {/* Stat cards */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "12px",
                      marginBottom: "20px",
                    }}
                  >
                    {[
                      {
                        icon: <MdAttachMoney size={20} />,
                        label: "Revenue (Paid)",
                        value: `₹${formatRupees(todaySales.revenue)}`,
                        color: "#C9A84C",
                      },
                      {
                        icon: <MdReceipt size={20} />,
                        label: "Total Orders",
                        value: todaySales.orders,
                        color: "#16302B",
                      },
                      {
                        icon: <MdShoppingCart size={20} />,
                        label: "Items Sold",
                        value: todaySales.items,
                        color: "#2ecc71",
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        style={{
                          background: "var(--d-bg,#f5f4f0)",
                          borderRadius: "14px",
                          padding: "16px 14px",
                          border: "1px solid var(--d-border,#e2e0da)",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ color: s.color, marginBottom: "6px" }}>
                          {s.icon}
                        </div>
                        <div
                          style={{
                            fontFamily: "Cormorant Garamond,serif",
                            fontSize: "1.6rem",
                            fontWeight: 700,
                            color: "var(--d-primary,#16302B)",
                            lineHeight: 1,
                          }}
                        >
                          {s.value}
                        </div>
                        <div
                          style={{
                            fontSize: "0.6rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            color: "var(--d-text-muted,#6b7280)",
                            marginTop: "4px",
                          }}
                        >
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order status pills */}
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginBottom: "20px",
                      flexWrap: "wrap",
                    }}
                  >
                    {[
                      {
                        label: "Paid",
                        count: todaySales.paid,
                        bg: "rgba(46,204,113,0.12)",
                        color: "#27ae60",
                      },
                      {
                        label: "Pending",
                        count: todaySales.pending,
                        bg: "rgba(201,168,76,0.12)",
                        color: "#C9A84C",
                      },
                      {
                        label: "Cancelled",
                        count: todaySales.cancelled,
                        bg: "rgba(231,76,60,0.10)",
                        color: "#e74c3c",
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        style={{
                          background: s.bg,
                          border: `1px solid ${s.color}30`,
                          borderRadius: "20px",
                          padding: "5px 14px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.82rem",
                            fontWeight: 800,
                            color: s.color,
                          }}
                        >
                          {s.count}
                        </span>
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontWeight: 600,
                            color: s.color,
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                          }}
                        >
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* By table breakdown */}
                  {todaySales.byTable.length > 0 && (
                    <>
                      <div
                        style={{
                          fontSize: "0.6rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "1.5px",
                          color: "var(--d-gold,#C9A84C)",
                          marginBottom: "10px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            flex: 1,
                            height: 1,
                            background: "rgba(201,168,76,0.2)",
                          }}
                        />
                        By Table
                        <span
                          style={{
                            flex: 1,
                            height: 1,
                            background: "rgba(201,168,76,0.2)",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "7px",
                          marginBottom: "20px",
                        }}
                      >
                        {todaySales.byTable.map(([label, data]) => (
                          <div
                            key={label}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              background: "var(--d-bg,#f5f4f0)",
                              borderRadius: "10px",
                              padding: "10px 14px",
                              border: "1px solid var(--d-border,#e2e0da)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <div
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: "8px",
                                  background: "rgba(201,168,76,0.12)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "var(--d-gold,#C9A84C)",
                                }}
                              >
                                <MdTableRestaurant size={15} />
                              </div>
                              <div>
                                <div
                                  style={{
                                    fontSize: "0.85rem",
                                    fontWeight: 700,
                                    color: "var(--d-primary,#16302B)",
                                  }}
                                >
                                  {label}
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.68rem",
                                    color: "var(--d-text-muted,#6b7280)",
                                  }}
                                >
                                  {data.orders} order
                                  {data.orders !== 1 ? "s" : ""} · {data.paid}{" "}
                                  paid
                                </div>
                              </div>
                            </div>
                            <div
                              style={{
                                fontFamily: "Cormorant Garamond,serif",
                                fontSize: "1.15rem",
                                fontWeight: 700,
                                color: "var(--d-primary,#16302B)",
                              }}
                            >
                              ₹{formatRupees(data.revenue)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Top items */}
                  {todaySales.topItems.length > 0 && (
                    <>
                      <div
                        style={{
                          fontSize: "0.6rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "1.5px",
                          color: "var(--d-gold,#C9A84C)",
                          marginBottom: "10px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            flex: 1,
                            height: 1,
                            background: "rgba(201,168,76,0.2)",
                          }}
                        />
                        Top Items Today
                        <span
                          style={{
                            flex: 1,
                            height: 1,
                            background: "rgba(201,168,76,0.2)",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                        }}
                      >
                        {todaySales.topItems.map(([name, data], idx) => (
                          <div
                            key={name}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              background: "var(--d-bg,#f5f4f0)",
                              borderRadius: "10px",
                              padding: "9px 14px",
                              border: "1px solid var(--d-border,#e2e0da)",
                            }}
                          >
                            <div
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: "50%",
                                background:
                                  idx === 0
                                    ? "rgba(201,168,76,0.25)"
                                    : "rgba(0,0,0,0.06)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.65rem",
                                fontWeight: 800,
                                color:
                                  idx === 0
                                    ? "var(--d-gold,#C9A84C)"
                                    : "var(--d-text-muted,#6b7280)",
                                flexShrink: 0,
                              }}
                            >
                              {idx + 1}
                            </div>
                            <div
                              style={{
                                flex: 1,
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                color: "var(--d-primary,#16302B)",
                              }}
                            >
                              {name}
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--d-text-muted,#6b7280)",
                                marginRight: "10px",
                              }}
                            >
                              ×{data.qty}
                            </div>
                            <div
                              style={{
                                fontSize: "0.88rem",
                                fontWeight: 700,
                                color: "var(--d-primary,#16302B)",
                              }}
                            >
                              ₹{formatRupees(data.revenue)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {todaySales.orders === 0 && (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "24px 0",
                        color: "var(--d-text-muted)",
                        fontSize: "0.9rem",
                      }}
                    >
                      No orders recorded today yet
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "12px 24px 16px",
                borderTop: "1px solid rgba(201,168,76,0.1)",
                background: "var(--d-bg,#f5f4f0)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <button
                onClick={loadTodaySales}
                disabled={salesLoading}
                style={{
                  background: "transparent",
                  border: "1.5px solid var(--d-border,#e2e0da)",
                  borderRadius: "10px",
                  padding: "8px 16px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  color: "var(--d-text-muted,#6b7280)",
                }}
              >
                ↻ Refresh
              </button>
              <button
                onClick={() => setShowSalesModal(false)}
                style={{
                  background: "linear-gradient(135deg,#C9A84C,#e4c47a)",
                  border: "none",
                  borderRadius: "10px",
                  padding: "8px 20px",
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  color: "#16302B",
                }}
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
